const productModel = require('../models/product.model');
const optimizationModel = require('../models/optimization.model');

class HistoryController {
  // Get optimization history for a product
  async getByAsin(req, res) {
    try {
      const { asin } = req.params;
      
      if (!asin || asin.length !== 10) {
        return res.status(400).json({
          success: false,
          message: 'Invalid ASIN format. ASIN must be 10 characters.'
        });
      }
      
      // Get product from database
      const product = await productModel.getByAsin(asin);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      // Get optimization history
      const history = await optimizationModel.getHistoryByProductId(product.id);
      
      return res.status(200).json({
        success: true,
        data: {
          product,
          history
        }
      });
    } catch (error) {
      console.error('Error in getByAsin history controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
}

module.exports = new HistoryController();