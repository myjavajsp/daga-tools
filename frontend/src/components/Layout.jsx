import React from 'react';
import { Box, Container } from '@mui/material';
import Header from './Header';
import Footer from './Footer';

/**
 * Layout — 前台通用布局（Header + 内容 + Footer）
 */
export default function Layout({ children }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <Header />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
          {children}
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}
