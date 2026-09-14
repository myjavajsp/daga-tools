import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export default function NoticeBanner({ message }) {
  if (!message) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 3,
          border: '1px solid #f0c0c0',
          bgcolor: '#fff5f5',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
        }}
      >
        <InfoOutlinedIcon sx={{ color: '#d32f2f', mt: 0.3, flexShrink: 0 }} />
        <Box>
          <Typography
            variant="subtitle2"
            sx={{ color: '#d32f2f', fontWeight: 700, mb: 0.5 }}
          >
            重要公告
          </Typography>
          <Typography variant="body2" sx={{ color: '#5f2120', lineHeight: 1.7 }}>
            {message}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
