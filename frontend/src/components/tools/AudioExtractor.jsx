import MediaJob from './MediaJob';

export default function AudioExtractor() {
  return (
    <MediaJob
      job="extract-audio"
      accept="video/*"
      icon="filmstrip"
      hint="支持 MP4 / MKV / MOV / WebM 等常见视频"
      buttonText="提取音频"
      defaultOptions={{ format: 'mp3', bitrate: 192 }}
      options={[
        { key: 'format', label: '输出格式', type: 'choice', choices: ['mp3', 'm4a', 'wav'] },
        { key: 'bitrate', label: '音质 (kbps)', type: 'choice', choices: [128, 192, 256, 320] },
      ]}
    />
  );
}
