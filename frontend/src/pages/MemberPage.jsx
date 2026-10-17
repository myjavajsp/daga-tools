import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import { getMe } from '../api/user';
import Header from '../components/Header';
import Footer from '../components/Footer';

/** 等级 → 展示名 */
const LEVEL_LABELS = { 0: '免费用户', 1: '月费会员', 2: '年费会员', 3: '永久会员' };
/** 等级 → 升级提示 */
const LEVEL_HINTS = {
  0: '升级会员每日可享 100 次解析，支持全平台高清极速线路。',
  1: '升级年费会员更优惠，到期时间越长越划算。',
  2: '升级永久会员一劳永逸，再也不用担心到期。',
  3: '您已是永久会员，感谢支持！',
};

/** 格式化到期时间（DATETIME → 本地可读） */
function fmtExpires(v) {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleString('zh-CN', { hour12: false });
}

/**
 * MemberPage — 我的会员页
 * 展示等级、到期日、今日剩余次数与升级提示；未登录跳转登录页。
 */
export default function MemberPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getMe();
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.error || '获取用户信息失败');
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        navigate('/login?redirect=/member', { replace: true });
        return;
      }
      setError(err.response?.data?.error || err.message || '获取用户信息失败');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('daga_user_token');
    if (!token) {
      navigate('/login?redirect=/member', { replace: true });
      return;
    }
    load();
  }, [load, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('daga_user_token');
    localStorage.removeItem('daga_user');
    navigate('/');
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  const quota = data?.quota || {};
  const level = quota.level ?? 0;

  return (
    <div className="min-h-screen bg-paper">
      <Header />
      <div className="wrap py-8 col-sm">
        <div className="phead">
          <h1>我的会员</h1>
          <span className="note">等级、到期时间与今日解析额度</span>
        </div>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {data && (
          <>
            {/* 账号信息 */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 22,
                  }}
                >
                  {(data.nickname || data.username || 'U').charAt(0).toUpperCase()
                  }
                </Box>
                <Box sx={{ flexGrow: 1, minWidth: 160 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {data.nickname || data.username}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    用户名：{data.username}
                    {data.email ? ` · 邮箱：${data.email}` : ''}
                  </Typography>
                </Box>
                <Chip
                  icon={<WorkspacePremiumIcon />}
                  label={LEVEL_LABELS[level] || '免费用户'}
                  color={level > 0 ? 'warning' : 'default'}
                  sx={{ fontWeight: 700 }}
                />
              </Box>
            </Paper>

            {/* 配额卡片 */}
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 3 }}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', flex: '1 1 200px' }}>
                <Typography variant="caption" color="text.secondary">会员等级</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{LEVEL_LABELS[level] || '免费用户'}</Typography>
              </Paper>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', flex: '1 1 200px' }}>
                <Typography variant="caption" color="text.secondary">到期时间</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {level === 3 ? '永久有效' : fmtExpires(quota.vip_expires_at)}
                </Typography>
              </Paper>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', flex: '1 1 200px' }}>
                <Typography variant="caption" color="text.secondary">今日剩余解析</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {quota.remaining ?? 0} / {quota.effective_quota ?? 0} 次
                </Typography>
              </Paper>
            </Box>

            {/* 升级提示 */}
            {level < 3 && (
              <Alert
                severity="info"
                icon={<WorkspacePremiumIcon />}
                sx={{ mb: 3, borderRadius: 2 }}
                action={
                  <Button component={Link} to="/register" size="small" color="inherit" variant="outlined">
                    了解注册
                  </Button>
                }
              >
                {LEVEL_HINTS[level] || LEVEL_HINTS[0]}
              </Alert>
            )}
            {level === 3 && (
              <Alert severity="success" icon={<WorkspacePremiumIcon />} sx={{ mb: 3, borderRadius: 2 }}>
                {LEVEL_HINTS[3]}
              </Alert>
            )}

            <Button variant="outlined" color="error" startIcon={<LogoutIcon />} onClick={handleLogout}>
              退出登录
            </Button>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
