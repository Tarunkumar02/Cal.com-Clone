import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const emailConfig = {
  from: process.env.SMTP_FROM || 'Cal Clone <noreply@example.com>',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};

export default transporter;
