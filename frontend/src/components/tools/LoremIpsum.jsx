import { useState } from 'react';
const WORDS = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate', 'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'];

export default function LoremIpsum() {
  const [count, setCount] = useState(3);
  const [type, setType] = useState('paragraphs');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const randomWord = () => WORDS[Math.floor(Math.random() * WORDS.length)];

  const randomSentence = (minWords = 8, maxWords = 16) => {
    const wordCount = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;
    let sentence = Array.from({ length: wordCount }, randomWord).join(' ');
    return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
  };

  const randomParagraph = () => {
    const sentenceCount = Math.floor(Math.random() * 4) + 3;
    return Array.from({ length: sentenceCount }, randomSentence).join(' ');
  };

  const generate = () => {
    let result = '';
    if (type === 'paragraphs') {
      result = Array.from({ length: count }, randomParagraph).join('\n\n');
    } else if (type === 'sentences') {
      result = Array.from({ length: count }, randomSentence).join(' ');
    } else {
      result = Array.from({ length: count }, randomWord).join(' ');
    }
    setOutput(result);
  };

  const copyOutput = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="lbl">数量</label>
          <input
            type="number"
            min="1"
            max="50"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full px-4 py-3 bg-paper border border-line rounded-card text-ink focus:outline-none focus:ring-2 focus:ring-accent-soft"
          />
        </div>
        <div>
          <label className="lbl">类型</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="input w-full"
          >
            <option value="paragraphs">段落</option>
            <option value="sentences">句子</option>
            <option value="words">单词</option>
          </select>
        </div>
      </div>

      <button
        onClick={generate}
        className="btn-a w-full transition-colors"
      >
        生成文本
      </button>

      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="lbl">生成结果</label>
            <button
              onClick={copyOutput}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                copied
                  ? 'bg-success-soft text-success'
                  : 'bg-surface-2 text-ink-2 hover:bg-surface-3'
              }`}
            >
              {copied ? '已复制!' : '复制'}
            </button>
          </div>
          <textarea
            value={output}
            readOnly
            className="w-full h-64 px-4 py-3 bg-paper border border-line rounded-card text-ink resize-none"
          />
        </div>
      )}

      <div className="bg-paper rounded-card p-4 text-sm text-ink-2">
        <div className="font-medium text-ink mb-2">关于Lorem Ipsum</div>
        <p className="text-xs">Lorem Ipsum是印刷业的标准dummy文本，起源于15世纪。这段文本源自西塞罗的著作，已有2000多年历史。</p>
      </div>
    </div>
  );
}
