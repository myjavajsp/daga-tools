import React, { useState, useEffect } from 'react';
import {
  Grid, Paper, Typography, Box, ButtonGroup, Button, Skeleton,
} from '@mui/material';
import ApiIcon from '@mui/icons-material/Api';
import CampaignIcon from '@mui/icons-material/Campaign';
import LinkIcon from '@mui/icons-material/Link';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { getInterfaces, getAds, getLinks, getFaqs, getStats } from '../../api/admin';

/* ─────── 统计卡片 ─────── */
function StatCard({ icon, label, count, color, loading }) {
  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            {label}
          </Typography>
          {loading
            ? <Skeleton variant="text" width={60} height={48} />
            : <Typography variant="h4" sx={{ fontWeight: 700 }}>{count}</Typography>
          }
        </Box>
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 56, height: 56, borderRadius: 2,
          bgcolor: `${color}15`, color,
        }}>
          {icon}
        </Box>
      </Box>
    </Paper>
  );
}

/* ─────── 访问量卡片（今日 / 近N天汇总）─────── */
function VisitCard({ label, pv, uv, loading }) {
  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0', height: '100%' }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', gap: 4 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
            <VisibilityIcon sx={{ fontSize: 16, color: '#1976d2' }} />
            <Typography variant="caption" color="text.secondary">PV（浏览量）</Typography>
          </Box>
          {loading
            ? <Skeleton variant="text" width={50} height={40} />
            : <Typography variant="h5" sx={{ fontWeight: 700, color: '#1976d2' }}>{pv}</Typography>
          }
        </Box>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
            <PeopleAltIcon sx={{ fontSize: 16, color: '#4caf50' }} />
            <Typography variant="caption" color="text.secondary">UV（独立访客）</Typography>
          </Box>
          {loading
            ? <Skeleton variant="text" width={50} height={40} />
            : <Typography variant="h5" sx={{ fontWeight: 700, color: '#4caf50' }}>{uv}</Typography>
          }
        </Box>
      </Box>
    </Paper>
  );
}

/* ─────── 折线图 Tooltip 自定义 ─────── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <Paper sx={{ p: 1.5, border: '1px solid #e0e0e0' }} elevation={3}>
      <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>{label}</Typography>
      {payload.map((p) => (
        <Typography key={p.dataKey} variant="caption" sx={{ display: 'block', color: p.color }}>
          {p.name}：{p.value}
        </Typography>
      ))}
    </Paper>
  );
}

/* ─────── Dashboard 主组件 ─────── */
export default function Dashboard() {
  const [stats, setStats] = useState({ interfaces: 0, ads: 0, links: 0, faqs: 0 });
  const [visitData, setVisitData] = useState({ list: [], summary: { todayPv: 0, todayUv: 0, totalPv: 0, totalUv: 0 } });
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [visitLoading, setVisitLoading] = useState(true);

  /* 加载内容统计 */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [ifRes, adRes, linkRes, faqRes] = await Promise.allSettled([
          getInterfaces(), getAds(), getLinks(), getFaqs(),
        ]);
        setStats({
          interfaces: ifRes.status === 'fulfilled' && ifRes.value.success ? (ifRes.value.data || []).length : 0,
          ads:         adRes.status === 'fulfilled' && adRes.value.success  ? (adRes.value.data || []).length  : 0,
          links:       linkRes.status === 'fulfilled' && linkRes.value.success ? (linkRes.value.data || []).length : 0,
          faqs:        faqRes.status === 'fulfilled' && faqRes.value.success   ? (faqRes.value.data || []).length   : 0,
        });
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, []);

  /* 加载访问统计 */
  useEffect(() => {
    const load = async () => {
      setVisitLoading(true);
      try {
        const res = await getStats(days);
        if (res.success) {
          // 日期简化显示 MM-DD
          const list = res.data.list.map(item => ({
            ...item,
            date: item.date.slice(5), // 截取 MM-DD
          }));
          setVisitData({ list, summary: res.data.summary });
        }
      } catch { /* ignore */ }
      setVisitLoading(false);
    };
    load();
  }, [days]);

  const contentCards = [
    { label: '解析接口', count: stats.interfaces, icon: <ApiIcon sx={{ fontSize: 28 }} />,           color: '#1976d2' },
    { label: '广告位',   count: stats.ads,        icon: <CampaignIcon sx={{ fontSize: 28 }} />,       color: '#e91e63' },
    { label: '推荐链接', count: stats.links,      icon: <LinkIcon sx={{ fontSize: 28 }} />,           color: '#4caf50' },
    { label: 'FAQ',      count: stats.faqs,       icon: <QuestionAnswerIcon sx={{ fontSize: 28 }} />, color: '#ff9800' },
  ];

  const { summary } = visitData;

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
        仪表盘
      </Typography>

      {/* 内容统计卡片 */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {contentCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
            <StatCard {...card} loading={loading} />
          </Grid>
        ))}
      </Grid>

      {/* 访问量汇总卡片 */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <VisitCard label="今日访问" pv={summary.todayPv} uv={summary.todayUv} loading={visitLoading} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <VisitCard label={`近 ${days} 天累计`} pv={summary.totalPv} uv={summary.totalUv} loading={visitLoading} />
        </Grid>
      </Grid>

      {/* 折线图 */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon sx={{ color: '#1976d2' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              访问趋势
            </Typography>
          </Box>
          <ButtonGroup size="small" variant="outlined">
            {[7, 14, 30].map(d => (
              <Button
                key={d}
                onClick={() => setDays(d)}
                variant={days === d ? 'contained' : 'outlined'}
                sx={{ minWidth: 52 }}
              >
                {d}天
              </Button>
            ))}
          </ButtonGroup>
        </Box>

        {visitLoading ? (
          <Skeleton variant="rectangular" height={260} sx={{ borderRadius: 2 }} />
        ) : visitData.list.length === 0 ? (
          <Box sx={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="text.secondary">暂无访问数据</Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={visitData.list} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={36} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 13 }} />
              <Line
                type="monotone"
                dataKey="pv"
                name="PV（浏览量）"
                stroke="#1976d2"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="uv"
                name="UV（独立访客）"
                stroke="#4caf50"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Paper>
    </Box>
  );
}
