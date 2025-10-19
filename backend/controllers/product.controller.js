const productModel = require('../models/product.model');
const scraperService = require('../services/scraper.service');

class ProductController {
  // Get product by ASIN
  async getByAsin(req, res) {
    try {
      const { asin } = req.params;
      const refreshParam = String(req.query.refresh || '').toLowerCase();
      const shouldRefresh = ['true', '1', 'yes', 'y'].includes(refreshParam);
      
      if (!asin || asin.length !== 10) {
        return res.status(400).json({
          success: false,
          message: 'Invalid ASIN format. ASIN must be 10 characters.'
        });
      }
      
      // Check if product exists in database
      let product = await productModel.getByAsin(asin);
      
      // Rescrape when forced via query or product missing
      if (!product || shouldRefresh) {
        try {
          const scrapedProduct = await scraperService.scrapeProductByAsin(asin);
          
          if (!product) {
            // Save to database if not present
            product = await productModel.create(scrapedProduct);
          } else if (scrapedProduct.description) {
            // Update existing product only when description is non-empty
            product = await productModel.update(asin, scrapedProduct);
          } else {
            // Return scraped data without updating DB if it’s still empty
            product = { id: product.id, asin, ...scrapedProduct };
          }
        } catch (error) {
          return res.status(404).json({
            success: false,
            message: 'Failed to fetch product from Amazon',
            error: error.message
          });
        }
      }
      
      return res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Error in getByAsin controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
  
  // Update product
  async update(req, res) {
    try {
      const { asin } = req.params;
      const productData = req.body;
      
      if (!asin || asin.length !== 10) {
        return res.status(400).json({
          success: false,
          message: 'Invalid ASIN format. ASIN must be 10 characters.'
        });
      }
      
      // Validate required fields
      if (!productData.title || !productData.description) {
        return res.status(400).json({
          success: false,
          message: 'Title and description are required'
        });
      }
      
      // Update product
      const updatedProduct = await productModel.update(asin, productData);
      
      return res.status(200).json({
        success: true,
        data: updatedProduct
      });
    } catch (error) {
      console.error('Error in update controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
}

module.exports = new ProductController();