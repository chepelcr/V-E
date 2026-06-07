import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * Fully procedural PBR marble/gold background (Path 1 — Three.js WebGL, no image).
 *
 * The marble is generated entirely in GLSL: domain-warped fractal noise builds a
 * black (dark theme) / ivory (light theme) base, ridged noise carves the golden
 * veins and fine hairline cracks. The veins drive a MeshStandardMaterial's
 * metalness + roughness, so they reflect a procedural RoomEnvironment under ACES
 * tone mapping — physically metallic, glowing gold.
 *
 * Theme is a single uniform crossfade (uLight 0→1): only the base recolors, the
 * gold veins stay gold, which keeps light mode clean and text readable.
 */

export interface MarbleHandle {
  setTheme(dark: boolean): void;
  setPointer(nx: number, ny: number): void;
  resize(width: number, height: number): void;
  start(): void;
  stop(): void;
  dispose(): void;
}

// Ashima 2D simplex noise + fbm + the procedural marble field.
const MARBLE_GLSL = /* glsl */ `
uniform float uTime;
uniform vec2  uPointer;
uniform float uLight;
uniform float uAspect;
uniform float uScale;
varying vec2  vMarbleUv;

vec3 permute(vec3 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0))
                  + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * snoise(p); p *= 2.0; a *= 0.5; }
  return v;
}

void computeMarble(vec2 uv, out vec3 albedo, out float metal, out float rough, out float glow){
  vec2 p = uv;
  p.x *= uAspect;          // keep veins from stretching with the viewport
  p *= uScale;             // vein density
  // diagonal bias so veins run top-left -> bottom-right like the reference slab
  p = mat2(0.92, -0.38, 0.38, 0.92) * p;

  vec2 flow = vec2(uTime * 0.018, -uTime * 0.013);

  // one domain-warp pass -> organic marble field
  vec2 q = vec2(fbm(p + flow), fbm(p + vec2(3.1, 1.7) - flow));
  float marble = fbm(p * 1.4 + 2.6 * q);
  float mott   = marble * 0.5 + 0.5;

  // gold veins: ridged (thin) lines from the warped field + a finer crack net
  float vein  = pow(1.0 - abs(marble), 7.0);
  float crack = pow(1.0 - abs(fbm(p * 2.3 + 2.0 * q)), 13.0);
  float gold  = smoothstep(0.22, 0.62, vein * 1.15 + crack * 0.6);

  // neutral hairline cracks (white/grey, not gold)
  float hair  = pow(1.0 - abs(fbm(p * 3.2 + 7.0)), 18.0);

  // base recolors per theme; gold stays gold
  vec3 darkBase  = mix(vec3(0.013, 0.013, 0.018), vec3(0.055, 0.055, 0.065), mott);
  vec3 lightBase = mix(vec3(0.85, 0.83, 0.79),   vec3(0.965, 0.955, 0.925), mott);
  vec3 base = mix(darkBase, lightBase, uLight);

  vec3 hairCol = mix(vec3(0.42, 0.42, 0.45), vec3(0.58, 0.54, 0.46), uLight);
  base = mix(base, hairCol, hair * 0.22 * (1.0 - gold));

  vec3 goldCol = vec3(1.0, 0.78, 0.34);
  albedo = mix(base, goldCol, gold);
  metal  = gold;
  rough  = mix(0.72, 0.16, gold);
  glow   = smoothstep(0.62, 1.0, gold) * 0.2;
}
`;

export function createMarbleScene(
  canvas: HTMLCanvasElement,
  opts: { dark: boolean; reducedMotion: boolean },
): MarbleHandle {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  // Procedural noise is fill-rate bound; cap DPR a little tighter than usual.
  const dprCap = 1.5;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = opts.dark ? 1.0 : 1.4;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  const camDist = 3;
  camera.position.set(0, 0, camDist);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envRT.texture;

  const uniforms = {
    uTime: { value: 0 },
    uPointer: { value: new THREE.Vector2(0, 0) },
    uLight: { value: opts.dark ? 0 : 1 },
    uAspect: { value: 1 },
    uScale: { value: 3.0 },
  };

  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 1.0,
    roughness: 1.0,
    envMapIntensity: 1.6,
    emissive: 0x000000,
  });

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);

    // expose vMarbleUv from the plane's local position (always available)
    shader.vertexShader =
      "varying vec2 vMarbleUv;\n" +
      shader.vertexShader.replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\n  vMarbleUv = position.xy + 0.5;",
      );

    shader.fragmentShader = MARBLE_GLSL + shader.fragmentShader;

    // compute the marble fields once, feed albedo / metalness / roughness / emissive
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <map_fragment>",
        /* glsl */ `
        vec3 mAlbedo; float mMetal; float mRough; float mGlow;
        computeMarble(vMarbleUv, mAlbedo, mMetal, mRough, mGlow);
        diffuseColor.rgb = mAlbedo;
        `,
      )
      .replace(
        "#include <metalnessmap_fragment>",
        "float metalnessFactor = mMetal;",
      )
      .replace(
        "#include <roughnessmap_fragment>",
        "float roughnessFactor = mRough;",
      )
      .replace(
        "#include <emissivemap_fragment>",
        "totalEmissiveRadiance += mGlow * vec3(1.0, 0.72, 0.28);",
      );
  };

  const geometry = new THREE.PlaneGeometry(1, 1);
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  function fitPlane() {
    const visH = 2 * Math.tan((camera.fov * Math.PI) / 360) * camDist;
    const visW = visH * camera.aspect;
    mesh.scale.set(visW * 1.18, visH * 1.18, 1);
    uniforms.uAspect.value = visW / visH;
  }

  const pointerTarget = new THREE.Vector2(0, 0);
  let exposureTarget = opts.dark ? 1.0 : 1.4;
  let lightTarget = opts.dark ? 0 : 1;

  let raf = 0;
  let running = false;
  let last = 0;

  function renderOnce() {
    renderer.render(scene, camera);
  }

  function frame(t: number) {
    if (!running) return;
    const dt = last ? Math.min((t - last) / 1000, 0.05) : 0.016;
    last = t;
    uniforms.uTime.value += dt;

    uniforms.uPointer.value.lerp(pointerTarget, 0.06);

    // always-on slow orbit so the gold reflections shimmer without mouse input
    const tt = uniforms.uTime.value;
    const targetX = pointerTarget.x * 0.22 + Math.sin(tt * 0.28) * 0.16;
    const targetY = pointerTarget.y * 0.16 + Math.cos(tt * 0.21) * 0.1;
    camera.position.x += (targetX - camera.position.x) * 0.04;
    camera.position.y += (targetY - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);

    uniforms.uLight.value += (lightTarget - uniforms.uLight.value) * 0.05;
    renderer.toneMappingExposure +=
      (exposureTarget - renderer.toneMappingExposure) * 0.05;

    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }

  return {
    setTheme(dark: boolean) {
      lightTarget = dark ? 0 : 1;
      exposureTarget = dark ? 1.0 : 1.4;
      if (!running) {
        uniforms.uLight.value = lightTarget;
        renderer.toneMappingExposure = exposureTarget;
        renderOnce();
      }
    },
    setPointer(nx: number, ny: number) {
      pointerTarget.set(nx, ny);
    },
    resize(width: number, height: number) {
      const w = Math.max(1, width);
      const h = Math.max(1, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      fitPlane();
      if (!running) renderOnce();
    },
    start() {
      if (running || opts.reducedMotion) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    },
    stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    },
    dispose() {
      this.stop();
      geometry.dispose();
      material.dispose();
      envRT.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
