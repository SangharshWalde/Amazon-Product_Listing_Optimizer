import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const Footer = () => {
  return (
    <Box component="footer" sx={{ py: 3, mt: 'auto', backgroundColor: 'white', borderTop: '1px solid #e0e0e0' }}>
      <Container>
        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} Amazon Listing Optimizer | SalesDuo Intern Project
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;