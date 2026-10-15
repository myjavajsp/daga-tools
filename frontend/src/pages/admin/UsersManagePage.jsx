import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Alert,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { getUsers, updateUser, deleteUser } from '../../api/admin';

/** 等级 → 展示名 */
const LEVEL_LABELS = { 0: '免费', 1: '月费', 2: '年费', 3: '永久' };

const EMPTY_FORM = { level: 0, vip_expires_at: '', daily_quota: 0, status: 1, nickname: '' };

/** 把后端 DATETIME 格式化成 datetime-local 输入框可用的值 */
function toDateTimeLocal(v) {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * UsersManagePage — 后台用户管理
 * 表格 + 用户名搜索 + 等级/状态筛选 + 编辑对话框（等级/到期/配额覆盖/状态/昵称）+ 软删除
 */
export default function UsersManagePage() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [keyword, setKeyword] = useState('');
  const [level, setLevel] = useState('');
  const [status, setStatus] = useState('');
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [delId, setDelId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await getUsers({ page, limit, username: keyword, level, status });
      if (res.success) {
        setRows(res.data.list || []);
        setTotal(res.data.total || 0);
      }
    } catch { /* ignore */ }
  }, [page, limit, keyword, level, status]);

  useEffect(() => {
    load();
  }, [load]);

  const openEdit = (row) => {
    setEditId(row.id);
    setForm({
      level: row.level,
      vip_expires_at: row.level === 3 ? '2038-01-01T00:00' : toDateTimeLocal(row.vip_expires_at),
      daily_quota: row.daily_quota,
      status: row.status,
      nickname: row.nickname || '',
    });
    setError('');
    setOpen(true);
  };

  const handleSave = async () => {
    if (form.nickname && form.nickname.length > 100) {
      setError('昵称过长（最多 100 字符）');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // datetime-local → 'YYYY-MM-DD HH:mm:ss'；空串表示清除到期时间
      const vipExpires = form.vip_expires_at ? form.vip_expires_at.replace('T', ' ') + ':00' : '';
      await updateUser(editId, {
        level: Number(form.level),
        vip_expires_at: vipExpires,
        daily_quota: Number(form.daily_quota),
        status: Number(form.status),
        nickname: form.nickname,
      });
      setOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!delId) return;
    try {
      await deleteUser(delId);
      setDelId(null);
      load();
    } catch { /* ignore */ }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>用户管理</Typography>
        <Typography variant="body2" color="text.secondary">共 {total} 个用户</Typography>
      </Box>

      {/* 搜索 + 筛选 */}
      <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 3, border: '1px solid #e0e0e0', display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          label="用户名搜索"
          value={keyword}
          onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
          InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> }}
          sx={{ minWidth: 220 }}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>等级</InputLabel>
          <Select
            value={level}
            label="等级"
            onChange={(e) => { setLevel(e.target.value); setPage(1); }}
          >
            <MenuItem value="">全部</MenuItem>
            <MenuItem value="0">免费</MenuItem>
            <MenuItem value="1">月费</MenuItem>
            <MenuItem value="2">年费</MenuItem>
            <MenuItem value="3">永久</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>状态</InputLabel>
          <Select
            value={status}
            label="状态"
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          >
            <MenuItem value="">全部</MenuItem>
            <MenuItem value="1">正常</MenuItem>
            <MenuItem value="0">禁用</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8f9ff' }}>
              <TableCell sx={{ fontWeight: 600, width: 60 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>用户名</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>昵称</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>等级</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>到期时间</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>今日已用/配额</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>状态</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>最近登录</TableCell>
              <TableCell sx={{ fontWeight: 600, width: 120 }}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow><TableCell colSpan={9} align="center" sx={{ py: 4, color: 'text.secondary' }}>暂无数据</TableCell></TableRow>
            ) : rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{row.username}</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{row.nickname || '—'}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={LEVEL_LABELS[row.level] || '免费'}
                    color={row.level > 0 ? 'warning' : 'default'}
                  />
                </TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>
                  {row.level === 3 ? '永久' : (row.vip_expires_at ? new Date(row.vip_expires_at).toLocaleDateString('zh-CN') : '—')}
                </TableCell>
                <TableCell>{row.quota_used} / {row.daily_quota > 0 ? row.daily_quota : '等级默认'}</TableCell>
                <TableCell>
                  <Chip size="small" label={row.status === 1 ? '正常' : '禁用'} color={row.status === 1 ? 'success' : 'error'} />
                </TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>
                  {row.last_login_at ? new Date(row.last_login_at).toLocaleString('zh-CN', { hour12: false }) : '—'}
                </TableCell>
                <TableCell>
                  <IconButton size="small" color="primary" onClick={() => openEdit(row)}><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => setDelId(row.id)} disabled={row.status === 0}><DeleteIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* 分页 */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2, mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          第 {page} / {totalPages} 页
        </Typography>
        <Button size="small" disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</Button>
        <Button size="small" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>下一页</Button>
      </Box>

      {/* 编辑对话框 */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>编辑用户 {editId ? '#' + editId : ''}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{error}</Alert>}
          <FormControl fullWidth size="small" sx={{ mt: 1, mb: 2 }}>
            <InputLabel>等级</InputLabel>
            <Select
              value={String(form.level)}
              label="等级"
              onChange={(e) => setForm({ ...form, level: Number(e.target.value) })}
            >
              <MenuItem value="0">免费用户</MenuItem>
              <MenuItem value="1">月费会员</MenuItem>
              <MenuItem value="2">年费会员</MenuItem>
              <MenuItem value="3">永久会员</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="到期时间"
            type="datetime-local"
            fullWidth
            size="small"
            sx={{ mb: 2 }}
            value={form.vip_expires_at}
            onChange={(e) => setForm({ ...form, vip_expires_at: e.target.value })}
            InputLabelProps={{ shrink: true }}
            helperText="永久会员自动填 2038-01-01；留空表示清除"
          />
          <TextField
            label="每日配额覆盖"
            type="number"
            fullWidth
            size="small"
            sx={{ mb: 2 }}
            value={form.daily_quota}
            onChange={(e) => setForm({ ...form, daily_quota: e.target.value })}
            helperText="0 = 按等级与系统设置走；>0 = 单独覆盖"
          />
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>状态</InputLabel>
            <Select
              value={String(form.status)}
              label="状态"
              onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}
            >
              <MenuItem value="1">正常</MenuItem>
              <MenuItem value="0">禁用</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="昵称"
            fullWidth
            size="small"
            value={form.nickname}
            onChange={(e) => setForm({ ...form, nickname: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleSave} disabled={loading}>{loading ? '保存中...' : '保存'}</Button>
        </DialogActions>
      </Dialog>

      {/* 软删除确认 */}
      <Dialog open={!!delId} onClose={() => setDelId(null)}>
        <DialogTitle>确认禁用</DialogTitle>
        <DialogContent><Typography>确定要禁用该用户吗？禁用后该用户将无法登录。</Typography></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDelId(null)}>取消</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>确认禁用</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
