import React from 'react';
import { Alert, Box } from '@mui/material';

const ErrorAlert = ({ message }) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>
        {message}
      </Alert>
    </Box>
  );
};

export default ErrorAlert;