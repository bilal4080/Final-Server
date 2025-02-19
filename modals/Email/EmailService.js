// emailService.js (You can create this file in your backend)

const nodemailer = require('nodemailer');

// Create a reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use any email service
  auth: {
    user: process.env.EMAIL_USER,  // Access from the .env file
    pass: process.env.EMAIL_PASS,  // Access from the .env file
  },
});

// Function to send the email
// Function to send the email
const sendEmail = async (toEmail, subject, text) => {
  try {
    const info = await transporter.sendMail({
      from: '"Imdedifix" <shieldkhan29@gmail.com>', // Corrected the sender email format
      to: toEmail, // List of receivers
      subject: subject, // Subject line
      text: text, // Plain text body
    });
    console.log('Email sent:', info.response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};


module.exports = sendEmail;
