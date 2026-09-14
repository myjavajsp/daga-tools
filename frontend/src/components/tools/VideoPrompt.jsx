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
    sci-fi: 'sci-fi concept art, futuristic, neon lights, cyberpunk style',
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
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">视频内容描述</label>
        <textarea value={subject} onChange={e => setSubject(e.target.value)} placeholder="描述你想生成的视频内容..." className="w-full h-24 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[{ id: 'style', label: '风格', vals: ['realistic', 'anime', 'fantasy', 'sci-fi'] }, { id: 'motion', label: '动效', vals: ['slow', 'fast', 'normal'] }, { id: 'camera', label: '镜头', vals: ['static', 'pan', 'zoom'] }].map(({ id, label, vals }) => (
          <div key={id}>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</label>
            <select value={id === 'style' ? style : id === 'motion' ? motion : camera} onChange={e => { if (id === 'style') setStyle(e.target.value); else if (id === 'motion') setMotion(e.target.value); else setCamera(e.target.value); }} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white">
              {vals.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        ))}
      </div>
      <button onClick={generate} disabled={!subject.trim()} className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50">生成提示词</button>
      {output && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AI视频提示词</span>
            <button onClick={() => navigator.clipboard.writeText(output)} className="text-xs text-blue-500 hover:text-blue-600">复制</button>
          </div>
          <p className="text-sm text-gray-800 dark:text-gray-200">{output}</p>
        </div>
      )}
    </div>
  );
}
