import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ApiIcon from '@mui/icons-material/Api';
import CampaignIcon from '@mui/icons-material/Campaign';
import LinkIcon from '@mui/icons-material/Link';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import LogoutIcon from '@mui/icons-material/Logout';
import { getMe } from '../../api/admin';

const DRAWER_WIDTH = 240;

const NAV_ITEMS = [
  { label: '仪表盘',    path: '/6n1x5ltwujr5',            icon: <DashboardIcon /> },
  { label: '解析接口',  path: '/6n1x5ltwujr5/interfaces',  icon: <ApiIcon /> },
  { label: '广告管理',  path: '/6n1x5ltwujr5/ads',         icon: <CampaignIcon /> },
  { label: '推荐链接',  path: '/6n1x5ltwujr5/links',       icon: <LinkIcon /> },
  { label: '系统设置',  path: '/6n1x5ltwujr5/settings',    icon: <SettingsIcon /> },
  { label: '使用说明',  path: '/6n1x5ltwujr5/guide',       icon: <MenuBookIcon /> },
  { label: 'FAQ管理',   path: '/6n1x5ltwujr5/faq',         icon: <QuestionAnswerIcon /> },
];

/**
 * AdminLayout — 后台通用布局（侧边栏 + 顶栏 + Outlet）
 */
export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminName, setAdminName] = useState('');

  // 登录状态检查
  useEffect(() => {
    const token = localStorage.getItem('daga_token');
    if (!token) {
      navigate('/6n1x5ltwujr5/login', { replace: true });
      return;
    }
    // 获取管理员信息
    const userStr = localStorage.getItem('daga_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setAdminName(user.username);
      } catch { /* ignore */ }
    }
    // 异步验证 token 有效性
    getMe().then((res) => {
      if (res.success) setAdminName(res.data.username);
    }).catch(() => {
      localStorage.removeItem('daga_token');
      localStorage.removeItem('daga_user');
      navigate('/6n1x5ltwujr5/login', { replace: true });
    });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('daga_token');
    localStorage.removeItem('daga_user');
    navigate('/6n1x5ltwujr5/login', { replace: true });
  };

  // 当前页面标题
  const currentNav = NAV_ITEMS.find((item) => {
    if (item.path === '/6n1x5ltwujr5') return location.pathname === '/6n1x5ltwujr5';
    return location.pathname.startsWith(item.path);
  });
  const pageTitle = currentNav ? currentNav.label : '管理后台';

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 2.5,
          px: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
          管理后台
        </Typography>
      </Box>
      <Divider />
      <List sx={{ flexGrow: 1, pt: 1 }}>
        {NAV_ITEMS.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={
                item.path === '/6n1x5ltwujr5'
                  ? location.pathname === '/6n1x5ltwujr5'
                  : location.pathname.startsWith(item.path)
              }
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              sx={{ mx: 1, borderRadius: 2, mb: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2, color: 'error.main' }}>
          <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="退出登录" />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', ml: { xs: 0, md: `${DRAWER_WIDTH}px` } }}>
        <AppBar position="sticky" color="default" elevation={1} sx={{ bgcolor: '#fff' }}>
          <Toolbar>
            <IconButton
              edge="start"
              sx={{ mr: 2, display: { md: 'none' } }}
              onClick={() => setMobileOpen(true)}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
              {pageTitle}
            </Typography>
            {adminName && (
              <Typography variant="body2" color="text.secondary">
                {adminName}
              </Typography>
            )}
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, bgcolor: '#f5f5f5' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
