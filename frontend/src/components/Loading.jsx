import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Loading — 加载动画组件
 * @param {string} message — 可选提示文字
 */
export default function Loading({ message = '加载中...' }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        gap: 2,
      }}
    >
      <CircularProgress size={40} />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}
