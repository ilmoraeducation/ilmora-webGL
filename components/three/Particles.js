'use client';
// components/three/Particles.js
// Ambient depth-layered particle environment synced with scroll sections
// Layers: foreground (fast), mid (normal), background (slow)

import { useEffect, useRef } from 'react';

const SECTION_ORDER = [
  'scene-hero','scene-problem','scene-chaos',
  'scene-reveal','scene-product','scene-journey',
  'scene-trust','scene-cta',
];

// Per-section speed and spread multipliers
const SECTION_CONFIG = {
  'scene-hero':     { speed: 0.18, spread: 1.0, opacity: 0.72, color: [0.79, 0.66, 0.22] },
  'scene-problem':  { speed: 0.22, spread: 1.1, opacity: 0.55, color: [0.6,  0.6,  0.8 ] },
  'scene-chaos':    { speed: 0.80, spread: 1.5, opacity: 0.90, color: [0.95, 0.42, 0.18] },
  'scene-reveal':   { speed: 0.08, spread: 0.85, opacity: 0.92, color: [0.98, 0.88, 0.52] },
  'scene-product':  { speed: 0.20, spread: 1.0, opacity: 0.65, color: [0.79, 0.66, 0.22] },
  'scene-journey':  { speed: 0.16, spread: 1.2, opacity: 0.60, color: [0.79, 0.66, 0.22] },
  'scene-trust':    { speed: 0.14, spread: 0.9, opacity: 0.70, color: [0.79, 0.66, 0.22] },
  'scene-cta':      { speed: 0.07, spread: 0.78, opacity: 0.90, color: [0.98, 0.88, 0.52] },
};

const LAYER_COUNT  = 3;
const PER_LAYER    = typeof window !== 'undefined' && window.innerWidth < 768 ? 280 : 500;
const TOTAL        = LAYER_COUNT * PER_LAYER;

function buildLayer(THREE, depth, spreadMult = 1.0) {
  const positions = new Float32Array(PER_LAYER * 3);
  const sizes     = new Float32Array(PER_LAYER);
  for (let i = 0; i < PER_LAYER; i++) {
    positions[i*3]   = (Math.random() - 0.5) * 22 * spreadMult;
    positions[i*3+1] = (Math.random() - 0.5) * 18 * spreadMult;
    positions[i*3+2] = depth + (Math.random() - 0.5) * 1.5;
    sizes[i]         = Math.random() * 2.8 + 0.6;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));
  return geo;
}

export default function Particles({ canvasRef }) {
  useEffect(() => {
    const canvas = canvasRef?.current;
    if (!canvas || !window.__THREE__) return;
    const THREE = window.__THREE__;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 80);
    camera.position.z = 8;

    // Build 3 depth layers
    const layerDepths  = [2, 0, -3]; // fg, mid, bg
    const layerSpeeds  = [1.4, 0.85, 0.4];
    const layerOpacities = [0.55, 0.78, 0.40];
    const layerSizes   = [0.038, 0.028, 0.018];
    const points       = [];

    const matShared = new THREE.PointsMaterial({
      color:          0xC9A84C,
      transparent:    true,
      opacity:        0.72,
      sizeAttenuation: true,
      blending:       THREE.AdditiveBlending,
      depthWrite:     false,
    });

    layerDepths.forEach((depth, li) => {
      const geo = buildLayer(THREE, depth);
      const mat = matShared.clone();
      mat.size    = layerSizes[li];
      mat.opacity = layerOpacities[li];
      const pts   = new THREE.Points(geo, mat);
      scene.add(pts);
      points.push({ pts, mat, geo, speed: layerSpeeds[li], baseOpacity: layerOpacities[li] });
    });

    /* ── Section detection ── */
    let currentConfig = SECTION_CONFIG['scene-hero'];
    let targetConfig  = currentConfig;

    const detectSection = () => {
      let best = null, bestVis = -1;
      SECTION_ORDER.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const r   = el.getBoundingClientRect();
        const vis = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
        if (vis > bestVis) { bestVis = vis; best = id; }
      });
      if (best && SECTION_CONFIG[best]) {
        targetConfig = SECTION_CONFIG[best];
      }
    };
    window.addEventListener('scroll', detectSection, { passive: true });

    /* ── Mouse parallax ── */
    let mx = 0, my = 0;
    const onMouse = e => {
      mx = (e.clientX / window.innerWidth  - 0.5) * 2;
      my = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouse, { passive: true });

    /* ── Resize ── */
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize, { passive: true });

    /* ── Animation ── */
    let raf, time = 0;
    let lerpSpeed = 0.18, lerpOpacity = 0.72;

    const animate = () => {
      raf = requestAnimationFrame(animate);
      time += 0.008;

      // Lerp towards target config
      lerpSpeed   += (targetConfig.speed   - lerpSpeed)   * 0.018;
      lerpOpacity += (targetConfig.opacity - lerpOpacity) * 0.018;

      // Lerp color
      const tc = targetConfig.color;
      const cc = currentConfig.color;

      points.forEach(({ pts, mat, geo, speed, baseOpacity }, li) => {
        const pos = geo.attributes.position.array;
        const s   = speed * lerpSpeed;

        // Float particles upward, wrap at edges
        for (let i = 0; i < PER_LAYER; i++) {
          pos[i*3+1] += s * 0.006;
          if (pos[i*3+1] > 9) pos[i*3+1] = -9;
          // Subtle horizontal drift
          pos[i*3]   += Math.sin(time + i * 0.3) * 0.002 * s;
        }
        geo.attributes.position.needsUpdate = true;

        // Mouse parallax per layer (fg moves more)
        pts.position.x += (mx * (3 - li) * 0.08 - pts.position.x) * 0.05;
        pts.position.y += (my * (3 - li) * 0.05 - pts.position.y) * 0.05;

        // Opacity modulation
        mat.opacity = baseOpacity * lerpOpacity;

        // Color lerp — gold tone in calm, warmer in chaos, bright in reveal
        mat.color.setRGB(
          tc[0] * 0.7 + cc[0] * 0.3,
          tc[1] * 0.7 + cc[1] * 0.3,
          tc[2] * 0.7 + cc[2] * 0.3,
        );
      });

      currentConfig = { ...currentConfig, color: tc };

      // Subtle camera drift
      camera.position.x += (mx * 0.15 - camera.position.x) * 0.018;
      camera.position.y += (my * 0.10 - camera.position.y) * 0.018;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll',     detectSection);
      window.removeEventListener('mousemove',  onMouse);
      window.removeEventListener('resize',     onResize);
      points.forEach(({ geo, mat }) => { geo.dispose(); mat.dispose(); });
      renderer.dispose();
    };
  }, [canvasRef]);

  return null;
}
