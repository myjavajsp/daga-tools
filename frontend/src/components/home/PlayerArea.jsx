import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import RefreshIcon from '@mui/icons-material/Refresh';

/**
 * PlayerArea — 播放器区域（iframe 嵌入）
 */
export default function PlayerArea({ videoUrl, currentInterface }) {
  const [iframeKey, setIframeKey] = useState(0);
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 纯计算 iframe src（无副作用）
  const iframeSrc = useMemo(() => {
    if (!videoUrl || !currentInterface) return null;
    let baseUrl = currentInterface.url;
    if (baseUrl.startsWith('//')) {
      baseUrl = 'https:' + baseUrl;
    }
    return baseUrl + encodeURIComponent(videoUrl);
  }, [videoUrl, currentInterface]);

  // 当 iframeSrc 变化时，重置状态
  useEffect(() => {
    if (iframeSrc) {
      setLoadError(false);
      setIsLoading(true);
      console.log('[PlayerArea] Loading:', iframeSrc.substring(0, 80) + '...');
    } else {
      setIsLoading(false);
    }
  }, [iframeSrc]);

  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
    setLoadError(false);
    console.log('[PlayerArea] iframe loaded OK');
  }, []);

  const handleIframeError = useCallback(() => {
    setIsLoading(false);
    setLoadError(true);
    console.error('[PlayerArea] iframe load error');
  }, []);

  const handleRetry = useCallback(() => {
    setLoadError(false);
    setIsLoading(true);
    setIframeKey((k) => k + 1);
  }, []);

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid #e0e0e0',
        mb: 3,
        bgcolor: '#000',
      }}
    >
      {iframeSrc ? (
        <>
          {loadError && (
            <Alert
              severity="warning"
              sx={{ m: 2 }}
              action={
                <Box
                  component="span"
                  sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }}
                  onClick={handleRetry}
                >
                  <RefreshIcon fontSize="small" /> 重试
                </Box>
              }
            >
              视频加载失败，请尝试切换其他解析接口或检查视频地址是否正确
            </Alert>
          )}
          <Box sx={{ position: 'relative', width: '100%', pt: loadError ? 0 : '56.25%' }}>
            {/* 加载动画叠加层 */}
            {isLoading && !loadError && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0, left: 0,
                  width: '100%', height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: '#1a1a2e',
                  zIndex: 2,
                }}
              >
                <CircularProgress sx={{ color: 'rgba(255,255,255,0.5)', mb: 2 }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                  正在加载解析服务…
                </Typography>
              </Box>
            )}
            {!loadError && (
              <iframe
                key={iframeKey}
                src={iframeSrc}
                title="视频解析播放器"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                style={{
                  position: 'absolute',
                  top: 0, left: 0,
                  width: '100%', height: '100%',
                  border: 'none',
                }}
              />
            )}
          </Box>
        </>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: { xs: 240, md: 360 },
            gap: 1.5,
            bgcolor: '#1a1a2e',
          }}
        >
          <OndemandVideoIcon sx={{ fontSize: 64, color: 'rgba(255,255,255,0.3)' }} />
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
            粘贴视频链接开始播放
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.2)', textAlign: 'center', px: 2 }}>
            请在上方粘贴腾讯视频、优酷、爱奇艺等平台的视频链接，选择解析接口后点击「Go - 解析播放」
          </Typography>
        </Box>
      )}
    </Paper>
  );
}
