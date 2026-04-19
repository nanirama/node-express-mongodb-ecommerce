const mongoose = require('mongoose');
const Product = require('../models/Products');

exports.createProduct = async (req, res) => {
    try {
        const { name, price, category } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : null; // Handle image upload
        const newProduct = new Product({ name, price, category, image });
        const savedProduct = await newProduct.save();
        res.status(201).json({ msg: "Product Saved Successfully", product: savedProduct });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create product' });
    }
};

exports.getProducts = async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            const labels = [
                'disconnected',
                'connected',
                'connecting',
                'disconnecting',
            ];
            const s = mongoose.connection.readyState;
            return res.status(503).json({
                error: 'Database not connected',
                message: `MongoDB is "${labels[s] ?? s}". Open GET /health on this host to verify.`,
            });
        }
        const products = await Product.find();
        res.status(200).json({ products });
    } catch (err) {
        console.error('getProducts', err);
        res.status(500).json({
            error: 'Failed to retrieve products',
            message: err.message,
        });
    }
};