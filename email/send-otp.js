const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        // Gmail app passwords are often copied with spaces between groups
        pass: process.env.EMAIL_PASSWORD?.replace(/\s/g, ''),
    },
});

const sendOtp = async (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'OTP Verification',
        text: `Your OTP is ${otp}`,
        html: `<p>Your OTP is ${otp}</p>`
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.log('Error sending email:', error);
    }
};

module.exports = sendOtp;