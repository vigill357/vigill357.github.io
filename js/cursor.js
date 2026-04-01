/**
 * cursor.js — 几何光标模块
 * 负责：三脚架光标跟随、延迟外环、悬停放大、点击波纹
 */

const Cursor = (() => {
  let cur, ring;
  let mx = 0, my = 0, rx = 0, ry = 0;

  /** 鼠标坐标跟踪 + 内部光标即时跟随 */
  function onMouseMove(e) {
    mx = e.clientX;
    my = e.clientY;
    cur.style.left = mx + 'px';
    cur.style.top  = my + 'px';
  }

  /** 外环延迟跟随（RAF 循环） */
  function followLoop() {
    rx += (mx - rx) * 0.15;
    ry += (my - ry) * 0.15;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(followLoop);
  }

  /** 可交互元素悬停放大 */
  function bindHover() {
    const targets = 'a, button, .novel-main, .story-card, .world-card, .gallery-item';
    document.querySelectorAll(targets).forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('big'));
      el.addEventListener('mouseleave', () => ring.classList.remove('big'));
    });
  }

  /** 点击波纹 */
  function onRipple(e) {
    const r = document.createElement('div');
    r.className = 'rpl';
    r.style.left = e.clientX + 'px';
    r.style.top  = e.clientY + 'px';
    document.body.appendChild(r);
    setTimeout(() => r.remove(), 700);
  }

  /** 初始化 */
  function init() {
    cur  = document.getElementById('cur');
    ring = document.getElementById('cur-ring');
    if (!cur || !ring) return;

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('click', onRipple);
    bindHover();
    followLoop();
  }

  return { init };
})();
