/**
 * iMovies - Email Service
 * Nodemailer wrapper for sending booking confirmations and notifications
 */
const nodemailer = require('nodemailer');
const config = require('../config');

class EmailService {
  /**
   * Create and return a Nodemailer transporter
   * Falls back to a console-logging stub in development if SMTP is not configured
   */
  static _getTransporter() {
    if (!config.smtp.user || !config.smtp.pass) {
      // Return null — emails will be logged to console instead
      return null;
    }

    return nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
  }

  /**
   * Send an email
   * @param {Object} options
   * @param {string} options.to - Recipient email
   * @param {string} options.subject - Email subject
   * @param {string} options.html - Email HTML body
   * @param {string} options.text - Plain text fallback
   */
  static async sendEmail({ to, subject, html, text }) {
    const transporter = this._getTransporter();

    const mailOptions = {
      from: `"iMovies" <${config.smtp.user || 'noreply@imovies.com'}>`,
      to,
      subject,
      html,
      text,
    };

    if (!transporter) {
      // Development fallback: log email to console
      console.log('📧 Email (dev mode - not actually sent):');
      console.log(`   To: ${to}`);
      console.log(`   Subject: ${subject}`);
      console.log(`   Body: ${text || '(HTML only)'}`);
      return { messageId: 'dev-mode-stub', accepted: [to] };
    }

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`📧 Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error(`❌ Email send failed: ${error.message}`);
      // Don't throw — email failure shouldn't break booking flow
      return null;
    }
  }

  /**
   * Send booking confirmation email
   * @param {Object} booking - Booking document (populated)
   * @param {Object} user - User document
   * @param {Object} movie - Movie document
   * @param {Object} show - Show document (populated with theatre)
   */
  static async sendBookingConfirmation(booking, user, movie, show) {
    const seatList = booking.seats
      .map((s) => `${s.row}${s.number} (${s.type})`)
      .join(', ');

    const showDate = new Date(show.date).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🎬 iMovies</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Booking Confirmed!</p>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">Hi ${user.name}!</h2>
          <p>Your booking has been confirmed. Here are the details:</p>
          
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #667eea; margin-top: 0;">${movie.title}</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Booking ID</td>
                <td style="padding: 8px 0; font-weight: bold;">${booking._id}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Date</td>
                <td style="padding: 8px 0;">${showDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Time</td>
                <td style="padding: 8px 0;">${show.time}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Screen</td>
                <td style="padding: 8px 0;">${show.screenName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Seats</td>
                <td style="padding: 8px 0;">${seatList}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Total Amount</td>
                <td style="padding: 8px 0; font-weight: bold; color: #667eea;">₹${booking.totalAmount.toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <p style="color: #666; font-size: 14px;">
            Please arrive at least 15 minutes before the show time. 
            Show this email or your booking ID at the counter.
          </p>
        </div>
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} iMovies. All rights reserved.
          </p>
        </div>
      </div>
    `;

    const text = `
iMovies - Booking Confirmed!

Hi ${user.name},

Your booking for "${movie.title}" has been confirmed.

Booking ID: ${booking._id}
Date: ${showDate}
Time: ${show.time}
Screen: ${show.screenName}
Seats: ${seatList}
Total Amount: ₹${booking.totalAmount.toFixed(2)}

Please arrive at least 15 minutes before the show time.
    `.trim();

    return this.sendEmail({
      to: user.email,
      subject: `🎬 Booking Confirmed - ${movie.title}`,
      html,
      text,
    });
  }

  /**
   * Send booking cancellation email
   */
  static async sendBookingCancellation(booking, user, movie) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #e74c3c; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🎬 iMovies</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Booking Cancelled</p>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">Hi ${user.name},</h2>
          <p>Your booking for <strong>${movie.title}</strong> (ID: ${booking._id}) has been cancelled.</p>
          <p>If a refund is applicable, it will be processed within 5-7 business days.</p>
          <p>Refund Amount: <strong>₹${booking.totalAmount.toFixed(2)}</strong></p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: user.email,
      subject: `Booking Cancelled - ${movie.title}`,
      html,
      text: `Your booking for "${movie.title}" (ID: ${booking._id}) has been cancelled. Refund of ₹${booking.totalAmount.toFixed(2)} will be processed within 5-7 business days.`,
    });
  }
}

module.exports = EmailService;
