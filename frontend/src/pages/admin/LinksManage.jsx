import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Table, TableHead, TableBody, TableRow, TableCell,
  IconButton, Switch, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Paper, Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { getLinks, createLink, updateLink, deleteLink } from '../../api/admin';

const EMPTY_FORM = { name: '', icon_url: '', link_url: '', sort_order: 0 };

/**
 * LinksManage — 推荐链接管理
 */
export default function LinksManage() {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [delId, setDelId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try { const res = await getLinks(); if (res.success) setRows(res.data || []); } catch { /* ignore */ }
  }, []);
  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditId(null); setForm(EMPTY_FORM); setError(''); setOpen(true); };
  const openEdit = (row) => { setEditId(row.id); setForm({ name: row.name, icon_url: row.icon_url || '', link_url: row.link_url, sort_order: row.sort_order }); setError(''); setOpen(true); };
  const closeDialog = () => setOpen(false);

  const handleSave = async () => {
    if (!form.name.trim() || !form.link_url.trim()) { setError('名称和链接不能为空'); return; }
    setLoading(true); setError('');
    try {
      if (editId) { await updateLink(editId, form); } else { await createLink(form); }
      closeDialog(); load();
    } catch (err) { setError(err.response?.data?.error || '操作失败'); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!delId) return;
    try { await deleteLink(delId); setDelId(null); load(); } catch { /* ignore */ }
  };

  const handleToggle = async (row) => {
    try { await updateLink(row.id, { is_active: row.is_active ? 0 : 1 }); load(); } catch { /* ignore */ }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>推荐链接管理</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>新增链接</Button>
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8f9ff' }}>
              <TableCell sx={{ fontWeight: 600 }}>名称</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>链接URL</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>图标URL</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>排序</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>状态</TableCell>
              <TableCell sx={{ fontWeight: 600, width: 120 }}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>暂无数据</TableCell></TableRow>
            ) : rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.name}</TableCell>
                <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.link_url}</TableCell>
                <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.icon_url || '-'}</TableCell>
                <TableCell>{row.sort_order}</TableCell>
                <TableCell><Switch checked={!!row.is_active} onChange={() => handleToggle(row)} size="small" /></TableCell>
                <TableCell>
                  <IconButton size="small" color="primary" onClick={() => openEdit(row)}><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => setDelId(row.id)}><DeleteIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? '编辑链接' : '新增链接'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField label="名称" fullWidth size="small" sx={{ mt: 1, mb: 2 }} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField label="链接URL" fullWidth size="small" sx={{ mb: 2 }} value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} />
          <TextField label="图标URL（可选）" fullWidth size="small" sx={{ mb: 2 }} value={form.icon_url} onChange={(e) => setForm({ ...form, icon_url: e.target.value })} />
          <TextField label="排序" type="number" fullWidth size="small" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialog}>取消</Button>
          <Button variant="contained" onClick={handleSave} disabled={loading}>{loading ? '保存中...' : '保存'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!delId} onClose={() => setDelId(null)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent><Typography>确定要删除这个推荐链接吗？</Typography></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDelId(null)}>取消</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>确认删除</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
