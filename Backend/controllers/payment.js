const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.createPaymentIntent = async (req, res) => {
  const userId = req.user._id.toString();
  const { amount, topup, userType, orderNo } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "pkr",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: userId,
        topup: topup,
        userType: userType ? userType : null,
        orderNo: orderNo ? orderNo : null,
      },
    });
    console.log("Payment Intent created:", paymentIntent.client_secret);
    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating payment intent",
      error: error.message,
    });
  }
};

// exports.createPaymentIntent = async (req, res) => {
//   const { amount } = req.body;
//   if (!amount || amount < 13900) {
//     return res.status(400).send({ success: false, message: 'Invalid amount' });
//   }
//   console.info('Received amount:', amount);
//   const token = req.headers.authorization?.split(' ')[1];
//   if (!token) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }
//   const decoded = jwt.verify(token, process.env.JWT_SECRET);
//   const userId = decoded.userId;
//   if (!userId) {
//     return res
//       .status(400)
//       .json({ success: false, message: 'User ID is required!' });
//   }
//   const user = await User.findById(userId);
//   if (!user) {
//     return res.status(404).json({ message: 'User not found' });
//   }
//   if (!amount || amount <= 0) {
//     return res.status(400).send('Invalid amount');
//   }
//   try {
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: amount,
//       currency: 'pkr',
//       automatic_payment_methods: {
//         enabled: true,
//       },
//       metadata: {
//         userId: userId,
//       },
//     });
//     console.log('Payment Intent created:', paymentIntent);
//     return res.send({ clientSecret: paymentIntent.client_secret });
//   } catch (err) {
//     console.error('Error creating payment intent:', err);
//     res.status(500).send('Server error');
//   }
// };

// exports.updateWallet = async (req, res) => {
//   const { amount, userId } = req.body;

//   if (!userId) {
//     return res
//       .status(400)
//       .json({ success: false, message: 'User ID is required!' });
//   }
//   const user = await User.findById(userId);
//   if (!user) {
//     return res.status(404).json({ message: 'User not found' });
//   }
//   try {
//     const wallet = await Wallet.findOne({ user: userId });

//     if (!wallet) {
//       return res.status(404).send('Wallet not found');
//     }

//     wallet.balance += amount;
//     await wallet.save();

//     res.status(200).send('Wallet updated successfully');
//   } catch (err) {
//     console.error('Error updating wallet:', err);
//     res.status(500).send('Server error');
//   }
// };

// app.post(
//   '/wallet-payment-webhook',
//   express.raw({ type: 'application/json' }),
//   async (req, res) => {
//     const sig = req.headers['stripe-signature'];

//     try {
//       const event = stripe.webhooks.constructEvent(
//         req.body,
//         sig,
//         process.env.STRIPE_WEBHOOK_SECRET,
//       );

//       console.log('✅ Webhook received:', event.type);

//       if (event.type === 'payment_intent.succeeded') {
//         const paymentIntent = event.data.object;
//         const userId = paymentIntent.metadata.userId;
//         const amount = paymentIntent.amount;

//         console.log('PaymentIntent:', paymentIntent);

//         if (!userId || !amount) {
//           console.error('❌ Missing userId or amount in metadata');
//           return res.status(400).send('Missing userId or amount');
//         }

//         const wallet = await Wallet.findOneAndUpdate(
//           { user: userId },
//           { $inc: { balance: amount } },
//           { new: true },
//         );

//         if (!wallet) {
//           const createdWallet = await Wallet.create({
//             user: userId,
//             balance: amount,
//             transactions: [
//               {
//                 type: 'deposit_completed',
//                 amount,
//                 escrowTxId: paymentIntent.id,
//                 status: 'completed',
//               },
//             ],
//           });
//           const updatedUser = await User.findByIdAndUpdate(
//             userId,
//             { wallet: createdWallet._id },
//             { new: true },
//           );
//           if (!updatedUser) {
//             console.error('❌ User not found');
//             return res.status(404).send('User not found');
//           }
//           console.log('✅ Wallet updated:', createdWallet);
//           return res.status(201).send('✅ Wallet updated:');
//         }

//         console.log('✅ Wallet updated:', wallet);
//       }

//       res.status(200).send('Webhook processed');
//     } catch (err) {
//       console.error('❌ Webhook error:', err.message);
//       res.status(500).send(`Webhook error: ${err.message}`);
//     }
//   },
// );
