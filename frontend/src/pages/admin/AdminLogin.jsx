import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Tooltip,
  IconButton,
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import RefreshIcon from '@mui/icons-material/Refresh';
import { login, getCaptcha } from '../../api/admin';

/**
 * AdminLogin — 后台登录页（含图形验证码）
 */
export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaId, setCaptchaId] = useState('');
  const [captchaImage, setCaptchaImage] = useState('');
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /** 加载/刷新验证码 */
  const loadCaptcha = useCallback(async () => {
    setCaptchaLoading(true);
    setCaptchaCode('');
    try {
      const res = await getCaptcha();
      if (res.success) {
        setCaptchaId(res.data.captchaId);
        setCaptchaImage(res.data.imageData);
      }
    } catch {
      // 若请求失败，静默忽略
    } finally {
      setCaptchaLoading(false);
    }
  }, []);

  // 页面加载时自动获取验证码
  useEffect(() => {
    loadCaptcha();
  }, [loadCaptcha]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码');
      return;
    }
    if (!captchaCode.trim()) {
      setError('请输入验证码');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await login(username.trim(), password, captchaId, captchaCode.trim());
      if (res.success) {
        localStorage.setItem('daga_token', res.data.token);
        localStorage.setItem('daga_user', JSON.stringify(res.data.user));
        navigate('/6n1x5ltwujr5');
      } else {
        setError(res.error || '登录失败');
        loadCaptcha(); // 登录失败自动刷新验证码
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || '登录失败，请重试';
      setError(msg);
      loadCaptcha(); // 异常也刷新
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        p: 2,
      }}
    >
      <Paper
        component="form"
        onSubmit={handleSubmit}
        elevation={8}
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
          maxWidth: 420,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 64,
            height: 64,
            borderRadius: '50%',
            bgcolor: 'rgba(25,118,210,0.1)',
            mb: 2,
          }}
        >
          <AdminPanelSettingsIcon sx={{ fontSize: 36, color: 'primary.main' }} />
        </Box>

        <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
          管理后台
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          请输入管理员账号登录
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <TextField
          label="用户名"
          fullWidth
          size="medium"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          sx={{ mb: 2 }}
          autoFocus
          disabled={loading}
        />

        <TextField
          label="密码"
          type="password"
          fullWidth
          size="medium"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 2 }}
          disabled={loading}
        />

        {/* 验证码行 */}
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 3 }}>
          <TextField
            label="验证码"
            fullWidth
            size="medium"
            value={captchaCode}
            onChange={(e) => setCaptchaCode(e.target.value)}
            disabled={loading}
            inputProps={{ maxLength: 6, autoComplete: 'off' }}
          />
          {/* 验证码图片 */}
          <Box
            sx={{
              flexShrink: 0,
              width: 120,
              height: 44,
              borderRadius: 1.5,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#f3f4f6',
              position: 'relative',
            }}
            onClick={loadCaptcha}
            title="点击刷新验证码"
          >
            {captchaLoading ? (
              <CircularProgress size={20} />
            ) : captchaImage ? (
              <img
                src={captchaImage}
                alt="验证码"
                style={{ width: '100%', height: '100%', display: 'block', userSelect: 'none' }}
                draggable={false}
              />
            ) : (
              <Typography variant="caption" color="text.secondary">加载中</Typography>
            )}
          </Box>
          {/* 刷新按钮 */}
          <Tooltip title="刷新验证码">
            <IconButton
              size="small"
              onClick={loadCaptcha}
              disabled={captchaLoading || loading}
              sx={{ flexShrink: 0 }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={loading}
          sx={{ py: 1.5, fontWeight: 700, fontSize: '1rem' }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : '登 录'}
        </Button>

        <Typography variant="caption" color="text.disabled" sx={{ mt: 2, display: 'block' }}>
          验证码不区分大小写 · 点击图片可刷新
        </Typography>
      </Paper>
    </Box>
  );
}
