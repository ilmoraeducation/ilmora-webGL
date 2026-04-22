'use client';
// components/three/HeroOrb.js
// Real 3D emissive sphere with GLSL noise deformation + GSAP scroll sync

import { useEffect, useRef, useCallback } from 'react';

/* ── Vertex shader — noise-based deformation ─────────────────────────────── */
const VERT = `
  uniform float uTime;
  uniform float uDistort;
  varying vec3  vNormal;
  varying vec3  vPosition;

  // Simplex-style 3D noise (compact version)
  vec3 mod289(vec3 x){return x - floor(x*(1./289.))*289.;}
  vec4 mod289(vec4 x){return x - floor(x*(1./289.))*289.;}
  vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - .85373472095314*r;}
  float snoise(vec3 v){
    const vec2 C=vec2(1./6.,1./3.);
    const vec4 D=vec4(0.,.5,1.,2.);
    vec3 i=floor(v+dot(v,C.yyy));
    vec3 x0=v-i+dot(i,C.xxx);
    vec3 g=step(x0.yzx,x0.xyz);
    vec3 l=1.-g;
    vec3 i1=min(g.xyz,l.zxy);
    vec3 i2=max(g.xyz,l.zxy);
    vec3 x1=x0-i1+C.xxx;
    vec3 x2=x0-i2+C.yyy;
    vec3 x3=x0-D.yyy;
    i=mod289(i);
    vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
    float n_=.142857142857;
    vec3 ns=n_*D.wyz-D.xzx;
    vec4 j=p-49.*floor(p*ns.z*ns.z);
    vec4 x_=floor(j*ns.z);
    vec4 y_=floor(j-7.*x_);
    vec4 x=x_*ns.x+ns.yyyy;
    vec4 y=y_*ns.x+ns.yyyy;
    vec4 h=1.-abs(x)-abs(y);
    vec4 b0=vec4(x.xy,y.xy);
    vec4 b1=vec4(x.zw,y.zw);
    vec4 s0=floor(b0)*2.+1.;
    vec4 s1=floor(b1)*2.+1.;
    vec4 sh=-step(h,vec4(0.));
    vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
    vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
    vec3 p0=vec3(a0.xy,h.x);
    vec3 p1=vec3(a0.zw,h.y);
    vec3 p2=vec3(a1.xy,h.z);
    vec3 p3=vec3(a1.zw,h.w);
    vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
    vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
    m=m*m;
    return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }

  void main(){
    vNormal   = normal;
    vPosition = position;
    vec3 pos  = position;
    float noise = snoise(pos * 1.6 + uTime * 0.28) * uDistort;
    pos += normal * noise;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

/* ── Fragment shader — emissive gold with Fresnel rim ────────────────────── */
const FRAG = `
  uniform vec3  uColorA;
  uniform vec3  uColorB;
  uniform float uTime;
  varying vec3  vNormal;
  varying vec3  vPosition;

  void main(){
    vec3 viewDir  = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - dot(vNormal, viewDir), 2.8);
    float pulse   = 0.5 + 0.5 * sin(uTime * 0.9);
    vec3  col     = mix(uColorA, uColorB, fresnel + pulse * 0.12);
    float alpha   = 0.78 + fresnel * 0.22;
    gl_FragColor  = vec4(col, alpha);
  }
`;

export default function HeroOrb({ canvasRef }) {
  const stateRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef?.current;
    if (!canvas || !window.__THREE__) return;
    const THREE = window.__THREE__;

    /* ── Scene setup ── */
    const renderer = new THREE.WebGLRenderer({
      canvas, alpha: true, antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, canvas.clientWidth / canvas.clientHeight, 0.1, 50);
    camera.position.set(0, 0, 4.5);

    /* ── Lights ── */
    scene.add(new THREE.AmbientLight(0x111122, 0.5));
    const keyLight = new THREE.PointLight(0xC9A84C, 3.5, 16);
    keyLight.position.set(2.2, 3.8, 3.5);
    scene.add(keyLight);
    const fillLight = new THREE.PointLight(0x1a3a6e, 1.5, 16);
    fillLight.position.set(-3, -2, 2);
    scene.add(fillLight);
    const rimLight = new THREE.PointLight(0xE5C97E, 1.0, 10);
    rimLight.position.set(0, -3, -2);
    scene.add(rimLight);

    /* ── Shader orb ── */
    const uniforms = {
      uTime:    { value: 0 },
      uDistort: { value: 0.32 },
      uColorA:  { value: new THREE.Color(0xC9A84C) },  // gold
      uColorB:  { value: new THREE.Color(0x8B4513) },  // deep amber
    };

    const geometry = new THREE.IcosahedronGeometry(1.6, 64);
    const material = new THREE.ShaderMaterial({
      vertexShader:   VERT,
      fragmentShader: FRAG,
      uniforms,
      transparent: true,
      side: THREE.FrontSide,
    });
    const orb = new THREE.Mesh(geometry, material);
    scene.add(orb);

    /* ── Outer glow ring ── */
    const ringGeo = new THREE.TorusGeometry(2.0, 0.008, 8, 120);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xC9A84C, transparent: true, opacity: 0.18 });
    const ring1   = new THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.x = 0.4;
    scene.add(ring1);
    const ring2 = ring1.clone();
    ring2.scale.setScalar(1.22);
    ring2.material = ringMat.clone();
    ring2.material.opacity = 0.07;
    ring2.rotation.z = 1.1;
    scene.add(ring2);

    /* ── Ambient glow sprite ── */
    const glowGeo = new THREE.PlaneGeometry(5, 5);
    const glowMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0xC9A84C),
      transparent: true, opacity: 0.06,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.z = -0.5;
    scene.add(glow);

    /* ── Mouse interaction ── */
    let mouseX = 0, mouseY = 0;
    const onMouse = (e) => {
      mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouse, { passive: true });

    /* ── Scroll sync via GSAP ScrollTrigger ── */
    let scrollProgress = 0;
    let gsapCleanup;
    (async () => {
      const { gsap, ScrollTrigger } = await import('@/animations/gsap-init');
      ScrollTrigger.create({
        trigger: '#scene-hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
        onUpdate: self => { scrollProgress = self.progress; },
      });
      // Scale orb down as hero exits
      gsap.to(orb.scale, {
        x: 0.4, y: 0.4, z: 0.4,
        scrollTrigger: {
          trigger: '#scene-hero',
          start: 'top top', end: 'bottom top',
          scrub: 1.5,
        },
      });
      gsapCleanup = () => { ScrollTrigger.getAll().forEach(t => t.kill()); };
    })();

    /* ── Resize ── */
    const onResize = () => {
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize, { passive: true });

    /* ── Animation loop ── */
    let raf;
    let rotX = 0, rotY = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      uniforms.uTime.value    = t;
      uniforms.uDistort.value = 0.30 + Math.sin(t * 0.55) * 0.06 + Math.sin(t * 1.3) * 0.02;

      // Smooth mouse-driven rotation
      rotY += (mouseX * 0.45 - rotY) * 0.04;
      rotX += (-mouseY * 0.25 - rotX) * 0.04;
      orb.rotation.y = rotY + t * 0.06;
      orb.rotation.x = rotX;
      orb.rotation.z = Math.sin(t * 0.3) * 0.06;

      // Breathing scale animation (pulse in and out)
      const breathe = 1 + Math.sin(t * 0.9) * 0.024;
      orb.scale.setScalar(breathe);

      // Ring rotation
      ring1.rotation.y = t * 0.15;
      ring2.rotation.y = -t * 0.12;
      ring1.rotation.z = t * 0.08;

      // Key light flicker (subtle)
      keyLight.intensity = 3.0 + Math.sin(t * 1.8) * 0.2;

      // Glow pulse
      glow.material.opacity = 0.04 + Math.sin(t * 0.7) * 0.025;

      renderer.render(scene, camera);
    };
    animate();

    stateRef.current = { renderer, scene, camera, geometry, material, orb, clock };

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', onResize);
      geometry.dispose();
      material.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      glowGeo.dispose();
      glowMat.dispose();
      renderer.dispose();
      if (gsapCleanup) gsapCleanup();
    };
  }, [canvasRef]);

  return null;
}
