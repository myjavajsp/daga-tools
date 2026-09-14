import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

/**
 * FaqSection — FAQ 折叠面板区
 *
 * @param {Array} faqs — FAQ 列表 [{ id, question, answer }]
 */
export default function FaqSection({ faqs = [] }) {
  const [expanded, setExpanded] = useState(false);

  if (faqs.length === 0) return null;

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

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
        ❓ 常见问题
      </Typography>

      <Box>
        {faqs.map((faq) => (
          <Accordion
            key={faq.id}
            expanded={expanded === `panel-${faq.id}`}
            onChange={handleChange(`panel-${faq.id}`)}
            elevation={0}
            sx={{
              mb: 1,
              border: '1px solid #e8e8e8',
              '&:last-child': { mb: 0 },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ fontWeight: 600, fontSize: '0.95rem' }}
            >
              {faq.question}
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                {faq.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Paper>
  );
}
