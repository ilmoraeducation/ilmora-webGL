// animations/gsap-init.js
// Single registration point — import this ONCE, not gsap directly
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register plugins once at module level
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Global GSAP defaults for premium feel
gsap.defaults({
  ease: 'power3.out',
  duration: 1,
});

// ScrollTrigger global config
ScrollTrigger.config({
  autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load',
  ignoreMobileResize: true,
});

export { gsap, ScrollTrigger };
