const express = require('express');
const router = express.Router();
const historyController = require('../controllers/history.controller');

// Get optimization history by ASIN
router.get('/:asin', historyController.getByAsin);

module.exports = router;