import React from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';

const ComparisonCard = ({ title, content, type, isList = false, isKeywords = false, emptyPlaceholder = 'No content available', note }) => {
  const getCardStyle = () => {
    switch (type) {
      case 'original':
        return {
          borderLeft: '4px solid #9e9e9e',
        };
      case 'optimized':
        return {
          borderLeft: '4px solid #2E7D32',
        };
      case 'keywords':
        return {
          borderLeft: '4px solid #FF9900',
        };
      default:
        return {};
    }
  };

  const renderContent = () => {
    // Keywords chips
    if (isKeywords) {
      if (Array.isArray(content) && content.length > 0) {
        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
            {content.map((keyword, index) => (
              <Chip 
                key={index} 
                label={keyword} 
                color="secondary" 
                variant="outlined" 
                sx={{ fontWeight: 'medium' }}
              />
            ))}
          </Box>
        );
      }
      return (
        <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
          {emptyPlaceholder}
        </Typography>
      );
    }
    
    // Bullet list
    if (isList) {
      if (Array.isArray(content) && content.length > 0) {
        return (
          <Box component="ul" sx={{ pl: 2, mt: 2 }}>
            {content.map((item, index) => (
              <Typography component="li" key={index} variant="body1" sx={{ mb: 1 }}>
                {item}
              </Typography>
            ))}
          </Box>
        );
      }
      return (
        <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
          {emptyPlaceholder}
        </Typography>
      );
    }
    
    // Plain text content (e.g., description/title)
    const text = typeof content === 'string' ? content.trim() : '';
    if (text) {
      return (
        <Typography variant="body1" sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>
          {text}
        </Typography>
      );
    }
    return (
      <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
        {emptyPlaceholder}
      </Typography>
    );
  };

  return (
    <Paper 
      sx={{ 
        p: 3, 
        height: '100%', 
        borderRadius: 2,
        ...getCardStyle()
      }}
    >
      <Typography 
        variant="h6" 
        component="h3" 
        fontWeight="medium"
        color={type === 'optimized' ? 'primary.main' : type === 'keywords' ? 'secondary.main' : 'text.primary'}
      >
        {title}
      </Typography>
      {note ? (
        <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary' }}>
          {note}
        </Typography>
      ) : null}
      
      {renderContent()}
    </Paper>
  );
};

export default ComparisonCard;