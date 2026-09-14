/**
 * daga-clone — frontend/src/api/client.js
 * Axios 实例 + JWT 拦截器
 */

import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT if present
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('daga_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401 globally
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('daga_token');
      localStorage.removeItem('daga_user');
      // Redirect to login if not already there
      if (!window.location.pathname.startsWith('/6n1x5ltwujr5/login')) {
        window.location.href = '/6n1x5ltwujr5/login';
      }
    }
    return Promise.reject(error);
  }
);

export default client;
