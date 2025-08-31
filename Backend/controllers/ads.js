const Ads = require("../models/ads");
const Product = require("../models/products");
const Click = require("../models/adClick");
const Transaction = require("../models/adsTransaction");
const Wallet = require("../models/wallet");
const WalletTransaction = require("../models/walletTransactions");

exports.createAd = async (req, res) => {
  const vendor = req.vendor._id;
  const { productId, budget, cost } = req.body;
  console.log("Parsed body", productId, budget, cost);
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const adExist = await Ads.findOne({ product: productId, status: "Active" });

    if (adExist) {
      return res.status(400).json({
        success: false,
        message: "An active ad already exist for this product",
      });
    }

    if (product.vendor.toString() !== vendor.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to create an ad for this product",
      });
    }
    product.isBoosted = true;
    await product.save();

    const wallet = await Wallet.findOne({ user: vendor._id });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found for this vendor",
      });
    } else if (wallet.balance < budget) {
      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance to create an ad",
      });
    }

    const ad = new Ads({
      product: productId,
      vendor: vendor,
      budget,
      cost,
    });

    await ad.save();

    res.status(201).json({
      success: true,
      message: "Ad created successfully",
      ad,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "An error occurred",
      error: error.message,
    });
  }
};

exports.updateAd = async (req, res) => {
  const vendor = req.vendor._id;
  const id = req.params.id;
  const { budget, cost, status } = req.body;

  try {
    const ad = await Ads.findById(id);
    const product = await Product.findById(ad.product);

    if (ad.vendor.toString() !== ad.vendor.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to create an ad for this product",
      });
    }

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Ad not found",
      });
    }

    ad.budget = budget;
    ad.cost = cost;

    if (status === "Inactive") {
      ad.status = status;
      product.isBoosted = false;
    } else if (status === "Active") {
      ad.status = status;
      product.isBoosted = true;
    }

    await ad.save();
    await product.save();

    res.status(200).json({
      success: true,
      message: "Ad updated successfully",
      ad,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred",
      error: error.message,
    });
  }
};

exports.clickCount = async (req, res) => {
  const userId = req.user._id;
  const { id: productId } = req.body;

  try {
    const ad = await Ads.findOne({ product: productId }).populate("product");

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Ad not found for the specified product.",
      });
    }

    if (ad.status !== "Active") {
      return res.status(400).json({
        success: false,
        message: "Ad is not active.",
      });
    }

    if (ad.budget < ad.cost) {
      return res.status(400).json({
        success: false,
        message: "Insufficient ad budget to process the click.",
      });
    }

    const wallet = await Wallet.findOne({ user: ad.vendor });

    if (!wallet || wallet.balance < ad.cost) {
      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance to process the click.",
      });
    }

    await Click.create({ user: userId, ad: ad._id });

    ad.clicks += 1;
    ad.budget -= ad.cost;

    wallet.balance -= ad.cost;
    await wallet.save();

    await WalletTransaction.create({
      wallet: wallet._id,
      amount: ad.cost,
      transactionType: "Debit",
      description: `Ad click charge for product: ${ad.product.name}`,
    });

    if (ad.budget < ad.cost || ad.budget <= 0 || wallet.balance < ad.cost) {
      ad.status = "Inactive";
      await Product.findByIdAndUpdate(ad.product._id, { isBoosted: false });
    }

    await ad.save();

    await Transaction.create({
      ad: ad._id,
      vendor: ad.vendor,
      amount: ad.cost,
    });

    res.status(200).json({
      success: true,
      message: "Click counted and balances updated.",
    });
  } catch (error) {
    console.error("Click Count Error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing the click.",
      error: error.message,
    });
  }
};

// exports.viewCount = async (req, res) => {
//   const { id } = req.body;
//   try {
//     const product = await Product.findById(id);
//     const ad = await Ads.findOne({ product: id });

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found",
//       });
//     }

//     product.views += 1;

//     await product.save();

//     res.status(200).json({
//       success: true,
//       message: "View count updated successfully",
//       ad,
//       product,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "An error occurred",
//       error: error.message,
//     });
//   }
// };

exports.getAds = async (req, res) => {
  try {
    const ads = await Ads.find({ status: "Active" })
      .sort({ cost: -1 })
      .limit(4);
    res.status(200).json({
      success: true,
      message: "Top 4 active ads retrieved successfully",
      ads,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred",
      error: error.message,
    });
  }
};

exports.getVendorAds = async (req, res) => {
  const vendor = req.vendor._id;

  try {
    const ads = await Ads.find({ vendor });
    res.status(200).json({
      success: true,
      message: "Vendor ads retrieved successfully",
      ads,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred",
      error: error.message,
    });
  }
};

exports.getAdPerformance = async (req, res) => {
  const id = req.params.id;

  try {
    const ad = await Ads.findById(id);
    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Ad not found",
      });
    }

    const clicks = await Click.find({ ad: id });
    const transactions = await Transaction.find({ ad: id });
    const spent = transactions.reduce(
      (total, transaction) => total + transaction.amount,
      0,
    );

    res.status(200).json({
      success: true,
      message: "Ad performance retrieved successfully",
      clicks,
      transactions,
      spent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred",
      error: error.message,
    });
  }
};

exports.getBidRange = async (req, res) => {
  try {
    const ads = await Ads.find({ status: "Active" }).sort({ cost: -1 });
    if (ads.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No active ads found",
      });
    }

    let highestBid = ads[0].cost;
    let totalCost = 0;

    for (const ad of ads) {
      totalCost += ad.cost;
      if (ad.cost > highestBid.cost) {
        highestBid = ad;
      }
    }

    const averageBid = totalCost / ads.length;
    Math.round(averageBid, 0);

    res.status(200).json({
      success: true,
      message: "Bid range retrieved successfully",
      highestBid,
      averageBid,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred",
      error: error.message,
    });
  }
};

exports.getAdbyProduct = async (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Product ID is required",
    });
  }

  try {
    const ad = await Ads.findOne({ product: id });
    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Ad not found",
        ad: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Ad retrieved successfully",
      ad,
    });
  } catch (error) {
    console.error("Error retrieving ad by product:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving the ad",
      error: error.message,
    });
  }
};
