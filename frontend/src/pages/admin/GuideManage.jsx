import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Table, TableHead, TableBody, TableRow, TableCell,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Paper, Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { getGuideSteps, createGuideStep, updateGuideStep, deleteGuideStep } from '../../api/admin';

const EMPTY_FORM = { step_number: 1, content: '', sort_order: 0 };

/**
 * GuideManage — 使用说明管理
 */
export default function GuideManage() {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [delId, setDelId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try { const res = await getGuideSteps(); if (res.success) setRows(res.data || []); } catch { /* ignore */ }
  }, []);
  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditId(null); setForm({ ...EMPTY_FORM, step_number: rows.length + 1, sort_order: rows.length + 1 }); setError(''); setOpen(true); };
  const openEdit = (row) => { setEditId(row.id); setForm({ step_number: row.step_number, content: row.content, sort_order: row.sort_order }); setError(''); setOpen(true); };
  const closeDialog = () => setOpen(false);

  const handleSave = async () => {
    if (!form.content.trim()) { setError('内容不能为空'); return; }
    setLoading(true); setError('');
    try {
      if (editId) { await updateGuideStep(editId, form); } else { await createGuideStep(form); }
      closeDialog(); load();
    } catch (err) { setError(err.response?.data?.error || '操作失败'); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!delId) return;
    try { await deleteGuideStep(delId); setDelId(null); load(); } catch { /* ignore */ }
  };

  const handleMove = async (row, direction) => {
    const idx = rows.findIndex((r) => r.id === row.id);
    if (direction === 'up' && idx > 0) {
      await updateGuideStep(row.id, { sort_order: rows[idx - 1].sort_order });
      await updateGuideStep(rows[idx - 1].id, { sort_order: row.sort_order });
      load();
    } else if (direction === 'down' && idx < rows.length - 1) {
      await updateGuideStep(row.id, { sort_order: rows[idx + 1].sort_order });
      await updateGuideStep(rows[idx + 1].id, { sort_order: row.sort_order });
      load();
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>使用说明管理</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>新增步骤</Button>
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8f9ff' }}>
              <TableCell sx={{ fontWeight: 600, width: 60 }}>序号</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>内容</TableCell>
              <TableCell sx={{ fontWeight: 600, width: 60 }}>排序</TableCell>
              <TableCell sx={{ fontWeight: 600, width: 180 }}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>暂无数据</TableCell></TableRow>
            ) : rows.map((row, idx) => (
              <TableRow key={row.id}>
                <TableCell>{row.step_number}</TableCell>
                <TableCell>{row.content}</TableCell>
                <TableCell>{row.sort_order}</TableCell>
                <TableCell>
                  <IconButton size="small" disabled={idx === 0} onClick={() => handleMove(row, 'up')}><ArrowUpwardIcon fontSize="small" /></IconButton>
                  <IconButton size="small" disabled={idx === rows.length - 1} onClick={() => handleMove(row, 'down')}><ArrowDownwardIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="primary" onClick={() => openEdit(row)}><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => setDelId(row.id)}><DeleteIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? '编辑步骤' : '新增步骤'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField label="步骤编号" type="number" fullWidth size="small" sx={{ mt: 1, mb: 2 }} value={form.step_number} onChange={(e) => setForm({ ...form, step_number: Number(e.target.value) })} />
          <TextField label="内容" fullWidth size="small" multiline rows={3} sx={{ mb: 2 }} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          <TextField label="排序" type="number" fullWidth size="small" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialog}>取消</Button>
          <Button variant="contained" onClick={handleSave} disabled={loading}>{loading ? '保存中...' : '保存'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!delId} onClose={() => setDelId(null)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent><Typography>确定要删除这个步骤吗？</Typography></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDelId(null)}>取消</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>确认删除</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
