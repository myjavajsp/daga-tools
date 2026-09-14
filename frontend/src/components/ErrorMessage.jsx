import React from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

/**
 * ErrorMessage — 错误提示组件
 * @param {string} message — 错误信息
 * @param {Function} onRetry — 重试回调（可选）
 */
export default function ErrorMessage({ message = '加载失败，请稍后重试', onRetry }) {
  return (
    <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
      <Alert
        severity="error"
        sx={{ maxWidth: 500, width: '100%' }}
        action={
          onRetry ? (
            <Button color="inherit" size="small" startIcon={<RefreshIcon />} onClick={onRetry}>
              重试
            </Button>
          ) : null
        }
      >
        <Typography variant="body2">{message}</Typography>
      </Alert>
    </Box>
  );
}
