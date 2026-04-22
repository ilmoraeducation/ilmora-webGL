// animations/masterTimeline.js — Luxury-grade timing refinement
// Premium easing, visual rhythm (beats/pauses/flow), scene continuity
import { gsap, ScrollTrigger } from './gsap-init';

const E = {
  enter:  'power4.out',
  exit:   'power3.in',
  float:  'sine.inOut',
  spring: 'elastic.out(1,0.6)',
  expo:   'expo.out',
  beat:   'power2.inOut',
};

export function initProblemScene() {
  const section = document.querySelector('#scene-problem');
  if (!section) return;
  const words = section.querySelectorAll('.problem-word');
  const label = section.querySelector('.scene-label');
  const lines = section.querySelectorAll('.problem-line');
  gsap.set(label, { opacity:0, y:18, filter:'blur(4px)' });
  gsap.set(words, { opacity:0, y:22, filter:'blur(3px)' });
  gsap.set(lines, { opacity:0, x:-20 });
  const tl = gsap.timeline({ scrollTrigger:{ trigger:'#scene-problem', start:'top 82%', end:'center 30%', scrub:1.6 } });
  tl.to(label, { opacity:1, y:0, filter:'blur(0px)', duration:0.5, ease:E.expo }, 0);
  words.forEach((w,i) => tl.to(w, { opacity:1, y:0, filter:'blur(0px)', duration:0.28, ease:E.enter }, 0.18+i*0.055));
  lines.forEach((l,i) => tl.to(l, { opacity:1, x:0, duration:0.4, ease:E.enter }, 0.7+i*0.14));
}

export function initChaosScene() {
  const section = document.querySelector('#scene-chaos');
  if (!section) return;
  const cards = section.querySelectorAll('.chaos-card');
  const title = section.querySelector('.chaos-title');
  gsap.set(title, { opacity:0, y:30, skewX:-2 });
  gsap.set(cards, { opacity:0, scale:0.88, y:40 });
  const tl = gsap.timeline({ scrollTrigger:{ trigger:'#scene-chaos', start:'top 78%', end:'bottom 22%', scrub:1.8 } });
  tl.to(title, { opacity:1, y:0, skewX:0, duration:0.5, ease:E.expo }, 0);
  cards.forEach((card,i) => {
    const r = (i%2===0?1:-1)*(Math.random()*1.5+0.5);
    gsap.set(card, { rotation:r });
    tl.to(card, { opacity:1, scale:1, y:0, rotation:0, duration:0.45, ease:E.spring }, 0.08+i*0.07);
    gsap.to(card, { y:'random(-8,8)', rotation:'random(-3,3)', duration:'random(3,5)', ease:E.float, yoyo:true, repeat:-1, delay:i*0.18 });
  });
  const glitch = section.querySelector('.glitch-text');
  if (glitch) {
    const doGlitch = () => gsap.timeline()
      .to(glitch,{skewX:3,x:2,duration:0.06,ease:'none'})
      .to(glitch,{skewX:-2,x:-2,duration:0.06,ease:'none'})
      .to(glitch,{skewX:0,x:0,duration:0.04,ease:'none'});
    [1.5,4.0,7.2].forEach(d => gsap.delayedCall(d, doGlitch));
  }
}

export function initRevealScene() {
  const section = document.querySelector('#scene-reveal');
  if (!section) return;
  const logo    = section.querySelector('.reveal-logo');
  const glow    = section.querySelector('.reveal-glow');
  const tagline = section.querySelectorAll('.reveal-tagline-word');
  const sub     = section.querySelector('.reveal-sub');
  const cta     = section.querySelector('.reveal-cta');
  gsap.set(glow,    { opacity:0, scale:0.6 });
  gsap.set(logo,    { opacity:0, scale:0.7, y:20, filter:'blur(12px)' });
  gsap.set(tagline, { opacity:0, y:30, filter:'blur(6px)' });
  gsap.set(sub,     { opacity:0, y:16 });
  gsap.set(cta,     { opacity:0, y:20, scale:0.94 });
  const tl = gsap.timeline({ scrollTrigger:{ trigger:'#scene-reveal', start:'top 72%', end:'center 25%', scrub:1.4 } });
  tl.to(glow, { opacity:1, scale:1.1, duration:0.7, ease:E.expo }, 0);
  tl.to(logo, { opacity:1, scale:1, y:0, filter:'blur(0px)', duration:0.8, ease:E.expo }, 0.15);
  tagline.forEach((w,i) => tl.to(w, { opacity:1, y:0, filter:'blur(0px)', duration:0.38, ease:E.enter }, 0.65+i*0.10));
  tl.to(sub, { opacity:1, y:0, duration:0.4, ease:E.enter }, 1.05);
  tl.to(cta, { opacity:1, y:0, scale:1, duration:0.45, ease:E.spring }, 1.25);
  if (cta) gsap.to(cta, { boxShadow:'0 0 48px rgba(201,168,76,0.65), 0 0 96px rgba(201,168,76,0.22)', duration:1.8, ease:E.beat, yoyo:true, repeat:-1, delay:2.4 });
}

export function initProductScene() {
  const section = document.querySelector('#scene-product');
  if (!section) return;
  const panels = section.querySelectorAll('.product-panel');
  const title  = section.querySelector('.product-title');
  const desc   = section.querySelector('.product-desc');
  gsap.set(title,  { opacity:0, y:28, filter:'blur(8px)' });
  gsap.set(desc,   { opacity:0, y:18 });
  gsap.set(panels, { opacity:0, y:50, scale:0.96, filter:'blur(4px)' });
  const tl = gsap.timeline({ scrollTrigger:{ trigger:'#scene-product', start:'top 72%', end:'bottom 18%', scrub:1.5 } });
  tl.to(title, { opacity:1, y:0, filter:'blur(0px)', duration:0.55, ease:E.expo }, 0);
  tl.to(desc,  { opacity:1, y:0, duration:0.45, ease:E.enter }, 0.18);
  panels.forEach((panel,i) => {
    tl.to(panel, { opacity:1, y:0, scale:1, filter:'blur(0px)', duration:0.55, ease:E.expo }, 0.28+i*0.12);
    ScrollTrigger.create({ trigger:'#scene-product', start:'top bottom', end:'bottom top', scrub:true,
      onUpdate: self => { const depth=(i-1.5)*14; gsap.set(panel,{y:self.progress*depth}); } });
  });
}

export function initJourneyScene() {
  const section = document.querySelector('#scene-journey');
  if (!section) return;
  const steps      = section.querySelectorAll('.journey-step');
  const title      = section.querySelector('.journey-title');
  const connectors = section.querySelectorAll('.journey-connector');
  if (title) {
    gsap.set(title, { opacity:0, y:24, filter:'blur(6px)' });
    ScrollTrigger.create({ trigger:'#scene-journey', start:'top 80%',
      onEnter:()=>gsap.to(title,{opacity:1,y:0,filter:'blur(0px)',duration:0.75,ease:E.expo}) });
  }
  gsap.set(steps, { opacity:0, x:50, filter:'blur(4px)' });
  gsap.set(connectors, { scaleX:0, transformOrigin:'left center' });
  const tl = gsap.timeline({ scrollTrigger:{ trigger:'#scene-journey', start:'top 70%', end:'center 25%', scrub:1.3 } });
  steps.forEach((step,i) => tl.to(step, { opacity:1, x:0, filter:'blur(0px)', duration:0.48, ease:E.enter }, 0.06+i*0.16));
  connectors.forEach((c,i) => tl.to(c, { scaleX:1, duration:0.3, ease:E.expo }, 0.28+i*0.16));
}

export function initTrustScene() {
  const section = document.querySelector('#scene-trust');
  if (!section) return;
  const counters     = section.querySelectorAll('.trust-counter');
  const testimonials = section.querySelectorAll('.trust-testimonial');
  const title        = section.querySelector('.trust-title');
  const uniLogos     = section.querySelectorAll('.uniLogoWrap');
  if (title) {
    gsap.set(title, { opacity:0, y:24, filter:'blur(6px)' });
    ScrollTrigger.create({ trigger:'#scene-trust', start:'top 80%',
      onEnter:()=>gsap.to(title,{opacity:1,y:0,filter:'blur(0px)',duration:0.75,ease:E.expo}) });
  }
  counters.forEach(counter => {
    const target = parseInt(counter.dataset.target||'0');
    const suffix = counter.dataset.suffix||'';
    gsap.set(counter,{opacity:0});
    ScrollTrigger.create({ trigger:counter, start:'top 88%', onEnter:()=>{
      gsap.to(counter,{opacity:1,duration:0.5});
      const obj={val:0};
      gsap.to(obj,{ val:target, duration:2.6, ease:'power3.out',
        onUpdate:()=>{ counter.textContent=Math.round(obj.val).toLocaleString()+suffix; } });
    }});
  });
  gsap.set(testimonials, { opacity:0, y:28, scale:0.97 });
  const tl = gsap.timeline({ scrollTrigger:{ trigger:'#scene-trust', start:'top 62%', end:'bottom 22%', scrub:1.2 } });
  testimonials.forEach((t,i) => tl.to(t, { opacity:1, y:0, scale:1, duration:0.5, ease:E.expo }, i*0.18));
  if (uniLogos.length) {
    gsap.set(uniLogos,{opacity:0,y:12});
    ScrollTrigger.create({ trigger:'.uniStrip', start:'top 88%',
      onEnter:()=>gsap.to(uniLogos,{opacity:0.65,y:0,duration:0.6,stagger:0.08,ease:E.enter}) });
  }
}

export function initCTAScene() {
  const section = document.querySelector('#scene-cta');
  if (!section) return;
  const title = section.querySelector('.cta-title');
  const sub   = section.querySelector('.cta-sub');
  const btn   = section.querySelector('.cta-btn');
  const bg    = section.querySelector('.cta-bg');
  gsap.set(bg,    { scale:0.80, opacity:0 });
  gsap.set(title, { opacity:0, y:36, filter:'blur(10px)' });
  gsap.set(sub,   { opacity:0, y:20 });
  gsap.set(btn,   { opacity:0, y:18, scale:0.94 });
  const tl = gsap.timeline({ scrollTrigger:{ trigger:'#scene-cta', start:'top 74%', end:'center 28%', scrub:1.3 } });
  tl.to(bg,    { scale:1, opacity:1, duration:0.9, ease:E.expo }, 0);
  tl.to(title, { opacity:1, y:0, filter:'blur(0px)', duration:0.65, ease:E.expo }, 0.12);
  tl.to(sub,   { opacity:1, y:0, duration:0.48, ease:E.enter }, 0.38);
  tl.to(btn,   { opacity:1, y:0, scale:1, duration:0.48, ease:E.spring }, 0.56);
  if (btn) ScrollTrigger.create({ trigger:'#scene-cta', start:'top 55%',
    onEnter:()=>gsap.to(btn,{boxShadow:'0 0 55px rgba(201,168,76,0.72),0 0 110px rgba(201,168,76,0.25)',duration:1.6,ease:E.beat,yoyo:true,repeat:-1}) });
}

export function initNavbarScroll() {
  ScrollTrigger.create({ start:'top -60', end:99999, toggleClass:{ targets:'.ilmora-navbar', className:'scrolled' } });
}

export function initScrollProgress(el) {
  if (!el) return;
  ScrollTrigger.create({ start:'top top', end:'bottom bottom', onUpdate:self=>{ el.style.width=(self.progress*100)+'%'; } });
}

export function initRevealElements() {
  document.querySelectorAll('.gsap-reveal').forEach((el,i) => {
    gsap.set(el, { opacity:0, y:24, filter:'blur(4px)' });
    ScrollTrigger.create({ trigger:el, start:'top 90%',
      onEnter:()=>gsap.to(el,{opacity:1,y:0,filter:'blur(0px)',duration:0.72,ease:E.expo,delay:(i%3)*0.06}) });
  });
}

export function initSceneTransitions() {
  document.querySelectorAll('[id^="scene-"]').forEach(scene => {
    ScrollTrigger.create({ trigger:scene, start:'bottom 40%', end:'bottom top', scrub:1.2,
      onUpdate:self=>{ scene.style.setProperty('--scene-exit-opacity', Math.max(0,1-self.progress*1.6)); } });
  });
}

export function killAllTriggers() {
  ScrollTrigger.getAll().forEach(t=>t.kill());
}
