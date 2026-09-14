import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, TextField, Paper, Alert, CircularProgress,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { getSettings, updateSettings } from '../../api/admin';

/**
 * SettingsManage — 系统设置
 */
export default function SettingsManage() {
  const [form, setForm] = useState({ site_title: '', site_keywords: '', site_description: '' });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    setFetching(true);
    try {
      const res = await getSettings();
      if (res.success && res.data) {
        setForm({
          site_title: res.data.site_title || '',
          site_keywords: res.data.site_keywords || '',
          site_description: res.data.site_description || '',
        });
      }
    } catch { /* ignore */ }
    finally { setFetching(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setLoading(true); setError(''); setSuccess('');
    try {
      const items = [
        { key: 'site_title', value: form.site_title },
        { key: 'site_keywords', value: form.site_keywords },
        { key: 'site_description', value: form.site_description },
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

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
        <TextField
          label="网站标题 (site_title)"
          fullWidth
          size="medium"
          sx={{ mb: 3 }}
          value={form.site_title}
          onChange={(e) => setForm({ ...form, site_title: e.target.value })}
          helperText="显示在浏览器标签页和 SEO 中的标题"
        />

        <TextField
          label="SEO 关键词 (site_keywords)"
          fullWidth
          size="medium"
          sx={{ mb: 3 }}
          value={form.site_keywords}
          onChange={(e) => setForm({ ...form, site_keywords: e.target.value })}
          helperText="多个关键词用逗号分隔"
        />

        <TextField
          label="SEO 描述 (site_description)"
          fullWidth
          size="medium"
          multiline
          rows={3}
          value={form.site_description}
          onChange={(e) => setForm({ ...form, site_description: e.target.value })}
          helperText="搜索引擎结果中显示的描述文字"
        />
      </Paper>
    </Box>
  );
}
