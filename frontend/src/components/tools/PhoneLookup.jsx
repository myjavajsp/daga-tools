import { useState } from 'react';
const AREA_CODES = {
  '130': '北京', '131': '北京', '132': '北京', '133': '北京', '134': '北京', '135': '北京', '136': '北京', '137': '北京', '138': '北京', '139': '北京',
  '150': '北京', '151': '北京', '152': '北京', '153': '北京', '155': '北京', '156': '北京', '157': '北京', '158': '北京', '159': '北京',
  '180': '北京', '181': '北京', '182': '北京', '183': '北京', '184': '北京', '185': '北京', '186': '北京', '187': '北京', '188': '北京', '189': '北京',
};
export default function PhoneLookup() {
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const lookup = (num) => {
    if (!/^\d{11}$/.test(num)) {
      setError('请输入11位手机号');
      setResult(null);
      return;
    }
    setError('');
    const prefix = num.substring(0, 3);
    // Demo: show mock result based on prefix
    const carriers = {
      '130': '中国联通', '131': '中国联通', '132': '中国联通', '155': '中国联通', '156': '中国联通', '185': '中国联通', '186': '中国联通',
      '133': '中国电信', '153': '中国电信', '173': '中国电信', '177': '中国电信', '180': '中国电信', '181': '中国电信', '189': '中国电信',
      '134': '中国移动', '135': '中国移动', '136': '中国移动', '137': '中国移动', '138': '中国移动', '139': '中国移动',
      '150': '中国移动', '151': '中国移动', '152': '中国移动', '157': '中国移动', '158': '中国移动', '159': '中国移动',
      '182': '中国移动', '183': '中国移动', '184': '中国移动', '187': '中国移动', '188': '中国移动',
    };
    const carrier = carriers[prefix] || '未知运营商';
    const provinces = ['北京', '上海', '广东', '江苏', '浙江', '山东', '河南', '四川', '湖北', '湖南', '福建', '安徽', '辽宁', '河北', '陕西', '江西', '云南', '山西', '吉林', '黑龙江'];
    const province = provinces[Math.floor(Math.random() * provinces.length)];
    setResult({ phone: num, carrier, province, prefix });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">手机号码</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
          placeholder="输入11位手机号..."
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-mono"
        />
      </div>

      <button onClick={() => lookup(phone)} disabled={phone.length !== 11} className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 transition-all">
        查询
      </button>

      {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm">{error}</div>}

      {result && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-2xl">📱</div>
            <div>
              <div className="font-bold text-gray-900 dark:text-white font-mono">{result.phone.slice(0,3)}****{result.phone.slice(7)}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{result.prefix} 段</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
              <div className="text-gray-500 dark:text-gray-400 text-xs">运营商</div>
              <div className="font-medium text-gray-900 dark:text-white">{result.carrier}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
              <div className="text-gray-500 dark:text-gray-400 text-xs">归属地</div>
              <div className="font-medium text-gray-900 dark:text-white">{result.province}</div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="font-medium text-gray-900 dark:text-white mb-2">说明</div>
        <p className="text-xs">本工具仅模拟查询功能，归属地数据仅供参考。实际归属地请以运营商官方数据为准。</p>
      </div>
    </div>
  );
}
