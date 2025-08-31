const User = require("../models/user");
const vendorWaitingList = require("../models/vendorWaitingList");
const Vendor = require("../models/vendors");
const Products = require("../models/products");
const Wallet = require("../models/wallet");
const Order = require("../models/orders");
const Ads = require("../models/ads");
const Transaction = require("../models/adsTransaction");
const Click = require("../models/adClick");
const SubscriptionBox = require("../models/supscriptionBox");
const WalletTransaction = require("../models/walletTransactions");
const { sendVendorTerminationEmail } = require("../utils/nodemailer");
const DeletedUsers = require("../models/deletedUsers");
const DeletedVendor = require("../models/deletedVendor");

exports.handleVendorStatus = async (req, res) => {
  const { status, email } = req.body;

  if (!status || (status !== "APPROVE" && status !== "REJECT")) {
    return res.json({
      success: false,
      message: "Invalid status, kindly provide valid status",
    });
  }

  const waitingVendor = await vendorWaitingList.findOne({ email });
  if (!waitingVendor) {
    return res.json({
      success: false,
      message: "No vendor found with this email in waiting list",
    });
  }

  if (status === "REJECT") {
    await vendorWaitingList.findByIdAndDelete(waitingVendor.id);
    return res.json({
      success: true,
      message: "Vendor request rejected successfully",
    });
  }

  // APPROVE
  const vendor = await Vendor.create({
    email: waitingVendor.email,
    name: waitingVendor.name,
    phone: waitingVendor.phone,
    cnic: waitingVendor.cnic,
    password: waitingVendor.password,
  });

  await vendorWaitingList.findByIdAndDelete(waitingVendor.id);

  const existingWallet = await Wallet.findOne({
    user: vendor._id,
    userType: "Vendor",
  });

  if (!existingWallet) {
    await Wallet.create({
      user: vendor._id,
      userType: "Vendor",
      balance: 0,
    });
  }

  return res.json({
    success: true,
    message: "Vendor approved and created successfully",
  });
};

exports.showVendorWaitingList = async (req, res) => {
  const vendors = await vendorWaitingList.find();
  return res.json({
    success: true,
    message: "Waiting list fetched successfully",
    vendors,
  });
};

exports.getVendorsList = async (req, res) => {
  const vendors = await Vendor.find({ isSuperAdmin: { $ne: true } });
  return res.json({
    success: true,
    message: "Waiting list fetched successfully",
    vendors,
  });
};

exports.deleteVendor = async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.json({ success: false, message: "Vendor Id is required" });
  }
  const vendor = await Vendor.findById(id);
  if (!vendor) {
    return res.json({ success: false, message: "No Vendor with this id" });
  }

  const vendorProducts = await Products.find({ vendor: id });
  const vendorAds = await Ads.find({ vendor: id });
  for (let index = 0; index < vendorAds.length; index++) {
    const element = vendorAds[index];
    await Transaction.deleteMany({ ad: element.id });
    await Click.deleteMany({ ad: element.id });
    await Ads.findByIdAndDelete(element.id);
  }
  for (i = 0; i < vendorProducts.length; i++) {
    const orders = await Order.find({ products: vendorProducts[i].id });

    for (let j = 0; j < orders.length; j++) {
      const order = orders[j];
      if (order.status === "Pending" && order.paymentMethod === "Cashless") {
        console.log("Vendor ID:", vendor._id.toString());
        console.log("Order User ID:", order.user.toString());
        console.log("Order Total:", order.total);

        await Wallet.findOneAndUpdate(
          { user: vendor._id, userType: "Vendor" },
          { $inc: { balance: -order.total } },
          { new: true, upsert: true },
        );

        await Wallet.findOneAndUpdate(
          { user: order.user, userType: "User" },
          { $inc: { balance: +order.total } },
          { new: true, upsert: true },
        );
      }
      await Order.findByIdAndDelete(order.id);
    }
    const productId = vendorProducts[i]._id;
    const affectedSubscriptions = await SubscriptionBox.find({
      "products.product": productId,
    });
    for (const box of affectedSubscriptions) {
      if (box.products.length === 1) {
        await SubscriptionBox.findByIdAndDelete(box._id);
      } else {
        await SubscriptionBox.findByIdAndUpdate(box._id, {
          $pull: { products: { product: productId } },
        });
      }
    }

    await Products.findByIdAndDelete(vendorProducts[i].id);
  }
  await DeletedVendor({
    name: vendor.name,
    email: vendor.email,
    phone: vendor.phone,
    cnic: vendor.cnic,
    stripeConnectedId: vendor.stripeConnectedId,
    deletedId: id,
  }).save();
  sendVendorTerminationEmail(vendor.name, vendor.email);

  if (vendor.deviceToken) {
    sendNotificationToAdminApp(
      vendor.deviceToken,
      "Account Terminated",
      `Dear ${vendor.name}, your vendor account has been terminated from FreshNest.`,
    );
  }

  await Vendor.findByIdAndDelete(id);

  return res.json({ success: false, message: "Deleted vendor successfully" });
};

exports.getUserList = async (req, res) => {
  const users = await User.find();
  return res.json({
    sucess: true,
    message: "Users fetched successfully",
    users,
  });
};

exports.getVendorById = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.json({ success: false, message: "Vendor Id is required" });
  }
  let vendor = await Vendor.findById(id);
  if (!vendor) {
    return res.json({ success: false, message: "No Vendor with this id" });
  }

  const vendorProducts = await Products.find({ vendor: id });
  const vendorProductIds = vendorProducts.map((p) => p._id);

  const vendorAds = await Ads.find({ vendor: id }).populate(
    "product",
    "name price",
  );
  const vendorWallet = await Wallet.findOne({ user: id, userType: "Vendor" });
  let vendorWalletTransactions = [];
  if (vendorWallet) {
    vendorWalletTransactions = await WalletTransaction.find({
      wallet: vendorWallet._id,
    });
  }
  const vendorOrders = await Order.find({
    products: { $in: vendorProductIds },
  });

  const vendorSubscriptions = await SubscriptionBox.find({
    "products.product": { $in: vendorProductIds },
  }).populate("products.product", "name price");
  vendor = vendor.toObject();
  vendor.products = vendorProducts;
  vendor.ads = vendorAds;
  vendor.wallet = vendorWallet;
  vendor.orders = vendorOrders;
  vendor.subscriptions = vendorSubscriptions;
  vendor.walletTransactions = vendorWalletTransactions;

  return res.json({
    success: true,
    message: "Vendor details fetched successfully",
    vendor,
  });
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching users",
    });
  }
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.json({ success: false, message: "User Id is required" });
  }
  let user = await User.findById(id);
  if (!user) {
    return res.json({ success: false, message: "No User with this id" });
  }
  user = user.toObject();
  const userOrders = await Order.find({ user: id });
  const userWallet = await Wallet.findOne({ user: id, userType: "User" });
  let userWalletTransactions = [];
  if (userWallet) {
    userWalletTransactions = await WalletTransaction.find({
      wallet: userWallet._id,
    });
  }
  const userSubscriptions = await SubscriptionBox.find({
    user: id,
  }).populate("products.product", "name");
  user.orders = userOrders;
  user.wallet = userWallet;
  user.walletTransactions = userWalletTransactions;
  user.subscriptions = userSubscriptions;
  return res.json({
    success: true,
    message: "User details fetched successfully",
    user,
  });
};

exports.deleteUser = async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.json({ success: false, message: "User Id is required" });
  }
  const user = await User.findById(id);
  if (!user) {
    return res.json({ success: false, message: "No User with this id" });
  }

  const userOrders = await Order.find({ user: id });
  for (let i = 0; i < userOrders.length; i++) {
    const order = userOrders[i];
    if (order.status === "Pending" && order.paymentMethod === "Cashless") {
      await Wallet.findOneAndUpdate(
        { user: order.vendor, userType: "Vendor" },
        { $inc: { balance: -order.total } },
        { new: true, upsert: true },
      );
      await Wallet.findOneAndUpdate(
        { user: id, userType: "User" },
        { $inc: { balance: +order.total } },
        { new: true, upsert: true },
      );
    }
    await Order.findByIdAndDelete(order.id);
  }

  const userSubscriptions = await SubscriptionBox.find({ user: id });
  for (let i = 0; i < userSubscriptions.length; i++) {
    const subscription = userSubscriptions[i];
    await SubscriptionBox.findByIdAndDelete(subscription.id);
  }

  sendVendorTerminationEmail(user.name, user.email);

  if (user.deviceToken) {
    sendNotificationToAdminApp(
      user.deviceToken,
      "Account Deleted",
      `Hi ${user.name}, your FreshNest account has been deleted.`,
    );
  }

  await DeletedUsers({
    name: user.name,
    email: user.email,
    phone: user.phone,
    address: user.address,
    city: user.city,
    state: user.state,
    postalcode: user.postalcode,
    deletedId: id,
  }).save();
  await User.findByIdAndDelete(id);
  return res.json({ success: true, message: "Deleted User successfully" });
};

exports.getDeletedUsers = async (req, res) => {
  try {
    const deletedUsers = await DeletedUsers.find();

    const wallets = await Promise.all(
      deletedUsers.map(async (deletedUser) => {
        return await Wallet.findOne({ user: deletedUser.deletedId });
      }),
    );
    return res.status(200).json({
      success: true,
      message: "Deleted users fetched successfully",
      deletedUsers,
      wallets,
    });
  } catch (error) {
    console.error("Error fetching deleted users:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching deleted users",
    });
  }
};

exports.getDeletedVendors = async (req, res) => {
  try {
    const deletedVendors = await DeletedVendor.find();
    const wallets = await Promise.all(
      deletedVendors.map(async (deletedUser) => {
        return await Wallet.findOne({ user: deletedUser.deletedId });
      }),
    );
    return res.status(200).json({
      success: true,
      message: "Deleted vendors fetched successfully",
      deletedVendors,
      wallets,
    });
  } catch (error) {
    console.error("Error fetching deleted vendors:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching deleted vendors",
    });
  }
};

exports.createSuperAdmin = async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.json({ success: false, message: "Vendor Id is required" });
  }
  const vendor = await Vendor.findById(id);
  if (!vendor) {
    return res.json({ success: false, message: "No Vendor with this id" });
  }
  if (vendor.isSuperAdmin) {
    await Vendor.findByIdAndUpdate(id, { isSuperAdmin: false }, { new: true });

    return res.json({
      success: true,
      message: "This vendor is now not a Super Admin",
    });
  }
  await Vendor.findByIdAndUpdate(id, { isSuperAdmin: true }, { new: true });
  return res.json({ success: true, message: "Vendor is now Super Admin" });
};
