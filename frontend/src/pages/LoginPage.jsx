import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import { login } from '../api/user';

/**
 * LoginPage — 用户登录页（风格对齐 AdminLogin）
 * 登录成功：令牌存 localStorage['daga_user_token']，用户信息存 'daga_user'
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /** 登录后回跳到来源页（?redirect=），默认去会员页 */
  const redirectAfterLogin = () => {
    const redirect = new URLSearchParams(location.search).get('redirect');
    navigate(redirect && redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/member');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('请输入用户名和密码');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await login(username.trim(), password);
      if (res.success) {
        localStorage.setItem('daga_user_token', res.data.token);
        localStorage.setItem('daga_user', JSON.stringify(res.data.user));
        redirectAfterLogin();
      } else {
        setError(res.error || '登录失败');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || '登录失败，请重试');
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
          <LoginIcon sx={{ fontSize: 36, color: 'primary.main' }} />
        </Box>

        <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
          用户登录
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          登录后可享受更多每日解析次数
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
          sx={{ mb: 3 }}
          disabled={loading}
        />

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

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          还没有账号？
          <Link to="/register" style={{ marginLeft: 4, fontWeight: 600 }}>
            免费注册
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
