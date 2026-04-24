'use client';
// components/three/UIPanels.js
// 3D floating UI panels in product section — canvas-textured planes with depth parallax
// hover tilt, scroll parallax, GSAP sync

import { useEffect, useRef } from 'react';

// Draw UI panel content onto a canvas to use as texture
function renderPanelTexture(title, lines, accentColor = '#C9A84C') {
  const W = 512, H = 320;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');

  // Background
  ctx.fillStyle = '#10101c';
  ctx.fillRect(0, 0, W, H);

  // Border
  ctx.strokeStyle = 'rgba(201,168,76,0.25)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(1, 1, W - 2, H - 2);

  // Traffic lights
  [['#ff5f56',28],['#ffbd2e',52],['#27c93f',76]].forEach(([c,x]) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(x, 22, 7, 0, Math.PI * 2);
    ctx.fill();
  });

  // Title bar
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fillRect(0, 0, W, 42);

  // Title text
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = '600 13px system-ui, sans-serif';
  ctx.fillText(title, 100, 26);

  // Gold accent line
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 42); ctx.lineTo(W, 42);
  ctx.stroke();

  // Content lines
  lines.forEach((line, i) => {
    const y = 80 + i * 38;
    if (line.type === 'stat') {
      // Big number
      ctx.fillStyle = line.color || accentColor;
      ctx.font = `700 28px system-ui`;
      ctx.fillText(line.value, 28, y + 10);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '500 12px system-ui';
      ctx.fillText(line.label, 28, y + 28);
    } else if (line.type === 'bar') {
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(28, y, W - 56, 8);
      ctx.fillStyle = line.color || accentColor;
      ctx.fillRect(28, y, (W - 56) * line.progress, 8);
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.font = '12px system-ui';
      ctx.fillText(line.label, 28, y + 22);
    } else if (line.type === 'row') {
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(28, y - 14, W - 56, 28);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = '13px system-ui';
      ctx.fillText(line.label, 38, y + 6);
      ctx.fillStyle = line.color || accentColor;
      ctx.font = '700 13px system-ui';
      ctx.fillText(line.value, W - 68, y + 6);
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.font = '12px system-ui';
      ctx.fillText(line.text || '', 28, y);
    }
  });

  return cv;
}

const PANEL_CONFIGS = [
  {
    title: 'Student Dashboard',
    pos: [-2.6, 0.5, 0],
    rot: [0.04, 0.18, 0],
    scale: [3.0, 1.88],
    depth: 0,
    lines: [
      { type:'stat', value:'MBA', label:'Current Program', color:'#C9A84C' },
      { type:'bar',  label:'Course Progress', progress: 0.62, color:'#C9A84C' },
      { type:'row',  label:'Status', value:'Active', color:'#22c55e' },
    ],
  },
  {
    title: 'Brochure Generator',
    pos: [2.4, 0.8, -0.8],
    rot: [-0.06, -0.14, 0],
    scale: [2.4, 1.5],
    depth: -0.8,
    lines: [
      { type:'stat', value:'PDF', label:'Output Format', color:'#C9A84C' },
      { type:'row',  label:'Student', value:'Ahmed Ali', color:'#E5C97E' },
      { type:'row',  label:'Program', value:'BTech', color:'#E5C97E' },
    ],
  },
  {
    title: 'AI Advisor',
    pos: [-1.2, -1.8, -0.4],
    rot: [0.08, 0.10, 0],
    scale: [2.6, 1.6],
    depth: -0.4,
    lines: [
      { type:'text', text: '💬 UAE equivalency?' },
      { type:'text', text: '→ MOHE process fully handled.' },
      { type:'text', text: '💬 How long does it take?' },
      { type:'text', text: '→ Typically 6–8 weeks.' },
    ],
  },
  {
    title: 'Admin Dashboard',
    pos: [1.6, -1.6, -1.2],
    rot: [-0.05, -0.20, 0.02],
    scale: [2.2, 1.38],
    depth: -1.2,
    lines: [
      { type:'stat', value:'24', label:'Total Students', color:'#C9A84C' },
      { type:'row',  label:'Leads',    value:'12', color:'#3b82f6' },
      { type:'row',  label:'Courses',  value:'8',  color:'#22c55e' },
    ],
  },
];

export default function UIPanels({ canvasRef }) {
  const hoveredRef = useRef(null);
  const mouseRef   = useRef({ x: 0, y: 0, nx: 0, ny: 0 });

  useEffect(() => {
    const canvas = canvasRef?.current;
    if (!canvas || !window.__THREE__) return;
    const THREE = window.__THREE__;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 50);
    camera.position.set(0, 0, 7.5);

    // Lighting
    scene.add(new THREE.AmbientLight(0x222233, 0.8));
    const key = new THREE.PointLight(0xC9A84C, 2.2, 18);
    key.position.set(3, 4, 5);
    scene.add(key);
    const fill = new THREE.PointLight(0x3a6fd8, 0.8, 14);
    fill.position.set(-4, -3, 3);
    scene.add(fill);

    // Build panels
    const panels = PANEL_CONFIGS.map(cfg => {
      const texCanvas = renderPanelTexture(cfg.title, cfg.lines);
      const tex = new THREE.CanvasTexture(texCanvas);

      const geo = new THREE.PlaneGeometry(cfg.scale[0], cfg.scale[1]);
      const mat = new THREE.MeshStandardMaterial({
        map:         tex,
        transparent: true,
        opacity:     0.0, // fade in via GSAP/scroll
        side:        THREE.FrontSide,
        roughness:   0.2,
        metalness:   0.05,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...cfg.pos);
      mesh.rotation.set(...cfg.rot);

      // Gold emissive border plane (slightly behind)
      const borderGeo = new THREE.PlaneGeometry(cfg.scale[0] + 0.04, cfg.scale[1] + 0.04);
      const borderMat = new THREE.MeshBasicMaterial({
        color: 0xC9A84C, transparent: true, opacity: 0.0,
        side: THREE.FrontSide,
      });
      const border = new THREE.Mesh(borderGeo, borderMat);
      border.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2] - 0.01);
      border.rotation.set(...cfg.rot);

      scene.add(border);
      scene.add(mesh);
      return { mesh, mat, border, borderMat, cfg, texCanvas, tex };
    });

    /* ── Raycaster for hover ── */
    const raycaster = new THREE.Raycaster();
    const pointer   = new THREE.Vector2();

    const onMouseMove = (e) => {
      mouseRef.current.nx = (e.clientX / window.innerWidth)  * 2 - 1;
      mouseRef.current.ny = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseRef.current.x  = e.clientX;
      mouseRef.current.y  = e.clientY;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    /* ── Scroll-based reveal ── */
    let scrollProgress = 0;
    let gsapCleanup;
    (async () => {
      const { gsap, ScrollTrigger } = await import('@/animations/gsap-init');
      ScrollTrigger.create({
        trigger: '#scene-product',
        start: 'top 80%',
        end:   'bottom 20%',
        scrub: 1.2,
        onUpdate: self => { scrollProgress = self.progress; },
        onEnter: () => {
          panels.forEach(({ mat, borderMat }, i) => {
            gsap.to(mat,       { opacity: 0.88, duration: 0.7, delay: i * 0.14 });
            gsap.to(borderMat, { opacity: 0.12, duration: 0.7, delay: i * 0.14 });
          });
        },
        onLeaveBack: () => {
          panels.forEach(({ mat, borderMat }) => {
            gsap.to(mat,       { opacity: 0, duration: 0.4 });
            gsap.to(borderMat, { opacity: 0, duration: 0.4 });
          });
        },
      });
      gsapCleanup = () => ScrollTrigger.getAll().forEach(t => t.kill());
    })();

    /* ── Resize ── */
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize, { passive: true });

    /* ── Animation loop ── */
    let raf;
    const clock = new THREE.Clock();

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Hover detection
      pointer.set(mouseRef.current.nx, mouseRef.current.ny);
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(panels.map(p => p.mesh));
      const hitMesh    = intersects[0]?.object ?? null;

      panels.forEach(({ mesh, mat, borderMat, cfg }, i) => {
        const isHovered = mesh === hitMesh;

        // Floating animation per panel
        const floatY = Math.sin(t * 0.6 + i * 1.1) * 0.08;
        const floatX = Math.sin(t * 0.4 + i * 0.7) * 0.04;
        mesh.position.y = cfg.pos[1] + floatY;
        mesh.position.x = cfg.pos[0] + floatX;

        // Scroll depth parallax
        mesh.position.z = cfg.pos[2] - scrollProgress * cfg.depth * 0.6;

        // Hover tilt
        const targetRotX = cfg.rot[0] + (isHovered ? mouseRef.current.ny * 0.06 : 0);
        const targetRotY = cfg.rot[1] + (isHovered ? mouseRef.current.nx * 0.08 : 0);
        mesh.rotation.x += (targetRotX - mesh.rotation.x) * 0.1;
        mesh.rotation.y += (targetRotY - mesh.rotation.y) * 0.1;

        // Hover scale + glow
        const targetScale = isHovered ? 1.05 : 1.0;
        mesh.scale.x += (targetScale - mesh.scale.x) * 0.1;
        mesh.scale.y += (targetScale - mesh.scale.y) * 0.1;
        borderMat.opacity += ((isHovered ? 0.35 : 0.10) - borderMat.opacity) * 0.12;
      });

      // Camera subtle drift from mouse
      camera.position.x += (mouseRef.current.nx * 0.3 - camera.position.x) * 0.025;
      camera.position.y += (mouseRef.current.ny * 0.2 - camera.position.y) * 0.025;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize',    onResize);
      panels.forEach(({ geo, mat, tex, border, borderMat, borderGeo }) => {
        mat.dispose(); tex?.dispose(); borderMat.dispose();
        renderer.dispose();
      });
      if (gsapCleanup) gsapCleanup();
    };
  }, [canvasRef]);

  return null;
}
