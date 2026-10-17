import { useState, useRef } from 'react';
export default function TextToSpeech() {
  const [text, setText] = useState('');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [voices, setVoices] = useState([]);
  const [speaking, setSpeaking] = useState(false);
  const [currentLang, setCurrentLang] = useState('zh-CN');
  const synthRef = useRef(null);

  useState(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
      setVoices(v);
    };
    loadVoices();
    window.speechSynthesis?.addEventListener('voiceschanged', loadVoices);
  });

  const speak = () => {
    if (!text.trim()) return;
    window.speechSynthesis?.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = rate;
    utter.pitch = pitch;
    const zhVoice = voices.find(v => v.lang.startsWith('zh'));
    if (zhVoice) utter.voice = zhVoice;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    window.speechSynthesis?.speak(utter);
  };

  const stop = () => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="lbl">输入文本</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="输入要朗读的文字..."
          className="w-full h-40 px-4 py-3 bg-paper border border-line rounded-card text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-accent-soft resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="lbl">语速: {rate}</label>
          <input type="range" min="0.5" max="2" step="0.1" value={rate} onChange={(e) => setRate(Number(e.target.value))} className="slider" />
        </div>
        <div>
          <label className="lbl">音调: {pitch}</label>
          <input type="range" min="0.5" max="2" step="0.1" value={pitch} onChange={(e) => setPitch(Number(e.target.value))} className="slider" />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={speak}
          disabled={!text.trim() || speaking}
          className="btn-a flex-1 transition-colors"
        >
          {speaking ? '播放中...' : '开始朗读'}
        </button>
        <button
          onClick={stop}
          disabled={!speaking}
          className="btn-ghost"
        >
          停止
        </button>
      </div>

      {voices.length > 0 && (
        <div>
          <label className="lbl">可用语音</label>
          <div className="flex flex-wrap gap-2">
            {voices.filter(v => v.lang.startsWith('zh') || v.lang.startsWith('en')).slice(0, 8).map((v, i) => (
              <button key={i} className="px-3 py-1 text-xs bg-surface-2 rounded-lg text-ink-2 hover:bg-accent-soft hover:text-accent transition-colors">
                {v.name.split(' ').pop()} ({v.lang})
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
