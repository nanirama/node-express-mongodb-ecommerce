const controller = require('../controllers/adminController');
const express = require('express');
const router = express.Router();

router.post('/register', controller.createAdmin);
router.post('/login', controller.loginAdmin);

module.exports = router;