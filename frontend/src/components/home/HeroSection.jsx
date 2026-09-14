import React from 'react';
import { Box, Typography } from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';

/**
 * HeroSection — 首页标题区（深蓝到紫渐变，仿 daga.cc 风格）
 *
 * @param {string} title — 标题（可选，默认使用内置文案）
 * @param {string} subtitle — 副标题
 */
export default function HeroSection({ title, subtitle }) {
  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 3,
        mb: 3,
        py: { xs: 6, md: 8 },
        px: 3,
        textAlign: 'center',
        background: 'linear-gradient(135deg, #0c1929 0%, #1a237e 35%, #283593 65%, #3949ab 100%)',
        boxShadow: '0 4px 30px rgba(26,35,126,0.25)',
      }}
    >
      {/* 装饰性粒子 */}
      <Box
        sx={{
          position: 'absolute',
          top: -60,
          right: -40,
          width: 240,
          height: 240,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(66,165,245,0.15) 0%, transparent 70%)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -40,
          left: -30,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(156,39,176,0.12) 0%, transparent 70%)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          right: '15%',
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)',
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
          <PlayCircleOutlineIcon sx={{ color: '#42a5f5', fontSize: 44, mr: 1.5, filter: 'drop-shadow(0 2px 8px rgba(66,165,245,0.4))' }} />
          <Typography
            component="h1"
            variant="h3"
            sx={{
              color: '#fff',
              fontWeight: 800,
              fontSize: { xs: '1.4rem', sm: '2rem', md: '2.25rem' },
              textShadow: '0 2px 12px rgba(0,0,0,0.3)',
              letterSpacing: '0.02em',
            }}
          >
            {title || '蓝光VIP视频在线解析'}
          </Typography>
        </Box>
        <Typography
          variant="h6"
          sx={{
            color: 'rgba(255,255,255,0.75)',
            fontWeight: 400,
            fontSize: { xs: '0.85rem', sm: '1rem', md: '1.1rem' },
            maxWidth: 600,
            mx: 'auto',
            lineHeight: 1.6,
          }}
        >
          {subtitle || '免费解析腾讯视频、优酷、爱奇艺等全网VIP视频'}
        </Typography>
      </Box>
    </Box>
  );
}
