const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0
    },
    products: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        productName: {
            type: String,
            required: true
        },
        productPrice: {
            type: Number,
            required: true
        },
        productImage: {
            type: String,
            default: ''
        },
        quantity: {
            type: Number,
            required: true,
            default: 1
        }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);