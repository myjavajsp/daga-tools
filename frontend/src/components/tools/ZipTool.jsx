import { useState } from 'react';
import { zipSync, unzipSync } from 'fflate';
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
          className="px-3 py-1.5 text-xs rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          清空
        </button>
        <span className="text-xs text-gray-400 self-center">打包无需上传，全程在本地完成</span>
      </div>

      <div
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
        onClick={() => document.getElementById('zf')?.click()}
      >
        <input id="zf" type="file" multiple onChange={handleFiles} className="hidden" />
        <div className="text-4xl mb-3">📦</div>
        <p className="text-gray-600 dark:text-gray-400">
          {files.length > 0 ? `已选择 ${files.length} 个文件` : '点击选择文件（打包 / 查看 ZIP）'}
        </p>
      </div>

      {files.length > 0 && (
        <div className="max-h-32 overflow-auto space-y-1">
          {files.map((f, i) => (
            <div
              key={`${f.name}-${i}`}
              className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm"
            >
              <span className="text-gray-700 dark:text-gray-300 truncate flex-1">{f.name}</span>
              <span className="text-xs text-gray-400 ml-2">{fmtSize(f.size)}</span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="text-red-500 ml-2 text-sm"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-400">压缩级别</span>
          <span className="font-mono text-gray-900 dark:text-white">{level}</span>
        </div>
        <input
          type="range"
          min="0"
          max="9"
          value={level}
          onChange={(e) => setLevel(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
        <p className="text-xs text-gray-400 mt-1">0 = 仅打包，9 = 最高压缩率（更慢）</p>
      </div>

      <div className="flex gap-3">
        <button onClick={compress} disabled={!files.length || busy} className={BTN_PRIMARY}>
          {busy ? '处理中…' : `打包为ZIP (${files.length})`}
        </button>
        <button
          onClick={decompress}
          disabled={!files.length || busy}
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          查看ZIP内容
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {result?.extracted !== undefined && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <div className="text-green-700 dark:text-green-400 font-medium">
            ZIP 内共 {result.extracted} 个文件
          </div>
          {entries.length > 0 && (
            <div className="mt-3 space-y-1 max-h-48 overflow-auto">
              {entries.map((e) => (
                <div
                  key={e.name}
                  className="flex items-center justify-between bg-white/60 dark:bg-gray-800/60 rounded-lg px-3 py-1.5 text-sm"
                >
                  <span className="text-gray-700 dark:text-gray-300 truncate flex-1">{e.name}</span>
                  <span className="text-xs text-gray-400 ml-2">{fmtSize(e.size)}</span>
                  <button
                    type="button"
                    onClick={() => downloadBlob(new Blob([e.data]), e.name)}
                    className="ml-2 px-2 py-0.5 text-xs rounded bg-blue-500 text-white hover:bg-blue-600"
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
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
          <div className="text-green-700 dark:text-green-400 font-medium">压缩完成！已开始下载</div>
          <div className="text-sm text-gray-500 mt-1">
            {result.label} · 原始 {fmtSize(result.original)} → {fmtSize(result.size)}
            {result.saved > 0 ? `（省 ${result.percent}%）` : ''}
          </div>
        </div>
      )}
    </div>
  );
}
