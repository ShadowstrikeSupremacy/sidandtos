const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Email config error:', error);
  } else {
    console.log('📧 Email server ready');
  }
});

function sendMail(options) {
  return transporter.sendMail(options);
}

module.exports = { sendMail };
