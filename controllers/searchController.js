const Product = require('../models/Products');

function escapeRegex(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

exports.searchProducts = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || !String(q).trim()) {
            return res.status(400).json({
                msg: 'Provide query param q (product name)',
            });
        }
        const filter = {
            isActive: true,
            name: { $regex: escapeRegex(String(q).trim()), $options: 'i' },
        };
        const products = await Product.find(filter).sort({ createdAt: -1 });
        return res.status(200).json({
            products,
            count: products.length,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
