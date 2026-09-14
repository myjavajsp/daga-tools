import { useState } from 'react';
const SIMPLIFIED_TO_TRADITIONAL = {
  '的': '的', '一': '一', '是': '是', '不': '不', '了': '瞭', '在': '在', '有': '有', '和': '和', '人': '人', '这': '這',
  '中': '中', '大': '大', '为': '為', '上': '上', '个': '個', '国': '國', '对': '對', '年': '年', '地': '地', '到': '到',
  '以': '以', '说': '說', '时': '時', '要': '要', '会': '會', '作': '作', '里': '裡', '用': '用', '道': '道', '行': '行',
  '所': '所', '然': '然', '家': '家', '种': '種', '后': '後', '自': '自', '事': '事', '物': '物', '发': '發', '与': '與',
  '即': '即', '给': '給', '明': '明', '看': '看', '并': '並', '还': '還', '去': '去', '能': '能', '没': '沒', '好': '好',
  '长': '長', '点': '點', '比': '比', '但': '但', '每': '每', '想': '想', '学': '學', '月': '月', '几': '幾', '同': '同',
  '会': '會', '来': '來', '分': '分', '生': '生', '成': '成', '可': '可', '多': '多', '次': '次', '新': '新', '出': '出',
  '回': '回', '小': '小', '信': '信', '话': '話', '什': '什', '下': '下', '让': '讓', '最': '最', '我': '我', '么': '麼',
  '只': '只', '又': '又', '知': '知', '什': '什', '过': '過', '现': '現', '其': '其', '手': '手', '头': '頭', '开': '開',
  '先': '先', '声': '聲', '去': '去', '四': '四', '五': '五', '六': '六', '七': '七', '八': '八', '九': '九', '十': '十',
  '百': '百', '千': '千', '万': '萬', '亿': '億', '鱼': '魚', '鸟': '鳥', '马': '馬', '龙': '龍', '凤': '鳳', '书': '書',
  '画': '畫', '电': '電', '车': '車', '钟': '鐘', '门': '門', '队': '隊', '页': '頁', '头': '頭', '乐': '樂', '云': '雲',
  '风': '風', '气': '氣', '雨': '雨', '雪': '雪', '冰': '冰', '鱼': '魚', '虾': '蝦', '龟': '龜', '兽': '獸', '鸡': '雞',
  '鸭': '鴨', '鹅': '鹅', '蛋': '蛋', '灯': '燈', '火': '火', '灶': '竈', '饭': '飯', '菜': '菜', '果': '果', '林': '林',
  '森': '森', '树': '樹', '木': '木', '石': '石', '山': '山', '水': '水', '河': '河', '海': '海', '江': '江', '河': '河',
  '岛': '島', '岸': '岸', '桥': '橋', '路': '路', '街': '街', '镇': '鎮', '城': '城', '墙': '墻', '院': '院', '房': '房',
  '屋': '屋', '窗': '窗', '床': '牀', '桌': '桌', '椅': '椅', '门': '門', '扇': '扇', '画': '畫', '字': '字', '纸': '紙',
  '笔': '筆', '墨': '墨', '书': '書', '包': '包', '衣': '衣', '服': '服', '鞋': '鞋', '帽': '帽', '钱': '錢', '银': '銀',
  '铁': '鐵', '铜': '銅', '金': '金', '玉': '玉', '珠': '珠', '宝': '寶', '爱': '愛', '亲': '親', '情': '情', '心': '心',
  '想': '想', '念': '念', '思': '思', '意': '意', '志': '志', '愿': '願', '梦': '夢', '梦': '夢', '魂': '魂', '鬼': '鬼',
  '神': '神', '仙': '仙', '佛': '佛', '庙': '廟', '寺': '寺', '堂': '堂', '宫': '宮', '殿': '殿', '园': '園', '林': '林',
  '花': '花', '草': '草', '树': '樹', '木': '木', '果': '果', '实': '實', '叶': '葉', '根': '根', '枝': '枝', '条': '條',
  '种': '種', '类': '類', '别': '別', '型': '型', '式': '式', '样': '樣', '貌': '貌', '颜': '顏', '色': '色', '红': '紅',
  '黄': '黃', '蓝': '藍', '绿': '綠', '白': '白', '黑': '黑', '灰': '灰', '紫': '紫', '橙': '橙', '粉': '粉', '青': '青',
  '暖': '暖', '冷': '冷', '热': '熱', '温': '溫', '凉': '涼', '寒': '寒', '暑': '暑', '晴': '晴', '阴': '陰', '明': '明',
  '暗': '暗', '光': '光', '影': '影', '星': '星', '日': '日', '月': '月', '太阳': '太陽', '月亮': '月亮', '星星': '星星',
  '云': '雲', '雾': '霧', '雷': '雷', '电': '電', '虹': '虹', '霞': '霞', '露': '露', '霜': '霜', '雪': '雪', '冰': '冰',
};

export default function ZhConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('zh-tw');

  const convert = (text, toTraditional) => {
    if (toTraditional) {
      // Traditional to Simplified (simplified mapping)
      let result = text;
      Object.entries(SIMPLIFIED_TO_TRADITIONAL).forEach(([simp, trad]) => {
        result = result.split(trad).join(simp);
      });
      return result;
    } else {
      // Simplified to Traditional
      let result = text;
      Object.entries(SIMPLIFIED_TO_TRADITIONAL).forEach(([simp, trad]) => {
        result = result.split(simp).join(trad);
      });
      return result;
    }
  };

  const handleConvert = () => {
    const result = convert(input, mode === 'zh-tw');
    setOutput(result);
  };

  const copyOutput = async () => {
    await navigator.clipboard.writeText(output);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button
          onClick={() => { setMode('zh-cn'); setOutput(''); }}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${mode === 'zh-cn' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
        >
          简→繁
        </button>
        <button
          onClick={() => { setMode('zh-tw'); setOutput(''); }}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${mode === 'zh-tw' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
        >
          繁→简
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">输入文本</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入简体中文或繁体中文..."
          className="w-full h-40 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        />
      </div>

      <button
        onClick={handleConvert}
        disabled={!input.trim()}
        className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 transition-all"
      >
        转换
      </button>

      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">转换结果</label>
            <button onClick={copyOutput} className="text-xs text-blue-500 hover:text-blue-600">复制</button>
          </div>
          <textarea
            value={output}
            readOnly
            className="w-full h-40 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white resize-none"
          />
        </div>
      )}

      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="font-medium text-gray-900 dark:text-white mb-2">常用简繁对照</div>
        <div className="grid grid-cols-3 gap-2 text-xs font-mono">
          {['里→裡', '后→後', '发→發', '面→麵', '谷→穀', '斗→鬥', '云→雲', '干→乾', '里→裡', '只→隻', '钟→鐘', '余→餘'].map(item => (
            <span key={item} className="px-2 py-1 bg-white dark:bg-gray-800 rounded">{item}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
