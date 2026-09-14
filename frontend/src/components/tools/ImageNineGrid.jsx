import { useState } from 'react';
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
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer" onClick={() => document.getElementById('nf')?.click()}>
        <input id="nf" type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <div className="text-4xl mb-3">📐</div>
        <p className="text-gray-600 dark:text-gray-400">{preview ? '点击更换图片' : '上传图片切成九宫格'}</p>
      </div>
      {preview && <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-xl" />}
      <button onClick={cut} disabled={!file} className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50">切成九宫格</button>
      {output.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {output.map((url, i) => (
            <a key={i} href={url} download={`grid_${i + 1}.png`} className="block rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <img src={url} alt={`Grid ${i + 1}`} className="w-full h-auto" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
