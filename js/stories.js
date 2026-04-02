/**
 * stories.js — 浅渊残响子页面逻辑
 * 负责：拉取所有衍生故事 meta + 字数统计、排序、渲染卡片、更新统计栏
 */

const StoriesPage = (() => {
  const ROOT = 'data/side_stories/';
  let allItems = [];  // 缓存，排序时直接用，不重复 fetch

  function countChineseChars(text) {
    return (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  }

  function fmtWords(n) {
    return n >= 10000 ? (n / 10000).toFixed(1) + ' 万字' : n + ' 字';
  }

  // 渲染卡片列表
  function renderCards(items) {
    const grid = document.getElementById('stories-grid');
    grid.innerHTML = '';
    items.forEach((item, i) => {
      const a = document.createElement('a');
      a.href = `reader.html?type=side&ch=${item.folder}`;
      a.className = 'story-card-full';
      a.innerHTML = `
        <div class="scf-num">STORY · ${String(i + 1).padStart(2, '0')}</div>
        <div class="scf-title">${item.meta.title || item.folder}</div>
        <div class="scf-synopsis">${item.meta.synopsis || '暂无简介。'}</div>
        <div class="scf-meta">
          <div class="scf-meta-group">
            <div class="scf-meta-item">
              <span class="scf-meta-key">字数</span>
              <span class="scf-meta-val">${item.words > 0 ? fmtWords(item.words) : '——'}</span>
            </div>
            <div class="scf-meta-item">
              <span class="scf-meta-key">更新</span>
              <span class="scf-meta-val">${item.meta.date || '——'}</span>
            </div>
          </div>
          <span class="scf-arrow">›</span>
        </div>
        <div class="scf-bg-num">${String(i + 1).padStart(2, '0')}</div>`;
      grid.appendChild(a);
    });
  }

  // 更新统计栏
  function updateStats(items) {
    const total = items.length;
    const totalWords = items.reduce((sum, i) => sum + i.words, 0);
    const latest = [...items]
      .sort((a, b) => (b.meta.date || '').localeCompare(a.meta.date || ''))
      [0]?.meta.date || '——';

    document.getElementById('stat-total').textContent  = `${total} 篇`;
    document.getElementById('stat-words').textContent  = totalWords > 0 ? fmtWords(totalWords) : '——';
    document.getElementById('stat-latest').textContent = latest;
  }

  // 排序
  function sortItems(key) {
    const sorted = [...allItems];
    if (key === 'name') {
      sorted.sort((a, b) =>
        (a.meta.title || '').localeCompare(b.meta.title || '', 'zh-Hans-CN', { sensitivity: 'base' }));
    } else if (key === 'date') {
      sorted.sort((a, b) => (b.meta.date || '').localeCompare(a.meta.date || ''));
    } else if (key === 'words') {
      sorted.sort((a, b) => b.words - a.words);
    }
    renderCards(sorted);
  }

  // 排序按钮绑定
  function bindSortBtns() {
    document.querySelectorAll('.sort-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        sortItems(btn.dataset.sort);
      });
    });
  }

  async function init() {
    try {
      const folders = await fetch(ROOT + 'index.json').then(r => r.json());

      allItems = await Promise.all(
        folders.map(async f => {
          const meta = await fetch(`${ROOT}${f}/meta.json`)
            .then(r => r.json())
            .catch(() => ({ title: f, synopsis: '', date: '' }));

          const words = await fetch(`${ROOT}${f}/${f}.txt`)
            .then(r => r.text())
            .then(t => countChineseChars(t))
            .catch(() => 0);

          return { folder: f, meta, words };
        })
      );

      // 默认拼音排序
      sortItems('name');
      updateStats(allItems);
      bindSortBtns();

    } catch (err) {
      console.warn('[StoriesPage]', err);
    }
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => {
  Cursor.init();
  StoriesPage.init();
});
