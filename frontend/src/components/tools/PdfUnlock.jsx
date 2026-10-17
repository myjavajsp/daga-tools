import { useState } from 'react';
import { fmtSize, downloadBlob, stripExt, safeName, BTN_PRIMARY } from '../../lib/file-utils';
import Icon from '../Icons';
import { uploadForBlob } from '../../lib/upload';

export default function PdfUnlock() {
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

  const unlock = async () => {
    if (!file || !password) return;
    setBusy(true);
    setError('');
    setResult(null);
    setProgress(0);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('mode', 'unlock');
      fd.append('password', password);
      const blob = await uploadForBlob('/api/pdf/crypt', fd, setProgress);
      const name = `${safeName(stripExt(file.name))}_unlocked.pdf`;
      setResult({ label: name, size: blob.size });
      downloadBlob(blob, name);
    } catch (err) {
      const m = String(err?.message || '');
      if (/password/i.test(m)) setError('密码错误，或该 PDF 未加密');
      else setError(m || '解密失败，请稍后重试');
    } finally {
      setBusy(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <div
        className="border-2 border-dashed border-line-2 rounded-card p-8 text-center hover:border-accent transition-colors cursor-pointer"
        onClick={() => document.getElementById('uf')?.click()}
      >
        <input id="uf" type="file" accept=".pdf,application/pdf" onChange={handleFile} className="hidden" />
        <div className="flex justify-center mb-3"><span className="chip"><Icon name="unlock" /></span></div>
        <p className="text-ink-2">{file ? `已选择: ${file.name}` : '上传加密的PDF'}</p>
      </div>

      <div>
        <label className="lbl">输入密码</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="输入PDF密码…"
          className="w-full px-4 py-3 bg-paper border border-line rounded-card text-ink"
        />
        <p className="text-xs text-ink-3 mt-2">
          需要提供正确的打开密码；本站无法破解忘记的密码。
        </p>
      </div>

      <button onClick={unlock} disabled={!file || !password || busy} className={BTN_PRIMARY}>
        {busy ? (progress ? `上传中 ${progress}%` : '解密中…') : '解密PDF'}
      </button>

      {error && (
        <div className="bg-danger-soft border border-line rounded-card p-4 text-danger text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-success-soft border border-line rounded-card p-4 text-center">
          <div className="text-success font-medium">解密成功！已开始下载</div>
          <div className="text-sm text-ink-3 mt-1">
            {result.label} ({fmtSize(result.size)})
          </div>
        </div>
      )}
    </div>
  );
}
