import React, { useState } from 'react';
import { Box, TextField, Button, InputAdornment, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LoadingButton from '@mui/lab/LoadingButton';

const AsinForm = ({ onSubmit, loading }) => {
  const [asin, setAsin] = useState('');
  const [error, setError] = useState('');

  const validateAsin = (value) => {
    // Basic ASIN validation - 10 characters alphanumeric
    const asinRegex = /^[A-Z0-9]{10}$/;
    return asinRegex.test(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const trimmedAsin = asin.trim().toUpperCase();
    
    if (!trimmedAsin) {
      setError('Please enter an ASIN');
      return;
    }
    
    if (!validateAsin(trimmedAsin)) {
      setError('Please enter a valid ASIN (10 characters, alphanumeric)');
      return;
    }
    
    setError('');
    onSubmit(trimmedAsin);
  };

  return (
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
        placeholder="Enter Amazon ASIN (e.g., B07PXGQC1Q)"
        value={asin}
        onChange={(e) => setAsin(e.target.value)}
        error={!!error}
        helperText={error}
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
      
      {loading ? (
        <LoadingButton
          loading
          variant="contained"
          color="primary"
          sx={{ 
            minWidth: 180,
            height: 56,
            borderRadius: 2
          }}
        >
          Optimizing...
        </LoadingButton>
      ) : (
        <Button
          type="submit"
          variant="contained"
          color="primary"
          startIcon={<AutoAwesomeIcon />}
          sx={{ 
            minWidth: 180,
            height: 56,
            borderRadius: 2
          }}
        >
          Optimize Listing
        </Button>
      )}
    </Paper>
  );
};

export default AsinForm;