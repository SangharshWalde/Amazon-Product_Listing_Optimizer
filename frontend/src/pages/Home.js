import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress } from '@mui/material';
import AsinForm from '../components/AsinForm';
import ComparisonView from '../components/ComparisonView';
import ErrorAlert from '../components/common/ErrorAlert';
import api from '../services/api';

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [productData, setProductData] = useState(null);
  const [optimizedData, setOptimizedData] = useState(null);

  const handleSubmit = async (asin) => {
    setLoading(true);
    setError(null);
    
    try {
      // First fetch the product data
      const productResponse = await api.getProductByAsin(asin);
      const productPayload = productResponse.data?.data || productResponse.data;
      setProductData({
        asin: productPayload.asin,
        title: productPayload.title,
        bullet_points: productPayload.bullets || [],
        description: productPayload.description || ''
      });
      
      // Then optimize the product
      const optimizationResponse = await api.optimizeProduct(asin);
      const optData = optimizationResponse.data?.data?.optimized || optimizationResponse.data?.optimized || optimizationResponse.data || {};
      setOptimizedData({
        title: optData.title,
        bullet_points: optData.bullets || [],
        description: optData.description || '',
        keywords: optData.keywords || []
      });
      
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'An error occurred while fetching the product data');
      console.error('Error:', err);
    }
  };

  return (
    <Box>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          mb: 4, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)',
          textAlign: 'center'
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Optimize Your Amazon Product Listings with AI
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3, maxWidth: 800, mx: 'auto' }}>
          Enter your Amazon product ASIN to get AI-optimized title, bullet points, and description that can help improve your listing's performance.
        </Typography>
        
        <AsinForm onSubmit={handleSubmit} loading={loading} />
      </Paper>

      {error && <ErrorAlert message={error} />}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {productData && optimizedData && !loading && (
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <ComparisonView 
              originalProduct={productData} 
              optimizedProduct={optimizedData} 
            />
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Home;