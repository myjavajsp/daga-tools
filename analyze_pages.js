const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const https = require('https');

console.log('=== 下载并分析服务器关键页面 ===\n');

const assetsDir = 'D:/MTC/daga-clone/server-build/assets';

// 需要分析的页面
const pagesToAnalyze = [
  'MemePage-CREfX3kK.js',
  'MbtiTestPage-BToOS-xD.js',
  'HotPage-B9kqQ79_.js',
  'AboutPage-D0zjLP0I.js',
  'PrivacyPolicyPage-CTmSZeQM.js',
  'TermsPage-LdB9Hro6.js',
  'ContactPage-Ah3U1TQf.js',
  'ToolsPage-C_T8Ap0j.js',
  'AIToolsPage-Cz3dK200.js',
  'ScreenRecorderPage-DVQwNIFO.js'
];

// 读取并分析每个页面
pagesToAnalyze.forEach(fileName => {
  const filePath = path.join(assetsDir, fileName);
  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${fileName} - 文件不存在`);
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const name = fileName.replace('.js', '');
  
  console.log(`\n【${name}】(${content.length} bytes)`);
  
  // 提取关键代码特征
  const features = {
    hasVideo: content.includes('<video') || content.includes('>video'),
    hasAudio: content.includes('<audio') || content.includes('>audio'),
    hasImage: content.includes('<img') || content.includes('image'),
    hasForm: content.includes('<input') || content.includes('form'),
    hasButton: content.includes('<button') || content.includes('Button'),
    hasList: content.includes('map(') || content.includes('.forEach('),
    hasState: content.includes('useState') || content.includes('setState'),
    hasEffect: content.includes('useEffect'),
    hasFetch: content.includes('fetch') || content.includes('axios') || content.includes('/api/'),
    hasRouter: content.includes('useNavigate') || content.includes('Link') || content.includes('route'),
    hasVideoParser: content.includes('parse') || content.includes('Parse') || content.includes('解析'),
    hasMeme: content.includes('meme') || content.includes('Meme') || content.includes('表情包'),
    hasMusic: content.includes('music') || content.includes('Music') || content.includes('音乐'),
    hasMBTI: content.includes('mbti') || content.includes('MBTI') || content.includes('测试'),
    hasAI: content.includes('ai') || content.includes('AI') || content.includes('智能'),
    hasRecorder: content.includes('record') || content.includes('Record') || content.includes('录屏'),
    hasScreen: content.includes('screen') || content.includes('Screen')
  };
  
  console.log('  特征:', Object.entries(features).filter(([k, v]) => v).map(([k]) => k).join(', '));
  
  // 提取主要函数名
  const funcMatches = content.match(/function\s+(\w+)/g) || [];
  const uniqueFuncs = [...new Set(funcMatches.map(f => f.replace('function ', '')))];
  console.log('  函数:', uniqueFuncs.slice(0, 5).join(', '));
});

console.log('\n\n=== 分析完成 ===');
console.log('请根据以上分析创建对应的 React 组件');