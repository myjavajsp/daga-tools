import React, { useState, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

/**
 * ParseForm — 视频解析表单（核心组件）
 *
 * @param {Array} interfaces — 解析接口列表 [{ id, name, url }]
 * @param {Function} onParse — 回调 (videoUrl, selectedInterface)
 * @param {boolean} loading — 外部 loading 状态
 */
export default function ParseForm({ interfaces = [], onParse, loading = false }) {
  const [videoUrl, setVideoUrl] = useState('');
  const [selectedId, setSelectedId] = useState('');

  const effectiveId = selectedId || (interfaces.length > 0 ? String(interfaces[0].id) : '');
  const selectedInterface = interfaces.find((iface) => String(iface.id) === effectiveId) || null;

  const doParse = useCallback(() => {
    const url = videoUrl.trim();
    if (!url) return;
    if (!selectedInterface) return;
    console.log('[ParseForm] doParse:', { url: url.substring(0, 50), iface: selectedInterface.name });
    if (onParse) onParse(url, selectedInterface);
  }, [videoUrl, selectedInterface, onParse]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      doParse();
    },
    [doParse]
  );

  // 输入框回车键触发解析
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        doParse();
      }
    },
    [doParse]
  );

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 3,
        border: '1px solid #e0e0e0',
        mb: 3,
      }}
    >
      {/* 频道选择器 */}
      <FormControl fullWidth size="medium" sx={{ mb: 2 }}>
        <InputLabel id="parse-interface-label">选择解析频道</InputLabel>
        <Select
          labelId="parse-interface-label"
          value={effectiveId}
          label="选择解析频道"
          onChange={(e) => setSelectedId(e.target.value)}
        >
          {interfaces.length > 0 ? (
            interfaces.map((iface) => (
              <MenuItem key={iface.id} value={String(iface.id)}>
                {iface.name}
              </MenuItem>
            ))
          ) : (
            <MenuItem value="" disabled>
              暂无可用接口
            </MenuItem>
          )}
        </Select>
      </FormControl>

      {/* 视频地址输入 */}
      <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
        <TextField
          fullWidth
          placeholder="粘贴视频链接，例如 https://v.qq.com/x/cover/xxx.html"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          size="medium"
          autoFocus
          InputProps={{
            startAdornment: (
              <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
            ),
          }}
          helperText="支持腾讯视频、优酷、爱奇艺、PPTV 等平台"
          sx={{ flexGrow: 1 }}
        />

        <Button
          type="submit"
          variant="contained"
          color="secondary"
          size="medium"
          disabled={loading || !videoUrl.trim() || !selectedInterface}
          startIcon={<PlayArrowIcon />}
          sx={{
            minWidth: { xs: '100%', sm: 160 },
            py: 1.5,
            fontWeight: 700,
            fontSize: '1rem',
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            color: '#1a1a2e',
            '&:hover': {
              background: 'linear-gradient(135deg, #3dd472 0%, #30e8c6 100%)',
            },
            '&.Mui-disabled': {
              color: 'rgba(26,26,46,0.4)',
              background: '#e0e0e0',
            },
          }}
        >
          Go - 解析播放
        </Button>
      </Box>

      {/* 当前频道提示 */}
      {selectedInterface && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 1.5, textAlign: 'center' }}
        >
          当前频道：{selectedInterface.name} — 点击按钮或按 Enter 开始解析
        </Typography>
      )}
    </Paper>
  );
}
