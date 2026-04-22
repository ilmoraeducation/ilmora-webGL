// three/lights.js

export function createLights(THREE, scene) {
  // Ambient — very dim baseline
  const ambient = new THREE.AmbientLight(0x111122, 0.6);
  scene.add(ambient);

  // Gold key light — main illumination from top-right
  const keyLight = new THREE.PointLight(0xC9A84C, 2.5, 18);
  keyLight.position.set(3, 4, 3);
  scene.add(keyLight);

  // Deep blue fill light — cinematic contrast from left
  const fillLight = new THREE.PointLight(0x1a3a6e, 1.2, 20);
  fillLight.position.set(-4, -2, 2);
  scene.add(fillLight);

  // Rim light — separates orb from background
  const rimLight = new THREE.PointLight(0xC9A84C, 0.8, 12);
  rimLight.position.set(0, -4, -3);
  scene.add(rimLight);

  return { ambient, keyLight, fillLight, rimLight };
}

/**
 * Animate lights per scene — call with progress 0-1 per scene
 * sceneIndex: 0=hero, 2=chaos, 3=reveal, etc.
 */
export function updateLightsForScene(lights, sceneIndex, progress) {
  if (!lights) return;
  const { keyLight, fillLight, ambient } = lights;

  switch (sceneIndex) {
    case 0: // hero — warm gold
      keyLight.intensity  = 2.5;
      fillLight.intensity = 1.2;
      ambient.intensity   = 0.6;
      break;
    case 2: // chaos — harsher, cooler
      keyLight.intensity  = 1.8 + Math.sin(Date.now() * 0.003) * 0.4;
      fillLight.intensity = 2.0;
      ambient.intensity   = 0.4;
      break;
    case 3: // reveal — bright bloom
      keyLight.intensity  = 3.5 * progress + 2.5 * (1 - progress);
      fillLight.intensity = 0.5;
      ambient.intensity   = 0.9 * progress + 0.6 * (1 - progress);
      break;
    case 7: // cta — intense gold
      keyLight.intensity  = 3.2;
      fillLight.intensity = 0.6;
      ambient.intensity   = 0.8;
      break;
    default:
      keyLight.intensity  = 2.0;
      fillLight.intensity = 1.0;
      ambient.intensity   = 0.6;
  }
}
