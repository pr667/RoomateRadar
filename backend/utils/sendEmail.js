const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendVerificationEmail(to, code) {
  const mailOptions = {
    from: `"RoommateRadar" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Verify your RoommateRadar account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #2563eb; margin-bottom: 8px;">Welcome to RoommateRadar!</h2>
        <p style="color: #374151;">Use the code below to verify your email address:</p>
        <div style="background: #eff6ff; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1d4ed8;">${code}</span>
        </div>
        <p style="color: #6b7280; font-size: 14px;">This code expires in 15 minutes.</p>
        <p style="color: #6b7280; font-size: 14px;">If you didn't create an account, you can ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

async function sendResetEmail(to, code) {
  const mailOptions = {
    from: `"RoommateRadar" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Reset your RoommateRadar password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #2563eb; margin-bottom: 8px;">Password Reset</h2>
        <p style="color: #374151;">Use the code below to reset your password:</p>
        <div style="background: #fef2f2; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #dc2626;">${code}</span>
        </div>
        <p style="color: #6b7280; font-size: 14px;">This code expires in 15 minutes.</p>
        <p style="color: #6b7280; font-size: 14px;">If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendVerificationEmail, sendResetEmail };
