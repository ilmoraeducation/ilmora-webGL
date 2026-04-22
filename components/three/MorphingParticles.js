'use client';
// components/three/MorphingParticles.js
// Fixed-layer particle system that morphs shape based on visible section
import { useEffect, useRef } from 'react';

const PARTICLE_COUNT = typeof window !== 'undefined' && window.innerWidth < 768 ? 2200 : 4200;

// ── Shape generators ──────────────────────────────────────────────────────────
const makeShape = {
  scatter() {
    const p = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      p[i*3]   = (Math.random() - 0.5) * 16;
      p[i*3+1] = (Math.random() - 0.5) * 14;
      p[i*3+2] = (Math.random() - 0.5) * 6;
    }
    return p;
  },
  sphere(r = 2.1) {
    const p = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const theta = Math.acos(2 * Math.random() - 1);
      const phi   = Math.random() * Math.PI * 2;
      const rad   = r + (Math.random() - 0.5) * 0.2;
      p[i*3]   = rad * Math.sin(theta) * Math.cos(phi);
      p[i*3+1] = rad * Math.sin(theta) * Math.sin(phi);
      p[i*3+2] = rad * Math.cos(theta);
    }
    return p;
  },
  gradCap() {
    const p = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const t = i / PARTICLE_COUNT;
      if (t < 0.42) {
        p[i*3]   = (Math.random() - 0.5) * 4.4;
        p[i*3+1] = 1.25 + (Math.random() - 0.5) * 0.09;
        p[i*3+2] = (Math.random() - 0.5) * 4.4;
      } else if (t < 0.72) {
        const theta = Math.acos(2 * Math.random() - 1) * 0.48;
        const phi   = Math.random() * Math.PI * 2;
        p[i*3]   = 1.15 * Math.sin(theta) * Math.cos(phi);
        p[i*3+1] = 1.15 * Math.sin(theta) * Math.sin(phi) - 0.1;
        p[i*3+2] = 1.15 * Math.cos(theta) * 0.55;
      } else {
        const hang = Math.random();
        p[i*3]   = 1.85 + (Math.random() - 0.5) * 0.14;
        p[i*3+1] = 1.1 - hang * 1.7;
        p[i*3+2] = (Math.random() - 0.5) * 0.14;
      }
    }
    return p;
  },
  road() {
    const p   = new Float32Array(PARTICLE_COUNT * 3);
    const stops = [-3.4, -1.1, 1.1, 3.4];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const t     = i / PARTICLE_COUNT;
      const xBase = -4.2 + t * 8.4;
      const curve = Math.sin(t * Math.PI) * 0.75;
      const nearStop = stops.find(s => Math.abs(xBase - s) < 0.42);
      if (nearStop != null && Math.random() < 0.2) {
        p[i*3]   = nearStop + (Math.random() - 0.5) * 0.6;
        p[i*3+1] = curve    + (Math.random() - 0.5) * 0.6;
        p[i*3+2] = (Math.random() - 0.5) * 0.35;
      } else {
        p[i*3]   = xBase + (Math.random() - 0.5) * 0.22;
        p[i*3+1] = curve + (Math.random() - 0.5) * 0.13;
        p[i*3+2] = (Math.random() - 0.5) * 0.22;
      }
    }
    return p;
  },
  shield() {
    const p = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const t     = i / PARTICLE_COUNT;
      const y     = 2.4 - t * 4.8;
      const halfW = y > -0.65
        ? Math.sqrt(Math.max(0, 1 - Math.pow((y - 0.9) / 1.75, 2))) * 2.2
        : Math.max(0, (y + 2.4) / 1.75) * 1.0;
      if (Math.random() < 0.26) {
        const sign = Math.random() < 0.5 ? 1 : -1;
        p[i*3]   = sign * halfW + (Math.random() - 0.5) * 0.09;
        p[i*3+1] = y;
        p[i*3+2] = (Math.random() - 0.5) * 0.16;
      } else {
        p[i*3]   = (Math.random() - 0.5) * halfW * 2;
        p[i*3+1] = y;
        p[i*3+2] = (Math.random() - 0.5) * 0.13;
      }
    }
    return p;
  },
  globe() {
    const p = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const theta  = Math.acos(2 * Math.random() - 1);
      const phi    = Math.random() * Math.PI * 2;
      const r      = 2.05 + (Math.random() - 0.5) * 0.12;
      const snap   = Math.random() < 0.32;
      const finalT = snap ? Math.round(theta / (Math.PI / 6)) * (Math.PI / 6) : theta;
      p[i*3]   = r * Math.sin(finalT) * Math.cos(phi);
      p[i*3+1] = r * Math.sin(finalT) * Math.sin(phi);
      p[i*3+2] = r * Math.cos(finalT);
    }
    return p;
  },
  starburst() {
    const p = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const arm   = Math.floor(Math.random() * 8);
      const angle = (arm / 8) * Math.PI * 2 + (Math.random() - 0.5) * 0.32;
      const dist  = Math.pow(Math.random(), 0.55) * 2.6;
      p[i*3]   = Math.cos(angle) * dist + (Math.random() - 0.5) * 0.16;
      p[i*3+1] = Math.sin(angle) * dist + (Math.random() - 0.5) * 0.16;
      p[i*3+2] = (Math.random() - 0.5) * 0.42;
    }
    return p;
  },
  ilmora() {
    const p = new Float32Array(PARTICLE_COUNT * 3);
    const letters = [
      (x,y) => Math.abs(x + 3.1) < 0.14 && Math.abs(y) < 1.15,
      (x,y) => (Math.abs(x + 1.85) < 0.14 && Math.abs(y) < 1.1) || (y < -0.9 && x > -1.95 && x < -1.15),
      (x,y) => Math.abs(x + 0.55) < 0.78 && Math.abs(y) < 1.1 && (Math.abs(x+1.15)<0.14 || Math.abs(x+0.12)<0.14 || (y>0.22 && Math.abs(Math.abs(x+0.65)-0.52-y*0.5)<0.16)),
      (x,y) => Math.pow(x-0.92,2)/0.38+Math.pow(y,2)/1.26<1 && Math.pow(x-0.92,2)/0.17+Math.pow(y,2)/0.85>1,
      (x,y) => (Math.abs(x-2.15)<0.14&&Math.abs(y)<1.1)||(y>0&&Math.pow(x-2.42,2)+Math.pow(y-0.56,2)<0.32&&Math.pow(x-2.42,2)+Math.pow(y-0.56,2)>0.09)||(y<0&&x>2.15&&x<2.78&&Math.abs(y+(x-2.15)*0.92)<0.19),
      (x,y) => (Math.abs(Math.abs(x-3.25)*1.1-(y+1.12)*0.56)<0.14&&y>-1.12)||(Math.abs(y)<0.16&&Math.abs(x-3.25)<0.58),
    ];
    let placed = 0, attempts = 0;
    while (placed < PARTICLE_COUNT && attempts < PARTICLE_COUNT * 22) {
      attempts++;
      const x = (Math.random() - 0.5) * 8.8;
      const y = (Math.random() - 0.5) * 3.0;
      if (letters.some(fn => fn(x, y))) {
        p[placed*3] = x; p[placed*3+1] = y; p[placed*3+2] = (Math.random()-0.5)*0.18;
        placed++;
      }
    }
    for (let i = placed; i < PARTICLE_COUNT; i++) {
      p[i*3]=(Math.random()-0.5)*8; p[i*3+1]=(Math.random()-0.5)*2.8; p[i*3+2]=(Math.random()-0.5)*0.22;
    }
    return p;
  },
};

// Section ID → shape key
const SECTION_MAP = {
  home: 'sphere', about: 'gradCap', how: 'road',
  programs: 'scatter', services: 'shield',
  universities: 'globe', faq: 'starburst', contact: 'ilmora',
};
const SECTION_ORDER = Object.keys(SECTION_MAP);

// Cache shapes after first use
let _cache = null;
function getShapes() {
  if (!_cache) _cache = Object.fromEntries(
    Object.keys(makeShape).map(k => [k, makeShape[k]()])
  );
  return _cache;
}

function lerp3(a, b, t) {
  const out = new Float32Array(PARTICLE_COUNT * 3);
  for (let i = 0; i < PARTICLE_COUNT * 3; i++) out[i] = a[i] + (b[i] - a[i]) * t;
  return out;
}
function easeInOut3(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3) / 2; }

export default function MorphingParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !window.THREE) return;
    const THREE = window.THREE;
    const shapes = getShapes();

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 5.8;

    // Geometry
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(shapes.sphere), 3));

    // Gold colour palette per particle
    const cols = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const m = Math.random();
      cols[i*3]   = 0.79 + m * 0.18;   // R
      cols[i*3+1] = 0.66 + m * 0.14;   // G
      cols[i*3+2] = 0.22 + m * 0.14;   // B
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(cols, 3));

    const material = new THREE.PointsMaterial({
      size: 0.026, vertexColors: true, transparent: true,
      opacity: 0.85, sizeAttenuation: true,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // State
    let currentKey = 'sphere';
    let targetKey  = 'sphere';
    let morphT     = 1.0;
    let rotY       = 0;
    let mouse      = { x: 0, y: 0 };
    let time       = 0;
    let raf;

    const onMouse = (e) => {
      mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };

    const onScroll = () => {
      let best = null, bestVis = -1;
      SECTION_ORDER.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const r   = el.getBoundingClientRect();
        const vis = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
        if (vis > bestVis) { bestVis = vis; best = id; }
      });
      if (!best) return;
      const key = SECTION_MAP[best];
      if (key !== targetKey) {
        currentKey = targetKey;
        targetKey  = key;
        morphT     = 0;
      }
    };

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('mousemove', onMouse, { passive: true });
    window.addEventListener('scroll',    onScroll, { passive: true });
    window.addEventListener('resize',    onResize, { passive: true });

    const animate = () => {
      raf = requestAnimationFrame(animate);
      time += 0.01;

      if (morphT < 1) morphT = Math.min(1, morphT + 0.013);
      const waving  = morphT > 0.1 && morphT < 0.9;
      const waveAmt = waving ? Math.sin((morphT - 0.1) / 0.8 * Math.PI) * 0.36 : 0;
      const eased   = easeInOut3(morphT);
      const lerped  = lerp3(shapes[currentKey], shapes[targetKey], eased);

      rotY += (mouse.x * 0.16 - rotY) * 0.038;
      const rX = mouse.y * 0.11;

      const pos = geometry.attributes.position.array;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const ix = lerped[i*3], iy = lerped[i*3+1], iz = lerped[i*3+2];

        // Wave burst
        const wave  = waving ? Math.sin(ix * 2.9 + time * 3.8) * waveAmt : 0;
        // Gentle float
        const float = Math.sin(time * 0.72 + ix * 0.55 + iy * 0.38) * 0.013;
        // Mouse repel
        const dx  = ix * 0.19 - mouse.x * 2.6;
        const dy  = iy * 0.19 - mouse.y * 2.6;
        const d   = Math.sqrt(dx*dx + dy*dy);
        const rep = d < 1.3 && d > 0.01 ? ((1.3 - d) / 1.3) * 0.24 : 0;

        // Rotate Y
        const cy = Math.cos(rotY), sy = Math.sin(rotY);
        const rx  =  ix * cy - iz * sy;
        const rz  =  ix * sy + iz * cy;
        // Rotate X
        const cx  = Math.cos(rX), sx = Math.sin(rX);
        const ry2 =  iy * cx - rz * sx;
        const rz2 =  iy * sx + rz * cx;

        pos[i*3]   = rx  + (d > 0.01 ? (dx/d)*rep : 0);
        pos[i*3+1] = ry2 + wave + float + (d > 0.01 ? (dy/d)*rep : 0);
        pos[i*3+2] = rz2;
      }
      geometry.attributes.position.needsUpdate = true;
      points.rotation.y += 0.0007;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('scroll',    onScroll);
      window.removeEventListener('resize',    onResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed', inset: 0,
        width: '100%', height: '100%',
        zIndex: 0, pointerEvents: 'none',
        opacity: 0.92,
      }}
    />
  );
}
