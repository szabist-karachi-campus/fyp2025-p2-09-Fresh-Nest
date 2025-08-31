const Wallet = require("../models/wallet");
const Transaction = require("../models/walletTransactions");
const Vendor = require("../models/vendors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.getVendorWallet = async (req, res) => {
  const vendorId = req.vendor._id;

  try {
    let wallet = await Wallet.findOne({ user: vendorId });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found for this vendor",
      });
    }

    res.status(200).json({
      success: true,
      message: "Wallet balance retrieved successfully",
      wallet,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving wallet balance",
      error: error.message,
    });
  }
};

exports.getUserWallet = async (req, res) => {
  const userId = req.user._id;

  try {
    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      await Wallet.create({
        user: userId,
        userType: "User",
        balance: 0,
      });
      await wallet.save();
    }
    res.status(200).json({
      success: true,
      message: "Wallet balance retrieved successfully",
      wallet,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving wallet balance",
      error: error.message,
    });
  }
};

exports.getWalletTransactions = async (req, res) => {
  const wallet = req.params.id;

  try {
    const transactions = await Transaction.find({ wallet }).sort({
      createdAt: -1,
    });
    res.status(200).json({
      success: true,
      message: "Wallet transactions retrieved successfully",
      transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving wallet transactions",
      error: error.message,
    });
  }
};

exports.ConnectStripe = async (req, res) => {
  console.log("Connecting Stripe account for vendor:", req.vendor._id);
  const vendorId = req.vendor._id;

  try {
    // Step 1: Create Standard Connect account
    const account = await stripe.accounts.create({
      type: "express",
      capabilities: {
        transfers: { requested: true },
        card_payments: { requested: true },
      },
    });

    // Step 2: Save account.id as stripeConnectedId
    await Vendor.findByIdAndUpdate(vendorId, {
      stripeConnectedId: account.id,
    });

    // Step 3: Create an onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: "http://localhost:8000/reauth", // Or your fallback page
      return_url: "http://localhost:8000/complete", // Called after they finish setup
      type: "account_onboarding",
    });

    const vendor = Vendor.findById(vendorId);

    if (vendor?.deviceToken) {
      sendNotificationToAdminApp(
        vendor.deviceToken,
        "Stripe Setup Started",
        "Your Stripe Connect onboarding link has been generated. Please complete your setup.",
      );
    }
    return res.status(200).json({
      success: true,
      message: "Connecting Stripe account initiated",
      url: accountLink.url,
    });
  } catch (error) {
    console.error("❌ Error in Connect:", error.message);
    return res.status(500).json({
      success: false,
      message: "An error occurred while connecting Stripe",
      error: error.message,
    });
  }
};

exports.WithdrawVendorMoney = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const wallet = await Wallet.findOne({ user: vendorId });
    if (!wallet || wallet.balance <= 0) {
      return res.status(400).json({
        success: false,
        message: "No Balance to withdraw",
        error: "No Balance to withdraw",
      });
    }
    const vendor = await Vendor.findById(vendorId);
    const connectedAccountId = vendor.stripeConnectedId;
    console.log("Connected Account ID:", connectedAccountId);

    const account = await stripe.accounts.retrieve(connectedAccountId);
    console.log(account.country); // Must match currency
    console.log(account.capabilities.transfers); // Must be 'active'

    if (!connectedAccountId) {
      return res.status(400).json({
        success: false,
        message: "Vendor is not connected to Stripe",
        error: "Vendor is not connected to Stripe",
      });
    }
    // Convert PKR to USD using a fixed exchange rate (example: 1 USD = 280 PKR)
    const exchangeRate = 280;
    const amountInUSD = wallet.balance / exchangeRate;

    // Ensure the amount is rounded to two decimal places
    const roundedAmountInUSD = Math.round(amountInUSD * 100) / 100;

    // Convert the amount back to cents for Stripe
    const amountInCents = Math.round(roundedAmountInUSD * 100);
    // Create a transfer to the connected account
    const transfer = await stripe.transfers.create({
      amount: amountInCents, // amount in cents
      currency: "usd",
      destination: connectedAccountId,
      description: `Withdrawal for vendor ${vendorId}`,
    });

    // Create a wallet transaction record
    await Transaction.create({
      wallet: wallet._id,
      transactionType: "Debit",
      amount: wallet.balance,
      description: "Withdrawal",
    });
    // Reset wallet balance to 0
    wallet.balance = 0;
    await wallet.save();

    if (vendor?.deviceToken) {
      sendNotificationToAdminApp(
        vendor.deviceToken,
        "Withdrawal Successful",
        `You have successfully withdrawn Rs. ${amountWithdrawnPKR}.`,
      );
    }

    return res.status(200).json({
      success: true,
      message: "Withdrawal successful",
      transfer,
    });
  } catch (error) {
    console.error("Withdrawal error:", error.message);
    return res.status(400).json({
      success: false,
      message: "Error occurred while withdrawing money",
      error: error.message,
    });
  }
};

exports.topUpWallet = async (req, res) => {
  const userId = req.user._id.toString();
  const userType = req.user.accountDetails ? "Vendor" : "User";
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Amount must be greater than 0",
    });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: "pkr",
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId,
        topup: "true",
        userType,
        orderNo: null,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Top-up initiated successfully",
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("❌ Stripe PaymentIntent Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to initiate top-up",
      error: error.message,
    });
  }
};
