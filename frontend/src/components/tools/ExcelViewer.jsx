import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import Icon from '../Icons';
export default function ExcelViewer() {
  const [sheets, setSheets] = useState([]);
  const [activeSheet, setActiveSheet] = useState(0);
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const workbook = XLSX.read(ev.target.result, { type: 'array' });
      setSheets(workbook.SheetNames);
      loadSheet(workbook, workbook.SheetNames[0]);
    };
    reader.readAsArrayBuffer(file);
  };

  const loadSheet = (wb, name) => {
    const sheet = wb.Sheets[name];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    if (data.length > 0) {
      setHeaders(data[0] || []);
      setRows(data.slice(1) || []);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className="border-2 border-dashed border-line-2 rounded-card p-6 text-center hover:border-accent transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="hidden" />
        <div className="flex justify-center mb-3"><span className="chip"><Icon name="chart" /></span></div>
        <p className="text-sm text-ink-2">{fileName || '点击上传 Excel / CSV 文件'}</p>
      </div>

      {sheets.length > 0 && sheets.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {sheets.map((name, i) => (
            <button
              key={i}
              onClick={() => { const wb = XLSX.read(null, { type: 'binary' }); setActiveSheet(i); }}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                activeSheet === i ? 'bg-accent text-accent-fg' : 'bg-surface-2 text-ink-2'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {rows.length > 0 && (
        <div className="overflow-auto max-h-96 border border-line rounded-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-paper">
                <th className="px-3 py-2 text-left text-xs font-medium text-ink-3 w-10">#</th>
                {headers.map((h, i) => (
                  <th key={i} className="px-3 py-2 text-left text-xs font-medium text-ink-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? 'bg-surface' : 'bg-paper'}>
                  <td className="px-3 py-2 text-xs text-ink-3 font-mono">{ri + 1}</td>
                  {headers.map((_, ci) => (
                    <td key={ci} className="px-3 py-2 text-ink-2 whitespace-nowrap max-w-xs truncate">{row[ci] ?? ''}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-3 py-2 text-xs text-ink-3 border-t border-line">
            共 {rows.length} 行 × {headers.length} 列
          </div>
        </div>
      )}
    </div>
  );
}
