/**
 * hero.js — Hero 首屏视差模块
 * 负责：Logo 多层视差跟踪 + hero-content / hero-panel 悬浮光标跟踪
 */

const HeroParallax = (() => {

  // Logo 各层目标值 / 当前插值
  const T = { sp:{x:0,y:0}, bl:{x:0,y:0}, o:{x:0,y:0}, m:{x:0,y:0}, c:{x:0,y:0} };
  const C = { sp:{x:0,y:0}, bl:{x:0,y:0}, o:{x:0,y:0}, m:{x:0,y:0}, c:{x:0,y:0} };

  // Hero 元素目标值 / 当前插值
  const TH = { cnt:{x:0,y:0}, pnl:{x:0,y:0} };
  const CH = { cnt:{x:0,y:0}, pnl:{x:0,y:0} };

  const lerp = (a, b, t) => a + (b - a) * t;
  const AL = 0.074;   // Logo 层插值系数（与原 logo.html 一致）
  const AH = 0.048;   // Hero 元素插值系数（更平滑）

  let svg, gSpin, g3, g0, g1, g2, core;
  let heroContent, heroPanel, heroEl;

  function onMouseMove(e) {
    // ── Logo 层视差（以 SVG 中心为基准）──
    const r  = svg.getBoundingClientRect();
    const cx = r.left + r.width  * 0.5;
    const cy = r.top  + r.height * 0.434;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const d  = Math.hypot(dx, dy) || 0.001;
    const sp = Math.min(d / 420, 1);
    const nx = dx / d, ny = dy / d;

    T.sp = { x: -nx * sp * 4.5, y: -ny * sp * 4.5 };
    T.bl = { x:  0,              y:  sp * 11        };
    T.o  = { x:  nx * sp * 1.4,  y:  ny * sp * 1.4  };
    T.m  = { x:  nx * sp * 3.2,  y:  ny * sp * 3.2  };
    T.c  = { x:  nx * sp * 8,    y:  ny * sp * 8     };

    // ── Hero 元素视差（以 Hero 区域中心为基准）──
    const hr  = heroEl.getBoundingClientRect();
    const hcx = hr.left + hr.width  * 0.5;
    const hcy = hr.top  + hr.height * 0.5;
    const hdx = e.clientX - hcx;
    const hdy = e.clientY - hcy;
    const hd  = Math.hypot(hdx, hdy) || 0.001;
    const hsp = Math.min(hd / 650, 1);
    const hnx = hdx / hd, hny = hdy / hd;

    // content 与 panel 方向相同，panel 幅度略大以增强层次感
    TH.cnt = { x: hnx * hsp * 5,  y: hny * hsp * 4 };
    TH.pnl = { x: hnx * hsp * 9,  y: hny * hsp * 6 };
  }

  function onMouseLeave() {
    for (const k of ['sp','bl','o','m','c']) T[k] = { x:0, y:0 };
    TH.cnt = { x:0, y:0 };
    TH.pnl = { x:0, y:0 };
  }

  const svgTf = o => `translate(${o.x.toFixed(2)},${o.y.toFixed(2)})`;

  function tick() {
    // 插值 Logo 层
    for (const k of ['sp','bl','o','m','c']) {
      C[k].x = lerp(C[k].x, T[k].x, AL);
      C[k].y = lerp(C[k].y, T[k].y, AL);
    }
    // 插值 Hero 元素
    for (const k of ['cnt','pnl']) {
      CH[k].x = lerp(CH[k].x, TH[k].x, AH);
      CH[k].y = lerp(CH[k].y, TH[k].y, AH);
    }

    // 应用 Logo 层变换
    gSpin.setAttribute('transform', svgTf(C.sp));
    g3.setAttribute('transform',    svgTf(C.bl));
    g0.setAttribute('transform',    svgTf(C.o));
    g1.setAttribute('transform',    svgTf(C.m));
    g2.setAttribute('transform',    svgTf(C.m));
    core.setAttribute('transform',  svgTf(C.c));

    // 应用 Hero 元素变换（content 直接 translate，panel 保留原有 translateY(-50%)）
    heroContent.style.transform =
      `translate(${CH.cnt.x.toFixed(2)}px, ${CH.cnt.y.toFixed(2)}px)`;
    heroPanel.style.transform =
      `translateY(calc(-50% + ${CH.pnl.y.toFixed(2)}px)) translateX(${CH.pnl.x.toFixed(2)}px)`;

    requestAnimationFrame(tick);
  }

  function init() {
    svg     = document.getElementById('heroLogoSvg');
    gSpin   = document.getElementById('hlSpin');
    g3      = document.getElementById('hlG3');
    g0      = document.getElementById('hlG0');
    g1      = document.getElementById('hlG1');
    g2      = document.getElementById('hlG2');
    core    = document.getElementById('hlCore');
    heroContent = document.querySelector('.hero-content');
    heroPanel   = document.querySelector('.hero-panel');
    heroEl      = document.querySelector('.hero');

    if (!svg || !gSpin || !heroContent || !heroPanel) return;

    document.addEventListener('mousemove',  onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    requestAnimationFrame(tick);
  }

  return { init };
})();
