// three/scene.js

export function createScene(THREE) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x06060F, 0.042);
  return scene;
}

/**
 * Dispose a Three.js object recursively (geometries, materials, textures)
 */
export function disposeObject(obj) {
  if (!obj) return;
  if (obj.geometry) {
    obj.geometry.dispose();
  }
  if (obj.material) {
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    mats.forEach(mat => {
      Object.values(mat).forEach(val => {
        if (val?.isTexture) val.dispose();
      });
      mat.dispose();
    });
  }
  obj.children?.forEach(disposeObject);
}

/**
 * Dispose an entire scene
 */
export function disposeScene(scene) {
  if (!scene) return;
  scene.traverse(disposeObject);
  scene.clear();
}
