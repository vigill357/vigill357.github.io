/**
 * Markup.js — 「无限理想乡」自定义标记语法解析器
 * 用法：Markup.parse(rawText) → HTML字符串
 *
 * ── A · 行内样式（嵌入段落中）────────────────────────────
 *   **文字**         金色强调
 *   *文字*           内心独白（斜体淡色）
 *   {{文字}}         数据 / 变量（等宽青色）
 *
 * ── B · 整段块（独占一行）──────────────────────────────
 *   [[文字]]         居中蓝字（关键台词 / 信号）
 *   > 文字           系统日志（等宽青色左边框）
 *   << 文字 >>       通讯频道（等宽绿色左边框）
 *   ((文字))         叙事旁白（右对齐灰色斜体）
 *   !![[文字]]!!     系统警告（红色等宽）
 *   ^^^ 文字 ^^^     广播公告（金边居中）
 *   ||| 文字 |||     档案引用块
 *   !!! 文字 !!!     危险叙事块（红色左边框）
 *
 * ── C · 结构标记────────────────────────────────────────
 *   ---              场景切换（菱形分隔线）
 *   === 文字 ===     章内小节标题
 *   ### 文字         时间戳 / 地点标注
 *   空行             段落间距；连续两空行加大间距
 */

const Markup = (() => {

  /* ── 样式注入 ─────────────────────────────────────── */

  const CSS = `
    /* 正文段落 */
    .mk-p {
      font-family: 'Noto Serif SC', serif;
      font-size: 19px;
      line-height: 2.15;
      color: #C0D4E8;
      margin: 0;
      text-indent: 2em;
    }

    /* 空行间距 */
    .mk-gap    { height: 1.1em; }
    .mk-gap-lg { height: 2.6em; }

    /* A · 行内 ─────────────────────────────────────── */

    /* 金色强调 */
    .mk-em {
      color: #C8A84E;
      font-weight: 600;
      font-style: normal;
    }

    /* 内心独白 */
    .mk-thought {
      font-style: italic;
      color: #8AAAC6;
    }

    /* 数据变量 */
    .mk-var {
      font-family: 'Share Tech Mono', monospace;
      color: #A8E6F5;
      background: rgba(168, 230, 245, 0.07);
      padding: 1px 6px;
      border-radius: 2px;
      font-size: 0.88em;
      font-style: normal;
    }

    /* B · 整段块 ────────────────────────────────────── */

    /* 居中蓝字 */
    .mk-center {
      font-family: 'Noto Serif SC', serif;
      color: #7BB8F0;
      letter-spacing: 0.22em;
      font-size: 16px;
      text-align: center;
      padding: 12px 0;
      line-height: 2;
    }

    /* 系统日志 */
    .mk-log {
      font-family: 'Share Tech Mono', monospace;
      font-size: 13px;
      color: #5BC8E8;
      border-left: 2px solid rgba(91, 200, 232, 0.45);
      padding: 8px 18px;
      background: rgba(91, 200, 232, 0.04);
      margin: 10px 0;
      letter-spacing: 0.05em;
      line-height: 1.9;
    }

    /* 通讯频道 */
    .mk-comm {
      font-family: 'Share Tech Mono', monospace;
      font-size: 13px;
      color: #8BE8A0;
      border-left: 2px solid rgba(139, 232, 160, 0.4);
      padding: 8px 18px;
      background: rgba(139, 232, 160, 0.04);
      margin: 10px 0;
      letter-spacing: 0.05em;
      line-height: 1.9;
    }

    /* 叙事旁白 */
    .mk-aside {
      font-family: 'Noto Serif SC', serif;
      font-size: 15.5px;
      color: #7090B0;
      font-style: italic;
      text-align: right;
      margin: 6px 0;
      letter-spacing: 0.04em;
      line-height: 1.9;
    }

    /* 系统警告 */
    .mk-warn {
      font-family: 'Share Tech Mono', monospace;
      font-size: 13px;
      color: #E06060;
      background: rgba(224, 92, 92, 0.06);
      border: 1px solid rgba(224, 92, 92, 0.25);
      padding: 9px 18px;
      margin: 10px 0;
      letter-spacing: 0.07em;
      line-height: 1.8;
    }

    /* 广播公告 */
    .mk-broadcast {
      font-family: 'Share Tech Mono', monospace;
      font-size: 12px;
      color: rgba(196, 154, 46, 0.85);
      border-top: 1px solid rgba(196, 154, 46, 0.22);
      border-bottom: 1px solid rgba(196, 154, 46, 0.22);
      background: rgba(196, 154, 46, 0.04);
      text-align: center;
      padding: 11px 0;
      letter-spacing: 0.17em;
      margin: 10px 0;
    }

    /* 档案引用块 */
    .mk-archive {
      border: 1px solid rgba(74, 144, 217, 0.2);
      background: rgba(10, 21, 37, 0.65);
      padding: 13px 20px;
      margin: 10px 0;
    }
    .mk-archive-body {
      font-family: 'Noto Serif SC', serif;
      font-size: 14px;
      color: #A8C0D8;
      line-height: 2;
    }

    /* 危险叙事块 */
    .mk-danger {
      font-family: 'Noto Serif SC', serif;
      font-size: 14.5px;
      color: #D89090;
      border-left: 3px solid rgba(224, 92, 92, 0.55);
      background: rgba(224, 92, 92, 0.05);
      padding: 10px 18px;
      margin: 10px 0;
      line-height: 2;
    }

    /* C · 结构标记 ───────────────────────────────────── */

    /* 场景切换菱形 */
    .mk-break {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 28px 0;
    }
    .mk-break-line {
      flex: 1;
      height: 1px;
      background: rgba(74, 144, 217, 0.2);
    }
    .mk-break-gem {
      width: 7px;
      height: 7px;
      border: 1px solid rgba(74, 144, 217, 0.5);
      transform: rotate(45deg);
      flex-shrink: 0;
    }

    /* 章内小节标题 */
    .mk-section {
      font-family: 'Noto Serif SC', serif;
      font-size: 14px;
      color: #90AECE;
      letter-spacing: 0.22em;
      text-align: center;
      padding: 6px 0;
      margin: 14px 0;
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .mk-section::before,
    .mk-section::after {
      content: '';
      flex: 1;
      height: 1px;
      background: rgba(74, 144, 217, 0.14);
    }

    /* 时间戳 / 地点标注 */
    .mk-timestamp {
      font-family: 'Share Tech Mono', monospace;
      font-size: 11px;
      color: #5A82AA;
      letter-spacing: 0.13em;
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 8px 0;
    }
    .mk-timestamp::before {
      content: '';
      width: 22px;
      height: 1px;
      background: rgba(74, 144, 217, 0.35);
      flex-shrink: 0;
    }
  `;

  function injectStyles() {
    if (document.getElementById('mk-styles')) return;
    const el = document.createElement('style');
    el.id = 'mk-styles';
    el.textContent = CSS;
    document.head.appendChild(el);
  }

  /* ── 工具函数 ─────────────────────────────────────── */

  /** HTML 转义，防止注入 */
  function esc(s) {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /** 行内样式替换（顺序不可颠倒：** 先于 *） */
  function inline(raw) {
    let s = esc(raw);
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong class="mk-em">$1</strong>');
    s = s.replace(/\*(.+?)\*/g,     '<em class="mk-thought">$1</em>');
    s = s.replace(/\{\{(.+?)\}\}/g, '<code class="mk-var">$1</code>');
    return s;
  }

  /* ── 单行解析 ─────────────────────────────────────── */

  /**
   * 返回值：
   *   { type: 'block', html }  — 块级元素
   *   { type: 'empty' }        — 空行
   *   { type: 'para',  html }  — 普通段落行
   */
  function parseLine(raw) {
    const t = raw.trim();

    // 空行
    if (t === '') return { type: 'empty' };

    // --- 场景切换
    if (t === '---') return {
      type: 'block',
      html: '<div class="mk-break"><div class="mk-break-line"></div><div class="mk-break-gem"></div><div class="mk-break-line"></div></div>'
    };

    // ### 时间戳
    if (t.startsWith('### ')) return {
      type: 'block',
      html: `<div class="mk-timestamp">${esc(t.slice(4))}</div>`
    };

    // === 小节标题 ===
    const sec = t.match(/^===\s*(.+?)\s*===$/);
    if (sec) return {
      type: 'block',
      html: `<div class="mk-section">${esc(sec[1])}</div>`
    };

    // [[ 居中蓝字 ]]
    const ctr = t.match(/^\[\[(.+?)\]\]$/);
    if (ctr) return {
      type: 'block',
      html: `<div class="mk-center">${esc(ctr[1])}</div>`
    };

    // > 系统日志
    if (t.startsWith('> ')) return {
      type: 'block',
      html: `<div class="mk-log">${esc(t.slice(2))}</div>`
    };

    // << 通讯频道 >>
    const comm = t.match(/^<<\s*(.+?)\s*>>$/);
    if (comm) return {
      type: 'block',
      html: `<div class="mk-comm">${esc(comm[1])}</div>`
    };

    // (( 旁白 ))
    const aside = t.match(/^\(\(\s*(.+?)\s*\)\)$/);
    if (aside) return {
      type: 'block',
      html: `<p class="mk-aside">${esc(aside[1])}</p>`
    };

    // !![[系统警告]]!!
    const warn = t.match(/^!!\[\[\s*(.+?)\s*\]\]!!$/);
    if (warn) return {
      type: 'block',
      html: `<div class="mk-warn">${esc(warn[1])}</div>`
    };

    // ^^^ 广播公告 ^^^
    const broad = t.match(/^\^\^\^\s*(.+?)\s*\^\^\^$/);
    if (broad) return {
      type: 'block',
      html: `<div class="mk-broadcast">${esc(broad[1])}</div>`
    };

    // ||| 档案引用 |||
    const arch = t.match(/^\|\|\|\s*(.+?)\s*\|\|\|$/);
    if (arch) return {
      type: 'block',
      html: `<div class="mk-archive"><div class="mk-archive-body">${esc(arch[1])}</div></div>`
    };

    // !!! 危险叙事 !!!
    const dang = t.match(/^!!!\s*(.+?)\s*!!!$/);
    if (dang) return {
      type: 'block',
      html: `<div class="mk-danger">${esc(dang[1])}</div>`
    };

    // 普通段落行（保留行首全角缩进，应用行内样式）
    return { type: 'para', html: `<p class="mk-p">${inline(raw)}</p>` };
  }

  /* ── 主解析入口 ───────────────────────────────────── */

  /**
   * parse(text) → HTML字符串
   * 连续空行计数：1行 → 普通段落间距，2行以上 → 加大间距
   */
  function parse(text) {
    injectStyles();

    const lines  = text.split('\n');
    const tokens = lines.map(parseLine);
    const out    = [];
    let   emptyCount = 0;

    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];

      if (tok.type === 'empty') {
        emptyCount++;
        continue;
      }

      // 遇到非空行，先根据之前的空行数量输出间距
      if (emptyCount === 1) {
        out.push('<div class="mk-gap"></div>');
      } else if (emptyCount >= 2) {
        out.push('<div class="mk-gap-lg"></div>');
      }
      emptyCount = 0;

      out.push(tok.html);
    }

    return out.join('\n');
  }

  /* ── 公开接口 ─────────────────────────────────────── */
  return { parse };

})();