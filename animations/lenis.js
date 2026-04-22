// animations/lenis.js
// Lenis smooth scroll — scene-aware speed, pauses at key moments
// Synced with GSAP RAF loop for perfect frame timing

let _lenis = null;

export async function initLenis() {
  // Dynamically import to keep SSR safe
  const { default: Lenis } = await import('@studio-freight/lenis');
  const { gsap }           = await import('./gsap-init');

  _lenis = new Lenis({
    duration:          1.35,
    easing:            t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo
    orientation:       'vertical',
    gestureOrientation:'vertical',
    smoothWheel:       true,
    wheelMultiplier:   0.85,
    touchMultiplier:   1.6,
    infinite:          false,
  });

  // Wire into GSAP ticker for perfect sync
  gsap.ticker.add(time => {
    _lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0); // prevent lag bursts

  // Scene-aware scroll speed
  const SCENE_SPEEDS = {
    'scene-hero':     0.65,  // slow — cinematic weight
    'scene-problem':  0.80,
    'scene-chaos':    1.15,  // faster — restless energy
    'scene-reveal':   0.55,  // very slow — dramatic pause
    'scene-product':  0.85,
    'scene-journey':  1.00,
    'scene-trust':    0.90,
    'scene-cta':      0.70,  // slow — weight of decision
  };

  const SECTIONS = Object.keys(SCENE_SPEEDS);
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.45) {
        const speed = SCENE_SPEEDS[entry.target.id] ?? 1.0;
        _lenis.options.wheelMultiplier  = 0.85 * speed;
        _lenis.options.touchMultiplier  = 1.6  * speed;
      }
    });
  }, { threshold: 0.45 });

  // Observe after DOM is ready
  requestAnimationFrame(() => {
    SECTIONS.forEach(id => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
  });

  return _lenis;
}

export function getLenis() { return _lenis; }

export function destroyLenis() {
  if (_lenis) { _lenis.destroy(); _lenis = null; }
}
