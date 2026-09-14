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
    if (i >= input.length) return 'text-gray-400 dark:text-gray-500';
    if (input[i] === text[i]) return 'text-green-600 dark:text-green-400';
    return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
  };

  return (
    <div className="space-y-6">
      <div className="relative p-4 bg-gray-50 dark:bg-gray-700 rounded-xl font-mono text-lg leading-relaxed select-none">
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
        className={`w-full h-32 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none ${completed ? 'opacity-50' : ''}`}
      />

      {completed && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{wpm}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">WPM</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{accuracy}%</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">准确率</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {((endTime - startTime) / 1000).toFixed(1)}s
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">用时</div>
          </div>
        </div>
      )}

      <button
        onClick={reset}
        className="w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
      >
        重新开始
      </button>
    </div>
  );
}
