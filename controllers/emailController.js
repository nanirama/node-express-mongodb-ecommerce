const User = require('../models/User');
const { generateOtp } = require('../email/generateOtp');
const sendOtp = require('../email/send-otp');
const jwt = require('jsonwebtoken');

exports.sendOtp = async (req, res) => {
    try {
        const { name, email } = req.body;
        if (!email) {
            return res.status(400).json({ msg: 'Email required' });
        }
        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({ name, email });
        }
        const otp = generateOtp();
        user.otp = otp;
        user.otpExpires = Date.now() + 5 * 60 * 1000;
        const savedUser = await user.save();        
        await sendOtp(email, otp);
        res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            name,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }
        if (user.otp !== otp) {
            return res.status(400).json({ msg: 'Invalid OTP' });
        }
        if (user.otpExpires < Date.now()) {
            return res.status(400).json({ msg: 'OTP expired' });
        }
        user.otp = null;
        user.otpExpires = null;
        await user.save();
        const token = jwt.sign(
            { _id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.status(200).json({ msg: 'OTP verified successfully', token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}