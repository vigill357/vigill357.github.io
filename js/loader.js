/**
 * loader.js — 内容加载模块
 * 负责：从 data/ 目录读取章节文本和世界观 JSON，渲染到页面
 */

const Loader = (() => {

  /**
   * 加载章节列表，并渲染到侧栏
   * 读取 data/world.json 中的 chapters 字段来获取目录信息
   */
  async function loadChapterList() {
    try {
      const res  = await fetch('data/world.json');
      const data = await res.json();

      if (!data.chapters || !data.chapters.length) return;

      const side = document.querySelector('.novel-side');
      if (!side) return;

      // 清空占位内容
      side.innerHTML = '';

      data.chapters.forEach((ch, i) => {
        const a = document.createElement('a');
        a.href = '#';
        a.className = 'chapter-item';
        a.dataset.src = ch.file; // 如 "data/chapters/ch1.txt"
        a.innerHTML = `
          <div class="ch-title">${ch.label}</div>
          <div class="ch-date">更新于 ${ch.date || '——'}</div>
          <span class="ch-arrow">›</span>`;
        a.addEventListener('click', e => {
          e.preventDefault();
          openChapter(ch.file, ch.label);
        });
        side.appendChild(a);
      });

      // 更新统计面板
      updateStats(data);
    } catch (err) {
      console.warn('[Loader] 未找到 data/world.json，使用默认占位内容', err);
    }
  }

  /**
   * 打开并阅读某一章（示例：可在此基础上扩展为弹窗/路由）
   */
  async function openChapter(filePath, title) {
    try {
      const res  = await fetch(filePath);
      const text = await res.text();
      // 可扩展为阅读器弹窗 / 单独页面，此处 console 输出
      console.log(`[Loader] 加载章节：${title}\n`, text.slice(0, 200), '...');
      alert(`📖 ${title}\n\n${text.slice(0, 300)}…\n\n（完整阅读器待开发）`);
    } catch (err) {
      console.error('[Loader] 无法加载章节文件:', filePath, err);
    }
  }

  /**
   * 用 world.json 数据更新 Hero 信息面板和小说统计
   */
  function updateStats(data) {
    const map = {
      '主线章节': data.chapters ? `${data.chapters.length} 章` : '— 章',
      '衍生故事': data.stories  ? `${data.stories.length} 篇`  : '— 篇',
      '插画':     data.gallery  ? `${data.gallery.length} 幅`  : '— 幅',
      '最近更新': data.lastUpdate || '——',
    };

    document.querySelectorAll('.panel-row').forEach(row => {
      const key = row.querySelector('.panel-key')?.textContent.trim();
      const val = row.querySelector('.panel-val');
      if (key && map[key] && val) {
        val.textContent = map[key];
      }
    });

    // 小说板块统计
    const statVals = document.querySelectorAll('.stat-val');
    if (statVals[0] && data.chapters) statVals[0].textContent = `${data.chapters.length} 章`;
    if (statVals[1] && data.totalWords) statVals[1].textContent = data.totalWords;
  }

  /**
   * 用 world.json 的 stories 数组渲染衍生故事卡片
   */
  async function loadStoryCards() {
    try {
      const res  = await fetch('data/world.json');
      const data = await res.json();
      if (!data.stories || !data.stories.length) return;

      const grid = document.querySelector('.stories-grid');
      if (!grid) return;

      grid.innerHTML = '';
      data.stories.forEach(story => {
        const meta = story.status === '完结'
          ? `<span>${story.status}</span><span>${story.words || ''}</span>`
          : `<span>${story.status}</span><span>${story.chapters || ''}</span>`;

        const a = document.createElement('a');
        a.href      = story.href || '#';
        a.className = 'story-card';
        a.innerHTML = `
          <h3 class="story-title">${story.title}</h3>
          <p class="story-excerpt">${story.excerpt || '暂无简介。'}</p>
          <div class="story-meta">${meta}</div>`;
        grid.appendChild(a);
      });
    } catch (err) {
      // 静默失败，保持占位内容
    }
  }

  /**
   * 加载世界观卡片计数
   */
  async function loadWorldCards() {
    try {
      const res  = await fetch('data/world.json');
      const data = await res.json();
      if (!data.world) return;

      const counts = {
        '人物图鉴':     data.world.characters   || '—',
        '世界地理':     data.world.locations     || '—',
        '时间线与历史': data.world.timelineNodes || '—',
        '技术与规则':   data.world.rules         || '—',
      };

      document.querySelectorAll('.world-card').forEach(card => {
        const title = card.querySelector('.world-title')?.textContent.trim();
        const em    = card.querySelector('.world-count em');
        if (title && counts[title] && em) {
          em.textContent = counts[title];
        }
      });
    } catch (err) {
      // 静默失败，保持占位数据
    }
  }

  /** 初始化 */
  function init() {
    loadChapterList();
    loadStoryCards();
    loadWorldCards();
  }

  return { init };
})();
