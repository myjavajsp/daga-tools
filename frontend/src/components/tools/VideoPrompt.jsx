import { useState } from 'react';
export default function VideoPrompt() {
  const [subject, setSubject] = useState('');
  const [style, setStyle] = useState('realistic');
  const [motion, setMotion] = useState('slow');
  const [camera, setCamera] = useState('static');
  const [output, setOutput] = useState('');

  const prompts = {
    realistic: 'photorealistic, cinematic lighting, 8k, highly detailed',
    anime: 'anime style, studio ghibli, vibrant colors, beautiful animation',
    fantasy: 'fantasy art, magical atmosphere, ethereal lighting, dreamy',
    'sci-fi': 'sci-fi concept art, futuristic, neon lights, cyberpunk style',
  };

  const motions = { slow: 'slow motion, smooth movement', fast: 'fast paced, dynamic movement', normal: 'natural movement' };
  const cameras = { static: 'static shot, tripod', pan: 'panning shot, smooth camera movement', zoom: 'zoom in, dramatic reveal' };

  const generate = () => {
    const p = prompts[style] || prompts.realistic;
    const m = motions[motion] || motions.slow;
    const c = cameras[camera] || cameras.static;
    setOutput(`${subject}, ${p}, ${m}, ${c}, masterpiece, best quality`);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="lbl">视频内容描述</label>
        <textarea value={subject} onChange={e => setSubject(e.target.value)} placeholder="描述你想生成的视频内容..." className="w-full h-24 px-4 py-3 bg-paper border border-line rounded-card text-ink resize-none focus:outline-none focus:ring-2 focus:ring-accent-soft" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[{ id: 'style', label: '风格', vals: ['realistic', 'anime', 'fantasy', 'sci-fi'] }, { id: 'motion', label: '动效', vals: ['slow', 'fast', 'normal'] }, { id: 'camera', label: '镜头', vals: ['static', 'pan', 'zoom'] }].map(({ id, label, vals }) => (
          <div key={id}>
            <label className="block text-xs text-ink-3 mb-1">{label}</label>
            <select value={id === 'style' ? style : id === 'motion' ? motion : camera} onChange={e => { if (id === 'style') setStyle(e.target.value); else if (id === 'motion') setMotion(e.target.value); else setCamera(e.target.value); }} className="input w-full">
              {vals.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        ))}
      </div>
      <button onClick={generate} disabled={!subject.trim()} className="btn-a w-full">生成提示词</button>
      {output && (
        <div className="bg-paper rounded-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-ink-2">AI视频提示词</span>
            <button onClick={() => navigator.clipboard.writeText(output)} className="act">复制</button>
          </div>
          <p className="text-sm text-ink">{output}</p>
        </div>
      )}
    </div>
  );
}
