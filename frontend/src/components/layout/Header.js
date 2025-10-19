import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import HistoryIcon from '@mui/icons-material/History';

const Header = () => {
  return (
    <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0', backgroundColor: 'white' }}>
      <Container>
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AutoAwesomeIcon sx={{ color: 'secondary.main', mr: 1, fontSize: 28 }} />
            <Typography
              variant="h5"
              component={RouterLink}
              to="/"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              Amazon Listing Optimizer
            </Typography>
          </Box>
          
          <Box>
            <Button
              component={RouterLink}
              to="/history"
              color="inherit"
              startIcon={<HistoryIcon />}
              sx={{ ml: 2 }}
            >
              History
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;