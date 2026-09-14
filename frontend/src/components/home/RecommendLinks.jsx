import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import MovieIcon from '@mui/icons-material/Movie';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import SmartDisplayIcon from '@mui/icons-material/SmartDisplay';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import TheatersIcon from '@mui/icons-material/Theaters';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';

/** 默认图标映射 */
const DEFAULT_ICONS = [
  <MovieIcon />,
  <MusicNoteIcon />,
  <SmartDisplayIcon />,
  <LiveTvIcon />,
  <OndemandVideoIcon />,
  <HeadphonesIcon />,
  <TheatersIcon />,
  <SportsEsportsIcon />,
];

/**
 * RecommendLinks — 推荐链接区
 *
 * @param {Array} links — 推荐链接列表 [{ id, name, link_url, icon_url }]
 */
export default function RecommendLinks({ links = [] }) {
  if (links.length === 0) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 3,
        border: '1px solid #e0e0e0',
        mb: 3,
      }}
    >
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        🔥 推荐工具
      </Typography>

      <Grid container spacing={2}>
        {links.map((link, idx) => (
          <Grid item xs={6} sm={3} key={link.id}>
            <Paper
              component="a"
              href={link.link_url}
              target="_blank"
              rel="noopener noreferrer"
              elevation={0}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 3,
                px: 1,
                borderRadius: 2,
                bgcolor: '#f8f9ff',
                border: '1px solid #e8ecff',
                cursor: 'pointer',
                textDecoration: 'none',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: '#eef0ff',
                  borderColor: '#c5caff',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(102,126,234,0.15)',
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  bgcolor: 'rgba(102,126,234,0.1)',
                  color: '#667eea',
                  mb: 1,
                  fontSize: 24,
                }}
              >
                {link.icon_url ? (
                  <img src={link.icon_url} alt={link.name} width="24" height="24" />
                ) : (
                  DEFAULT_ICONS[idx % DEFAULT_ICONS.length]
                )}
              </Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: 'text.primary', textAlign: 'center' }}
              >
                {link.name}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}
