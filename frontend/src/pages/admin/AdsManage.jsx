import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Table, TableHead, TableBody, TableRow, TableCell,
  IconButton, Switch, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Paper, Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { getAds, createAd, updateAd, deleteAd } from '../../api/admin';

const EMPTY_FORM = { position: '', name: '', code: '' };

/**
 * AdsManage — 广告位管理
 */
export default function AdsManage() {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [delId, setDelId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try { const res = await getAds(); if (res.success) setRows(res.data || []); } catch { /* ignore */ }
  }, []);
  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditId(null); setForm(EMPTY_FORM); setError(''); setOpen(true); };
  const openEdit = (row) => { setEditId(row.id); setForm({ position: row.position, name: row.name || '', code: row.code }); setError(''); setOpen(true); };
  const closeDialog = () => setOpen(false);

  const handleSave = async () => {
    if (!form.position.trim() || !form.code.trim()) { setError('位置和代码不能为空'); return; }
    setLoading(true); setError('');
    try {
      if (editId) { await updateAd(editId, form); } else { await createAd(form); }
      closeDialog(); load();
    } catch (err) { setError(err.response?.data?.error || '操作失败'); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!delId) return;
    try { await deleteAd(delId); setDelId(null); load(); } catch { /* ignore */ }
  };

  const handleToggle = async (row) => {
    try { await updateAd(row.id, { is_active: row.is_active ? 0 : 1 }); load(); } catch { /* ignore */ }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>广告位管理</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>新增广告</Button>
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8f9ff' }}>
              <TableCell sx={{ fontWeight: 600 }}>位置</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>名称</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>状态</TableCell>
              <TableCell sx={{ fontWeight: 600, width: 120 }}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>暂无数据</TableCell></TableRow>
            ) : rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.position}</TableCell>
                <TableCell>{row.name || '-'}</TableCell>
                <TableCell>
                  <Switch checked={!!row.is_active} onChange={() => handleToggle(row)} size="small" />
                </TableCell>
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
        <DialogTitle>{editId ? '编辑广告' : '新增广告'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField label="位置标识" fullWidth size="small" sx={{ mt: 1, mb: 2 }} value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} helperText="例如：header、sidebar、footer" />
          <TextField label="名称（可选）" fullWidth size="small" sx={{ mb: 2 }} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField label="HTML代码" fullWidth size="small" multiline rows={4} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialog}>取消</Button>
          <Button variant="contained" onClick={handleSave} disabled={loading}>{loading ? '保存中...' : '保存'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!delId} onClose={() => setDelId(null)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent><Typography>确定要删除这个广告位吗？</Typography></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDelId(null)}>取消</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>确认删除</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
