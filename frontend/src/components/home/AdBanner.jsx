import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

/**
 * AdBanner — 广告位组件
 *
 * @param {Array} ads — 广告列表 [{ id, position, name, code }]
 */
export default function AdBanner({ ads = [] }) {
  if (ads.length === 0) return null;

  return (
    <Box sx={{ mb: 3 }}>
      {ads.map((ad) => (
        <Paper
          key={ad.id}
          elevation={0}
          sx={{
            mb: 2,
            borderRadius: 3,
            border: '1px solid #e0e0e0',
            overflow: 'hidden',
          }}
        >
          {/* 广告标签 */}
          {ad.name && (
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                textAlign: 'center',
                py: 0.5,
                bgcolor: '#f5f5f5',
                color: 'text.disabled',
                fontSize: '0.7rem',
              }}
            >
              广告 · {ad.name}
            </Typography>
          )}

          {/* 广告内容 */}
          <Box
            dangerouslySetInnerHTML={{ __html: ad.code }}
            sx={{
              '& > *': { maxWidth: '100%' },
            }}
          />
        </Paper>
      ))}
    </Box>
  );
}
