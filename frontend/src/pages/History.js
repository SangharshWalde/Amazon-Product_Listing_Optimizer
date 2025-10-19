import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  Divider,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import ErrorAlert from '../components/common/ErrorAlert';
import ComparisonView from '../components/ComparisonView';
import api from '../services/api';

const History = () => {
  const { asin } = useParams();
  const navigate = useNavigate();
  const [searchAsin, setSearchAsin] = useState(asin || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedOptimization, setSelectedOptimization] = useState(null);
  const [originalProduct, setOriginalProduct] = useState(null);

  useEffect(() => {
    if (asin) {
      fetchHistory(asin);
    }
  }, [asin]);

  const fetchHistory = async (asinValue) => {
    setLoading(true);
    setError(null);
    setSelectedOptimization(null);
    setHistory([]);

    try {
      const response = await api.getHistoryByAsin(asinValue);
      // Backend returns: { success, data: { product, history } }
      const payload = response?.data?.data || {};
      const product = payload.product || null;
      const rawHistory = Array.isArray(payload.history) ? payload.history : [];
      // Normalize server fields to match frontend expectations
      const normalizedHistory = rawHistory.map(h => ({
        ...h,
        bullet_points: Array.isArray(h.bullets) ? h.bullets : [],
        created_at: h.created_at || h.createdAt,
      }));

      // Map backend product.bullets -> product.bullet_points
      const normalizedProduct = product ? {
        ...product,
        bullet_points: Array.isArray(product.bullets) ? product.bullets : [],
      } : null;

      setHistory(normalizedHistory);
      setOriginalProduct(normalizedProduct);

      if (normalizedHistory.length > 0) {
        setSelectedOptimization(normalizedHistory[0]);
      }

      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err?.response?.data?.message || 'An error occurred while fetching the history');
      console.error('Error:', err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchAsin.trim()) {
      navigate(`/history/${searchAsin.trim().toUpperCase()}`);
    }
  };

  const handleOptimizationSelect = (optimization) => {
    setSelectedOptimization(optimization);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <Box>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          mb: 4, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)'
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Optimization History
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          View the history of optimizations for your Amazon product listings.
        </Typography>
        
        <Paper 
          component="form" 
          onSubmit={handleSubmit}
          elevation={0}
          sx={{ 
            p: 2, 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            alignItems: 'center', 
            maxWidth: 600, 
            mx: 'auto',
            borderRadius: 2,
            backgroundColor: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Enter Amazon ASIN"
            value={searchAsin}
            onChange={(e) => setSearchAsin(e.target.value)}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ 
              mr: { xs: 0, sm: 2 },
              mb: { xs: 2, sm: 0 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<HistoryIcon />}
            disabled={loading}
            sx={{ 
              minWidth: 180,
              height: 56,
              borderRadius: 2
            }}
          >
            View History
          </Button>
        </Paper>
      </Paper>

      {error && <ErrorAlert message={error} />}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && history.length > 0 && (
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom fontWeight="medium">
              Optimization Records
            </Typography>
            <Box sx={{ maxHeight: 600, overflowY: 'auto', pr: 2 }}>
              {history.map((item) => (
                <Card 
                  key={item.id} 
                  sx={{ 
                    mb: 2, 
                    cursor: 'pointer',
                    borderRadius: 2,
                    border: selectedOptimization?.id === item.id ? '2px solid' : '1px solid',
                    borderColor: selectedOptimization?.id === item.id ? 'primary.main' : '#e0e0e0',
                  }}
                  onClick={() => handleOptimizationSelect(item)}
                >
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      {formatDate(item.created_at)}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2" noWrap>
                      {item.title.substring(0, 60)}...
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Grid>
          
          <Grid item xs={12} md={8}>
            {selectedOptimization && originalProduct && (
              <ComparisonView 
                originalProduct={originalProduct} 
                optimizedProduct={selectedOptimization} 
              />
            )}
          </Grid>
        </Grid>
      )}

      {!loading && history.length === 0 && asin && (
        <Box sx={{ textAlign: 'center', my: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No optimization history found for ASIN: {asin}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            Try optimizing this product first on the home page.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default History;