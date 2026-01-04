// src/controllers/paymentController.js
const Transaction = require('../models/transactionModel');
const axios = require('axios');

// Mock Payment Gateway helper 
const mockPaymentGateway = async (amount, cardInfo) => {
  try {
    const response = await axios.post(`${process.env.GATEWAY_URL}/api/gateway/pay`, {
      amount,
      ...cardInfo, // cardNumber, expiry, cvv, userId, billId, purpose
    });

    return {
      status: response.data.status,
      providerRef: response.data.transactionRef,
      otpSent: response.data.otpSent || false, // whether OTP was triggered
    };
  } catch (err) {
    console.error('Payment Gateway error:', err.message);
    return {
      status: 'FAILED',
      providerRef: `mock_${Date.now()}`,
      otpSent: false,
    };
  }
};

// Existing initiatePayment 
const initiatePayment = async (req, res) => {
  const idempotencyKey = req.headers['idempotency-key'];
  const { billId, amount, cardNumber, expiry, cvv, purpose } = req.body;
  const userId = req.userId;

  if (!idempotencyKey) {
    return res.status(400).json({ message: 'Idempotency-Key header required' });
  }

  if (!userId || !amount || !cardNumber || !expiry || !cvv || !purpose) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const existingTxn = await Transaction.findOne({ idempotencyKey });
  if (existingTxn) {
    return res.status(200).json({
      message: 'Duplicate request – returning existing transaction',
      transaction: existingTxn,
    });
  }

  try {
    const gatewayResponse = await mockPaymentGateway(amount, {
      userId,
      billId,
      cardNumber,
      expiry,
      cvv,
      purpose,
    });

    const transaction = await Transaction.create({
      userId,
      billId: billId || null,
      cardNumber,
      amount,
      purpose,
      status: gatewayResponse.status || 'PENDING',
      idempotencyKey,
      providerRef: gatewayResponse.providerRef,
    });

    res.status(201).json({
      message: `Payment ${gatewayResponse.status}`,
      transaction,
      otpSent: gatewayResponse.otpSent,
    });
  } catch (err) {
    console.error('Payment error:', err.message);
    const transaction = await Transaction.create({
      userId,
      billId: billId || null,
      amount,
      purpose,
      status: 'FAILED',
      providerRef: `mock_${Date.now()}`,
    });

    res.status(500).json({
      message: 'Payment FAILED',
      transaction,
    });
  }
};

// const confirmPayment = async (req, res) => {
//   // const { billId, otp } = req.body;
//   const { providerRef, otp } = req.body;
//   // 1 Find transaction
// //  const txn = await Transaction.findOne({ billId, status: 'PENDING' });

//   const txn = await Transaction.findOne({
//     providerRef,
//     status: 'PENDING'
//   });

//   if (txn.status !== 'PENDING') {
//   return res.json({
//     message: 'Transaction already processed',
//     transaction: txn
//   });
// }


//   console.log(txn);
//   console.log(otp)
//   if (!txn || txn.status !== 'PENDING') {
//     return res.status(400).json({ message: 'Invalid or already completed transaction' });
//   }

//   try {
//     // 2 Verify OTP via Payment Gateway 
//     const verify = await axios.post(
//       `${process.env.GATEWAY_URL}/api/gateway/verify-otp`,
//          {
//             cardNumber: txn.cardNumber, // must store cardNumber in Transaction
//             amount: txn.amount,
//             otp
//           }
//         );

//     if (verify.data.status !== 'SUCCESS') {
//       txn.status = 'FAILED';
//       await txn.save();
//       return res.status(400).json({ message: 'OTP verification failed' });
//     }

//     // 3 Execute business logic with rollback safety
//     try {
//       if (txn.purpose === 'BILL_PAYMENT') {
//         await axios.post(`${process.env.BILLING_URL}/api/bills/mark-paid`, {
//           billId: txn.billId,
//         });
//       }

//       if (txn.purpose === 'TOP_UP') {
//         await axios.post(`${process.env.USER_URL}/api/wallet/topup`, {
//           userId: txn.userId,
//           amount: txn.amount,
//         });
//       }

//       // 4 Everything succeeded
//       txn.status = 'COMPLETED';
//       await txn.save();
//       return res.json({ message: 'Payment completed', transaction: txn });

//     } catch (businessErr) {
//       // 5 Rollback transaction if downstream fails
//       console.error('Business operation failed, rolling back:', businessErr.message);

//       await axios.post(`${process.env.GATEWAY_URL}/api/gateway/rollback`, {
//         providerRef: txn.providerRef,
//         amount: txn.amount,
//       });

//       txn.status = 'ROLLED_BACK';
//       await txn.save();

//       return res.status(500).json({
//         message: 'Payment rolled back due to downstream failure',
//       });
//     }

//   } catch (err) {
//     console.error('OTP verification or network failure:', err.message);
//     txn.status = 'FAILED';
//     await txn.save();
//     return res.status(500).json({ message: 'Payment failed' });
//   }
// };

const confirmPayment = async (req, res) => {
  const { providerRef, otp } = req.body;

  const txn = await Transaction.findOne({
    providerRef,
    status: 'PENDING'
  });

  if (!txn) {
    return res.status(400).json({ message: 'Invalid or completed transaction' });
  }

  // Idempotency guard
  if (txn.status !== 'PENDING') {
    return res.json({ message: 'Already processed', transaction: txn });
  }

  try {
    // Verify OTP via Gateway
    const verify = await axios.post(
      `${process.env.GATEWAY_URL}/api/gateway/verify-otp`,
      {
        providerRef,
        otp
      }
    );

    if (verify.data.status !== 'SUCCESS') {
      txn.status = 'FAILED';
      await txn.save();
      return res.status(400).json({ message: 'OTP verification failed' });
    }

    try {
      console.log("Purpose : ",txn.purpose);
      console.log("BillId : ",txn.billId);
      // Business logic
      if (txn.purpose === 'BILL_PAYMENT') {
        await axios.post(`${process.env.BILLING_URL}/api/billing/mark-paid`, {
          billId: txn.billId
        });
      }

      if (txn.purpose === 'TOP_UP') {
        await axios.post(`${process.env.USER_URL}/api/wallet/topup`, {
          userId: txn.userId,
          amount: txn.amount
        });
      }

      txn.status = 'COMPLETED';
      await txn.save();

      return res.json({ message: 'Payment completed', transaction: txn });

    } catch (businessErr) {
      console.error('Downstream failed, rolling back:', businessErr.message);

      await axios.post(`${process.env.GATEWAY_URL}/api/gateway/rollback`, {
        providerRef: txn.providerRef,
        amount: txn.amount
      });

      txn.status = 'ROLLED_BACK';
      await txn.save();

      return res.status(500).json({
        message: 'Payment rolled back due to downstream failure'
      });
    }

  } catch (err) {
    console.error('OTP verification/network error:', err.message);
    txn.status = 'FAILED';
    await txn.save();
    return res.status(500).json({ message: 'Payment failed' });
  }
};


module.exports = { initiatePayment, confirmPayment };
