const Order = require("../models/orders");
const Product = require("../models/products");
const Ad = require("../models/ads");
const AdClick = require("../models/adClick");
const AdTransaction = require("../models/adsTransaction");
const SubscriptionBox = require("../models/supscriptionBox");

exports.getVendorRevenue = async (req, res) => {
  const vendorId = req.vendor._id;

  try {
    const vendorProducts = await Product.find(
      { vendor: vendorId },
      "_id price",
    );
    const productPriceMap = {};
    const productIds = vendorProducts.map((p) => {
      productPriceMap[p._id.toString()] = p.price;
      return p._id;
    });

    const deliveredOrders = await Order.find({
      status: "Delivered",
      products: { $in: productIds },
    });

    let totalRevenue = 0;

    deliveredOrders.forEach((order) => {
      order.products.forEach((productId, index) => {
        const idStr = productId.toString();
        if (productPriceMap[idStr]) {
          const price = productPriceMap[idStr];
          const quantity = order.quantities[index] || 1;
          totalRevenue += price * quantity;
        }
      });
    });

    return res.status(200).json({
      success: true,
      totalRevenue,
    });
  } catch (err) {
    console.error("Error calculating revenue:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to calculate revenue",
      error: err.message,
    });
  }
};

exports.getOrderAnalytics = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const vendorProductIds = await Product.find({ vendor: vendorId }).distinct(
      "_id",
    );
    const vendorProductIdStrings = vendorProductIds.map((id) => id.toString());

    const orders = await Order.find({ products: { $in: vendorProductIds } });

    let totalOrders = 0;
    let deliveredOrders = 0;
    let cancelledOrders = 0;

    orders.forEach((order) => {
      const hasVendorProduct = order.products.some((productId) =>
        vendorProductIdStrings.includes(productId.toString()),
      );

      if (hasVendorProduct) {
        totalOrders++;

        if (order.status === "Delivered") deliveredOrders++;
        if (order.status === "Cancelled") cancelledOrders++;
      }
    });

    const orderSuccessRate =
      totalOrders > 0
        ? ((deliveredOrders / totalOrders) * 100).toFixed(2) + "%"
        : "0%";

    res.json({
      success: true,
      analytics: {
        totalOrders,
        deliveredOrders,
        cancelledOrders,
        orderSuccessRate,
      },
    });
  } catch (err) {
    console.error("Error in getOrderAnalytics:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

exports.getBestseller = async (req, res) => {
  try {
    const vendorId = req.vendor._id;

    const vendorProducts = await Product.find({ vendor: vendorId });
    const vendorProductMap = {};
    vendorProducts.forEach((prod) => {
      vendorProductMap[prod._id.toString()] = prod;
    });
    const vendorProductIds = vendorProducts.map((p) => p._id.toString());

    const deliveredOrders = await Order.find({
      status: "Delivered",
      products: { $in: vendorProductIds },
    });

    const productSalesCount = {};

    deliveredOrders.forEach((order) => {
      order.products.forEach((productId, index) => {
        const pid = productId.toString();
        if (vendorProductIds.includes(pid)) {
          const qty = order.quantities?.[index] || 1;
          productSalesCount[pid] = (productSalesCount[pid] || 0) + qty;
        }
      });
    });

    let bestsellerId = null;
    let maxQty = 0;
    for (const [pid, qty] of Object.entries(productSalesCount)) {
      if (qty > maxQty) {
        maxQty = qty;
        bestsellerId = pid;
      }
    }

    if (!bestsellerId) {
      return res.json({
        success: true,
        message: "No bestseller yet",
        bestseller: null,
      });
    }

    res.json({
      success: true,
      bestseller: {
        product: vendorProductMap[bestsellerId],
        totalSold: maxQty,
      },
    });
  } catch (err) {
    console.error("Error in getBestseller:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

exports.getAdAnalytics = async (req, res) => {
  try {
    const vendorId = req.vendor._id;

    const ads = await Ad.find({ vendor: vendorId });
    const totalAdsCount = ads.length;
    const activeAdsCount = ads.filter((ad) => ad.status === "Active").length;
    const totalAdClicks = ads.reduce((sum, ad) => sum + (ad.clicks || 0), 0);

    const adTransactions = await AdTransaction.find({ vendor: vendorId });
    const totalAdSpend = adTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    const adProductIds = ads.map((ad) => ad.product);

    const deliveredOrders = await Order.find({
      status: "Delivered",
      products: { $in: adProductIds },
    });

    let adDrivenRevenue = 0;
    deliveredOrders.forEach((order) => {
      order.products.forEach((productId, index) => {
        if (
          adProductIds.some(
            (adPid) => adPid.toString() === productId.toString(),
          )
        ) {
          adDrivenRevenue += order.total / order.products.length;
        }
      });
    });

    const ROI =
      totalAdSpend > 0
        ? ((adDrivenRevenue - totalAdSpend) / totalAdSpend) * 100
        : 0;

    res.json({
      success: true,
      analytics: {
        totalAdsCount,
        activeAdsCount,
        totalAdClicks,
        totalAdSpend,
        adDrivenRevenue,
        ROI: `${ROI.toFixed(2)}%`,
      },
    });
  } catch (error) {
    console.error("Error in getAdAnalytics:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching ad analytics",
    });
  }
};

exports.getSubscriptionAnalytics = async (req, res) => {
  try {
    const vendorId = req.vendor._id;

    const vendorProducts = await Product.find({ vendor: vendorId });
    const vendorProductIds = vendorProducts.map((p) => p._id.toString());
    const productPriceMap = new Map();
    vendorProducts.forEach((p) =>
      productPriceMap.set(p._id.toString(), p.price),
    );

    const subscriptions = await SubscriptionBox.find({ isActive: true });

    let totalInvolvedSubscriptions = 0;
    let frequencyCounts = {
      Daily: 0,
      Weekly: 0,
      Monthly: 0,
    };

    let recurringRevenue = {
      Daily: 0,
      Weekly: 0,
      Monthly: 0,
    };

    subscriptions.forEach((sub) => {
      let involved = false;
      sub.products.forEach(({ product, quantity }) => {
        const pid = product.toString();
        if (vendorProductIds.includes(pid)) {
          involved = true;
          const unitRevenue = productPriceMap.get(pid) * quantity;
          recurringRevenue[sub.frequency] += unitRevenue;
        }
      });

      if (involved) {
        totalInvolvedSubscriptions++;
        frequencyCounts[sub.frequency]++;
      }
    });

    res.json({
      success: true,
      analytics: {
        totalInvolvedSubscriptions,
        frequencyCounts,
        recurringRevenue,
      },
    });
  } catch (error) {
    console.error("Error in getVendorSubscriptionAnalytics:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching subscription analytics",
    });
  }
};

exports.getMonthlySalesAnalytics = async (req, res) => {
  try {
    const vendorId = req.vendor._id;

    const productIds = await Product.find({ vendor: vendorId }).distinct("_id");

    const now = new Date();
    const currentYear = now.getFullYear();
    const monthlyAnalytics = [];

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    for (let month = 0; month <= now.getMonth(); month++) {
      const startOfMonth = new Date(currentYear, month, 1);
      const endOfMonth = new Date(currentYear, month + 1, 1);

      const orders = await Order.find({
        products: { $in: productIds },
        status: "Delivered",
        createdAt: { $gte: startOfMonth, $lt: endOfMonth },
      });

      const sales = orders.reduce((total, order) => total + order.total, 0);
      const orderCount = orders.length;

      monthlyAnalytics.push({
        month: monthNames[month],
        sales,
        orderCount,
      });
    }

    res.json({
      success: true,
      monthlyAnalytics,
    });
  } catch (error) {
    console.error("Error in getMonthlySalesAnalytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch monthly analytics",
    });
  }
};
