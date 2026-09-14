/**
 * daga-clone — frontend/src/api/public.js
 * 公共 API 调用函数（无需认证）
 */

import client from './client';

/** 获取所有启用的解析接口 */
export async function fetchInterfaces() {
  const res = await client.get('/public/interfaces');
  return res.data;
}

/** 获取系统设置（key-value map） */
export async function fetchSettings() {
  const res = await client.get('/public/settings');
  return res.data;
}

/** 获取使用步骤列表 */
export async function fetchGuide() {
  const res = await client.get('/public/guide');
  return res.data;
}

/** 获取 FAQ 列表 */
export async function fetchFaq() {
  const res = await client.get('/public/faq');
  return res.data;
}

/** 获取推荐链接列表 */
export async function fetchLinks() {
  const res = await client.get('/public/links');
  return res.data;
}

/** 获取广告列表 */
export async function fetchAds() {
  const res = await client.get('/public/ads');
  return res.data;
}
