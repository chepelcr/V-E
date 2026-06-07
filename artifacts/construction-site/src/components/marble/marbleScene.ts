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

// thin vein at the zero-crossing of a signed field: bright only on the line
float veinLine(float field, float width){
  return 1.0 - smoothstep(0.0, width, abs(field));
}

void computeMarble(vec2 uv, out vec3 albedo, out float metal, out float rough, out float glow){
  vec2 p = uv;
  p.x *= uAspect;          // keep veins from stretching with the viewport
  p *= uScale;             // overall feature scale
  // diagonal bias so veins run top-left -> bottom-right like the reference slab
  p = mat2(0.92, -0.38, 0.38, 0.92) * p;

  vec2 flow = vec2(uTime * 0.012, -uTime * 0.009);

  // domain warp shared by every layer
  vec2 w = vec2(fbm(p * 0.8 + flow), fbm(p * 0.8 + vec2(5.2, 1.3) - flow));

  // --- gold veins: SPARSE + THIN (zero-crossings of a warped field) ---
  float fieldA = fbm(p * 0.9 + 1.8 * w);            // primary long veins
  float fieldB = fbm(p * 1.9 + 2.2 * w + 3.0);      // finer branching
  // appear only in broad bands so the surface stays mostly black
  float band = smoothstep(0.45, 0.95, snoise(p * 0.35 + 12.0) * 0.5 + 0.5);
  float gold = veinLine(fieldA, 0.05) * mix(0.35, 1.0, band);
  gold = max(gold, veinLine(fieldB, 0.03) * 0.7 * band);
  gold = clamp(gold, 0.0, 1.0);

  // --- neutral grey/white hairline crackle: denser, very thin, subtle ---
  float fieldH = fbm(p * 3.4 + 1.5 * w + 20.0);
  float hair = veinLine(fieldH, 0.02) * 0.45;

  // calm the very centre so hero text stays readable
  vec2 c = uv - 0.5; c.x *= uAspect;
  float centre = smoothstep(0.0, 0.5, length(c));
  gold *= mix(0.45, 1.0, centre);
  hair *= mix(0.5, 1.0, centre);

  // --- base: near-black (dark) / ivory (light), gold stays gold ---
  float mott = fieldA * 0.5 + 0.5;
  vec3 darkBase  = mix(vec3(0.010, 0.010, 0.014), vec3(0.030, 0.030, 0.038), mott);
  vec3 lightBase = mix(vec3(0.855, 0.835, 0.80), vec3(0.955, 0.945, 0.915), mott);
  vec3 base = mix(darkBase, lightBase, uLight);

  vec3 hairCol = mix(vec3(0.40, 0.40, 0.44), vec3(0.55, 0.52, 0.46), uLight);
  base = mix(base, hairCol, hair * (1.0 - gold));

  vec3 goldCol = vec3(1.0, 0.76, 0.32);
  albedo = mix(base, goldCol, gold);
  metal  = gold;                       // ONLY the veins are metallic
  rough  = mix(0.88, 0.18, gold);      // base is matte; gold is polished
  glow   = pow(gold, 1.6) * 0.16;
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
    envMapIntensity: 1.2,
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
