import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { register } from '../api/user';

/**
 * RegisterPage — 用户注册页（风格对齐 AdminLogin）
 * 注册成功即自动登录：令牌存 localStorage['daga_user_token']
 */
export default function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const uname = username.trim();
    if (!uname) {
      setError('请输入用户名');
      return;
    }
    if (!/^[A-Za-z0-9_\u4e00-\u9fa5]{3,50}$/.test(uname)) {
      setError('用户名需为 3-50 位字母、数字、下划线或中文');
      return;
    }
    if (!password || password.length < 6) {
      setError('密码长度至少 6 位');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await register(uname, password, email.trim() || undefined);
      if (res.success) {
        localStorage.setItem('daga_user_token', res.data.token);
        localStorage.setItem('daga_user', JSON.stringify(res.data.user));
        navigate('/member');
      } else {
        setError(res.error || '注册失败');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || '注册失败，请重试');
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
          <PersonAddIcon sx={{ fontSize: 36, color: 'primary.main' }} />
        </Box>

        <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
          免费注册
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          注册即送每日免费解析次数
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
          helperText="3-50 位字母、数字、下划线或中文"
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
          helperText="至少 6 位"
          disabled={loading}
        />

        <TextField
          label="确认密码"
          type="password"
          fullWidth
          size="medium"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          sx={{ mb: 2 }}
          disabled={loading}
        />

        <TextField
          label="邮箱（选填）"
          fullWidth
          size="medium"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          {loading ? <CircularProgress size={24} color="inherit" /> : '注 册'}
        </Button>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          已有账号？
          <Link to="/login" style={{ marginLeft: 4, fontWeight: 600 }}>
            直接登录
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
