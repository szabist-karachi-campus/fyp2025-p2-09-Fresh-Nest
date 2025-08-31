const Order = require("../models/orders");
const Product = require("../models/products");
const User = require("../models/user");
const Vendors = require("../models/vendors");
const Wallet = require("../models/wallet");
const Transaction = require("../models/walletTransactions");
const { sendNotificationToAdminApp } = require("../utils/notification");

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { products, quantities, total, paymentMethod } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Products must be a non-empty array of product IDs",
      });
    }

    const productDetails = await Product.find({ _id: { $in: products } });

    if (productDetails.length !== products.length) {
      return res.status(404).json({
        success: false,
        message: "One or more products not found",
      });
    }

    const vendorOrders = {};

    // Use for...of instead of forEach to handle async properly
    for (let index = 0; index < productDetails.length; index++) {
      const product = productDetails[index];
      const vendorId = product.vendor.toString();
      const vendor = await Vendors.findById(vendorId);

      if (vendor?.deviceToken) {
        sendNotificationToAdminApp(
          vendor.deviceToken,
          "New order Received",
          `${req.user.name} placed an order for ${product.name}`,
        );
      }

      if (!vendorOrders[vendorId]) {
        vendorOrders[vendorId] = [];
      }

      vendorOrders[vendorId].push({
        product: product._id.toString(),
        quantity: quantities[index] || 1,
        price: product.price,
      });
    }

    let firstOrderNo = null;
    const createdOrders = [];

    for (const [vendorId, productOrder] of Object.entries(vendorOrders)) {
      console.log("Product Order for Vendor:", vendorId, productOrder);

      const vendorTotal = productOrder.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      if (vendorTotal > total) {
        return res.status(400).json({
          success: false,
          message: "Total mismatch for vendor order",
        });
      }

      const productsArray = productOrder.map((item) => item.product);
      const quantitiesArray = productOrder.map((item) => item.quantity);

      if (productsArray.length === 0 || quantitiesArray.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Products or quantities array is empty for vendor order",
        });
      }

      const order = new Order({
        user: userId,
        products: productsArray,
        quantities: quantitiesArray,
        total: vendorTotal,
        vendor: vendorId,
        paymentMethod: paymentMethod,
      });

      if (!firstOrderNo) {
        firstOrderNo = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      }
      order.orderNo = firstOrderNo;

      await order.save();
      createdOrders.push(order);
    }

    return res.status(201).json({
      success: true,
      message: "Orders created successfully",
      orders: createdOrders,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    const order = await Order.findById(orderId).populate("products");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.status = status;

    if (status === "Delivered") {
      order.paymentStatus = "Paid";
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while updating order status",
      error: error.message,
    });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch all orders for the user
    const orders = await Order.find({ user: userId }).populate({
      path: "products",
      populate: {
        path: "vendor",
        model: "Vendor",
      },
    });
    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No orders found for the user",
      });
    }

    // Group orders by orderNo
    const groupedOrders = orders.reduce((acc, order) => {
      const productsWithOrderId = order.products.map((product) => ({
        ...product.toObject(),
        orderId: order._id,
        status: order.status,
      }));

      // Check if an entry for this orderNo already exists
      const existingGroup = acc.find(
        (group) => group.orderNo === order.orderNo,
      );

      if (existingGroup) {
        // If it exists, merge the products, quantities, and total into the existing group
        existingGroup.products.push(...productsWithOrderId);
        existingGroup.quantities.push(...order.quantities);
        existingGroup.total += order.total;
      } else {
        // If it doesn't exist, create a new group
        acc.push({
          _id: order._id,
          user: order.user,
          products: [...productsWithOrderId],
          quantities: [...order.quantities],
          status: order.status,
          total: order.total,
          orderNo: order.orderNo,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        });
      }

      return acc;
    }, []);

    res.status(200).json({
      success: true,
      message: "User orders retrieved successfully",
      orders: groupedOrders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving orders",
      error: error.message,
    });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { orderNo } = req.body;

    const orders = await Order.find({ orderNo }).populate("products");

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Orders not found for the given order number",
      });
    }

    const userId = orders[0].user;
    const vendorId = orders[0].products[0].vendor;

    for (const order of orders) {
      if (order.status === "Delivered") continue;

      order.status = "Cancelled";

      if (order.paymentMethod === "Cashless") {
        const vendorWallet = await Wallet.findOne({ user: vendorId });
        if (!vendorWallet) {
          return res.status(400).json({
            success: false,
            message: `Vendor wallet not found for vendor ID ${vendorId}`,
          });
        }

        vendorWallet.balance -= order.total;
        await vendorWallet.save();

        await Transaction.create({
          wallet: vendorWallet._id,
          amount: order.total,
          transactionType: "Debit",
          description: `Refund for cancelled order ${order.orderNo}`,
        });

        let userWallet = await Wallet.findOne({ user: userId });
        if (!userWallet) {
          userWallet = await Wallet.create({
            user: userId,
            userType: "User",
            balance: order.total,
          });
        } else {
          userWallet.balance += order.total;
          await userWallet.save();
        }

        await Transaction.create({
          wallet: userWallet._id,
          amount: order.total,
          transactionType: "Credit",
          description: `Refunded for cancelled Order ${order.orderNo}`,
        });

        order.paymentStatus = "Refunded";
      }

      await order.save();
      const vendor = Vendors.findById(vendorId);
      sendNotificationToAdminApp(
        vendor.deviceToken,
        "Order Cancelled",
        `Order No. ${orderNo} has been cancelled.`,
      );
    }

    return res.status(200).json({
      success: true,
      message: "Order(s) cancelled successfully.",
      orders,
    });
  } catch (error) {
    console.error("Cancel Order Error:", {
      message: error.message,
      stack: error.stack,
      body: req.body,
    });

    return res.status(500).json({
      success: false,
      message: "An error occurred while updating order status",
      error: error.message,
    });
  }
};

exports.cancelOrderById = async (req, res) => {
  try {
    const { id } = req.body;
    console.log(id);

    const order = await Order.findById(id).populate("products");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found for the given ID",
      });
    }

    if (order.status === "Delivered") {
      return res.status(400).json({
        success: false,
        message: "Delivered orders cannot be cancelled",
      });
    }

    const userId = order.user;
    const vendorId = order.products[0].vendor;

    order.status = "Cancelled";

    if (order.paymentMethod === "Cashless") {
      const vendorWallet = await Wallet.findOne({ user: vendorId });
      if (!vendorWallet) {
        return res.status(400).json({
          success: false,
          message: `Vendor wallet not found for vendor ID ${vendorId}`,
        });
      }

      vendorWallet.balance -= order.total;
      await vendorWallet.save();

      await Transaction.create({
        wallet: vendorWallet._id,
        amount: order.total,
        transactionType: "Debit",
        description: `Refund for cancelled order ${order.orderNo}`,
      });

      let userWallet = await Wallet.findOne({ user: userId });
      if (!userWallet) {
        userWallet = await Wallet.create({
          user: userId,
          userType: "User",
          balance: order.total,
        });
      } else {
        userWallet.balance += order.total;
        await userWallet.save();
      }

      await Transaction.create({
        wallet: userWallet._id,
        amount: order.total,
        transactionType: "Credit",
        description: `Refunded for cancelled Order ${order.orderNo}`,
      });

      order.paymentStatus = "Refunded";
    }

    await order.save();

    const vendor = Vendors.findById(vendorId);
    sendNotificationToAdminApp(
      vendor.deviceToken,
      "Order Cancelled",
      `Order No. ${order.orderNo} has been cancelled.`,
    );

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully.",
      order,
    });
  } catch (error) {
    console.error("Cancel Order Error:", {
      message: error.message,
      stack: error.stack,
      body: req.body,
    });

    return res.status(500).json({
      success: false,
      message: "An error occurred while cancelling the order",
      error: error.message,
    });
  }
};

exports.getUserAddress = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);
    const user = await User.findById(order.user);

    const address = {
      address: user.address,
      city: user.city,
      state: user.state,
      postalcode: user.postalcode,
    };

    res.json({
      success: true,
      message: "User address retrieved successfully",
      address,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred",
      error: error.message,
    });
  }
};

exports.getVendorOrders = async (req, res) => {
  try {
    const vendorId = req.vendor._id;

    const orders = await Order.find()
      .populate({
        path: "products",
        model: "Product",
        select: "name vendor price image",
      })
      .populate({
        path: "user",
        model: "User",
        select: "name email phone address city",
      });

    const vendorOrders = orders.filter((order) =>
      order.products.some(
        (product) => product.vendor.toString() === vendorId.toString(),
      ),
    );

    return res.status(200).json({ success: true, orders: vendorOrders });
  } catch (error) {
    console.error("Error in getVendorOrders:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getVendorSales = async (req, res) => {
  try {
    const vendor = req.vendor._id;

    const orders = await Order.find({ paymentStatus: "Paid" }).populate({
      path: "products",
      model: "Product",
      select: "vendor price",
    });

    const vendorSales = orders
      .filter((order) =>
        order.products.some(
          (product) => product.vendor.toString() === vendor.toString(),
        ),
      )
      .reduce((acc, order) => acc + order.total, 0);

    res.json({
      success: true,
      message: "Vendor sales retrieved successfully",
      totalSales: vendorSales,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred",
      error: error.message,
    });
  }
};

// exports.getProductSalesInfo = async (req, res) => {
//   try {
//     const product = req.params.id;
//     const vendor = req.vendor._id;
//     const orders = await Order.find({ product, vendor, status: "Delivered" });

//     const totalSales = orders.reduce((acc, order) => acc + order.total, 0);
//     const totalQuantity = orders.reduce(
//       (acc, order) => acc + order.quantity,
//       0,
//     );

//     res.json({
//       success: true,
//       message: "Product sales retrieved successfully",
//       totalSales,
//       totalQuantity,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "An error occurred",
//       error: error.message,
//     });
//   }
// };
