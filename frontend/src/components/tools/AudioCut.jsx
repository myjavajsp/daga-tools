import MediaJob from './MediaJob';

export default function AudioCut() {
  return (
    <MediaJob
      job="trim"
      accept="audio/*"
      icon="scissors"
      hint="按起止时间裁剪音频（不重新编码，速度快）"
      buttonText="裁剪"
      defaultOptions={{ start: 0, duration: 30, format: 'mp3' }}
      options={[
        { key: 'start', label: '开始时间 (秒)', type: 'number', min: 0, max: 86400 },
        { key: 'duration', label: '裁剪时长 (秒)', type: 'number', min: 1, max: 14400 },
        { key: 'format', label: '输出格式', type: 'choice', choices: ['mp3', 'm4a', 'wav'] },
      ]}
    />
  );
}
