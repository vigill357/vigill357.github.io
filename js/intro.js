/**
 * intro.js — 增强版开场动画模块
 * 流程：黑屏阶段 → Logo 准备就绪 → 鼠标视差追踪 → 点击驱动瞳孔转场 → 内容层级式浮现
 */

const Intro = (() => {
  // Logo 动画完成并允许交互的时间（ms）
  const LOGO_READY_MS = 3000; 

  let logoWrap;
  let revealed = false;

  // ── 鼠标视差：Logo 随光标轻微偏移 ──
  function onMouseMove(e) {
    if (revealed) return;
    const { clientX, clientY } = e;
    // 计算相对于屏幕中心的偏移，除以 40 控制灵敏度
    const x = (clientX - window.innerWidth / 2) / 40;
    const y = (clientY - window.innerHeight / 2) / 40;
    
    // 应用平滑偏移
    logoWrap.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }

  // ── Logo 悬停反馈 ──
  function onLogoEnter() {
    logoWrap.classList.add('logo-hovered');
    document.getElementById('cur-ring')?.classList.add('big');
  }

  function onLogoLeave() {
    logoWrap.classList.remove('logo-hovered');
    // 离开时回归原位
    logoWrap.style.transform = `translate3d(0, 0, 0)`;
    document.getElementById('cur-ring')?.classList.remove('big');
  }

  // ── 冲击波环：点击瞬间从点击点向外扩散 ──
  function spawnVeilRings(cx, cy) {
    const cfg = [
      { delay: 0,   dur: 1.5, border: '1px solid rgba(0,210,255,0.7)' },
      { delay: 200, dur: 2.0, border: '0.5px solid rgba(0,210,255,0.4)' },
      { delay: 450, dur: 2.5, border: '0.5px solid rgba(255,255,255,0.15)' },
    ];

    cfg.forEach(({ delay, dur, border }) => {
      const el = document.createElement('div');
      el.className = 'veil-ring';
      el.style.left = cx + 'px';
      el.style.top = cy + 'px';
      el.style.border = border;
      // 动画参数
      el.style.animation = `veilRingExpand ${dur}s ${delay}ms cubic-bezier(0.15, 0.83, 0.66, 1) both`;
      
      document.body.appendChild(el);
      // 动画结束后自动销毁
      setTimeout(() => el.remove(), delay + dur * 1000 + 200);
    });
  }

  // ── Logo 点击：触发转场 ──
  function onLogoClick(e) {
    if (revealed) return;
    revealed = true;

    // 获取点击坐标，用于 CSS clip-path 变量
    const cx = e.clientX;
    const cy = e.clientY;
    const gx = (cx / window.innerWidth * 100).toFixed(2) + '%';
    const gy = (cy / window.innerHeight * 100).toFixed(2) + '%';
    
    document.documentElement.style.setProperty('--gx', gx);
    document.documentElement.style.setProperty('--gy', gy);

    // 状态切换：Logo 瞬间坍缩
    logoWrap.classList.remove('logo-hovered');
    logoWrap.classList.add('logo-clicked');
    document.getElementById('cur-ring')?.classList.remove('big');

    // 移除监听
    window.removeEventListener('mousemove', onMouseMove);
    logoWrap.removeEventListener('click', onLogoClick);

    // 发射冲击波
    spawnVeilRings(cx, cy);

    // 短暂延迟后切换 Revealed 状态，触发 CSS 中的 clip-path 动画
    setTimeout(() => {
      document.body.classList.remove('intro-phase');
      document.body.classList.add('intro-revealed');
      
      // 遮罩动画结束后彻底清理 DOM（匹配 CSS 2.2s 过渡）
      setTimeout(() => {
        document.getElementById('intro-veil')?.remove();
      }, 3000);
    }, 150);
  }

  function setLogoReady() {
    logoWrap.classList.add('logo-ready');
    logoWrap.addEventListener('mouseenter', onLogoEnter);
    logoWrap.addEventListener('mouseleave', onLogoLeave);
    logoWrap.addEventListener('click',      onLogoClick);
    window.addEventListener('mousemove', onMouseMove);
  }

  function init() {
    logoWrap = document.getElementById('heroLogoWrap');
    if (!logoWrap) return;

    // 初始状态
    document.body.classList.add('intro-phase');

    // 等待 Logo 动画加载至可交互状态
    setTimeout(setLogoReady, LOGO_READY_MS);
  }

  return { init };
})();