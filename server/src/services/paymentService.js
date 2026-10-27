/**
 * iMovies - Payment Service
 * Abstract gateway with Razorpay as default, Stripe & PayPal stubs
 * Uses test mode credentials for all gateways
 */
const crypto = require('crypto');
const config = require('../config');

class PaymentService {
  /**
   * Create a payment order on the specified gateway
   * 
   * @param {Object} options
   * @param {number} options.amount - Amount in smallest currency unit (e.g., paise for INR)
   * @param {string} options.currency - Currency code (default: 'INR')
   * @param {string} options.gateway - Gateway name: 'razorpay', 'stripe', 'paypal'
   * @param {Object} options.metadata - Additional metadata (receipt, notes, etc.)
   * @returns {Object} Gateway-specific order/session object
   */
  static async createOrder({ amount, currency = 'INR', gateway = 'razorpay', metadata = {} }) {
    switch (gateway) {
      case 'razorpay':
        return this._createRazorpayOrder(amount, currency, metadata);
      case 'stripe':
        return this._createStripeSession(amount, currency, metadata);
      case 'paypal':
        return this._createPayPalOrder(amount, currency, metadata);
      default:
        throw new Error(`Unsupported payment gateway: ${gateway}`);
    }
  }

  /**
   * Verify a payment callback/webhook
   * 
   * @param {Object} options
   * @param {string} options.gateway - Gateway name
   * @param {Object} options.payload - Gateway-specific verification payload
   * @returns {Object} { verified: boolean, paymentId: string }
   */
  static async verifyPayment({ gateway = 'razorpay', payload }) {
    switch (gateway) {
      case 'razorpay':
        return this._verifyRazorpayPayment(payload);
      case 'stripe':
        return this._verifyStripePayment(payload);
      case 'paypal':
        return this._verifyPayPalPayment(payload);
      default:
        throw new Error(`Unsupported payment gateway: ${gateway}`);
    }
  }

  /**
   * Initiate a refund
   * 
   * @param {Object} options
   * @param {string} options.gateway - Gateway name
   * @param {string} options.paymentId - Gateway payment ID
   * @param {number} options.amount - Refund amount (optional, full refund if omitted)
   * @returns {Object} Refund result
   */
  static async initiateRefund({ gateway = 'razorpay', paymentId, amount }) {
    switch (gateway) {
      case 'razorpay':
        return this._refundRazorpay(paymentId, amount);
      case 'stripe':
        return this._refundStripe(paymentId, amount);
      case 'paypal':
        return this._refundPayPal(paymentId, amount);
      default:
        throw new Error(`Unsupported payment gateway: ${gateway}`);
    }
  }

  // ─── Razorpay Implementation ─────────────────────────────────────────

  /**
   * Create Razorpay order
   * In production, this would use the Razorpay SDK
   */
  static async _createRazorpayOrder(amount, currency, metadata) {
    try {
      // In test/development mode, simulate order creation
      // In production, use: const Razorpay = require('razorpay');
      // const instance = new Razorpay({ key_id, key_secret });
      // return instance.orders.create({ amount, currency, receipt, notes });

      const orderId = `order_${crypto.randomBytes(12).toString('hex')}`;

      return {
        id: orderId,
        entity: 'order',
        amount,
        amount_paid: 0,
        amount_due: amount,
        currency,
        receipt: metadata.receipt || '',
        status: 'created',
        notes: metadata.notes || {},
      };
    } catch (error) {
      throw new Error(`Razorpay order creation failed: ${error.message}`);
    }
  }

  /**
   * Verify Razorpay payment signature
   */
  static async _verifyRazorpayPayment(payload) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = payload;

    // In test mode, accept any valid-looking payment
    if (config.nodeEnv !== 'production') {
      return {
        verified: true,
        paymentId: razorpay_payment_id || `pay_${crypto.randomBytes(12).toString('hex')}`,
        orderId: razorpay_order_id,
      };
    }

    // Production: verify HMAC signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', config.razorpay.keySecret)
      .update(body)
      .digest('hex');

    const verified = expectedSignature === razorpay_signature;

    return {
      verified,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    };
  }

  /**
   * Refund a Razorpay payment
   */
  static async _refundRazorpay(paymentId, amount) {
    // Stub: In production, use Razorpay SDK
    return {
      id: `rfnd_${crypto.randomBytes(12).toString('hex')}`,
      entity: 'refund',
      payment_id: paymentId,
      amount: amount || 0,
      status: 'processed',
    };
  }

  // ─── Stripe Stub ─────────────────────────────────────────────────────

  static async _createStripeSession(amount, currency, metadata) {
    // Stub: In production, use Stripe SDK
    return {
      id: `cs_test_${crypto.randomBytes(16).toString('hex')}`,
      object: 'checkout.session',
      amount_total: amount,
      currency: currency.toLowerCase(),
      status: 'open',
      url: `https://checkout.stripe.com/pay/cs_test_stub`,
      metadata,
    };
  }

  static async _verifyStripePayment(payload) {
    // Stub: In production, verify webhook signature
    return {
      verified: true,
      paymentId: payload.payment_intent || `pi_${crypto.randomBytes(12).toString('hex')}`,
    };
  }

  static async _refundStripe(paymentId, amount) {
    return {
      id: `re_${crypto.randomBytes(12).toString('hex')}`,
      object: 'refund',
      payment_intent: paymentId,
      amount: amount || 0,
      status: 'succeeded',
    };
  }

  // ─── PayPal Stub ─────────────────────────────────────────────────────

  static async _createPayPalOrder(amount, currency, metadata) {
    // Stub: In production, use PayPal REST SDK
    return {
      id: `PAYPAL_${crypto.randomBytes(12).toString('hex').toUpperCase()}`,
      status: 'CREATED',
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: (amount / 100).toFixed(2), // PayPal uses major units
          },
        },
      ],
      links: [
        {
          href: `https://www.sandbox.paypal.com/checkoutnow?token=stub`,
          rel: 'approve',
          method: 'GET',
        },
      ],
    };
  }

  static async _verifyPayPalPayment(payload) {
    // Stub: In production, capture order and verify
    return {
      verified: true,
      paymentId: payload.orderID || `PAYPAL_${crypto.randomBytes(8).toString('hex').toUpperCase()}`,
    };
  }

  static async _refundPayPal(paymentId, amount) {
    return {
      id: `REFUND_${crypto.randomBytes(8).toString('hex').toUpperCase()}`,
      status: 'COMPLETED',
      capture_id: paymentId,
      amount: {
        value: amount ? (amount / 100).toFixed(2) : '0.00',
        currency_code: 'INR',
      },
    };
  }
}

module.exports = PaymentService;
