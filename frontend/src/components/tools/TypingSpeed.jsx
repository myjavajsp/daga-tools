import { useState, useEffect, useRef } from 'react';
const SAMPLE_TEXTS = [
  'The quick brown fox jumps over the lazy dog. Programming is the art of telling another human what one wants the computer to do.',
  'Technology empowers us to achieve the impossible. Every line of code is a step toward a better future for everyone.',
  'Success is not final, failure is not fatal. It is the courage to continue that counts in the journey of life.',
];

export default function TypingSpeed() {
  const [text] = useState(() => SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)]);
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [completed, setCompleted] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!input && !startTime) {
      inputRef.current?.focus();
    }
  }, [input, startTime]);

  const handleChange = (e) => {
    const val = e.target.value;
    setInput(val);

    if (!startTime) setStartTime(Date.now());

    const correct = val.split('').filter((c, i) => c === text[i]).length;
    setAccuracy(val.length ? Math.round((correct / val.length) * 100) : 100);

    if (val.length >= text.length) {
      setEndTime(Date.now());
      setCompleted(true);
      const timeMin = (Date.now() - startTime) / 60000;
      setWpm(Math.round(text.length / 5 / timeMin));
    }
  };

  const reset = () => {
    setInput('');
    setStartTime(null);
    setEndTime(null);
    setWpm(0);
    setAccuracy(100);
    setCompleted(false);
  };

  const getCharClass = (i) => {
    if (i >= input.length) return 'text-ink-3';
    if (input[i] === text[i]) return 'text-success';
    return 'text-danger bg-danger-soft';
  };

  return (
    <div className="space-y-6">
      <div className="relative p-4 bg-paper rounded-card font-mono text-lg leading-relaxed select-none">
        {text.split('').map((char, i) => (
          <span key={i} className={getCharClass(i)}>{char}</span>
        ))}
      </div>

      <textarea
        ref={inputRef}
        value={input}
        onChange={handleChange}
        disabled={completed}
        placeholder="开始打字..."
        className={`w-full h-32 px-4 py-3 border border-line rounded-card text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-accent-soft focus:border-accent resize-none text-base ${completed ? 'bg-surface-2' : 'bg-paper'}`}
      />

      {completed && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-accent-soft border border-line rounded-card p-4 text-center">
            <div className="text-3xl font-bold text-accent">{wpm}</div>
            <div className="text-xs text-ink-3 mt-1">WPM</div>
          </div>
          <div className="bg-success-soft border border-line rounded-card p-4 text-center">
            <div className="text-3xl font-bold text-success">{accuracy}%</div>
            <div className="text-xs text-ink-3 mt-1">准确率</div>
          </div>
          <div className="bg-accent-soft border border-line rounded-card p-4 text-center">
            <div className="text-3xl font-bold text-accent">
              {((endTime - startTime) / 1000).toFixed(1)}s
            </div>
            <div className="text-xs text-ink-3 mt-1">用时</div>
          </div>
        </div>
      )}

      <button
        onClick={reset}
        className="w-full py-3 bg-surface-2 text-ink-2 font-semibold rounded-card hover:bg-surface-3 transition-all"
      >
        重新开始
      </button>
    </div>
  );
}
