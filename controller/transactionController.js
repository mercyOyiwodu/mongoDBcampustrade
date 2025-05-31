const transactionModel = require('../models/transaction');
const Product = require('../models/product');
const axios = require('axios');
require('dotenv').config();
const otpGenerator = require('otp-generator');
const Secret_key = process.env.Korapay_Secret_Key;
const formatedDate = new Date().toLocaleString();

exports.initializePayment = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        message: 'Please provide email, name, and productId',
      });
    }

    // Fetch product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Calculate post fee (5%)
    const postFee = parseFloat((0.05 * product.price).toFixed(2));

    const reference = `TCA-YU-${otpGenerator.generate(12, { specialChars: false })}`;
    const paymentData = {
      amount: postFee,
      customer: {
        name,
        email,
      },
      currency: 'NGN',
      reference: reference,
      redirect_url: `https://campus-trade-h7bq.vercel.app/dashboard/paymentstatus`,
      //  redirect_url: `http://localhost:5173/dashboard/paymentstatus`,
    };

    const response = await axios.post('https://api.korapay.com/merchant/api/v1/charges/initialize', paymentData, {
      headers: { Authorization: `Bearer ${Secret_key}` },
    });

    const { data } = response?.data;

    // Save transaction
    const transaction = new transactionModel({
      name,
      email,
      amount: postFee,
      reference,
      status: 'Pending',
      purpose: 'post_fee',
      used: false,
      productId,
      paymentDate: formatedDate,
    });
    await transaction.save();

    return res.status(200).json({
      message: 'Payment initialized successfully',
      data: {
        reference: data?.reference,
        checkout_url: data?.checkout_url,
        redirect_url: paymentData.redirect_url,
      },
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: 'Error initializing payment: ' + error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.query;

    const transaction = await transactionModel.findOne({ reference });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const response = await axios.get(`https://api.korapay.com/merchant/api/v1/charges/${reference}`, {
      headers: { Authorization: `Bearer ${Secret_key}` },
    });

    const { data } = response?.data;

    if (data?.status === 'success') {
      transaction.status = 'Success';
      transaction.used = true;
      await transaction.save();

      if (transaction.productId) {
        await Product.findByIdAndUpdate(transaction.productId, { status: 'approved' });
      }

      return res.status(200).json({
        message: 'Payment verified and product approved',
        data: transaction,
      });
    } else {
      transaction.status = 'Failed';
      await transaction.save();
      return res.status(200).json({ message: 'Payment verification failed' });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: 'Error verifying payment: ' + error.message,
    });
  }
};
