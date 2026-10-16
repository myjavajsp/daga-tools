import MediaJob from './MediaJob';

export default function AudioConvert() {
  return (
    <MediaJob
      job="convert"
      accept="audio/*"
      icon="🔄"
      hint="支持 MP3 / WAV / M4A / OGG / FLAC 等"
      buttonText="转换格式"
      defaultOptions={{ format: 'mp3' }}
      options={[
        {
          key: 'format',
          label: '目标格式',
          type: 'choice',
          choices: ['mp3', 'wav', 'm4a', 'ogg', 'flac'],
        },
      ]}
    />
  );
}
