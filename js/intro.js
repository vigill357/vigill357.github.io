/**
 * intro.js — 开场动画模块
 * 流程：黑屏 → Logo 动画（~4.5s）→ Logo 可交互 → 悬浮选中 → 点击 → 内容浮现
 */

const Intro = (() => {
  const LOGO_READY_MS = 4500; // Logo 动画完成时间（ms）

  let logoWrap;
  let revealed = false;

  // ── Logo 悬停：浮起 + 光标变为选中状态 ──
  function onLogoEnter() {
    logoWrap.classList.add('logo-hovered');
    document.getElementById('cur-ring')?.classList.add('big');
  }

  function onLogoLeave() {
    logoWrap.classList.remove('logo-hovered');
    document.getElementById('cur-ring')?.classList.remove('big');
  }

  // ── 冲击波环：点击瞬间从 logo 中心向外扩散，标记层次 ──
  function spawnVeilRings(cx, cy) {
    const cfg = [
      { delay:  50, dur: 1.4, border: '1.5px solid rgba(0,220,255,0.70)' },
      { delay: 220, dur: 1.8, border: '1px   solid rgba(0,185,225,0.45)' },
      { delay: 420, dur: 2.2, border: '1px   solid rgba(0,150,210,0.28)' },
      { delay: 650, dur: 2.6, border: '0.5px solid rgba(20,80,170,0.15)' },
    ];
    cfg.forEach(({ delay, dur, border }) => {
      const el = document.createElement('div');
      el.className = 'veil-ring';
      el.style.left   = cx + 'px';
      el.style.top    = cy + 'px';
      el.style.width  = '220px';
      el.style.height = '220px';
      el.style.border = border;
      el.style.animationName           = 'veilRingExpand';
      el.style.animationDuration       = dur + 's';
      el.style.animationDelay          = delay + 'ms';
      el.style.animationTimingFunction = 'cubic-bezier(0.12,0.8,0.32,1)';
      el.style.animationFillMode       = 'both';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), delay + dur * 1000 + 200);
    });
  }

  // ── Logo 点击 → 触发全局 Reveal ──
  function onLogoClick() {
    if (revealed) return;
    revealed = true;

    // 计算 Logo 中心（像素坐标用于环，百分比用于遮罩渐变）
    const rect = logoWrap.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const gx = (cx / window.innerWidth  * 100).toFixed(2) + '%';
    const gy = (cy / window.innerHeight * 100).toFixed(2) + '%';
    document.body.style.setProperty('--gx', gx);
    document.body.style.setProperty('--gy', gy);

    // 点击闪光 & 锁定交互
    logoWrap.classList.remove('logo-hovered');
    logoWrap.classList.add('logo-clicked');
    logoWrap.removeEventListener('mouseenter', onLogoEnter);
    logoWrap.removeEventListener('mouseleave', onLogoLeave);
    logoWrap.removeEventListener('click',      onLogoClick);
    document.getElementById('cur-ring')?.classList.remove('big');

    // 即刻发射冲击波环（在黑幕上可见）
    spawnVeilRings(cx, cy);

    // 短暂延迟后切换到 revealed 状态，让点击动画先播放
    setTimeout(() => {
      document.body.classList.remove('intro-phase');
      document.body.classList.add('intro-revealed');
      // veil 动画结束后移除元素（3.2s + 少量余量）
      setTimeout(() => document.getElementById('intro-veil')?.remove(), 3600);
    }, 200);
  }

  // ── Logo 动画完成后设为可交互 ──
  function setLogoReady() {
    logoWrap.classList.add('logo-ready');
    logoWrap.addEventListener('mouseenter', onLogoEnter);
    logoWrap.addEventListener('mouseleave', onLogoLeave);
    logoWrap.addEventListener('click',      onLogoClick);
  }

  function init() {
    logoWrap = document.getElementById('heroLogoWrap');
    if (!logoWrap) return;

    // 立即设置开场状态：全黑、隐藏内容
    document.body.classList.add('intro-phase');

    // 等待 Logo 动画完成后开放交互
    setTimeout(setLogoReady, LOGO_READY_MS);
  }

  return { init };
})();