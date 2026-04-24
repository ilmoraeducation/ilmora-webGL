// animations/cursor.js
// Luxury custom cursor — dot + trailing ring with contextual shape-shifting
// Pure JS, no React deps, runs at 60fps via requestAnimationFrame

const CURSOR_STATES = {
  default:     { dotScale: 1,    ringScale: 1,    ringOpacity: 0.55, blend: 'difference' },
  button:      { dotScale: 0.3,  ringScale: 2.6,  ringOpacity: 0.80, blend: 'normal'     },
  card:        { dotScale: 0.6,  ringScale: 1.8,  ringOpacity: 0.65, blend: 'difference' },
  link:        { dotScale: 0.8,  ringScale: 1.5,  ringOpacity: 0.70, blend: 'difference' },
  text:        { dotScale: 1.2,  ringScale: 0.5,  ringOpacity: 0.30, blend: 'difference' },
  canvas:      { dotScale: 0,    ringScale: 0,    ringOpacity: 0,    blend: 'normal'     },
  hidden:      { dotScale: 0,    ringScale: 0,    ringOpacity: 0,    blend: 'normal'     },
};

export function initCursor(dotEl, ringEl) {
  if (!dotEl || !ringEl) return () => {};

  // Hide native cursor on desktop only
  if (window.matchMedia('(pointer: fine)').matches) {
    document.documentElement.style.cursor = 'none';
  } else {
    // Touch device — hide custom cursor elements
    dotEl.style.display  = 'none';
    ringEl.style.display = 'none';
    return () => {};
  }

  let mouseX = window.innerWidth  / 2;
  let mouseY = window.innerHeight / 2;
  let ringX  = mouseX;
  let ringY  = mouseY;
  let state  = 'default';
  let raf;

  // Current interpolated values
  let curDotScale  = 1;
  let curRingScale = 1;
  let curRingOpacity = 0.55;

  const lerp = (a, b, t) => a + (b - a) * t;

  const onMove = e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  };

  // Detect cursor state from hovered element
  const getState = el => {
    if (!el) return 'default';
    if (el.closest('canvas'))                        return 'canvas';
    if (el.closest('button, .btn, [role="button"]')) return 'button';
    if (el.closest('a'))                             return 'link';
    if (el.closest('.card'))                         return 'card';
    if (el.closest('p, h1, h2, h3, li'))             return 'text';
    return 'default';
  };

  const onOver = e => { state = getState(e.target); };

  document.addEventListener('mousemove',  onMove, { passive: true });
  document.addEventListener('mouseover',  onOver, { passive: true });

  const tick = () => {
    raf = requestAnimationFrame(tick);

    // Ring trails dot with smooth lerp (expo-like)
    ringX = lerp(ringX, mouseX, 0.10);
    ringY = lerp(ringY, mouseY, 0.10);

    // Position
    dotEl.style.transform  = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;
    ringEl.style.transform = `translate(${ringX - 17}px, ${ringY - 17}px)`;

    // Interpolate state values
    const target = CURSOR_STATES[state] || CURSOR_STATES.default;
    curDotScale     = lerp(curDotScale,     target.dotScale,     0.12);
    curRingScale    = lerp(curRingScale,    target.ringScale,    0.10);
    curRingOpacity  = lerp(curRingOpacity,  target.ringOpacity,  0.12);

    dotEl.style.scale        = curDotScale;
    ringEl.style.scale       = curRingScale;
    ringEl.style.opacity     = curRingOpacity;
    dotEl.style.mixBlendMode = target.blend;
  };
  tick();

  return () => {
    cancelAnimationFrame(raf);
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseover', onOver);
    document.documentElement.style.cursor = '';
  };
}
