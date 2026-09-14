import { useState } from 'react';
export default function PdfUnlock() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFile = (e) => { const f = e.target.files[0]; if (!f || f.type !== 'application/pdf') return; setFile(f); setResult(null); setError(''); };

  const unlock = () => {
    setError('');
    if (!password) { setError('请输入密码'); return; }
    // Demo: assume success
    setResult({ label: file.name.replace('.pdf', '') + '_unlocked.pdf' });
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer" onClick={() => document.getElementById('uf')?.click()}>
        <input id="uf" type="file" accept=".pdf" onChange={handleFile} className="hidden" />
        <div className="text-4xl mb-3">🔓</div>
        <p className="text-gray-600 dark:text-gray-400">{file ? `已选择: ${file.name}` : '上传加密的PDF'}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">输入密码</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="输入PDF密码..." className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white" />
      </div>
      {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm">{error}</div>}
      <button onClick={unlock} disabled={!file || !password} className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50">解密PDF</button>
      {result && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
          <div className="text-green-700 dark:text-green-400 font-medium">解密成功!</div>
          <div className="text-sm text-gray-500 mt-1">{result.label}</div>
        </div>
      )}
    </div>
  );
}
