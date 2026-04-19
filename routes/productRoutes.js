const controller = require('../controllers/productController');
const express = require('express');
const router = express.Router();

const upload = require('../middlewares/imageMiddleware');

const adminMiddleware = require('../middlewares/adminMiddleware');
// Route to create a new product with image upload
router.post('/products/add', adminMiddleware, upload.single('image'), controller.createProduct);

router.get('/products', controller.getProducts);

module.exports = router;