import React from 'react';
import Reveal from '../Reveal';

/**
 * GuideSteps — 使用说明（左说明 + 右步骤卡）
 * 数据来自后台 guide 表：{ id, step_number, content }，正文只有一句，
 * 所以 .n 给序号、正文直接当主文案（.steps p.body），不编小标题。
 * 
 * 注意：后端可能有重复数据，这里按 step_number+content 去重。
 */
export default function GuideSteps({ steps = [], title = '怎么用', note, intro }) {
  if (steps.length === 0) return null;

  // 按 step_number + content 去重，保留第一条（避免后端重复数据）
  const uniqueKeys = [];
  const uniqueSteps = steps.filter((step) => {
    const key = `${step.step_number}|${step.content}`;
    if (uniqueKeys.includes(key)) return false;
    uniqueKeys.push(key);
    return true;
  });

  if (uniqueSteps.length === 0) return null;

  return (
    <section className="section">
      <div className="wrap two">
        <Reveal>
          <h2 className="h">{title}</h2>
          {intro && <p className="p">{intro}</p>}
        </Reveal>
        <Reveal as="ol" className="steps">
          {uniqueSteps.map((step, idx) => (
            <li key={step.id ?? idx}>
              <span className="n">{String(step.step_number ?? idx + 1).padStart(2, '0')}</span>
              <p className="body">{step.content}</p>
            </li>
          ))}
        </Reveal>
      </div>
      {note && <div className="wrap"><p className="contact">{note}</p></div>}
    </section>
  );
}
