const Cart = require('../models/Cart');
const User = require('../models/User');
const Product = require('../models/Products');

function totalFromLineItems(products) {
    return products.reduce(
        (sum, item) => sum + item.productPrice * item.quantity,
        0
    );
}

exports.addProductToCart = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }
        const { productId, quantity } = req.body;
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(400).json({ msg: 'Product not found' });
        }
        const line = {
            productId,
            productName: product.name,
            productPrice: product.price,
            productImage: product.image || '',
            quantity,
        };
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = await Cart.create({
                userId,
                totalPrice: line.productPrice * line.quantity,
                products: [line],
            });
            return res.status(200).json({ msg: 'Product added to cart', cart });
        }
        const itemIndex = cart.products.findIndex(
            (item) => item.productId.toString() === productId
        );
        if (itemIndex > -1) {
            cart.products[itemIndex].quantity += quantity;
            cart.products[itemIndex].productPrice = product.price;
            cart.products[itemIndex].productName = product.name;
            cart.products[itemIndex].productImage = product.image || '';
        } else {
            cart.products.push(line);
        }
        cart.totalPrice = totalFromLineItems(cart.products);
        await cart.save();
        return res.status(200).json({ msg: 'Product added to cart', cart });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.getCart = async (req, res) => {
    try {
        const userId = req.userId;
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(400).json({ msg: 'Cart not found' });
        }
        return res.status(200).json({ cart });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const cart = await Cart.findOne({ userId: req.userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found',
            });
        }
        const before = cart.products.length;
        cart.products = cart.products.filter(
            (item) => item.productId.toString() !== productId
        );
        if (cart.products.length === before) {
            return res.status(404).json({
                success: false,
                message: 'Product not in cart',
            });
        }
        cart.totalPrice = totalFromLineItems(cart.products);
        await cart.save();
        return res.json({
            success: true,
            message: 'Product removed',
            cart,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.updateQuantity = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const qty = Number(quantity);
        if (!productId || Number.isNaN(qty) || qty < 1) {
            return res.status(400).json({
                success: false,
                message: 'Valid productId and quantity (>= 1) required',
            });
        }
        const cart = await Cart.findOne({ userId: req.userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found',
            });
        }
        const itemIndex = cart.products.findIndex(
            (item) => item.productId.toString() === productId
        );
        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Product not in cart',
            });
        }
        cart.products[itemIndex].quantity = qty;
        cart.totalPrice = totalFromLineItems(cart.products);
        await cart.save();
        return res.json({
            success: true,
            message: 'Quantity updated',
            cart,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
