const jwt = require("jsonwebtoken");
const Vendors = require("../models/vendors");
const MessageThread = require("../models/message");
const Order = require("../models/orders");
const User = require("../models/user");
const products = require("../models/products");

const { sendNotificationToAdminApp } = require("../utils/notification");

const extractSenderFromToken = async (token) => {
  let decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.userId) return { senderId: decoded.userId, senderModel: "User" };
  if (decoded.email) {
    const vendor = await Vendors.findOne({ email: decoded.email });
    if (vendor.isSuperAdmin) {
      return { senderId: vendor._id, senderModel: "SuperAdmin" };
    } else {
      return {
        senderId: vendor._id,
        senderModel: "Vendor",
      };
    }
  }

  throw new Error("Invalid token payload");
};

const getCurrentUserFromToken = async (req) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) throw new Error("Authorization header missing");

  const token = authHeader.split(" ")[1];
  if (!token) throw new Error("Token missing");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.userId) return { id: decoded.userId, model: "User" };
  if (decoded.email) {
    const vendor = await Vendors.findOne({ email: decoded.email });
    if (vendor.isSuperAdmin) {
      return { id: vendor.id, model: "SuperAdmin" };
    } else {
      return { id: vendor.id, model: "Vendor" };
    }
  }

  throw new Error("Invalid token payload");
};

exports.getAllThreads = async (req, res) => {
  try {
    const currentUser = await getCurrentUserFromToken(req);
    console.log("Current User:", currentUser);

    const threads = await MessageThread.find({
      $or: [
        { initiatorId: currentUser.id, initiatorModel: currentUser.model },
        { receiverId: currentUser.id, receiverModel: currentUser.model },
      ],
    })
      .populate({
        path: "orderId",
        populate: {
          path: "products",
          model: "Product",
        },
      })
      .sort({ updatedAt: -1 });
    console.log(threads);

    for (let thread of threads) {
      if (thread.initiatorModel === "User") {
        thread._doc.initiator = await User.findById(thread.initiatorId).lean();
      } else {
        thread._doc.initiator = await Vendors.findById(
          thread.initiatorId,
        ).lean();
      }

      if (thread.receiverModel === "User") {
        thread._doc.receiver = await User.findById(thread.receiverId).lean();
      } else {
        thread._doc.receiver = await Vendors.findById(thread.receiverId).lean();
      }
    }
    return res.status(200).json({ success: true, threads });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Server error", details: error.message });
  }
};

exports.getThreadByOrderId = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { with: contextModel } = req.query;
    const currentUser = await getCurrentUserFromToken(req);
    console.log("parsed body", { orderId, contextModel, currentUser });

    if (
      !contextModel ||
      !["User", "Vendor", "SuperAdmin"].includes(contextModel)
    ) {
      return res
        .status(400)
        .json({ error: "Invalid or missing `with` context in query params" });
    }

    const thread = await MessageThread.findOne({
      orderId,
      $or: [
        {
          initiatorId: currentUser.id,
          initiatorModel: currentUser.model,
          receiverModel: contextModel,
        },
        {
          receiverId: currentUser.id,
          receiverModel: currentUser.model,
          initiatorModel: contextModel,
        },
      ],
    })
      .populate({
        path: "orderId",
        populate: {
          path: "products",
          model: "Product",
        },
      })
      .lean();

    if (!thread) {
      return res
        .status(404)
        .json({ error: "Thread not found for the specified context" });
    }

    let initiatorInfo = null;
    if (thread.initiatorModel === "User") {
      initiatorInfo = await User.findById(thread.initiatorId).select("name");
    } else if (thread.initiatorModel === "SuperAdmin") {
      initiatorInfo = await Vendors.findById(thread.initiatorId).select("name");
    } else if (thread.initiatorModel === "Vendor") {
      initiatorInfo = await Vendors.findById(thread.initiatorId).select("name");
    }

    const order = await Order.findById(orderId)
    const product = await products.findById(order.products[0]).populate('vendor')

    let receiverInfo = null;
    if (thread.receiverModel === "User") {
      receiverInfo = await User.findById(thread.receiverId).select("name");
    } else if (thread.receiverModel === "SuperAdmin") {
      receiverInfo = await Vendors.findById(thread.receiverId).select("name");
      if (receiverInfo?.deviceToken?.trim()) {
        await sendNotificationToAdminApp(
          receiverInfo.deviceToken,
          'You have Received a New Message',
          `${initiatorInfo.name} sent you a dispute for Order: ${order.orderNo}`
        );
      }
      if (product?.vendor?.deviceToken?.trim()) {
        await sendNotificationToAdminApp(
          product.vendor.deviceToken,
          'You have Received a Dispute',
          `${initiatorInfo.name} sent a dispute for Order: ${order.orderNo}`
        );
      }
    } else if (thread.receiverModel === "Vendor") {
      receiverInfo = await Vendors.findById(thread.receiverId).select("name");
      if(receiverInfo.deviceToken?.trim()){
        await sendNotificationToAdminApp(receiverInfo.deviceToken,'You have Recieved a New Message', `${initiatorInfo.name} sent you a message for Order;${order.orderNo}`)
      }
    }

    // Populate chat senders
    const populatedChats = await Promise.all(
      thread.chats.map(async (chat) => {
        let sender = null;
        if (chat.senderModel === "User") {
          sender = await User.findById(chat.senderId).select("name");
        } else if (chat.senderModel === "SuperAdmin") {
          sender = await Vendors.findById(chat.senderId).select("name");
        } else if (chat.senderModel === "Vendor") {
          sender = await Vendors.findById(chat.senderId).select("name");
        }
        return { ...chat, sender: sender || null };
      }),
    );

    return res.status(200).json({
      success: true,
      thread: {
        ...thread,
        chats: populatedChats,
        initiatorInfo,
        receiverInfo,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Server error", details: error.message });
  }
};

exports.getThreadById = async (req, res) => {
  const { id } = req.params;

  try {
    const thread = await MessageThread.findById(id).populate({
      path: "orderId",
      populate: {
        path: "_id",
        model: "Order",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Thread retrieved successfully",
      thread,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving thread",
      error: error.message,
    });
  }
};

exports.sendMessage = async (req, res) => {
  const { message, orderId, title, receiverModel, receiverId } = req.body;
  const authHeader = req.headers["authorization"];

  const token = authHeader.split(" ")[1];
  const user = req.user;
  console.log("Parsed body for send message:", {
    message,
    orderId,
    title,
    receiverModel,
    receiverId,
  });
  let receiverIdNormalized = receiverId;
  console.info("Received data:", {
    message,
    orderId,
    title,
    receiverModel,
    receiverId,
  });

  if (user.isSuperAdmin && !receiverId) {
    const superAdmin = await Vendors.findOne({ isSuperAdmin: true });
    if (!superAdmin)
      return res.status(404).json({ error: "SuperAdmin not found" });
    receiverIdNormalized = superAdmin._id;
  }
  if (receiverModel === "SuperAdmin") {
    const superAdmin = await Vendors.findOne({ isSuperAdmin: true });
    if (!superAdmin)
      return res.status(404).json({ error: "SuperAdmin not found" });
    receiverIdNormalized = superAdmin._id;
  }

  let sender;
  try {
    sender = await extractSenderFromToken(token);
  } catch (err) {
    return res.status(403).json({ error: err.message });
  }

  if (
    !message ||
    !orderId ||
    !title ||
    !receiverModel ||
    !receiverIdNormalized
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    let thread = await MessageThread.findOne({
      orderId,
      $or: [
        {
          initiatorId: sender.senderId,
          initiatorModel: sender.senderModel,
          receiverId: receiverIdNormalized,
          receiverModel,
        },
        {
          initiatorId: receiverId,
          initiatorModel: receiverModel,
          receiverId: sender.senderId,
          receiverModel: sender.senderModel,
        },
      ],
    });

    const newMessage = {
      senderId: sender.senderId,
      senderModel: sender.senderModel,
      message,
      timestamp: new Date(),
    };

    if (thread) {
      thread.chats.push(newMessage);
    } else {
      thread = new MessageThread({
        orderId,
        title,
        initiatorId: sender.senderId,
        initiatorModel: sender.senderModel,
        receiverId: receiverIdNormalized,
        receiverModel,
        chats: [newMessage],
      });
    }

    await thread.save();

    return res.status(200).json({ success: true, thread });
  } catch (error) {
    console.log("Error in sendMessage:", error.message);
    return res
      .status(500)
      .json({ error: "Server error", details: error.message });
  }
};
