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

  // ── Logo 点击 → 触发全局 Reveal ──
  function onLogoClick() {
    if (revealed) return;
    revealed = true;

    // 计算 Logo 中心在 viewport 中的百分比，作为网格线扩散原点
    const rect = logoWrap.getBoundingClientRect();
    const gx = ((rect.left + rect.width  / 2) / window.innerWidth  * 100).toFixed(2) + '%';
    const gy = ((rect.top  + rect.height / 2) / window.innerHeight * 100).toFixed(2) + '%';
    document.body.style.setProperty('--gx', gx);
    document.body.style.setProperty('--gy', gy);

    // 点击闪光 & 锁定交互
    logoWrap.classList.remove('logo-hovered');
    logoWrap.classList.add('logo-clicked');
    logoWrap.removeEventListener('mouseenter', onLogoEnter);
    logoWrap.removeEventListener('mouseleave', onLogoLeave);
    logoWrap.removeEventListener('click',      onLogoClick);
    document.getElementById('cur-ring')?.classList.remove('big');

    // 短暂延迟后切换到 revealed 状态，让点击动画先播放
    setTimeout(() => {
      document.body.classList.remove('intro-phase');
      document.body.classList.add('intro-revealed');
      // veil 动画结束后移除元素（1.9s + 少量余量）
      setTimeout(() => document.getElementById('intro-veil')?.remove(), 2200);
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