import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const aiTools = [
  // 对话聊天
  { name: 'ChatGPT', category: '对话聊天', desc: 'OpenAI 推出的通用对话 AI，支持写作、编程、分析等', link: 'https://chat.openai.com', recommended: true },
  { name: 'Claude', category: '对话聊天', desc: 'Anthropic 出品，长文本处理能力强，适合深度写作', link: 'https://claude.ai', recommended: true },
  { name: 'Gemini', category: '对话聊天', desc: 'Google 多模态 AI，集成 Workspace，支持图文理解', link: 'https://gemini.google.com' },
  { name: 'DeepSeek', category: '对话聊天', desc: '国产开源大模型，推理能力强，性价比极高', link: 'https://chat.deepseek.com' },
  { name: 'Perplexity', category: '对话聊天', desc: 'AI 搜索引擎，带引用来源的深度研究助手', link: 'https://perplexity.ai' },
  { name: 'Grok', category: '对话聊天', desc: 'xAI 出品，实时联网，风格幽默', link: 'https://grok.com' },
  { name: 'Kimi', category: '对话聊天', desc: '月之暗面出品，长上下文处理，适合分析文档', link: 'https://kimi.moonshot.cn' },
  { name: '豆包', category: '对话聊天', desc: '字节跳动出品，多模态对话 AI，国内易用', link: 'https://www.doubao.com' },
  { name: '通义千问', category: '对话聊天', desc: '阿里出品，长文本/代码/推理全能模型', link: 'https://tongyi.aliyun.com' },
  { name: '文心一言', category: '对话聊天', desc: '百度出品，中文理解强，集成搜索引擎', link: 'https://yiyan.baidu.com' },
  { name: '智谱清言', category: '对话聊天', desc: '智谱AI 出品，GLM 系列模型，支持多模态', link: 'https://chatglm.cn' },
  { name: 'Poe', category: '对话聊天', desc: '聚合多个 AI 模型，一平台切换使用', link: 'https://poe.com' },
  { name: 'Coze', category: '对话聊天', desc: '字节跳动 AI Bot 搭建平台，可自定义插件', link: 'https://www.coze.com' },
  { name: '扣子 (Coze)', category: '对话聊天', desc: '字节跳动 AI Bot 搭建平台', link: 'https://www.coze.cn' },
  
  // 编程开发
  { name: 'Cursor', category: '编程开发', desc: 'AI 原生代码编辑器，内置 GPT-4/Claude，自动补全', link: 'https://www.cursor.com', recommended: true },
  { name: 'GitHub Copilot', category: '编程开发', desc: 'GitHub 出品，IDE 内 AI 代码补全和生成', link: 'https://github.com/copilot', recommended: true },
  { name: 'Windsurf', category: '编程开发', desc: 'Codeium 出品，AI 流式编程 IDE', link: 'https://codeium.com', recommended: true },
  { name: 'Claude Code', category: '编程开发', desc: 'Anthropic 出品，终端内 AI 编程代理', link: 'https://docs.anthropic.com/claude-code' },
  { name: 'Replit AI', category: '编程开发', desc: '在线 IDE 内置 AI 编程助手', link: 'https://replit.com' },
  { name: 'v0', category: '编程开发', desc: 'Vercel 出品，AI 生成 React/UI 组件', link: 'https://v0.dev' },
  { name: 'Bolt.new', category: '编程开发', desc: 'AI 全栈 Web 应用生成，浏览器内编辑部署', link: 'https://bolt.new' },
  { name: 'Lovable', category: '编程开发', desc: 'AI 全栈应用生成器，自然语言描述构建', link: 'https://lovable.dev' },
  { name: 'Tabnine', category: '编程开发', desc: 'AI 代码补全，支持本地模型和隐私模式', link: 'https://www.tabnine.com' },
  { name: 'Amazon Q', category: '编程开发', desc: 'AWS 出品，开发助手和商业智能', link: 'https://aws.amazon.com/q' },
  { name: 'CodeBuddy', category: '编程开发', desc: '腾讯 AI 编码 Agent，支持 IDE/插件/CLI', link: 'https://codebuddy.cn' },
  { name: '通义灵码', category: '编程开发', desc: '阿里 AI 编码助手，支持 VS Code/JetBrains', link: 'https://tongyi.aliyun.com/lingma' },
  { name: '文心快码 (Comate)', category: '编程开发', desc: '百度 AI 编码助手，智能代码补全和生成', link: 'https://comate.baidu.com' },
  { name: 'CodeGeeX', category: '编程开发', desc: '智谱开源 AI 编码助手，支持 100+ 语言', link: 'https://codegeex.cn' },
  { name: 'CodeFuse', category: '编程开发', desc: '阿里代码助理，聚焦研发效能', link: 'https://codefuse.alipay.com' },
  { name: 'Codex CLI', category: '编程开发', desc: 'OpenAI 编码 Agent CLI，GPT-5 驱动', link: 'https://developers.openai.com/codex/cli' },
  { name: 'OpenCode', category: '编程开发', desc: '增长最快的开源 CLI Agent，75+ 模型切换', link: 'https://opencode.ai' },
  { name: 'Aider', category: '编程开发', desc: '开源 CLI 编码 Agent 鼻祖，支持 Claude/GPT/DeepSeek', link: 'https://aider.chat' },
  { name: 'Cline', category: '编程开发', desc: 'VS Code AI 编码 Agent，支持 MCP 工具调用', link: 'https://cline.bot' },
  
  // 图像生成
  { name: 'Midjourney', category: '图像生成', desc: '高质量 AI 图像生成，艺术风格出众', link: 'https://www.midjourney.com', recommended: true },
  { name: 'DALL·E', category: '图像生成', desc: 'OpenAI 文生图，创意风格多样', link: 'https://openai.com', recommended: true },
  { name: 'Stable Diffusion', category: '图像生成', desc: '开源文生图模型，本地部署可定制', link: 'https://stability.ai' },
  { name: 'Canva AI', category: '图像生成', desc: '在线设计平台内 AI 生图、抠图、排版', link: 'https://www.canva.com' },
  { name: 'Magnific AI', category: '图像生成', desc: 'AI 图像放大增强，细节锐化', link: 'https://magnific.ai' },
  { name: 'Remove.bg', category: '图像生成', desc: 'AI 一键去背景，支持批量处理', link: 'https://www.remove.bg' },
  { name: 'Leonardo AI', category: '图像生成', desc: 'AI 图像生成，游戏资产和概念设计', link: 'https://leonardo.ai' },
  { name: 'Ideogram', category: '图像生成', desc: 'AI 生图，文字渲染能力业界领先', link: 'https://ideogram.ai' },
  { name: 'Flux', category: '图像生成', desc: 'Black Forest Labs 开源文生图模型', link: 'https://flux.ai' },
  { name: 'Kling', category: '图像生成', desc: '快手出品，AI 视频和图像生成', link: 'https://kling.kuaishou.com' },
  { name: 'Recraft', category: '图像生成', desc: 'AI 矢量图生成，Logo 和图标设计', link: 'https://recraft.ai' },
  { name: 'Adobe Firefly', category: '图像生成', desc: 'Adobe 全家桶 AI 生图和设计', link: 'https://firefly.adobe.com', recommended: true },
  { name: 'Microsoft Designer', category: '图像生成', desc: '微软出品，AI 设计生成，集成 Copilot', link: 'https://designer.microsoft.com' },
  
  // 视频制作
  { name: 'Sora', category: '视频制作', desc: 'OpenAI 文生视频，真实物理模拟', link: 'https://openai.com/sora' },
  { name: 'Runway Gen', category: '视频制作', desc: 'AI 视频生成和编辑，专业级创作工具', link: 'https://runwayml.com', recommended: true },
  { name: 'Pika Labs', category: '视频制作', desc: '文生视频，支持风格迁移和编辑', link: 'https://pika.art' },
  { name: 'HeyGen', category: '视频制作', desc: 'AI 数字人视频生成，口型同步', link: 'https://www.heygen.com', recommended: true },
  { name: 'CapCut', category: '视频制作', desc: '剪映国际版，AI 视频剪辑和特效', link: 'https://www.capcut.com' },
  { name: 'Vidu', category: '视频制作', desc: '生数科技出品，AI 文生视频', link: 'https://www.vidu.cn' },
  { name: 'Luma Dream Machine', category: '视频制作', desc: 'AI 视频生成，物理效果逼真', link: 'https://lumalabs.ai/dream-machine' },
  { name: 'Descript', category: '视频制作', desc: 'AI 视频/播客编辑，文本编辑视频', link: 'https://www.descript.com' },
  { name: 'Video to GIF', category: '视频制作', desc: '视频转 GIF，支持调整 FPS 和尺寸', link: '#' },
  
  // 音频处理
  { name: 'ElevenLabs', category: '音频处理', desc: 'AI 语音合成，声音克隆，情感表达', link: 'https://try.elevenlabs.io', recommended: true },
  { name: 'Suno', category: '音频处理', desc: 'AI 音乐生成，根据提示词创作完整歌曲', link: 'https://suno.com', recommended: true },
  { name: 'Udio', category: '音频处理', desc: 'AI 音乐生成，音质出色', link: 'https://www.udio.com' },
  { name: 'Whisper', category: '音频处理', desc: 'OpenAI 开源语音识别，准确率高', link: 'https://openai.com/whisper' },
  { name: 'Adobe Podcast', category: '音频处理', desc: 'AI 音频增强，一键降噪和音质提升', link: 'https://podcast.adobe.com' },
  { name: 'AIVA', category: '音频处理', desc: 'AI 古典音乐创作，适合配乐', link: 'https://www.aiva.ai' },
  { name: 'Krisp', category: '音频处理', desc: 'AI 降噪，实时消除背景噪音', link: 'https://krisp.ai' },
  { name: 'Play.ht', category: '音频处理', desc: 'AI 语音生成，支持克隆和情感表达', link: 'https://play.ht' },
  { name: 'Audio Extractor', category: '音频处理', desc: '从视频中提取音频轨道', link: '#' },
  
  // 写作辅助
  { name: 'Notion AI', category: '写作辅助', desc: '笔记和文档内的 AI 写作助手', link: 'https://www.notion.so/product/ai' },
  { name: 'Jasper', category: '写作辅助', desc: 'AI 营销文案生成，支持品牌语气', link: 'https://www.jasper.ai', recommended: true },
  { name: 'Copy.ai', category: '写作辅助', desc: 'AI 文案工具，快速生成营销内容', link: 'https://www.copy.ai', recommended: true },
  { name: 'Grammarly', category: '写作辅助', desc: 'AI 语法检查和写作润色', link: 'https://www.grammarly.com', recommended: true },
  { name: 'WPS AI', category: '写作辅助', desc: 'WPS Office 内置 AI，写作/PPT/表格助手', link: 'https://ai.wps.cn' },
  { name: '讯飞写作', category: '写作辅助', desc: '科大讯飞出品，AI 写作和会议纪要', link: 'https://write.iflytek.com' },
  { name: 'ProWritingAid', category: '写作辅助', desc: '深度语法检查和写作风格分析', link: 'https://prowritingaid.com' },
  { name: 'AI Writing Assistant', category: '写作辅助', desc: '模板驱动的写作助手', link: '#' },
  
  // 效率工具
  { name: 'Gamma', category: '效率工具', desc: 'AI 演示文稿生成，文档和卡片', link: 'https://gamma.app' },
  { name: 'Notion', category: '效率工具', desc: '全能协作平台，集成 AI 问答和写作', link: 'https://www.notion.so' },
  { name: 'Zapier AI', category: '效率工具', desc: 'AI 自动化工作流，连接上百应用', link: 'https://zapier.com', recommended: true },
  { name: 'Motion', category: '效率工具', desc: 'AI 项目管理，自动排期和优先级', link: 'https://www.usemotion.com', recommended: true },
  { name: 'Otter.ai', category: '效率工具', desc: 'AI 会议记录，实时转录和摘要', link: 'https://otter.ai' },
  { name: '飞书智能伙伴', category: '效率工具', desc: '字节飞书内置 AI，文档/会议/知识库', link: 'https://www.feishu.cn' },
  { name: '钉钉 AI', category: '效率工具', desc: '阿里钉钉内置 AI，审批/文档/会议助手', link: 'https://www.dingtalk.com' },
  { name: 'Mem.ai', category: '效率工具', desc: 'AI 笔记，自动关联和整理知识', link: 'https://mem.ai' },
  
  // 设计创意
  { name: 'Figma AI', category: '设计创意', desc: 'Figma 内置 AI 设计生成和编辑', link: 'https://www.figma.com', recommended: true },
  { name: 'Adobe Firefly', category: '设计创意', desc: 'Adobe 全家桶 AI 生图和设计', link: 'https://firefly.adobe.com', recommended: true },
  { name: 'Uizard', category: '设计创意', desc: 'AI 线框图转 UI 设计稿', link: 'https://uizard.io' },
  { name: 'Looka', category: '设计创意', desc: 'AI Logo 设计生成器', link: 'https://looka.com' },
  { name: 'Galileo AI', category: '设计创意', desc: 'AI UI 设计，文字描述生成界面稿', link: 'https://www.usegalileo.ai' },
  { name: 'Visily', category: '设计创意', desc: 'AI 原型设计，截图转可编辑设计稿', link: 'https://www.visily.ai' },
  
  // 免费大模型
  { name: 'Agnes AI', category: '免费大模型', desc: '新加坡 Sapiens AI 出品，全模态永久免费', link: 'https://platform.agnes-ai.com' },
  { name: '智谱 GLM-4-Flash', category: '免费大模型', desc: 'GLM-4-Flash 永久免费，30 并发无限制', link: 'https://open.bigmodel.cn' },
  { name: 'Google Gemini API', category: '免费大模型', desc: 'Gemini Flash 系列永久免费，1500 次/天', link: 'https://ai.google.dev' },
  { name: 'NVIDIA NIM', category: '免费大模型', desc: '免费无限调用，40RPM，支持多模型', link: 'https://build.nvidia.com' },
  { name: 'Free Qwen3', category: '免费大模型', desc: '全球首个完全免费无限制大模型 API', link: 'https://qwen3.slmnb.cn' },
  { name: 'Groq', category: '免费大模型', desc: '极速免费推理 API，30RPM，无需绑卡', link: 'https://groq.com' },
  { name: 'Cloudflare Workers AI', category: '免费大模型', desc: '免费 AI API，边缘计算推理', link: 'https://workers.ai' },
  { name: 'Hugging Face Inference API', category: '免费大模型', desc: '免费推理 API，数十万开源模型', link: 'https://huggingface.co/inference-api' },
  { name: 'ModelScope 魔搭', category: '免费大模型', desc: '阿里达摩院出品，每天 2000 次免费', link: 'https://modelscope.cn' },
  
  // Agent 平台
  { name: 'Dify', category: 'Agent 平台', desc: '开源 LLM 应用开发平台，可视化编排', link: 'https://dify.ai' },
  { name: 'FastGPT', category: 'Agent 平台', desc: '开源知识库 + Agent 工作流', link: 'https://fastgpt.in' },
  { name: 'LangChain', category: 'Agent 平台', desc: '主流 Agent 开发框架，支持多模型', link: 'https://langchain.com' },
  { name: 'CrewAI', category: 'Agent 平台', desc: '多 Agent 协作框架，编排角色分工', link: 'https://crewai.com' },
  { name: 'AutoGen', category: 'Agent 平台', desc: 'Microsoft 多 Agent 对话框架', link: 'https://microsoft.github.io/autogen' },
  { name: 'MCP', category: 'Agent 平台', desc: 'Anthropic Model Context Protocol', link: 'https://modelcontextprotocol.io' },
  { name: 'Manus', category: 'Agent 平台', desc: '云端自主 AI Agent，自动执行复杂任务', link: 'https://manus.im' },
  { name: 'Devin', category: 'Agent 平台', desc: 'AI 软件工程师，自主开发/调试/部署', link: 'https://devin.ai' },
  { name: 'OpenHands', category: 'Agent 平台', desc: '开源 AI 开发 Agent', link: 'https://www.openhands.dev' },
  { name: 'Google Vertex AI Agent', category: 'Agent 平台', desc: 'Google Agent 构建平台', link: 'https://cloud.google.com/vertex-ai' },
  { name: 'Microsoft Copilot Studio', category: 'Agent 平台', desc: '微软 Agent 构建平台', link: 'https://copilotstudio.microsoft.com' },
  { name: 'Semantic Kernel', category: 'Agent 平台', desc: '微软开源 Agent 框架', link: 'https://learn.microsoft.com/semantic-kernel' },
  { name: '扣子 (Coze)', category: 'Agent 平台', desc: '字节跳动 Agent 搭建平台', link: 'https://www.coze.cn' },
  { name: '百度千帆 AppBuilder', category: 'Agent 平台', desc: '百度 Agent 构建平台', link: 'https://console.bce.baidu.com/ai_apaas/dialogHome' },
  { name: '阿里百炼', category: 'Agent 平台', desc: '阿里大模型服务平台', link: 'https://bailian.aliyun.com' },
  { name: '腾讯元器', category: 'Agent 平台', desc: '腾讯 Agent 构建平台', link: 'https://yuanqi.tencent.com' },
  { name: 'LinkAI', category: 'Agent 平台', desc: '国内 Agent 平台', link: 'https://link-ai.tech' },
  { name: 'AgentBase', category: 'Agent 平台', desc: '开源 Agent 平台', link: 'https://agentbase.ai' },
  { name: '讯飞星辰', category: 'Agent 平台', desc: '科大讯飞 Agent 平台', link: 'https://agent.xfyun.cn' },
  { name: 'Trae Work', category: 'Agent 平台', desc: '字节跳动三端协同 AI 工作台', link: 'https://trae.cn' },
  { name: 'WorkBuddy', category: 'Agent 平台', desc: '腾讯全场景 AI 智能体', link: 'https://workbuddy.ai' },
  { name: 'QoderWork', category: 'Agent 平台', desc: '阿里云桌面 Work Agent', link: 'https://qoder.com/qoderwork' },
  { name: 'QwenPaw', category: 'Agent 平台', desc: '阿里通义桌面 Agent', link: 'https://qwenpaw.agentscope.io' },
  { name: 'OpenClaw', category: 'Agent 平台', desc: '开源桌面 Agent', link: 'https://openclaw.ai' },
  { name: '百度红手指 Operator', category: 'Agent 平台', desc: '百度桌面 Agent', link: 'https://operator.gc.com.cn' },
  { name: '华为 AgentArts (智果)', category: 'Agent 平台', desc: '华为云企业级 Agent 开发平台', link: 'https://www.huaweicloud.com/product/agentarts.html' },
];

const categories = ['全部', '对话聊天', '图像生成', '视频制作', '音频处理', '写作辅助', '编程开发', '效率工具', '设计创意', '免费大模型', 'Agent 平台'];

export default function AIToolsPage() {
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTools = aiTools.filter(tool => {
    const matchCategory = selectedCategory === '全部' || tool.category === selectedCategory;
    const matchSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       tool.desc.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-1">AI 工具导航</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">精选 60+ 热门 AI 工具，分类浏览，快速找到适合你的工具</p>
            
            {/* 分类筛选 */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            {/* 搜索框 */}
            <input
              type="text"
              placeholder="搜索 AI 工具名称或描述..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white mb-6"
            />
            
            {/* 工具列表 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredTools.map((tool, index) => (
                <a
                  key={index}
                  href={tool.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 bg-gradient-to-br from-blue-500 to-indigo-500">
                      {tool.name.charAt(0)}
                    </div>
                    <div classMin-w-0 flex-1>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-800 dark:text-white">{tool.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400">{tool.category}</span>
                        {tool.recommended && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 font-medium">推荐</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{tool.desc}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
            
            {/* AI 资讯 */}
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">AI 资讯</h3>
                <a className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium" href="/recommend">查看更多 →</a>
              </div>
              <div className="flex flex-wrap gap-2">
                {['GPT‑Live‑1 in the API', 'DeepSeek v4.1 Flash Uncensor…', 'Claude is no longer availabl…', 'The Gemini app is now availa…', 'DeepSeek 4.1 Flash', 'YouTube had a bug – I used C…'].map((news, i) => (
                  <a
                    key={i}
                    href="/recommend"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-transparent rounded-full text-xs text-gray-700 dark:text-gray-300 hover:from-purple-100 dark:hover:from-purple-900 hover:text-purple-700 dark:hover:text-purple-300 transition-colors no-underline border border-purple-100/50 dark:border-purple-800/50"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0"></span>
                    {news}
                  </a>
                ))}
              </div>
            </div>
            
            {/* 提交工具表单 */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 text-center">发现了好用的 AI 工具？欢迎提交收录</p>
              <div className="max-w-md mx-auto space-y-3">
                <input type="text" placeholder="工具名称 *" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                <input type="url" placeholder="官网地址 *" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                <textarea placeholder="简要描述（可选）" rows="2" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"></textarea>
                <div className="flex gap-2">
                  <select className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white">
                    <option value="">选择分类（可选）</option>
                    <option value="chatbot">对话聊天</option>
                    <option value="image">图像生成</option>
                    <option value="video">视频制作</option>
                    <option value="audio">音频处理</option>
                    <option value="writing">写作辅助</option>
                    <option value="code">编程开发</option>
                    <option value="productivity">效率工具</option>
                    <option value="design">设计创意</option>
                    <option value="api">免费大模型</option>
                    <option value="agent">Agent 平台</option>
                  </select>
                  <input type="text" placeholder="你的称呼（可选）" className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                </div>
                <input type="text" placeholder="联系方式（微信/邮箱/链接，方便我们联系你）" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                <button className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:from-blue-600 hover:to-blue-700 transition-colors">
                  提交 AI 工具
                </button>
              </div>
            </div>
          </div>
          
          {/* 广告位 */}
          <div className="mt-6">
            <div className="space-y-3">
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
                <div>
                  <a href="https://www.aliyun.com/minisite/goods?userCode=3kaw7rmd" rel="noopener noreferrer" style={{ display: 'block', textDecoration: 'none' }}>
                    <div style={{ background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', borderRadius: '12px', padding: '16px 20px', textAlign: 'center', color: '#fff' }}>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>☁️ 阿里云 AI 加速 · 低至38元/年</div>
                      <div style={{ fontSize: '12px', opacity: '0.85' }}>云服务器 ｜ OpenClaw 一键部署 ｜ AI模型限时5折</div>
                      <div style={{ marginTop: '8px', display: 'inline-block', background: '#64ffda', color: '#0f0c29', padding: '4px 20px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>查看优惠 →</div>
                    </div>
                  </a>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
                    <div>
                      <a href="#" rel="noopener noreferrer" style={{ display: 'block', borderRadius: '12px', overflow: 'hidden' }}>
                        <img src={`https://via.placeholder.com/300x200?text=Ad+${i}`} alt="广告" style={{ width: '100%', display: 'block' }} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}