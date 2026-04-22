'use client';
// components/three/Scene.js
// Master Three.js orchestrator — renders ALL 3D layers to their own canvases
// Each layer is a fixed canvas stacked in z-order behind the DOM

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const HeroOrb  = dynamic(() => import('./HeroOrb'),  { ssr: false });
const Particles = dynamic(() => import('./Particles'), { ssr: false });
const UIPanels = dynamic(() => import('./UIPanels'),  { ssr: false });

// Canvas layer z-index slots
const Z = {
  particles: 0,   // deepest — ambient background
  orb:       1,   // hero orb
  panels:    2,   // product UI panels
};

export default function Scene() {
  const particlesCanvasRef = useRef(null);
  const orbCanvasRef       = useRef(null);
  const panelsCanvasRef    = useRef(null);

  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState('scene-hero');

  useEffect(() => {
    // Load THREE globally once — shared across all sub-canvases
    if (window.__THREE__) { setMounted(true); return; }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = () => {
      window.__THREE__ = window.THREE;
      setMounted(true);
    };
    script.onerror = () => {
      // Fallback: try npm three
      import('three').then(THREE => {
        window.__THREE__ = THREE;
        setMounted(true);
      }).catch(console.error);
    };
    document.head.appendChild(script);

    return () => {
      // Don't remove script — THREE needs to stay global
    };
  }, []);

  // Track active section to hide/show relevant layers
  useEffect(() => {
    if (!mounted) return;

    const SECTIONS = [
      'scene-hero','scene-problem','scene-chaos','scene-reveal',
      'scene-product','scene-journey','scene-trust','scene-cta',
    ];

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.4) {
          setActiveSection(entry.target.id);
        }
      });
    }, { threshold: 0.4 });

    SECTIONS.forEach(id => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });

    return () => obs.disconnect();
  }, [mounted]);

  const isHeroActive    = ['scene-hero','scene-problem'].includes(activeSection);
  const isProductActive = activeSection === 'scene-product';

  const canvasStyle = (zIndex, opacity = 1) => ({
    position: 'fixed',
    inset: 0,
    width: '100%',
    height: '100%',
    zIndex,
    pointerEvents: 'none',
    transition: 'opacity 0.8s ease',
    opacity,
  });

  return (
    <>
      {/* Layer 0 — Ambient particles (always visible) */}
      <canvas
        ref={particlesCanvasRef}
        style={canvasStyle(Z.particles)}
        aria-hidden="true"
      />
      {mounted && <Particles canvasRef={particlesCanvasRef} />}

      {/* Layer 1 — Hero orb (visible in hero + problem scenes) */}
      <canvas
        ref={orbCanvasRef}
        style={canvasStyle(Z.orb, isHeroActive ? 1 : 0)}
        aria-hidden="true"
      />
      {mounted && <HeroOrb canvasRef={orbCanvasRef} />}

      {/* Layer 2 — 3D UI panels (visible in product scene) */}
      <canvas
        ref={panelsCanvasRef}
        style={canvasStyle(Z.panels, isProductActive ? 1 : 0)}
        aria-hidden="true"
      />
      {mounted && <UIPanels canvasRef={panelsCanvasRef} />}
    </>
  );
}
