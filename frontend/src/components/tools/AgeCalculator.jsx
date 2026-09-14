import { useState, useEffect } from 'react';

export default function AgeCalculator() {
  const [birthDate, setBirthDate] = useState('');
  const [name, setName] = useState('');
  const [result, setResult] = useState(null);

  const calculateAge = (birth, name = '') => {
    const today = new Date();
    const birthDateObj = new Date(birth);
    
    let years = today.getFullYear() - birthDateObj.getFullYear();
    let months = today.getMonth() - birthDateObj.getMonth();
    let days = today.getDate() - birthDateObj.getDate();
    
    if (days < 0) {
      months--;
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    const totalDays = Math.floor((today - birthDateObj) / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;
    
    // 星座
    const zodiac = getZodiac(birthDateObj.getMonth() + 1, birthDateObj.getDate());
    
    // 生肖
    const zodiacAnimal = getZodiacAnimal(birthDateObj.getFullYear());
    
    // 下一个生日
    const nextBirthday = new Date(today.getFullYear(), birthDateObj.getMonth(), birthDateObj.getDate());
    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    const daysUntilBirthday = Math.floor((nextBirthday - today) / (1000 * 60 * 60 * 24));
    
    setResult({
      name,
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      totalHours,
      totalMinutes,
      zodiac,
      zodiacAnimal,
      daysUntilBirthday,
      nextBirthday: nextBirthday.toLocaleDateString('zh-CN')
    });
  };

  const getZodiac = (month, day) => {
    const zodiacs = [
      ['摩羯座', '水瓶座'], ['水瓶座', '双鱼座'], ['双鱼座', '白羊座'],
      ['白羊座', '金牛座'], ['金牛座', '双子座'], ['双子座', '巨蟹座'],
      ['巨蟹座', '狮子座'], ['狮子座', '处女座'], ['处女座', '天秤座'],
      ['天秤座', '天蝎座'], ['天蝎座', '射手座'], ['射手座', '摩羯座']
    ];
    const dayThresholds = [20, 19, 21, 20, 21, 22, 23, 23, 23, 24, 23, 22];
    return day <= dayThresholds[month - 1] ? zodiacs[month - 1][0] : zodiacs[month - 1][1];
  };

  const getZodiacAnimal = (year) => {
    const animals = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
    return animals[(year - 4) % 12];
  };

  const handleCalculate = () => {
    if (birthDate) {
      calculateAge(birthDate, name);
    }
  };

  return (
    <div className="space-y-6">
      {/* 输入区域 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            姓名（可选）
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="请输入姓名..."
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            出生日期
          </label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50"
          />
        </div>
        
        <button
          onClick={handleCalculate}
          disabled={!birthDate}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          计算年龄
        </button>
      </div>

      {/* 结果展示 */}
      {result && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 text-center">
            <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
              {result.years}
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              {result.name || '您'} 今年{' '}
              <span className="font-semibold text-blue-600 dark:text-blue-400">{result.years}</span>
              {' '}岁{' '}
              <span className="text-gray-500 dark:text-gray-500">{result.months} 个月 {result.days} 天</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
              <div className="text-xl font-bold text-gray-900 dark:text-white">{result.totalDays.toLocaleString()}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">已活天数</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
              <div className="text-xl font-bold text-gray-900 dark:text-white">{result.totalWeeks.toLocaleString()}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">已活周数</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
              <div className="text-xl font-bold text-gray-900 dark:text-white">{result.totalHours.toLocaleString()}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">已活小时</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
              <div className="text-xl font-bold text-gray-900 dark:text-white">{result.daysUntilBirthday}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">距生日天数</div>
            </div>
          </div>

          <div className="flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-2xl">♒</span>
              <span className="text-gray-700 dark:text-gray-300">{result.zodiac}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐭</span>
              <span className="text-gray-700 dark:text-gray-300">{result.zodiacAnimal}座</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
