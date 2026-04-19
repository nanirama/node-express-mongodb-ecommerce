const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { emailMiddleware } = require('../middlewares/emailMiddleware');

router.post('/add-to-cart', emailMiddleware, cartController.addProductToCart);
router.get('/get-cart', emailMiddleware, cartController.getCart);
router.delete(
    '/remove-from-cart/:productId',
    emailMiddleware,
    cartController.removeFromCart
);
router.patch(
    '/update-quantity',
    emailMiddleware,
    cartController.updateQuantity
);
module.exports = router;