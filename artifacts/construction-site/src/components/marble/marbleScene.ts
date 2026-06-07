import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * High-fidelity PBR marble/gold background (Path 1 — Three.js WebGL).
 *
 * The real marble photograph is used as the albedo map. From it we derive a
 * metalness map (gold veins -> 1.0) and a roughness map (gold veins shiny),
 * so the golden veins reflect a procedural environment map (RoomEnvironment)
 * with ACES filmic tone mapping — physically metallic, glowing gold over a
 * deep black polished base.
 *
 * Animation is intentionally cheap to hold 60fps: a slow UV noise drift on the
 * albedo plus a pointer-driven camera parallax that makes the gold reflections
 * shimmer. Light/dark theme is a smooth uniform crossfade (no hard cut).
 */

export interface MarbleHandle {
  setTheme(dark: boolean): void;
  setPointer(nx: number, ny: number): void;
  resize(width: number, height: number): void;
  start(): void;
  stop(): void;
  dispose(): void;
}

// Ashima 2D simplex noise — used for the subtle fluid drift of the marble.
const SNOISE_GLSL = /* glsl */ `
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
`;

/** Derive metalness + roughness maps from the marble photo by detecting gold. */
function deriveMaps(image: HTMLImageElement): {
  metalness: THREE.CanvasTexture;
  roughness: THREE.CanvasTexture;
  emissive: THREE.CanvasTexture;
  aspect: number;
} {
  const maxSide = 1024;
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const w = Math.max(1, Math.round(image.width * scale));
  const h = Math.max(1, Math.round(image.height * scale));

  const src = document.createElement("canvas");
  src.width = w;
  src.height = h;
  const sctx = src.getContext("2d", { willReadFrequently: true })!;
  sctx.drawImage(image, 0, 0, w, h);
  const data = sctx.getImageData(0, 0, w, h).data;

  const metalCanvas = document.createElement("canvas");
  const roughCanvas = document.createElement("canvas");
  const emisCanvas = document.createElement("canvas");
  for (const c of [metalCanvas, roughCanvas, emisCanvas]) {
    c.width = w;
    c.height = h;
  }
  const mImg = sctx.createImageData(w, h);
  const rImg = sctx.createImageData(w, h);
  const eImg = sctx.createImageData(w, h);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // "goldness": warm pixels where red & green dominate blue (yellow/gold),
    // excluding neutral white cracks (where r≈g≈b) and the black base.
    const warm = Math.min(r, g) - b; // >0 for yellows
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    let gold = Math.max(0, Math.min(1, warm / 90));
    if (lum < 28) gold *= 0.2; // very dark -> not reflective gold
    const goldByte = Math.round(gold * 255);

    // metalness: gold veins fully metallic, base dielectric
    mImg.data[i] = mImg.data[i + 1] = mImg.data[i + 2] = goldByte;
    mImg.data[i + 3] = 255;

    // roughness: gold smooth (~0.18), base rougher (~0.78)
    const rough = Math.round((0.78 - 0.6 * gold) * 255);
    rImg.data[i] = rImg.data[i + 1] = rImg.data[i + 2] = rough;
    rImg.data[i + 3] = 255;

    // emissive mask: faint warm glow only on the brightest gold
    const glow = Math.round(Math.max(0, gold - 0.4) * 255);
    eImg.data[i] = glow;
    eImg.data[i + 1] = Math.round(glow * 0.78);
    eImg.data[i + 2] = Math.round(glow * 0.25);
    eImg.data[i + 3] = 255;
  }

  metalCanvas.getContext("2d")!.putImageData(mImg, 0, 0);
  roughCanvas.getContext("2d")!.putImageData(rImg, 0, 0);
  emisCanvas.getContext("2d")!.putImageData(eImg, 0, 0);

  const mk = (canvas: HTMLCanvasElement, srgb = false) => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    t.anisotropy = 4;
    return t;
  };

  return {
    metalness: mk(metalCanvas),
    roughness: mk(roughCanvas),
    emissive: mk(emisCanvas, true),
    aspect: image.width / image.height,
  };
}

/** Make a texture "cover" the plane regardless of aspect mismatch. */
function applyCover(tex: THREE.Texture, imgAspect: number, planeAspect: number) {
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.center.set(0.5, 0.5);
  if (planeAspect > imgAspect) {
    const s = imgAspect / planeAspect;
    tex.repeat.set(1, s);
    tex.offset.set(0, (1 - s) / 2);
  } else {
    const s = planeAspect / imgAspect;
    tex.repeat.set(s, 1);
    tex.offset.set((1 - s) / 2, 0);
  }
}

export function createMarbleScene(
  canvas: HTMLCanvasElement,
  opts: { textureUrl: string; dark: boolean; reducedMotion: boolean },
): MarbleHandle {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
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
    uLight: { value: opts.dark ? 0 : 1 }, // 0 = dark marble, 1 = light/cream
  };

  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 1.0,
    roughness: 1.0,
    envMapIntensity: 1.25,
    emissive: 0xffffff,
    emissiveIntensity: 0.0,
  });

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime;
    shader.uniforms.uPointer = uniforms.uPointer;
    shader.uniforms.uLight = uniforms.uLight;

    shader.fragmentShader =
      `uniform float uTime;\nuniform vec2 uPointer;\nuniform float uLight;\n` +
      SNOISE_GLSL +
      shader.fragmentShader;

    // Subtle fluid drift + pointer parallax on the albedo lookup.
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <map_fragment>",
      /* glsl */ `
      #ifdef USE_MAP
        float nx = snoise(vMapUv * 2.2 + vec2(uTime * 0.025, -uTime * 0.02));
        float ny = snoise(vMapUv * 2.2 + vec2(7.3 - uTime * 0.018, 2.1));
        vec2 drift = vec2(nx, ny) * 0.0035;
        vec2 par = uPointer * 0.012;
        vec4 sampledDiffuseColor = texture2D( map, vMapUv + drift + par );
        diffuseColor *= sampledDiffuseColor;
      #endif
      `,
    );

    // Light/dark crossfade as a warm color grade after tone mapping.
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <tonemapping_fragment>",
      /* glsl */ `
      #include <tonemapping_fragment>
      vec3 lifted = gl_FragColor.rgb * 1.45 + vec3(0.24, 0.21, 0.15);
      gl_FragColor.rgb = mix(gl_FragColor.rgb, lifted, uLight);
      `,
    );
  };

  const geometry = new THREE.PlaneGeometry(1, 1);
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  let imgAspect = 1;
  let viewW = 1;
  let viewH = 1;

  function fitPlane() {
    const visH = 2 * Math.tan((camera.fov * Math.PI) / 360) * camDist;
    const visW = visH * camera.aspect;
    // Overscan so parallax never reveals an edge.
    mesh.scale.set(visW * 1.18, visH * 1.18, 1);
    if (material.map) applyCover(material.map, imgAspect, visW / visH);
  }

  const loader = new THREE.TextureLoader();
  loader.load(opts.textureUrl, (albedo) => {
    albedo.colorSpace = THREE.SRGBColorSpace;
    albedo.anisotropy = 4;
    material.map = albedo;

    const img = albedo.image as HTMLImageElement;
    try {
      const maps = deriveMaps(img);
      imgAspect = maps.aspect;
      material.metalnessMap = maps.metalness;
      material.roughnessMap = maps.roughness;
      material.emissiveMap = maps.emissive;
      material.emissiveIntensity = 0.12;
    } catch {
      // Cross-origin / canvas read failure: fall back to a uniform metallic look.
      imgAspect = img.width / img.height || 1;
      material.metalness = 0.4;
      material.roughness = 0.5;
    }
    material.needsUpdate = true;
    fitPlane();
    renderOnce();
  });

  // ---- pointer / theme target state ----
  const pointerTarget = new THREE.Vector2(0, 0);
  let exposureTarget = opts.dark ? 1.0 : 1.45;
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

    // ease pointer + theme uniforms
    uniforms.uPointer.value.lerp(pointerTarget, 0.06);
    camera.position.x += (pointerTarget.x * 0.18 - camera.position.x) * 0.05;
    camera.position.y += (pointerTarget.y * 0.12 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);
    uniforms.uLight.value += (lightTarget - uniforms.uLight.value) * 0.05;
    renderer.toneMappingExposure +=
      (exposureTarget - renderer.toneMappingExposure) * 0.05;

    material.emissiveIntensity = 0.12 + 0.04 * Math.sin(uniforms.uTime.value * 0.8);

    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }

  return {
    setTheme(dark: boolean) {
      lightTarget = dark ? 0 : 1;
      exposureTarget = dark ? 1.0 : 1.45;
      if (!running) {
        // reduced-motion: snap + single render
        uniforms.uLight.value = lightTarget;
        renderer.toneMappingExposure = exposureTarget;
        renderOnce();
      }
    },
    setPointer(nx: number, ny: number) {
      pointerTarget.set(nx, ny);
    },
    resize(width: number, height: number) {
      viewW = Math.max(1, width);
      viewH = Math.max(1, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(viewW, viewH, false);
      camera.aspect = viewW / viewH;
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
      material.map?.dispose();
      material.metalnessMap?.dispose();
      material.roughnessMap?.dispose();
      material.emissiveMap?.dispose();
      material.dispose();
      envRT.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
