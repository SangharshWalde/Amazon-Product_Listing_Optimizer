const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

// Get product by ASIN
router.get('/:asin', productController.getByAsin);

// Update product
router.put('/:asin', productController.update);

module.exports = router;