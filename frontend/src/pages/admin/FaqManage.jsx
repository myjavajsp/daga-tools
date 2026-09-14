import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Table, TableHead, TableBody, TableRow, TableCell,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Paper, Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { getFaqs, createFaq, updateFaq, deleteFaq } from '../../api/admin';

const EMPTY_FORM = { question: '', answer: '', sort_order: 0 };

/**
 * FaqManage — FAQ 管理
 */
export default function FaqManage() {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [delId, setDelId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try { const res = await getFaqs(); if (res.success) setRows(res.data || []); } catch { /* ignore */ }
  }, []);
  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditId(null); setForm({ ...EMPTY_FORM, sort_order: rows.length + 1 }); setError(''); setOpen(true); };
  const openEdit = (row) => { setEditId(row.id); setForm({ question: row.question, answer: row.answer, sort_order: row.sort_order }); setError(''); setOpen(true); };
  const closeDialog = () => setOpen(false);

  const handleSave = async () => {
    if (!form.question.trim() || !form.answer.trim()) { setError('问题和答案不能为空'); return; }
    setLoading(true); setError('');
    try {
      if (editId) { await updateFaq(editId, form); } else { await createFaq(form); }
      closeDialog(); load();
    } catch (err) { setError(err.response?.data?.error || '操作失败'); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!delId) return;
    try { await deleteFaq(delId); setDelId(null); load(); } catch { /* ignore */ }
  };

  const truncate = (text, max = 60) => text && text.length > max ? text.slice(0, max) + '...' : text;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>FAQ 管理</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>新增 FAQ</Button>
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8f9ff' }}>
              <TableCell sx={{ fontWeight: 600 }}>问题</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>答案</TableCell>
              <TableCell sx={{ fontWeight: 600, width: 60 }}>排序</TableCell>
              <TableCell sx={{ fontWeight: 600, width: 120 }}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>暂无数据</TableCell></TableRow>
            ) : rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell sx={{ fontWeight: 500 }}>{row.question}</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{truncate(row.answer)}</TableCell>
                <TableCell>{row.sort_order}</TableCell>
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
        <DialogTitle>{editId ? '编辑 FAQ' : '新增 FAQ'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField label="问题" fullWidth size="small" sx={{ mt: 1, mb: 2 }} value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
          <TextField label="答案" fullWidth size="small" multiline rows={3} sx={{ mb: 2 }} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} />
          <TextField label="排序" type="number" fullWidth size="small" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialog}>取消</Button>
          <Button variant="contained" onClick={handleSave} disabled={loading}>{loading ? '保存中...' : '保存'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!delId} onClose={() => setDelId(null)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent><Typography>确定要删除这个 FAQ 吗？</Typography></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDelId(null)}>取消</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>确认删除</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
