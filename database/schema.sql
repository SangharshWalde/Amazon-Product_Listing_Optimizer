-- Create database
CREATE DATABASE IF NOT EXISTS amazon_listing_app;
USE amazon_listing_app;

-- Products table to store original product details
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asin VARCHAR(10) NOT NULL UNIQUE,
  title VARCHAR(500),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_asin (asin)
);

-- Bullet points table to store original bullet points
CREATE TABLE IF NOT EXISTS product_bullets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  bullet_text TEXT NOT NULL,
  bullet_order INT NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product_id (product_id)
);

-- Optimizations table to store optimization records
CREATE TABLE IF NOT EXISTS optimizations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  optimized_title VARCHAR(500),
  optimized_description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product_id (product_id)
);

-- Optimized bullet points table
CREATE TABLE IF NOT EXISTS optimized_bullets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  optimization_id INT NOT NULL,
  bullet_text TEXT NOT NULL,
  bullet_order INT NOT NULL,
  FOREIGN KEY (optimization_id) REFERENCES optimizations(id) ON DELETE CASCADE,
  INDEX idx_optimization_id (optimization_id)
);

-- Keywords table for suggested keywords
CREATE TABLE IF NOT EXISTS suggested_keywords (
  id INT AUTO_INCREMENT PRIMARY KEY,
  optimization_id INT NOT NULL,
  keyword VARCHAR(255) NOT NULL,
  FOREIGN KEY (optimization_id) REFERENCES optimizations(id) ON DELETE CASCADE,
  INDEX idx_optimization_id (optimization_id)
);