/**
 * loader.js — 内容加载模块
 * 负责：从新数据结构（data/main_stories/）动态读取章节，渲染到首页
 */

const Loader = (() => {

  const STORIES_ROOT = 'data/main_stories/';

  function countChineseChars(text) {
    return (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  }

  function fmtWords(n) {
    if (n >= 10000) return (n / 10000).toFixed(1) + ' 万字';
    return n + ' 字';
  }

  /**
   * 加载章节列表，渲染到首页侧栏
   */
  async function loadChapterList() {
    try {
      const idxRes  = await fetch(STORIES_ROOT + 'index.json');
      const folders = await idxRes.json();

      const side = document.querySelector('.novel-side');
      if (!side) return;

      const metas = await Promise.all(
        folders.map(f =>
          fetch(`${STORIES_ROOT}${f}/meta.json`)
            .then(r => r.json())
            .catch(() => ({ title: f, date: '', synopsis: '' }))
        )
      );

      side.innerHTML = '';

      // 可滚动章节列表容器（倒序，最新在顶）
      const scrollWrap = document.createElement('div');
      scrollWrap.className = 'novel-side-scroll';

      [...metas].map((meta, i) => ({ meta, i })).reverse().forEach(({ meta, i }) => {
        const a = document.createElement('a');
        a.href      = `reader.html?ch=${folders[i]}`;
        a.className = 'chapter-item';
        a.innerHTML = `
          <div class="ch-title">${meta.title || folders[i]}</div>
          <div class="ch-date">更新于 ${meta.date || '——'}</div>
          <span class="ch-arrow">›</span>`;
        scrollWrap.appendChild(a);
      });

      const filler = document.createElement('div');
      filler.style.cssText = 'flex:1; background:var(--bg1);';
      scrollWrap.appendChild(filler);
      side.appendChild(scrollWrap);

      // 底部固定：全部目录
      const allLink = document.createElement('a');
      allLink.href      = 'novel.html';
      allLink.className = 'chapter-item chapter-item--all';
      allLink.innerHTML = `
        <div class="ch-title">从头开始 · 全部目录</div>
        <div class="ch-date">READ MORE →</div>
        <span class="ch-arrow">›</span>`;
      side.appendChild(allLink);

      updateStats(folders, metas);

    } catch (err) {
      console.warn('[Loader] 无法加载章节列表', err);
    }
  }

  /**
   * 更新首页 Hero 面板与小说统计（含累计字数）
   */
  async function updateStats(folders, metas) {
    const lastDate = metas.length
      ? [...metas].sort((a, b) => (b.date || '').localeCompare(a.date || ''))[0].date || '——'
      : '——';

    let worldData = {};
    try {
      const res = await fetch('data/world.json');
      worldData = await res.json();
    } catch (_) {}

    const map = {
      '主线章节': `${folders.length} 章`,
      '衍生故事': worldData.stories ? `${worldData.stories.length} 篇` : '— 篇',
      '插画':     worldData.gallery ? `${worldData.gallery.length} 幅`  : '— 幅',
      '最近更新': lastDate,
    };

    document.querySelectorAll('.panel-row').forEach(row => {
      const key = row.querySelector('.panel-key')?.textContent.trim();
      const val = row.querySelector('.panel-val');
      if (key && map[key] && val) val.textContent = map[key];
    });

    // 已更新章数（第一个 .stat-val）
    const statVals = document.querySelectorAll('.stat-val');
    if (statVals[0]) statVals[0].textContent = `${folders.length} 章`;

    if (worldData.novel) {
      const titleEl = document.querySelector('.novel-title');
      const descEl  = document.querySelector('.novel-desc');
      if (titleEl && worldData.novel.title)    titleEl.textContent = worldData.novel.title;
      if (descEl  && worldData.novel.synopsis) descEl.textContent  = worldData.novel.synopsis;
    }

    // 累计字数：并行拉取所有正文计算（第二个 .stat-val）
    let total = 0;
    await Promise.all(
      folders.map(async f => {
        try {
          const r    = await fetch(`${STORIES_ROOT}${f}/${f}.txt`);
          const text = await r.text();
          total += countChineseChars(text);
        } catch (_) {}
      })
    );
    if (statVals[1]) {
      statVals[1].textContent = total > 0 ? fmtWords(total) : '— 万字';
    }
  }

  /**
   * 渲染衍生故事卡片
   */
  async function loadStoryCards() {
    try {
      const res  = await fetch('data/world.json');
      const data = await res.json();
      if (!data.stories?.length) return;

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
    } catch (_) {}
  }

  /**
   * 渲染世界观卡片计数
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
        if (title && counts[title] !== undefined && em) em.textContent = counts[title];
      });
    } catch (_) {}
  }

  function init() {
    loadChapterList();
    loadStoryCards();
    loadWorldCards();
  }

  return { init };
})();
