import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = {
  // Product endpoints
  getProductByAsin: (asin) => {
    return axios.get(`${API_URL}/products/${asin}`);
  },
  
  updateProduct: (asin, productData) => {
    return axios.put(`${API_URL}/products/${asin}`, productData);
  },
  
  // Optimization endpoints
  optimizeProduct: (asin) => {
    return axios.post(`${API_URL}/optimize/${asin}`);
  },
  
  // History endpoints
  getHistoryByAsin: (asin) => {
    return axios.get(`${API_URL}/history/${asin}`);
  }
};

export default api;