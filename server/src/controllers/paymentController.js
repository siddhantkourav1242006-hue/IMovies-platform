/**
 * iMovies - Payment Controller
 * Initiates payments and verifies gateway callbacks
 */
const Payment = require('../models/Payment');
const Show = require('../models/Show');
const Seat = require('../models/Seat');
const PaymentService = require('../services/paymentService');

/**
 * @desc    Create / initiate a payment
 * @route   POST /api/payments/create
 * @access  Private (user)
 */
const createPayment = async (req, res, next) => {
  try {
    const { showId, seats, gateway = 'razorpay' } = req.body;
    const userId = req.user._id;

    // Verify show exists
    const show = await Show.findById(showId);
    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found.',
      });
    }

    // Verify the seats are locked by this user
    let totalAmount = 0;
    for (const seat of seats) {
      const seatDoc = await Seat.findOne({
        showId,
        row: seat.row,
        number: seat.number,
        status: 'locked',
        lockedBy: userId,
      });

      if (!seatDoc) {
        return res.status(409).json({
          success: false,
          message: `Seat ${seat.row}${seat.number} is not locked by you. Please lock seats first.`,
        });
      }

      // Check if lock expired
      if (seatDoc.isLockExpired()) {
        return res.status(409).json({
          success: false,
          message: `Seat ${seat.row}${seat.number} lock has expired. Please lock seats again.`,
        });
      }

      // Calculate price based on seat type
      const price = show.pricing[seatDoc.type] || show.pricing.standard;
      totalAmount += price;
    }

    // Create gateway order
    const gatewayOrder = await PaymentService.createOrder({
      amount: totalAmount * 100, // Convert to smallest currency unit (paise)
      currency: 'INR',
      gateway,
      metadata: {
        receipt: `booking_${Date.now()}`,
        notes: {
          showId: showId.toString(),
          userId: userId.toString(),
          seatCount: seats.length,
        },
      },
    });

    // Create payment record
    const payment = await Payment.create({
      userId,
      amount: totalAmount,
      currency: 'INR',
      gateway,
      gatewayOrderId: gatewayOrder.id,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      data: {
        payment,
        gatewayOrder,
        keyId: gateway === 'razorpay' ? require('../config').razorpay.keyId : undefined,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify payment callback from gateway
 * @route   POST /api/payments/verify
 * @access  Private (user)
 */
const verifyPayment = async (req, res, next) => {
  try {
    const { paymentId, gatewayPayload } = req.body;

    // Find payment record
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found.',
      });
    }

    if (payment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Payment does not belong to this user.',
      });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Payment already processed with status: ${payment.status}`,
      });
    }

    // Verify with gateway
    const verification = await PaymentService.verifyPayment({
      gateway: payment.gateway,
      payload: gatewayPayload,
    });

    if (verification.verified) {
      payment.status = 'success';
      payment.gatewayPaymentId = verification.paymentId;
      await payment.save();

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully.',
        data: {
          paymentId: payment._id,
          status: payment.status,
          gatewayPaymentId: payment.gatewayPaymentId,
        },
      });
    } else {
      payment.status = 'failed';
      await payment.save();

      res.status(400).json({
        success: false,
        message: 'Payment verification failed.',
        data: {
          paymentId: payment._id,
          status: payment.status,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { createPayment, verifyPayment };
