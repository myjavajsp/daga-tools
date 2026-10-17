import { useState } from 'react';
import { zipSync, unzipSync } from 'fflate';
import Icon from '../Icons';
import { fmtSize, downloadBlob, readAsArrayBuffer, stripExt, safeName, BTN_PRIMARY } from '../../lib/file-utils';

export default function ZipTool() {
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [entries, setEntries] = useState([]);
  const [level, setLevel] = useState(6);

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length) {
      setFiles((prev) => [...prev, ...selected]);
      setResult(null);
      setError('');
    }
    e.target.value = '';
  };

  const removeFile = (index) => setFiles((prev) => prev.filter((_, i) => i !== index));

  /** 打包：支持多文件；若选中一个 .zip 则展示其内部清单 */
  const compress = async () => {
    if (!files.length) return;
    setBusy(true);
    setError('');
    setResult(null);
    setEntries([]);
    try {
      const table = {};
      for (const f of files) {
        table[f.name] = new Uint8Array(await readAsArrayBuffer(f));
      }
      const zipped = zipSync(table, { level });
      const blob = new Blob([zipped], { type: 'application/zip' });
      const raw = files.reduce((a, b) => a + b.size, 0);
      const name = files.length === 1 ? `${safeName(stripExt(files[0].name))}.zip` : 'archive.zip';
      setResult({
        label: name,
        size: blob.size,
        original: raw,
        saved: raw - blob.size,
        percent: raw ? Math.max(0, Math.round(((raw - blob.size) / raw) * 100)) : 0,
      });
      downloadBlob(blob, name);
    } catch (err) {
      setError(err?.message || '压缩失败');
    } finally {
      setBusy(false);
    }
  };

  /** 解压：读取 zip 内文件清单，可逐个下载 */
  const decompress = async () => {
    const z = files.find((f) => /\.zip$/i.test(f.name));
    if (!z) {
      setError('请先选择一个 .zip 文件');
      return;
    }
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const buf = await readAsArrayBuffer(z);
      const out = unzipSync(new Uint8Array(buf));
      const list = Object.keys(out).map((n) => ({
        name: n,
        size: out[n].byteLength,
        data: out[n],
      }));
      setEntries(list);
      setResult({ extracted: list.length });
    } catch (err) {
      setError(/zip|decompress/i.test(String(err?.message || '')) ? 'ZIP 文件损坏或无法解析' : err?.message || '解压失败');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={() => {
            setFiles([]);
            setEntries([]);
            setResult(null);
            setError('');
          }}
          className="px-3 py-1.5 text-xs rounded-lg bg-surface-2 text-ink-2 hover:bg-surface-3"
        >
          清空
        </button>
        <span className="text-xs text-ink-3 self-center">打包无需上传，全程在本地完成</span>
      </div>

      <div
        className="border-2 border-dashed border-line-2 rounded-card p-8 text-center hover:border-accent transition-colors cursor-pointer"
        onClick={() => document.getElementById('zf')?.click()}
      >
        <input id="zf" type="file" multiple onChange={handleFiles} className="hidden" />
        <div className="flex justify-center mb-3"><span className="chip"><Icon name="box" /></span></div>
        <p className="text-ink-2">
          {files.length > 0 ? `已选择 ${files.length} 个文件` : '点击选择文件（打包 / 查看 ZIP）'}
        </p>
      </div>

      {files.length > 0 && (
        <div className="max-h-32 overflow-auto space-y-1">
          {files.map((f, i) => (
            <div
              key={`${f.name}-${i}`}
              className="flex items-center justify-between bg-paper rounded-lg px-3 py-2 text-sm"
            >
              <span className="text-ink-2 truncate flex-1">{f.name}</span>
              <span className="text-xs text-ink-3 ml-2">{fmtSize(f.size)}</span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="icon-btn text-danger ml-1"
                title="移除"
                aria-label="移除"
              >
                <Icon name="close" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-ink-2">压缩级别</span>
          <span className="font-mono text-ink">{level}</span>
        </div>
        <input
          type="range"
          min="0"
          max="9"
          value={level}
          onChange={(e) => setLevel(Number(e.target.value))}
          className="slider"
        />
        <p className="text-xs text-ink-3 mt-1">0 = 仅打包，9 = 最高压缩率（更慢）</p>
      </div>

      <div className="flex gap-3">
        <button onClick={compress} disabled={!files.length || busy} className={BTN_PRIMARY}>
          {busy ? '处理中…' : `打包为ZIP (${files.length})`}
        </button>
        <button
          onClick={decompress}
          disabled={!files.length || busy}
          className="btn-ghost"
        >
          查看ZIP内容
        </button>
      </div>

      {error && (
        <div className="bg-danger-soft border border-line rounded-card p-4 text-danger text-sm">
          {error}
        </div>
      )}

      {result?.extracted !== undefined && (
        <div className="bg-success-soft border border-line rounded-card p-4">
          <div className="text-success font-medium">
            ZIP 内共 {result.extracted} 个文件
          </div>
          {entries.length > 0 && (
            <div className="mt-3 space-y-1 max-h-48 overflow-auto">
              {entries.map((e) => (
                <div
                  key={e.name}
                  className="flex items-center justify-between bg-surface-2 rounded-lg px-3 py-1.5 text-sm"
                >
                  <span className="text-ink-2 truncate flex-1">{e.name}</span>
                  <span className="text-xs text-ink-3 ml-2">{fmtSize(e.size)}</span>
                  <button
                    type="button"
                    onClick={() => downloadBlob(new Blob([e.data]), e.name)}
                    className="ml-2 px-2 py-0.5 text-xs rounded bg-accent text-accent-fg hover:bg-accent-press"
                  >
                    下载
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {result?.label && result.extracted === undefined && (
        <div className="bg-success-soft border border-line rounded-card p-4 text-center">
          <div className="text-success font-medium">压缩完成！已开始下载</div>
          <div className="text-sm text-ink-3 mt-1">
            {result.label} · 原始 {fmtSize(result.original)} → {fmtSize(result.size)}
            {result.saved > 0 ? `（省 ${result.percent}%）` : ''}
          </div>
        </div>
      )}
    </div>
  );
}
