import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Paper, Chip, Grid } from '@mui/material';
import ComparisonCard from './ComparisonCard';

const ComparisonView = ({ originalProduct, optimizedProduct }) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Build a safe fallback for original description when empty
  const originalDescRaw = (originalProduct?.description || '').trim();
  const originalBullets = Array.isArray(originalProduct?.bullet_points) ? originalProduct.bullet_points : [];
  const originalDescDisplay = originalDescRaw || (originalBullets.length ? originalBullets.join(' ') : '');
  const originalDescNote = originalDescRaw ? undefined : (originalBullets.length ? 'Derived from bullet points' : undefined);

  return (
    <Box className="fade-in">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h2" fontWeight="bold">
          Optimization Results
        </Typography>
        <Chip 
          label={`ASIN: ${originalProduct.asin}`} 
          color="secondary" 
          variant="outlined" 
          sx={{ fontWeight: 'medium' }}
        />
      </Box>

      <Paper sx={{ mb: 4, borderRadius: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
          aria-label="comparison tabs"
        >
          <Tab label="Title" />
          <Tab label="Bullet Points" />
          <Tab label="Description" />
          <Tab label="Keywords" />
        </Tabs>
      </Paper>

      <Box sx={{ display: activeTab === 0 ? 'block' : 'none' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <ComparisonCard 
              title="Original Title"
              content={originalProduct.title}
              type="original"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ComparisonCard 
              title="Optimized Title"
              content={optimizedProduct.title}
              type="optimized"
            />
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ display: activeTab === 1 ? 'block' : 'none' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <ComparisonCard 
              title="Original Bullet Points"
              content={originalProduct.bullet_points}
              type="original"
              isList={true}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ComparisonCard 
              title="Optimized Bullet Points"
              content={optimizedProduct.bullet_points}
              type="optimized"
              isList={true}
            />
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ display: activeTab === 2 ? 'block' : 'none' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <ComparisonCard 
              title="Original Description"
              content={originalDescDisplay}
              type="original"
              emptyPlaceholder="No description provided on the product page"
              note={originalDescNote}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ComparisonCard 
              title="Optimized Description"
              content={optimizedProduct.description}
              type="optimized"
            />
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ display: activeTab === 3 ? 'block' : 'none' }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ComparisonCard 
              title="Suggested Keywords"
              content={optimizedProduct.keywords}
              type="keywords"
              isKeywords={true}
              emptyPlaceholder="No keywords suggested"
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ComparisonView;