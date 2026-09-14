import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';

/**
 * GuideSteps — 使用说明区（4步卡片式）
 *
 * @param {Array} steps — 步骤列表 [{ id, step_number, content }]
 */
export default function GuideSteps({ steps = [] }) {
  if (steps.length === 0) return null;

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
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
        📖 使用说明
      </Typography>

      <Grid container spacing={2}>
        {steps.map((step) => (
          <Grid item xs={12} sm={6} md={3} key={step.id}>
            <Box
              sx={{
                textAlign: 'center',
                p: 2,
                height: '100%',
                borderRadius: 2,
                bgcolor: '#f8f9ff',
                border: '1px solid #e8ecff',
              }}
            >
              {/* 序号圆圈 */}
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: '#667eea',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  mb: 1.5,
                }}
              >
                {step.step_number}
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                {step.content}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}
