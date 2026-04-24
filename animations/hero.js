// animations/hero.js — Premium entrance with blur-clear cinematic focus
import { gsap, ScrollTrigger } from './gsap-init';

export function initHeroScene(refs) {
  const { badge, title, titleGold, sub, btns, pills, scrollHint } = refs;
  const ctx = gsap.context(() => {
    const tl = gsap.timeline({ defaults:{ ease:'expo.out' } });

    // Badge — pops in first, sharp entrance
    if (badge?.current) {
      gsap.set(badge.current, { opacity:0, y:16, scale:0.94 });
      tl.to(badge.current, { opacity:1, y:0, scale:1, duration:0.7 }, 0.3);
    }

    // Title line 1 — heavy drop with blur-clear
    if (title?.current) {
      gsap.set(title.current, { opacity:0, y:44, filter:'blur(10px)' });
      tl.to(title.current, { opacity:1, y:0, filter:'blur(0px)', duration:1.0 }, 0.55);
    }

    // Gold line — slightly after, feels like a separate beat
    if (titleGold?.current) {
      gsap.set(titleGold.current, { opacity:0, y:44, filter:'blur(10px)' });
      tl.to(titleGold.current, { opacity:1, y:0, filter:'blur(0px)', duration:1.0 }, 0.78);
    }

    // Subtitle — lighter, floats up
    if (sub?.current) {
      gsap.set(sub.current, { opacity:0, y:24 });
      tl.to(sub.current, { opacity:1, y:0, duration:0.8, ease:'power3.out' }, 1.05);
    }

    // Buttons — spring in together
    if (btns?.current) {
      gsap.set(btns.current, { opacity:0, y:20, scale:0.96 });
      tl.to(btns.current, { opacity:1, y:0, scale:1, duration:0.7, ease:'elastic.out(1,0.7)' }, 1.28);
    }

    // Pills — soft final appearance
    if (pills?.current) {
      gsap.set(pills.current, { opacity:0, y:14 });
      tl.to(pills.current, { opacity:1, y:0, duration:0.6, ease:'power3.out' }, 1.52);
    }

    // Scroll hint — very delayed, almost afterthought
    if (scrollHint?.current) {
      gsap.set(scrollHint.current, { opacity:0 });
      tl.to(scrollHint.current, { opacity:1, duration:0.8, ease:'power2.out' }, 2.1);
    }

    // ── Scroll exit — hero fades and scales up as user leaves ─────────────
    ScrollTrigger.create({
      trigger: '#scene-hero',
      start: 'top top',
      end:   'bottom top',
      scrub: 1.5,
      onUpdate: self => {
        const p = self.progress;
        gsap.set('#scene-hero .hero-inner', {
          opacity:  Math.max(0, 1 - p * 1.5),
          scale:    1 + p * 0.05,
          y:        p * -50,
          filter:   `blur(${p * 8}px)`,
        });
      },
    });
  });
  return ctx;
}

// Stub — mouse tracking runs inside HeroOrb.js WebGL loop
export function initOrbParallax() { return null; }
