// utils/bulkEmail.js
import nodemailer from 'nodemailer';
import User from '../model/User.js';

export const sendEmail = async (subject, text) => {
  const users = await User.find({}, 'email');
  const emails = users.map(user => user.email);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_EMAIL, // e.g. cp.arena.notify@gmail.com
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: emails,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
};
