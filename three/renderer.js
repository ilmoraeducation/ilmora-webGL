// three/renderer.js
// Production WebGL renderer — created once, shared across scenes

let _renderer = null;

export function createRenderer(canvas) {
  const THREE = window.__THREE__;
  if (!THREE) throw new Error('THREE not loaded');

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha:     true,
    antialias: window.devicePixelRatio < 2, // antialias only on low-DPI
    powerPreference: 'high-performance',
    stencil:  false,
    depth:    true,
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = false; // no shadows for perf

  // tone mapping for cinematic look
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  return renderer;
}

export function resizeRenderer(renderer, camera) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h);
  if (camera) {
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
}

export function disposeRenderer(renderer) {
  renderer?.dispose();
}
