/**
 * iMovies - Configuration
 * Loads environment variables and exports a unified config object
 */
const dotenv = require('dotenv');
const path = require('path');

// Load .env from server root
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const config = {
  // Server
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/imovies',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'imovies_dev_secret_key_2024',
  jwtExpire: process.env.JWT_EXPIRE || '7d',

  // Razorpay
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_xxxxxxxxxxxx',
    keySecret: process.env.RAZORPAY_KEY_SECRET || 'xxxxxxxxxxxxxxxxxxxx',
  },

  // Stripe
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_xxxxxxxxxxxx',
  },

  // PayPal
  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID || 'xxxxxxxxxxxx',
    clientSecret: process.env.PAYPAL_CLIENT_SECRET || 'xxxxxxxxxxxx',
  },

  // Email / SMTP
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },

  // Client
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',

  // Seat lock TTL in seconds (5 minutes)
  seatLockTTL: 300,
};

module.exports = config;
