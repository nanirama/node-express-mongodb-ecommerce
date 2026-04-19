const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.createAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body || {};
        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = new Admin({ name, email, password: hashedPassword });
        await admin.save();
        res.status(201).json(admin);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.loginAdmin = async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
        return res.status(400).json({
            message: 'Email and password are required. Send JSON (Content-Type: application/json) or form fields.',
        });
    }
    console.log('Login attempt with email:', email); // Debugging log
    try {
        
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ accessToken: token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};