import { useState } from 'react';
import { fmtSize, downloadBlob, stripExt, safeName, BTN_PRIMARY } from '../../lib/file-utils';
import Icon from '../Icons';
import { uploadForBlob } from '../../lib/upload';

/**
 * PDF 加密 —— 走服务端 qpdf。
 * 浏览器端的 pdf-lib 只能读取 PDF，不支持写出加密 PDF，因此必须在服务端完成。
 */
export default function PdfLock() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (f.type !== 'application/pdf' && !/\.pdf$/i.test(f.name)) {
      setError('请选择 PDF 文件');
      return;
    }
    setError('');
    setResult(null);
    setFile(f);
  };

  const lock = async () => {
    if (!file || !password) return;
    setBusy(true);
    setError('');
    setResult(null);
    setProgress(0);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('mode', 'lock');
      fd.append('password', password);
      const blob = await uploadForBlob('/api/pdf/crypt', fd, setProgress);
      const name = `${safeName(stripExt(file.name))}_encrypted.pdf`;
      setResult({ label: name, size: blob.size });
      downloadBlob(blob, name);
    } catch (err) {
      setError(err?.message || '加密失败，请稍后重试');
    } finally {
      setBusy(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <div
        className="border-2 border-dashed border-line-2 rounded-card p-8 text-center hover:border-accent transition-colors cursor-pointer"
        onClick={() => document.getElementById('lf')?.click()}
      >
        <input id="lf" type="file" accept=".pdf,application/pdf" onChange={handleFile} className="hidden" />
        <div className="flex justify-center mb-3"><span className="chip"><Icon name="lock" /></span></div>
        <p className="text-ink-2">{file ? `已选择: ${file.name}` : '上传PDF加密'}</p>
      </div>

      <div>
        <label className="lbl">设置打开密码</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="输入密码…"
          className="w-full px-4 py-3 bg-paper border border-line rounded-card text-ink"
        />
        <p className="text-xs text-ink-3 mt-2">
          加密在服务端完成（浏览器端的 pdf-lib 库不支持写出加密 PDF）。请牢记密码，遗失后无法找回。
        </p>
      </div>

      <button onClick={lock} disabled={!file || !password || busy} className={BTN_PRIMARY}>
        {busy ? (progress ? `上传中 ${progress}%` : '加密中…') : '加密PDF'}
      </button>

      {error && (
        <div className="bg-danger-soft border border-line rounded-card p-4 text-danger text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-success-soft border border-line rounded-card p-4 text-center">
          <div className="text-success font-medium">加密完成！已开始下载</div>
          <div className="text-sm text-ink-3 mt-1">
            {result.label} ({fmtSize(result.size)})
          </div>
        </div>
      )}
    </div>
  );
}
