/**
 * daga-clone — frontend/src/api/user.js
 * 前台用户体系 API（注册 / 登录 / 我的资料 / 修改密码）
 * 令牌独立存储 localStorage['daga_user_token']，与后台 daga_token 相互隔离。
 */

import axios from 'axios';

const userClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 — 附带用户令牌
userClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('daga_user_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器 — 401 时清理用户登录态（跳转交由页面处理）
userClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('daga_user_token');
      localStorage.removeItem('daga_user');
    }
    return Promise.reject(error);
  }
);

/** 注册（成功后自动登录，返回 { token, user }） */
export async function register(username, password, email) {
  const res = await userClient.post('/user/register', { username, password, email });
  return res.data;
}

/** 登录 */
export async function login(username, password) {
  const res = await userClient.post('/user/login', { username, password });
  return res.data;
}

/** 我的资料 + 配额视图 */
export async function getMe() {
  const res = await userClient.get('/user/me');
  return res.data;
}

/** 修改密码 */
export async function changePassword(oldPassword, newPassword) {
  const res = await userClient.post('/user/change-password', { oldPassword, newPassword });
  return res.data;
}
