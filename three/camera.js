// three/camera.js

export function createCamera(THREE) {
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.01,
    200
  );
  camera.position.set(0, 0, 6);
  return camera;
}

/**
 * Smoothly lerp camera to target position every frame
 * Call inside animation loop
 */
export function lerpCamera(camera, target, alpha = 0.06) {
  camera.position.x += (target.x - camera.position.x) * alpha;
  camera.position.y += (target.y - camera.position.y) * alpha;
  camera.position.z += (target.z - camera.position.z) * alpha;
}

/**
 * Returns target positions per scene index (0-7)
 */
export function getCameraTargetForScene(sceneIndex) {
  const targets = [
    { x:  0,    y:  0,   z: 6.0  }, // 0 hero
    { x: -0.5,  y:  0.2, z: 6.5  }, // 1 problem
    { x:  0.6,  y: -0.2, z: 5.8  }, // 2 chaos
    { x:  0,    y:  0,   z: 5.5  }, // 3 reveal
    { x:  0.3,  y:  0.1, z: 6.2  }, // 4 product
    { x: -0.3,  y:  0,   z: 6.8  }, // 5 journey
    { x:  0,    y: -0.3, z: 6.0  }, // 6 trust
    { x:  0,    y:  0,   z: 5.5  }, // 7 cta
  ];
  return targets[sceneIndex] ?? targets[0];
}
