const express = require('express');
const router = express.Router();
const optimizationController = require('../controllers/optimization.controller');

// Optimize product by ASIN
router.post('/:asin', optimizationController.optimizeProduct);

module.exports = router;