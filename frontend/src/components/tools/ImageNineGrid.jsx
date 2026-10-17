import { useState } from 'react';
import Icon from '../Icons';
export default function ImageNineGrid() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [output, setOutput] = useState([]);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const cut = () => {
    if (!file) return;
    // Create 9 grid from image using canvas
    const img = new Image();
    img.onload = () => {
      const parts = [];
      const pw = img.naturalWidth / 3;
      const ph = img.naturalHeight / 3;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const canvas = document.createElement('canvas');
          canvas.width = pw;
          canvas.height = ph;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, c * pw, r * ph, pw, ph, 0, 0, pw, ph);
          parts.push(canvas.toDataURL());
        }
      }
      setOutput(parts);
    };
    img.src = URL.createObjectURL(file);
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-line-2 rounded-card p-8 text-center hover:border-accent transition-colors cursor-pointer" onClick={() => document.getElementById('nf')?.click()}>
        <input id="nf" type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <div className="flex justify-center mb-3"><span className="chip"><Icon name="grid9" /></span></div>
        <p className="text-ink-2">{preview ? '点击更换图片' : '上传图片切成九宫格'}</p>
      </div>
      {preview && <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-card" />}
      <button onClick={cut} disabled={!file} className="btn-a w-full">切成九宫格</button>
      {output.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {output.map((url, i) => (
            <a key={i} href={url} download={`grid_${i + 1}.png`} className="block rounded-card overflow-hidden border-2 border-line hover:shadow-lift transition-shadow">
              <img src={url} alt={`Grid ${i + 1}`} className="w-full h-auto" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
