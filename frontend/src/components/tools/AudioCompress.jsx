import MediaJob from './MediaJob';

export default function AudioCompress() {
  return (
    <MediaJob
      job="compress-audio"
      accept="audio/*"
      icon="chart"
      hint="降低比特率以减小体积，输出为 MP3"
      buttonText="压缩音频"
      defaultOptions={{ bitrate: 128 }}
      options={[
        { key: 'bitrate', label: '目标比特率 (kbps)', type: 'choice', choices: [64, 96, 128, 192] },
      ]}
    />
  );
}
