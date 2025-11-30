import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Send confirmation email
 */
export const sendConfirmationEmail = async (to, link) => {
  const etherealUser = process.env.ETHEREAL_USER;
  const etherealPass = process.env.ETHEREAL_PASS;

  const transporter = nodemailer.createTransport(
    etherealUser
      ? {
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: { user: etherealUser, pass: etherealPass },
          tls: {
            rejectUnauthorized: false,
          },
        }
      : { jsonTransport: true }
  );

  const mailOptions = {
    from: 'noreply@snacksmart.com',
    to,
    subject: 'Welcome to SnackSmart – Confirm Your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; color: #222; max-width: 600px; margin: 0 auto;">
        <h2>Hello!</h2>
        <p>Thank you for signing up for SnackSmart! Please confirm your email by clicking the button below.</p>
        <a href="${link}" style="display: inline-block; padding: 12px 24px; background: #0b9d58; color: #fff; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Confirm Your Email
        </a>
        <p style="font-size: 12px; color: #666; margin-top: 12px;">This link expires in 24 hours.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
