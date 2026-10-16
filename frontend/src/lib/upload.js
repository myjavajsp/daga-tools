/**
 * 带上传进度的文件上传，期望服务端直接返回二进制文件（Blob）。
 * 非 2xx 响应时，尝试按 JSON 解析出 message 作为错误文案。
 */
export function uploadForBlob(url, formData, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.responseType = 'blob';
    xhr.timeout = 10 * 60 * 1000; // 10 分钟

    if (xhr.upload && typeof onProgress === 'function') {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.target.total) * 100));
      };
    }

    const fail = () => reject(new Error(`请求失败（HTTP ${xhr.status}）`));

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response);
        return;
      }
      const ct = String(xhr.getResponseHeader('Content-Type') || '').toLowerCase();
      const fallback = `请求失败（HTTP ${xhr.status}）`;
      if (xhr.response && ct.includes('application/json')) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const j = JSON.parse(String(reader.result));
            reject(new Error(j.message || fallback));
          } catch {
            reject(new Error(fallback));
          }
        };
        reader.onerror = () => reject(new Error(fallback));
        reader.readAsText(xhr.response);
        return;
      }
      reject(new Error(fallback));
    };

    xhr.onerror = () => reject(new Error('网络错误，请检查连接后重试'));
    xhr.ontimeout = () => reject(new Error('处理超时，文件可能过大'));
    xhr.onabort = () => reject(new Error('请求已取消'));
    xhr.send(formData);
  });
}
