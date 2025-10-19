const { pool } = require('../config/db.config');

class ProductModel {
  // Get product by ASIN
  async getByAsin(asin) {
    try {
      const [product] = await pool.query(
        'SELECT * FROM products WHERE asin = ?',
        [asin]
      );
      
      if (product.length === 0) {
        return null;
      }
      
      // Get bullet points
      const [bullets] = await pool.query(
        'SELECT * FROM product_bullets WHERE product_id = ? ORDER BY bullet_order',
        [product[0].id]
      );
      
      return {
        ...product[0],
        bullets: bullets.map(b => b.bullet_text)
      };
    } catch (error) {
      console.error('Error getting product by ASIN:', error);
      throw error;
    }
  }
  
  // Create new product
  async create(productData) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Insert product
      const [result] = await connection.query(
        'INSERT INTO products (asin, title, description) VALUES (?, ?, ?)',
        [productData.asin, productData.title, productData.description]
      );
      
      const productId = result.insertId;
      
      // Insert bullet points
      if (productData.bullets && productData.bullets.length > 0) {
        const bulletValues = productData.bullets.map((bullet, index) => [
          productId, bullet, index + 1
        ]);
        
        await connection.query(
          'INSERT INTO product_bullets (product_id, bullet_text, bullet_order) VALUES ?',
          [bulletValues]
        );
      }
      
      await connection.commit();
      
      return {
        id: productId,
        asin: productData.asin,
        title: productData.title,
        description: productData.description,
        bullets: productData.bullets || []
      };
    } catch (error) {
      await connection.rollback();
      console.error('Error creating product:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
  
  // Update existing product
  async update(asin, productData) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Get product ID
      const [product] = await connection.query(
        'SELECT id FROM products WHERE asin = ?',
        [asin]
      );
      
      if (product.length === 0) {
        throw new Error('Product not found');
      }
      
      const productId = product[0].id;
      
      // Update product
      await connection.query(
        'UPDATE products SET title = ?, description = ? WHERE id = ?',
        [productData.title, productData.description, productId]
      );
      
      // Delete existing bullets
      await connection.query(
        'DELETE FROM product_bullets WHERE product_id = ?',
        [productId]
      );
      
      // Insert new bullets
      if (productData.bullets && productData.bullets.length > 0) {
        const bulletValues = productData.bullets.map((bullet, index) => [
          productId, bullet, index + 1
        ]);
        
        await connection.query(
          'INSERT INTO product_bullets (product_id, bullet_text, bullet_order) VALUES ?',
          [bulletValues]
        );
      }
      
      await connection.commit();
      
      return {
        id: productId,
        asin,
        ...productData
      };
    } catch (error) {
      await connection.rollback();
      console.error('Error updating product:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = new ProductModel();