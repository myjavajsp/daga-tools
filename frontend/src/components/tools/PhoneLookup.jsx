import { useState } from 'react';
import { BTN_PRIMARY } from '../../lib/file-utils';
import Icon from '../Icons';

/**
 * 手机号信息查询
 *
 * 说明：中国大陆手机号**前 3 位只能确定运营商**，归属地需要「前 7 位号段库」
 * （数万条、且随携号转网与放号持续变动）。硬编码号段库体积过大且必然过时，
 * 因此这里只输出**可以确定**的信息：号段、运营商、号卡类型，归属地不做猜测。
 */

/** 前 3 位 -> 运营商 */
const CARRIERS = {
  133: '中国电信', 149: '中国电信', 153: '中国电信', 162: '中国电信',
  173: '中国电信', 174: '中国电信', 177: '中国电信', 180: '中国电信',
  181: '中国电信', 189: '中国电信', 190: '中国电信', 191: '中国电信',
  193: '中国电信', 199: '中国电信',
  130: '中国联通', 131: '中国联通', 132: '中国联通', 145: '中国联通',
  146: '中国联通', 155: '中国联通', 156: '中国联通', 166: '中国联通',
  167: '中国联通', 175: '中国联通', 176: '中国联通', 185: '中国联通',
  186: '中国联通', 196: '中国联通',
  134: '中国移动', 135: '中国移动', 136: '中国移动', 137: '中国移动',
  138: '中国移动', 139: '中国移动', 147: '中国移动', 148: '中国移动',
  150: '中国移动', 151: '中国移动', 152: '中国移动', 157: '中国移动',
  158: '中国移动', 159: '中国移动', 172: '中国移动', 178: '中国移动',
  182: '中国移动', 183: '中国移动', 184: '中国移动', 187: '中国移动',
  188: '中国移动', 195: '中国移动', 197: '中国移动', 198: '中国移动',
};

/** 前 3 位 -> 号卡类型 */
function cardType(prefix) {
  const p = Number(prefix);
  if ([134, 135, 136, 137, 138, 139, 150, 151, 152, 157, 158, 159, 182, 183, 184, 187, 188, 147, 148, 172, 178, 195, 197, 198].includes(p)) return '移动号段';
  if ([130, 131, 132, 155, 156, 145, 146, 166, 167, 175, 176, 185, 186, 196].includes(p)) return '联通号段';
  if ([133, 153, 173, 174, 177, 180, 181, 189, 149, 162, 190, 191, 193, 199].includes(p)) return '电信号段';
  return '未知号段';
}

export default function PhoneLookup() {
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const lookup = (num) => {
    const digits = String(num).replace(/\D/g, '');
    if (!/^1\d{10}$/.test(digits)) {
      setError('请输入 11 位中国大陆手机号');
      setResult(null);
      return;
    }
    setError('');
    const prefix = digits.slice(0, 3);
    setResult({
      masked: `${digits.slice(0, 3)}****${digits.slice(7)}`,
      prefix,
      carrier: CARRIERS[Number(prefix)] || '未知运营商',
      type: cardType(Number(prefix)),
      valid: /^1[3-9]\d{9}$/.test(digits),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="lbl">手机号码</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
          onKeyDown={(e) => e.key === 'Enter' && lookup(phone)}
          placeholder="输入11位手机号..."
          className="w-full px-4 py-3 bg-paper border border-line rounded-card text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-accent-soft font-mono"
        />
      </div>

      <button
        onClick={() => lookup(phone)}
        disabled={phone.length !== 11}
        className={BTN_PRIMARY}
      >
        查询
      </button>

      {error && (
        <div className="bg-danger-soft border border-line rounded-card p-4 text-danger text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-paper rounded-card p-4 space-y-3">
          <div className="flex items-center gap-3">
            <span className="chip"><Icon name="phone" /></span>
            <div>
              <div className="font-bold text-ink font-mono">{result.masked}</div>
              <div className="text-xs text-ink-3">{result.prefix} 段</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-surface rounded-lg p-3">
              <div className="text-ink-3 text-xs">运营商</div>
              <div className="font-medium text-ink">{result.carrier}</div>
            </div>
            <div className="bg-surface rounded-lg p-3">
              <div className="text-ink-3 text-xs">号段类型</div>
              <div className="font-medium text-ink">{result.type}</div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-accent-soft border border-line rounded-card p-4 text-sm text-ink-2">
        <div className="font-medium text-ink mb-2">说明</div>
        <p className="text-xs">
          号码前 3 位可准确判断运营商；归属地需依赖「前 7 位号段库」（数万条且持续变动），
          本站不做猜测以避免给出错误信息。
        </p>
      </div>
    </div>
  );
}
