/**
 * daga-clone — server/routes/ai.js
 * AI 文案生成：POST /api/ai/writer
 *
 * 为什么必须走后端：
 *   API Key 放在前端等于公开，任何人都可提取并盗用额度；
 *   同时限流、计费、日志也都需要服务端承载。
 *
 * 配置（服务端环境变量，写在 /opt/daga-clone/.env）：
 *   LLM_API_URL   兼容 OpenAI 的 chat completions 地址
 *   LLM_API_KEY   密钥
 *   LLM_MODEL     模型名，默认 gpt-4o-mini
 *
 * 请求体：{ prompt: string, type?: string, tone?: string, length?: string }
 * 响应：  { success: true, text: string } 或 { success: false, message: string }
 */

const express = require('express');

const router = express.Router();

const MAX_PROMPT = 4000;
const TIMEOUT_MS = 120000; // 2 分钟

/** 按文案类型给出系统提示 */
function buildSystem(type, tone, length) {
  const typeMap = {
    xiaohongshu: '小红书种草笔记',
    douyin: '抖音短视频脚本',
    wechat: '微信公众号文章',
    product: '商品详情页文案',
    ad: '广告投放文案',
    brand: '品牌 Slogan',
  };
  const toneMap = {
    professional: '专业严谨',
    casual: '轻松日常',
    humor: '幽默风趣',
    emotional: '情感共鸣',
    luxury: '高端质感',
  };
  const lengthMap = {
    short: '控制在 100 字以内',
    medium: '300 字左右',
    long: '800 字以上，结构完整',
  };
  const t = typeMap[type] || '营销文案';
  const tn = toneMap[tone] || '自然得体';
  const ln = lengthMap[length] || '篇幅适中';
  return `你是一位资深中文文案策划。请围绕用户的主题，撰写一篇${t}。要求：风格${tn}，${ln}，语言地道，避免空话套话，直接输出文案正文，不要加解释或前后缀。`;
}

router.post('/writer', express.json(), async (req, res) => {
  const { topic, type, tone, length } = req.body || {};

  if (!topic || !String(topic).trim()) {
    return res.status(400).json({ success: false, message: '请输入文案主题' });
  }

  const apiUrl = process.env.LLM_API_URL;
  const apiKey = process.env.LLM_API_KEY;
  const model = process.env.LLM_MODEL || 'gpt-4o-mini';

  if (!apiUrl || !apiKey) {
    return res.status(503).json({
      success: false,
      message: 'AI 文案服务尚未配置（缺少 LLM_API_URL / LLM_API_KEY），请联系站长',
    });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const r = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: buildSystem(type, tone, length) },
          { role: 'user', content: String(topic).slice(0, MAX_PROMPT) },
        ],
        temperature: 0.8,
      }),
      signal: controller.signal,
    });

    const text = await r.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }

    if (!r.ok) {
      const msg =
        (json && (json.error?.message || json.message)) ||
        `上游返回 HTTP ${r.status}`;
      return res.status(502).json({ success: false, message: String(msg).slice(0, 300) });
    }

    const content =
      (json && json.choices && json.choices[0] && json.choices[0].message?.content) ||
      (json && json.data) ||
      (json && json.text) ||
      '';

    if (!content) {
      return res.status(502).json({ success: false, message: '上游未返回有效内容' });
    }

    return res.json({ success: true, text: String(content) });
  } catch (err) {
    const msg =
      err?.name === 'AbortError' ? 'AI 生成超时，请稍后重试' : String(err?.message || 'AI 服务调用失败');
    return res.status(500).json({ success: false, message: msg.slice(0, 300) });
  } finally {
    clearTimeout(timer);
  }
});

module.exports = router;
