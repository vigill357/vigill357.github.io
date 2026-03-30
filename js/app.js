/**
 * app.js — 主入口
 * 负责：导航平滑滚动、各模块初始化调度
 */

document.addEventListener('DOMContentLoaded', () => {

  // ── 导航锚点平滑滚动 ──
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ── 初始化光标模块 ──
  Cursor.init();

  // ── 初始化内容加载模块 ──
  Loader.init();
});
