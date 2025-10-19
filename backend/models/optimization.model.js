const { pool } = require('../config/db.config');

class OptimizationModel {
  // Create new optimization
  async create(productId, optimizationData) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Insert optimization
      const [result] = await connection.query(
        'INSERT INTO optimizations (product_id, optimized_title, optimized_description) VALUES (?, ?, ?)',
        [productId, optimizationData.title, optimizationData.description]
      );
      
      const optimizationId = result.insertId;
      
      // Insert bullet points
      if (optimizationData.bullets && optimizationData.bullets.length > 0) {
        const bulletValues = optimizationData.bullets.map((bullet, index) => [
          optimizationId, bullet, index + 1
        ]);
        
        await connection.query(
          'INSERT INTO optimized_bullets (optimization_id, bullet_text, bullet_order) VALUES ?',
          [bulletValues]
        );
      }
      
      // Insert keywords
      if (optimizationData.keywords && optimizationData.keywords.length > 0) {
        const keywordValues = optimizationData.keywords.map(keyword => [
          optimizationId, keyword
        ]);
        
        await connection.query(
          'INSERT INTO suggested_keywords (optimization_id, keyword) VALUES ?',
          [keywordValues]
        );
      }
      
      await connection.commit();
      
      return {
        id: optimizationId,
        productId,
        ...optimizationData
      };
    } catch (error) {
      await connection.rollback();
      console.error('Error creating optimization:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
  
  // Get optimization history for a product
  async getHistoryByProductId(productId) {
    try {
      // Get optimizations
      const [optimizations] = await pool.query(
        'SELECT * FROM optimizations WHERE product_id = ? ORDER BY created_at DESC',
        [productId]
      );
      
      if (optimizations.length === 0) {
        return [];
      }
      
      // Get all optimization IDs
      const optimizationIds = optimizations.map(opt => opt.id);
      
      // Get all bullets for these optimizations
      const [bullets] = await pool.query(
        'SELECT * FROM optimized_bullets WHERE optimization_id IN (?) ORDER BY optimization_id, bullet_order',
        [optimizationIds]
      );
      
      // Get all keywords for these optimizations
      const [keywords] = await pool.query(
        'SELECT * FROM suggested_keywords WHERE optimization_id IN (?)',
        [optimizationIds]
      );
      
      // Map bullets and keywords to their respective optimizations
      return optimizations.map(opt => {
        const optBullets = bullets
          .filter(b => b.optimization_id === opt.id)
          .map(b => b.bullet_text);
          
        const optKeywords = keywords
          .filter(k => k.optimization_id === opt.id)
          .map(k => k.keyword);
          
        return {
          id: opt.id,
          productId: opt.product_id,
          title: opt.optimized_title,
          description: opt.optimized_description,
          bullets: optBullets,
          keywords: optKeywords,
          createdAt: opt.created_at
        };
      });
    } catch (error) {
      console.error('Error getting optimization history:', error);
      throw error;
    }
  }
  
  // Get latest optimization for a product
  async getLatestByProductId(productId) {
    try {
      const history = await this.getHistoryByProductId(productId);
      return history.length > 0 ? history[0] : null;
    } catch (error) {
      console.error('Error getting latest optimization:', error);
      throw error;
    }
  }
}

module.exports = new OptimizationModel();