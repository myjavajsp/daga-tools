import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, TextField, Paper, Alert, CircularProgress,
  Switch, FormControlLabel,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { getSettings, updateSettings } from '../../api/admin';

/** toggles 开关组定义（key → 后台文案） */
const TOGGLE_DEFS = [
  { key: 'enable_hot', label: '热点' },
  { key: 'enable_music', label: '音乐' },
  { key: 'enable_ai', label: 'AI' },
  { key: 'enable_meme', label: '表情包' },
];

/** 安全解析 toggles JSON；失败时回落全开 */
function parseToggles(raw) {
  try {
    const obj = JSON.parse(raw || '{}');
    return obj && typeof obj === 'object' ? obj : {};
  } catch {
    return {};
  }
}

/**
 * SettingsManage — 系统设置
 * SEO 三字段 + 公告 + 统计代码 + 开关组 + 解析配额
 */
export default function SettingsManage() {
  const [form, setForm] = useState({
    site_title: '',
    site_keywords: '',
    site_description: '',
    announcement: '',
    announcement_enabled: '0',
    stats_code: '',
    toggles: {},
    free_daily_quota: '5',
    vip_daily_quota: '100',
    guest_daily_quota: '5',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    setFetching(true);
    try {
      const res = await getSettings();
      if (res.success && res.data) {
        const d = res.data;
        setForm({
          site_title: d.site_title || '',
          site_keywords: d.site_keywords || '',
          site_description: d.site_description || '',
          announcement: d.announcement || '',
          announcement_enabled: d.announcement_enabled || '0',
          stats_code: d.stats_code || '',
          toggles: parseToggles(d.toggles),
          free_daily_quota: String(d.free_daily_quota ?? '5'),
          vip_daily_quota: String(d.vip_daily_quota ?? '100'),
          guest_daily_quota: String(d.guest_daily_quota ?? '5'),
        });
      }
    } catch { /* ignore */ }
    finally { setFetching(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const setToggle = (key, checked) =>
    setForm((prev) => ({ ...prev, toggles: { ...prev.toggles, [key]: checked ? '1' : '0' } }));

  const handleSave = async () => {
    setLoading(true); setError(''); setSuccess('');
    try {
      const items = [
        { key: 'site_title', value: form.site_title },
        { key: 'site_keywords', value: form.site_keywords },
        { key: 'site_description', value: form.site_description },
        { key: 'announcement', value: form.announcement },
        { key: 'announcement_enabled', value: form.announcement_enabled },
        { key: 'stats_code', value: form.stats_code },
        { key: 'toggles', value: JSON.stringify(form.toggles) },
        { key: 'free_daily_quota', value: String(form.free_daily_quota) },
        { key: 'vip_daily_quota', value: String(form.vip_daily_quota) },
        { key: 'guest_daily_quota', value: String(form.guest_daily_quota) },
      ];
      await updateSettings(items);
      setSuccess('设置已保存');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || '保存失败');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>系统设置</Typography>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? '保存中...' : '保存设置'}
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* SEO 设置 */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0', mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2.5 }}>SEO 设置</Typography>
        <TextField
          label="网站标题 (site_title)"
          fullWidth
          size="medium"
          sx={{ mb: 3 }}
          value={form.site_title}
          onChange={(e) => setField('site_title', e.target.value)}
          helperText="显示在浏览器标签页和 SEO 中的标题"
        />

        <TextField
          label="SEO 关键词 (site_keywords)"
          fullWidth
          size="medium"
          sx={{ mb: 3 }}
          value={form.site_keywords}
          onChange={(e) => setField('site_keywords', e.target.value)}
          helperText="多个关键词用逗号分隔"
        />

        <TextField
          label="SEO 描述 (site_description)"
          fullWidth
          size="medium"
          multiline
          rows={3}
          value={form.site_description}
          onChange={(e) => setField('site_description', e.target.value)}
          helperText="搜索引擎结果中显示的描述文字"
        />
      </Paper>

      {/* 公告设置 */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0', mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2.5 }}>首页公告</Typography>
        <TextField
          label="公告内容 (announcement)"
          fullWidth
          multiline
          rows={3}
          sx={{ mb: 2 }}
          value={form.announcement}
          onChange={(e) => setField('announcement', e.target.value)}
          helperText="启用后展示在首页顶部；支持多行文本"
        />
        <FormControlLabel
          control={
            <Switch
              checked={form.announcement_enabled === '1'}
              onChange={(e) => setField('announcement_enabled', e.target.checked ? '1' : '0')}
            />
          }
          label="启用公告"
        />
      </Paper>

      {/* 统计代码 */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0', mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2.5 }}>统计代码</Typography>
        <TextField
          label="统计代码 (stats_code)"
          fullWidth
          multiline
          rows={5}
          value={form.stats_code}
          onChange={(e) => setField('stats_code', e.target.value)}
          helperText="粘贴完整 <script> 片段，将注入全站页面 </head> 前"
          InputProps={{ style: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', fontSize: 13 } }}
        />
      </Paper>

      {/* 开关组 */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0', mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2.5 }}>栏目开关 (toggles)</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {TOGGLE_DEFS.map((t) => (
            <FormControlLabel
              key={t.key}
              control={
                <Switch
                  checked={String(form.toggles[t.key] ?? '1') !== '0'}
                  onChange={(e) => setToggle(t.key, e.target.checked)}
                />
              }
              label={t.label}
            />
          ))}
        </Box>
        <Typography variant="caption" color="text.secondary">
          关闭后，前台导航与首页对应栏目入口将隐藏
        </Typography>
      </Paper>

      {/* 解析配额 */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>解析配额（每日次数）</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2.5 }}>
          对游客 / 注册用户 / 会员分别生效；改动即时生效，单个用户的单独覆盖优先级更高
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <TextField
            label="免费用户 (free_daily_quota)"
            type="number"
            size="medium"
            sx={{ width: 220 }}
            value={form.free_daily_quota}
            onChange={(e) => setField('free_daily_quota', e.target.value)}
            inputProps={{ min: 0 }}
          />
          <TextField
            label="会员 (vip_daily_quota)"
            type="number"
            size="medium"
            sx={{ width: 220 }}
            value={form.vip_daily_quota}
            onChange={(e) => setField('vip_daily_quota', e.target.value)}
            inputProps={{ min: 0 }}
          />
          <TextField
            label="游客 (guest_daily_quota)"
            type="number"
            size="medium"
            sx={{ width: 220 }}
            value={form.guest_daily_quota}
            onChange={(e) => setField('guest_daily_quota', e.target.value)}
            inputProps={{ min: 0 }}
          />
        </Box>
      </Paper>
    </Box>
  );
}
