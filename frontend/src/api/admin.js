/**
 * daga-clone — frontend/src/api/admin.js
 * 管理后台 API 调用函数（需认证）
 */

import client from './client';

/* ── 认证 ─────────────────────────────────────── */

/** 获取验证码 */
export async function getCaptcha() {
  const res = await client.get('/admin/captcha');
  return res.data;
}

/** 管理员登录（含验证码） */
export async function login(username, password, captchaId, captchaCode) {
  const res = await client.post('/admin/login', { username, password, captchaId, captchaCode });
  return res.data;
}

/** 获取当前登录用户信息 */
export async function getMe() {
  const res = await client.get('/admin/me');
  return res.data;
}

/* ── 解析接口 ─────────────────────────────────── */

export async function getInterfaces() {
  const res = await client.get('/admin/interfaces');
  return res.data;
}

export async function createInterface(data) {
  const res = await client.post('/admin/interfaces', data);
  return res.data;
}

export async function updateInterface(id, data) {
  const res = await client.put(`/admin/interfaces/${id}`, data);
  return res.data;
}

export async function deleteInterface(id) {
  const res = await client.delete(`/admin/interfaces/${id}`);
  return res.data;
}

/* ── 广告 ─────────────────────────────────────── */

export async function getAds() {
  const res = await client.get('/admin/ads');
  return res.data;
}

export async function createAd(data) {
  const res = await client.post('/admin/ads', data);
  return res.data;
}

export async function updateAd(id, data) {
  const res = await client.put(`/admin/ads/${id}`, data);
  return res.data;
}

export async function deleteAd(id) {
  const res = await client.delete(`/admin/ads/${id}`);
  return res.data;
}

/* ── 推荐链接 ─────────────────────────────────── */

export async function getLinks() {
  const res = await client.get('/admin/links');
  return res.data;
}

export async function createLink(data) {
  const res = await client.post('/admin/links', data);
  return res.data;
}

export async function updateLink(id, data) {
  const res = await client.put(`/admin/links/${id}`, data);
  return res.data;
}

export async function deleteLink(id) {
  const res = await client.delete(`/admin/links/${id}`);
  return res.data;
}

/* ── 系统设置 ─────────────────────────────────── */

export async function getSettings() {
  const res = await client.get('/admin/settings');
  return res.data;
}

export async function updateSettings(data) {
  const res = await client.put('/admin/settings', data);
  return res.data;
}

/* ── 使用步骤 ─────────────────────────────────── */

export async function getGuideSteps() {
  const res = await client.get('/admin/guide');
  return res.data;
}

export async function createGuideStep(data) {
  const res = await client.post('/admin/guide', data);
  return res.data;
}

export async function updateGuideStep(id, data) {
  const res = await client.put(`/admin/guide/${id}`, data);
  return res.data;
}

export async function deleteGuideStep(id) {
  const res = await client.delete(`/admin/guide/${id}`);
  return res.data;
}

/* ── FAQ ──────────────────────────────────────── */

export async function getFaqs() {
  const res = await client.get('/admin/faq');
  return res.data;
}

export async function createFaq(data) {
  const res = await client.post('/admin/faq', data);
  return res.data;
}

export async function updateFaq(id, data) {
  const res = await client.put(`/admin/faq/${id}`, data);
  return res.data;
}

export async function deleteFaq(id) {
  const res = await client.delete(`/admin/faq/${id}`);
  return res.data;
}

/* ── 访问统计 ─────────────────────────────────── */

export async function getStats(days = 7) {
  const res = await client.get(`/admin/stats?days=${days}`);
  return res.data;
}
