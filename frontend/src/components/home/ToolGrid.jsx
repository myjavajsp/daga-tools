import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../Icons';
import Reveal from '../Reveal';

/**
 * 首页工具卡阵。
 * 文案只写已在源码里核对过的能力：
 *  - 去背景 = 浏览器内跑 U2Net（onnx），输出透明 PNG，不上传；
 *  - 图片压缩 = canvas 重编码，同样在本地；
 *  - 二维码 = 生成后可下载 PNG。
 * 其余条目沿用站点自己的工具名与说法，不加没做过的承诺。
 */
const TOOLS = [
  {
    icon: 'play',
    name: 'M3U8 播放器',
    desc: '手上有 m3u8 直链就能直接在线播放，支持自定义地址与全屏。',
    tag: 'm3u8',
    path: '/tools/m3u8-player',
    feat: true,
  },
  { icon: 'film', name: '短视频去水印', desc: '抖音、快手分享链接解析，输出无水印地址。', tag: '抖音/快手', path: '/tools/video-downloader' },
  { icon: 'qr', name: '二维码生成', desc: '文本、网址生成二维码，可直接下载 PNG。', tag: 'PNG', path: '/tools/qr-code-gen' },
  { icon: 'wand', name: 'AI 去背景', desc: '人像、商品抠图，浏览器内处理，输出透明 PNG。', tag: '本地', path: '/tools/image-bg-remove' },
  { icon: 'image', name: '图片压缩', desc: '按质量重编码压小体积，图片不上传服务器。', tag: '本地', path: '/tools/compress' },
  { icon: 'file', name: 'PDF 合并', desc: '多个 PDF 合成一个文件，可调整顺序。', tag: '合并', path: '/tools/pdf-merge' },
  { icon: 'crop', name: '视频转 GIF', desc: '截取一段视频做成 GIF 动图。', tag: 'GIF', path: '/tools/video-to-gif' },
];

/**
 * ToolGrid — 「实用工具」区块（1 个横贯主推 + 3 列卡阵）
 * 只留一个主推项，其余等权重；hover 才显出「使用 →」，卡片不靠颜色分主次。
 */
export default function ToolGrid({ tools = TOOLS, title = '实用工具', note = '解析之外，日常用得最多的几个', moreTo = '/tools/', moreLabel = '全部工具' }) {
  return (
    <section className="section" id="tools">
      <div className="wrap">
        <div className="sec-head">
          <h2>{title}</h2>
          {note && <span className="note">{note}</span>}
          <Link to={moreTo} className="more">
            {moreLabel}
            <Icon name="arrow" />
          </Link>
        </div>

        <Reveal as="div" className="tools">
          {tools.map((tool) =>
            tool.feat ? (
              <Link key={tool.path} to={tool.path} className="tcard feat">
                <span className="chip">
                  <Icon name={tool.icon} />
                </span>
                <div className="txt">
                  <h3>{tool.name}</h3>
                  <p>{tool.desc}</p>
                </div>
                <span className="open">
                  打开
                  <Icon name="arrow" className="sz15" />
                </span>
              </Link>
            ) : (
              <Link key={tool.path} to={tool.path} className="tcard">
                <span className="hd">
                  <span className="chip">
                    <Icon name={tool.icon} />
                  </span>
                  <h3>{tool.name}</h3>
                  <span className="tg">{tool.tag}</span>
                </span>
                <p>{tool.desc}</p>
                <span className="go">
                  使用
                  <Icon name="arrow" className="sz15" />
                </span>
              </Link>
            )
          )}
        </Reveal>
      </div>
    </section>
  );
}
