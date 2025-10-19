const productModel = require('../models/product.model');
const optimizationModel = require('../models/optimization.model');
const openaiService = require('../services/openai.service');

class OptimizationController {
  // Optimize product listing
  async optimizeProduct(req, res) {
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
      
      // Generate optimized content using OpenAI
      const optimizedData = await openaiService.optimizeProduct(product);
      
      // Save optimization to database
      const savedOptimization = await optimizationModel.create(product.id, optimizedData);
      
      return res.status(200).json({
        success: true,
        data: {
          original: product,
          optimized: savedOptimization
        }
      });
    } catch (error) {
      console.error('Error in optimizeProduct controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Optimization failed',
        error: error.message
      });
    }
  }
}

module.exports = new OptimizationController();