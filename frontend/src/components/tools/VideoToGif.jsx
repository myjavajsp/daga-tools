import MediaJob from './MediaJob';

export default function VideoToGif() {
  return (
    <MediaJob
      job="video-to-gif"
      accept="video/*"
      icon="filmstrip"
      hint="截取视频片段生成 GIF（最长 30 秒）"
      buttonText="转换为GIF"
      defaultOptions={{ start: 0, duration: 3, fps: 12, width: 480 }}
      options={[
        { key: 'start', label: '开始时间 (秒)', type: 'number', min: 0, max: 86400 },
        { key: 'duration', label: '时长 (秒)', type: 'number', min: 1, max: 30 },
        { key: 'fps', label: '帧率', type: 'choice', choices: [8, 12, 16, 24] },
        { key: 'width', label: '宽度 (px)', type: 'choice', choices: [320, 480, 640] },
      ]}
    />
  );
}
