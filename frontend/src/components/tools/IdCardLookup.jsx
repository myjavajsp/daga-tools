import { useState } from 'react';
import Icon from '../Icons';
const ID_PATTERN = /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
const PROVINCES = {
  11: '北京', 12: '天津', 13: '河北', 14: '山西', 15: '内蒙古',
  21: '辽宁', 22: '吉林', 23: '黑龙江',
  31: '上海', 32: '江苏', 33: '浙江', 34: '安徽', 35: '福建', 36: '江西', 37: '山东',
  41: '河南', 42: '湖北', 43: '湖南', 44: '广东', 45: '广西', 46: '海南',
  50: '重庆', 51: '四川', 52: '贵州', 53: '云南', 54: '西藏',
  61: '陕西', 62: '甘肃', 63: '青海', 64: '宁夏', 65: '新疆',
  71: '台湾', 81: '香港', 82: '澳门',
};
export default function IdCardLookup() {
  const [idCard, setIdCard] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const lookup = (num) => {
    if (!ID_PATTERN.test(num)) {
      setError('身份证号格式不正确');
      setResult(null);
      return;
    }
    setError('');
    const prov = parseInt(num.substring(0, 2));
    const year = num.substring(6, 10);
    const month = num.substring(10, 12);
    const day = num.substring(12, 14);
    const genderNum = parseInt(num.substring(16, 17));
    const gender = genderNum % 2 === 1 ? '男' : '女';
    const birthDate = `${year}-${month}-${day}`;
    const age = Math.floor((Date.now() - new Date(birthDate).getTime()) / 31557600000);
    const province = PROVINCES[prov] || '未知';
    const checkCode = num.substring(17);
    setResult({ idCard: num.replace(/(.{4})(.{10})(.+)$/, '$1******$3'), prov, province, birthDate, gender, age, checkCode });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="lbl">身份证号</label>
        <input
          type="text"
          value={idCard}
          onChange={(e) => setIdCard(e.target.value.replace(/\D/g, '').slice(0, 18))}
          placeholder="输入18位身份证号..."
          className="w-full px-4 py-3 bg-paper border border-line rounded-card text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-accent-soft font-mono"
        />
      </div>

      <button onClick={() => lookup(idCard)} disabled={idCard.length !== 18} className="btn-a w-full transition-colors">
        查询
      </button>

      {error && <div className="bg-danger-soft border border-line rounded-card p-4 text-danger text-sm">{error}</div>}

      {result && (
        <div className="bg-paper rounded-card p-4 space-y-3">
          <div className="flex items-center gap-3">
            <span className="chip"><Icon name="idcard" /></span>
            <div>
              <div className="font-bold text-ink font-mono text-lg">{result.idCard}</div>
              <div className="text-xs text-ink-3">{result.province}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: '性别', value: result.gender },
              { label: '年龄', value: `${result.age}岁` },
              { label: '生日', value: result.birthDate },
              { label: '校验码', value: result.checkCode },
            ].map(({ label, value }) => (
              <div key={label} className="bg-surface rounded-lg p-3">
                <div className="text-ink-3 text-xs">{label}</div>
                <div className="font-medium text-ink">{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-accent-soft border border-line rounded-card p-4 text-sm text-ink-2">
        <div className="font-medium text-ink mb-2">身份证号码结构</div>
        <div className="text-xs space-y-1">
          <div>• 前6位：地址码（省市区）</div>
          <div>• 7-14位：出生日期（YYYYMMDD）</div>
          <div>• 15-17位：顺序码（奇数男，偶数女）</div>
          <div>• 第18位：校验码（0-9或X）</div>
        </div>
      </div>
    </div>
  );
}
