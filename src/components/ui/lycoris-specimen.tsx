"use client";

import * as React from "react";
import {
  FIINA_PRODUCTS,
  FiinaProduct,
  clamp01,
  smoothstep,
  easeInOut,
  progressFrom,
  sceneCoord,
  reveal,
  formatRupiah,
} from "../../data/products";
import {
  V3,
  StageShape,
  PAN_STRIDE,
  buildPanSetMesh,
  PanMeshData,
} from "../../utils/panGeometry";

export type LycorisLink = { label: string; href?: string; onClick?: () => void };

export type LycorisSpecimenProps = {
  name?: string;
  studio?: string;
  year?: string;
  description?: string;
  specs?: string[];
  tagline?: { text: string; small?: boolean }[];
  fontFamily?: string;
  ink?: string;
  bone?: string;
  crimson?: string;
  height?: string;
  sceneScroll?: number;
  alive?: boolean;
  className?: string;
  activeShape?: StageShape;
  onShapeChange?: (shape: StageShape) => void;
  onAddToCart?: (product: FiinaProduct, qty: number) => void;
  onOpenCheckout?: () => void;
  onScrollToCatalog?: () => void;
};

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const norm = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

const HEART_CENTER: V3 = [0, 0.05, 0];

type Key = {
  spin: number;
  el: number;
  size: number;
  ox: number;
  oy: number;
  /** 0 = single iconic pan, 1 = 3-tier nested set (18, 20, 22 cm) separated */
  stack: number;
};

const KEYS: Key[] = [
  // 0 · Pembuka: 1 iconic Loyang Love floating cleanly above Fiinastore title
  { spin: 0.35, el: 28, size: 0.54, ox: 0, oy: 0.22, stack: 0 },
  // 1 · Tampak Atas: camera looks straight down into the heart pan basin, F & e flank
  { spin: 0.0, el: 82, size: 0.5, ox: 0, oy: 0.04, stack: 0 },
  // 2 · Satu Set Tiga Ukuran: 3 sizes (18, 20, 22 cm) separate vertically in 3D
  { spin: 0.72, el: 24, size: 0.5, ox: 0, oy: 0.08, stack: 1 },
  // 3 · Pilihan Bentuk: interactive shape explorer (Love, Bulat, Segi, Bronis, Rigi, Pai)
  { spin: 1.35, el: 32, size: 0.44, ox: 0, oy: 0.2, stack: 0.65 },
  // 4 · Kreasi Baking: pan shifts right on desktop, editorial statement & creations on left
  { spin: 2.15, el: 26, size: 0.56, ox: 0.46, oy: 0.06, stack: 0.85 },
  // 5 · Belanja Set: pan crowns top center, direct purchase module & set comparison below
  { spin: 2.95, el: 34, size: 0.44, ox: 0, oy: 0.45, stack: 1 },
];

// Portrait mobile stages position the 3D pan in the clear center window between top header card and bottom interactive card
const KEYS_TALL: Partial<Key>[] = [
  // 0 · Pembuka portrait: pan sits cleanly between top tagline/spec strip and Fiinastore wordmark
  { size: 0.52, ox: 0, oy: 0.14 },
  // 1 · Tampak Atas portrait: pan sits in clear center between top anatomy card and bottom callout bar
  { size: 0.46, ox: 0, oy: 0.04 },
  // 2 · Satu Set portrait: pan sits in clear middle zone between top header and bottom size selector
  { size: 0.44, ox: 0, oy: 0.1 },
  // 3 · Bentuk portrait: pan sits in clear upper-middle zone above the 2x3 shape grid
  { size: 0.43, ox: 0, oy: 0.18 },
  // 4 · Kreasi portrait: pan sits in clear center between top headline card and bottom feature card
  { size: 0.44, ox: 0, oy: 0.06 },
  // 5 · Pesan Set portrait: pan sits in clear middle between top quick-shape switcher and bottom purchase card
  { size: 0.39, ox: 0, oy: 0.14 },
];

// Short landscape mobile stages (e.g. 844x390, 667x375) position the 3D pan so horizontal HUDs never collide
const KEYS_SHORT_LANDSCAPE: Partial<Key>[] = [
  // 0 · Pembuka landscape: pan sits slightly higher so wordmark + bottom bar below never collide
  { size: 0.4, ox: 0, oy: 0.28 },
  // 1 · Tampak Atas landscape: centered between top bar and bottom bar
  { size: 0.4, ox: 0, oy: 0.02 },
  // 2 · Satu Set landscape: centered between left summary and right size buttons
  { size: 0.4, ox: 0, oy: 0.04 },
  // 3 · Bentuk landscape: centered in upper-middle above the bottom horizontal inspector bar
  { size: 0.36, ox: 0, oy: 0.22 },
  // 4 · Kreasi landscape: shifted right while editorial copy sits on left
  { size: 0.44, ox: 0.48, oy: 0.04 },
  // 5 · Pesan Set landscape: shifted left while compact purchase card sits on right
  { size: 0.38, ox: -0.46, oy: 0.06 },
];

const SCENES = KEYS.length;
const HOLD = 0.34;
const NAV = [
  "Pembuka",
  "Tampak Atas",
  "Satu Set",
  "Bentuk",
  "Kreasi",
  "Pesan Set",
];

const keyAt = (coord: number, tall: boolean, shortLandscape: boolean): Key => {
  const i = Math.max(0, Math.min(SCENES - 1, Math.floor(coord)));
  const j = Math.min(SCENES - 1, i + 1);
  const f = coord - i;
  const overrideA = tall
    ? KEYS_TALL[i]
    : shortLandscape
    ? KEYS_SHORT_LANDSCAPE[i]
    : {};
  const overrideB = tall
    ? KEYS_TALL[j]
    : shortLandscape
    ? KEYS_SHORT_LANDSCAPE[j]
    : {};
  const a = { ...KEYS[i], ...overrideA };
  const b = { ...KEYS[j], ...overrideB };
  const l = (x: number, y: number) => x + (y - x) * f;
  return {
    spin: l(a.spin, b.spin),
    el: l(a.el, b.el),
    size: l(a.size, b.size),
    ox: l(a.ox, b.ox),
    oy: l(a.oy, b.oy),
    stack: l(a.stack, b.stack),
  };
};

type M4 = Float32Array;
const perspective = (
  fovy: number,
  aspect: number,
  near: number,
  far: number
): M4 => {
  const f = 1 / Math.tan(fovy / 2);
  const m = new Float32Array(16);
  m[0] = f / aspect;
  m[5] = f;
  m[10] = (far + near) / (near - far);
  m[11] = -1;
  m[14] = (2 * far * near) / (near - far);
  return m;
};

const lookAt = (eye: V3, at: V3): M4 => {
  const z = norm(sub(eye, at));
  const x = norm(cross([0, 1, 0], z));
  const y = cross(z, x);
  const m = new Float32Array(16);
  m[0] = x[0];
  m[4] = x[1];
  m[8] = x[2];
  m[1] = y[0];
  m[5] = y[1];
  m[9] = y[2];
  m[2] = z[0];
  m[6] = z[1];
  m[10] = z[2];
  m[12] = -dot(x, eye);
  m[13] = -dot(y, eye);
  m[14] = -dot(z, eye);
  m[15] = 1;
  return m;
};

const multiply = (a: M4, b: M4): M4 => {
  const o = new Float32Array(16);
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++)
      o[c * 4 + r] =
        a[r] * b[c * 4] +
        a[4 + r] * b[c * 4 + 1] +
        a[8 + r] * b[c * 4 + 2] +
        a[12 + r] * b[c * 4 + 3];
  return o;
};

const rotY = (t: number): M4 => {
  const c = Math.cos(t);
  const s = Math.sin(t);
  return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]);
};

const rotX = (t: number): M4 => {
  const c = Math.cos(t);
  const s = Math.sin(t);
  return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]);
};

// ---- WebGL Shaders for Brushed Silver Aluminum on Warm Cream Stage --------

const VERT = `
attribute vec3 a_pos;
attribute vec3 a_nrm;
attribute vec4 a_aux;
uniform mat4 u_vp;
uniform mat4 u_model;
uniform vec2 u_offset;
uniform float u_time;
uniform float u_intro;
uniform float u_stack;
uniform float u_sway;
varying vec3 v_n;
varying vec3 v_w;
varying float v_u;
varying float v_pan;
varying float v_kind;
varying float v_rad;
void main() {
  vec3 p = a_pos;
  float panIdx = a_aux.y;

  float introScale = 0.82 + 0.18 * u_intro;

  float stackAmt = clamp(u_stack, 0.0, 1.0);
  if (panIdx > 0.5) {
    float vis = smoothstep(0.02, 0.35, stackAmt);
    p *= mix(0.001, 1.0, vis);
    p.y += panIdx * 0.34 * stackAmt;
    p.x += (panIdx == 1.0 ? -0.18 : 0.18) * stackAmt;
    p.z += (panIdx == 1.0 ? -0.08 : 0.08) * stackAmt;
  } else {
    p.y -= 0.12 * stackAmt;
  }

  p *= introScale;
  p.y += 0.018 * u_sway * sin(u_time * 1.4 + panIdx * 1.1);

  vec4 w = u_model * vec4(p, 1.0);
  v_w = w.xyz;
  v_n = (u_model * vec4(a_nrm, 0.0)).xyz;
  v_u = a_aux.x;
  v_pan = panIdx;
  v_kind = a_aux.z;
  v_rad = a_aux.w;
  gl_Position = u_vp * w;
  gl_Position.xy += u_offset * gl_Position.w;
}
`;

const FRAG = `
precision highp float;
uniform vec3 u_eye;
varying vec3 v_n;
varying vec3 v_w;
varying float v_u;
varying float v_pan;
varying float v_kind;
varying float v_rad;

float studioEnv(vec3 r) {
  float key = pow(max(dot(r, normalize(vec3(-0.42, 0.82, 0.38))), 0.0), 10.0) * 1.65;
  float warmFill = pow(max(dot(r, normalize(vec3(0.65, 0.45, 0.55))), 0.0), 4.0) * 0.75;
  float sideStrip = smoothstep(0.42, 0.78, abs(r.x)) * smoothstep(-0.4, 0.6, r.y) * 0.75;
  float overhead = smoothstep(0.55, 0.98, r.y) * 0.65;
  return key + warmFill + sideStrip + overhead;
}

void main() {
  vec3 n = normalize(v_n);
  vec3 v = normalize(u_eye - v_w);
  if (dot(n, v) < 0.0) n = -n;
  vec3 r = reflect(-v, n);

  float env = studioEnv(r);
  float ndotv = max(dot(n, v), 0.0);
  float fresnel = pow(1.0 - ndotv, 2.6);

  float brush = 0.96 + 0.04 * sin(v_u * 140.0 + v_w.y * 85.0);

  float dif1 = max(dot(n, normalize(vec3(-0.35, 0.78, 0.52))), 0.0);
  float dif2 = max(dot(n, normalize(vec3(0.55, -0.25, 0.65))), 0.0);

  vec3 darkContour = vec3(0.28, 0.25, 0.23);
  vec3 silverMid = vec3(0.68, 0.71, 0.75) * brush;
  vec3 warmSpec = vec3(1.0, 0.97, 0.91);

  vec3 col = mix(darkContour, silverMid, 0.28 + 0.58 * dif1 + 0.22 * dif2);

  col += vec3(0.24, 0.23, 0.21) * env;
  col += warmSpec * pow(max(env, 0.0), 2.1) * 0.22;

  if (v_kind > 0.5 && v_kind < 1.5) {
    col = mix(col, vec3(0.92, 0.93, 0.95), 0.32);
    col += warmSpec * pow(max(env, 0.0), 1.6) * 0.18;
  }

  if (v_kind > 1.5) {
    col *= 0.86 + 0.14 * smoothstep(0.0, 0.85, v_rad);
  }

  if (v_pan > 0.5) {
    col *= (v_pan < 1.5) ? vec3(0.97, 0.96, 0.95) : vec3(0.94, 0.93, 0.91);
  }

  col = mix(col, vec3(0.24, 0.20, 0.18), fresnel * 0.48);

  col = clamp(col, 0.0, 1.0);
  gl_FragColor = vec4(col, 1.0);
}
`;

const DISPLAY =
  '"Fraunces", "Playfair Display", "Iowan Old Style", Georgia, serif';
const SANS =
  '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif';
const MONO = '"JetBrains Mono", monospace';

const DEFAULT_SPECS = [
  "Bahan Aluminium Berkualitas",
  "1 Set Isi 3 Ukuran (18, 20, 22 cm)",
  "Tinggi Proporsional 5 cm",
  "Sambungan Lipat Rapi & Kokoh",
  "Panas Merata, Matang Sempurna",
];

const DEFAULT_TAGLINE = [
  { text: "Panggang" },
  { text: "lebih merata,", small: true },
  { text: "Hasil kue" },
  { text: "lebih istimewa", small: true },
];

const SHAPE_OPTIONS_LEFT: {
  id: StageShape;
  code: string;
  title: string;
  sub: string;
  price: number;
  productId: string;
}[] = [
  {
    id: "love",
    code: "01",
    title: "LOVE SET 3",
    sub: "Uk. 18, 20, 22 cm · Tinggi 5 cm",
    price: 42000,
    productId: "loyang-love-set3",
  },
  {
    id: "bulat",
    code: "02",
    title: "BULAT GAGANG",
    sub: "Ø 18, 20, 22 cm · Tinggi 5 cm",
    price: 42000,
    productId: "loyang-bulat-set3",
  },
  {
    id: "segi",
    code: "03",
    title: "SEGI EMPAT",
    sub: "Uk. 18, 20, 22 cm · Tinggi 5 cm",
    price: 42000,
    productId: "loyang-segi-set3",
  },
];

const SHAPE_OPTIONS_RIGHT: {
  id: StageShape;
  code: string;
  title: string;
  sub: string;
  price: number;
  productId: string;
}[] = [
  {
    id: "bronis",
    code: "04",
    title: "BRONIS POLOS",
    sub: "Panjang 18, 20, 22 cm · T 5 cm",
    price: 32000,
    productId: "loyang-bronis-polos-set3",
  },
  {
    id: "rigi",
    code: "05",
    title: "BRONIS RIGI",
    sub: "Loyang Agar 18, 20, 22 cm",
    price: 35000,
    productId: "loyang-bronis-rigi-set3",
  },
  {
    id: "pai",
    code: "06",
    title: "PAI BULAT RIGI",
    sub: "Ø 18, 20, 22 cm · Kulit Renyah",
    price: 40000,
    productId: "loyang-pai-set3",
  },
];

const ALL_STAGE_SHAPES = [...SHAPE_OPTIONS_LEFT, ...SHAPE_OPTIONS_RIGHT];

const CSS =
  ".lys-stage{container-type:size;container-name:lys}" +
  ".lys-char{display:inline-block;animation:lys-in 1.1s cubic-bezier(.2,.8,.2,1) both}" +
  "@keyframes lys-in{from{opacity:0;transform:translateY(0.32em) rotate(3deg)}to{opacity:1;transform:none}}" +
  ".lys-shape-btn{transition:transform .2s cubic-bezier(.16,1,.3,1),color .2s,border-color .2s;cursor:pointer}" +
  ".lys-shape-btn:hover{color:var(--lys-red);transform:translateX(3px)}" +
  ".lys-nav button{display:flex;align-items:center;gap:8px;justify-content:flex-end;background:none;border:0;padding:4px 0;cursor:pointer;color:inherit;font:inherit}" +
  ".lys-nav .lys-tick{display:block;height:2px;width:12px;background:currentColor;opacity:.45;transition:width .35s cubic-bezier(.2,.8,.2,1),opacity .25s,background-color .25s}" +
  ".lys-nav .lys-lab{opacity:0;pointer-events:none;transform:translateX(6px);transition:opacity .25s,transform .25s,color .25s;background:rgba(246,239,226,0.94);padding:2px 6px;border-radius:4px}" +
  ".lys-nav:hover .lys-lab,.lys-nav button:hover .lys-lab,.lys-nav button:focus-visible .lys-lab{opacity:1;transform:none}" +
  ".lys-nav button[aria-current=step] .lys-lab{color:var(--lys-red);font-weight:600}" +
  ".lys-nav button[aria-current=step] .lys-tick{width:24px;opacity:1;background:var(--lys-red)}" +
  /* Deterministic layout visibility driven by data-layout on .lys-stage */
  ".lys-only-portrait{display:none!important}" +
  ".lys-only-wide{display:grid!important}" +
  ".lys-only-wide-flex{display:flex!important}" +
  ".lys-only-wide-block{display:block!important}" +
  ".lys-stage[data-layout='portrait'] .lys-only-portrait{display:flex!important}" +
  ".lys-stage[data-layout='portrait'] .lys-only-wide{display:none!important}" +
  ".lys-stage[data-layout='portrait'] .lys-only-wide-flex{display:none!important}" +
  ".lys-stage[data-layout='portrait'] .lys-only-wide-block{display:none!important}" +
  ".lys-stage[data-layout='portrait'] .lys-hide-portrait{display:none!important}" +
  ".lys-stage[data-layout='landscape-short'] .lys-hide-short{display:none!important}" +
  ".lys-stage[data-layout='landscape-short'] .lys-wordmark{top:63%!important;font-size:min(11.5cqw, 16.5cqh)!important}" +
  ".lys-stage[data-layout='landscape-short'] .lys-short-compact{padding:6px 10px!important;font-size:11px!important}" +
  ".lys-stage[data-layout='landscape-short'] .lys-s4-left{top:50%!important;transform:translateY(-50%)!important;max-width:46cqw!important}" +
  ".lys-stage[data-layout='landscape-short'] .lys-fin-wrap{top:8cqh!important;bottom:13cqh!important;align-items:center!important;justify-content:flex-end!important}" +
  ".lys-stage[data-layout='landscape-short'] .lys-fin-card{max-width:54cqw!important;padding:10px 14px!important}" +
  "@container lys (max-width: 1020px){.lys-hide-md{display:none!important}}" +
  "@media (prefers-reduced-motion: reduce){.lys-char{animation:none}}";

type Fx = "rise" | "clip" | "line" | "fade" | "draw";

const sc = (scene: number, fx: Fx = "rise", delay = 0) => ({
  "data-sc": scene,
  "data-fx": fx,
  "data-d": delay,
});

export default function LycorisSpecimen({
  name = "Fiinastore",
  studio = "Fiinastore Bakeware",
  year = "2026",
  description,
  specs = DEFAULT_SPECS,
  tagline = DEFAULT_TAGLINE,
  fontFamily = DISPLAY,
  ink = "#F6EFE2",
  bone = "#281C16",
  crimson = "#B84A27",
  height = "calc(100svh - 48px)",
  sceneScroll = 1.15,
  alive = true,
  className = "",
  activeShape: controlledShape,
  onShapeChange,
  onAddToCart,
  onOpenCheckout,
  onScrollToCatalog,
}: LycorisSpecimenProps) {
  const rootRef = React.useRef<HTMLElement | null>(null);
  const stageRef = React.useRef<HTMLDivElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const glowRef = React.useRef<HTMLDivElement | null>(null);
  const wordRef = React.useRef<HTMLDivElement | null>(null);

  const [reduced, setReduced] = React.useState(false);
  const [activeScene, setActiveScene] = React.useState(0);
  const [layoutMode, setLayoutMode] = React.useState<
    "portrait" | "landscape-short" | "wide"
  >("wide");
  const [internalShape, setInternalShape] = React.useState<StageShape>("love");
  const [selectedSizePreview, setSelectedSizePreview] = React.useState<
    "18 cm" | "20 cm" | "22 cm"
  >("20 cm");
  const [stageQty, setStageQty] = React.useState(1);
  const [forceStackView, setForceStackView] = React.useState<boolean | null>(
    null
  );

  const currentShape = controlledShape ?? internalShape;
  const handleSelectShape = (s: StageShape) => {
    setInternalShape(s);
    onShapeChange?.(s);
  };

  const activeShapeMeta =
    ALL_STAGE_SHAPES.find((s) => s.id === currentShape) ?? ALL_STAGE_SHAPES[0];
  const activeProduct =
    FIINA_PRODUCTS.find((p) => p.id === activeShapeMeta.productId) ??
    FIINA_PRODUCTS[0];

  const desc =
    description ??
    "Solusi perlengkapan dapur dan cetakan kue aluminium berkualitas. Satu set langsung dapat tiga ukuran berjenjang dengan sambungan lipat rapi, kokoh, dan panas merata untuk hasil panggangan terbaik.";

  const letters = Array.from(name);
  const firstIdx = letters.findIndex((c) => c.trim() !== "");
  const lastIdx =
    letters.length - 1 - [...letters].reverse().findIndex((c) => c.trim() !== "");

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const meshCacheRef = React.useRef<Record<StageShape, PanMeshData> | null>(
    null
  );
  if (!meshCacheRef.current) {
    meshCacheRef.current = {
      love: buildPanSetMesh("love"),
      bulat: buildPanSetMesh("bulat"),
      segi: buildPanSetMesh("segi"),
      bronis: buildPanSetMesh("bronis"),
      rigi: buildPanSetMesh("rigi"),
      pai: buildPanSetMesh("pai"),
    };
  }

  const look = React.useRef({
    crimson,
    bone,
    alive,
    reduced,
    shape: currentShape,
    forceStackView,
  });
  look.current = {
    crimson,
    bone,
    alive,
    reduced,
    shape: currentShape,
    forceStackView,
  };

  React.useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const glow = glowRef.current;
    const word = wordRef.current;
    if (!root || !stage || !canvas || !glow || !word) return;

    const isHeadless =
      typeof navigator !== "undefined" &&
      (navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent));

    let currentUploadedShape: StageShape = look.current.shape;
    let activeMesh: PanMeshData = meshCacheRef.current![currentUploadedShape];

    let gl: WebGLRenderingContext | null = null;
    let ctx2d: CanvasRenderingContext2D | null = null;
    let prog: WebGLProgram | null = null;
    let vbo: WebGLBuffer | null = null;
    let ibo: WebGLBuffer | null = null;
    const loc: Record<string, WebGLUniformLocation | null> = {};

    const uploadMeshToGL = (mesh: PanMeshData) => {
      if (!gl || !prog || !vbo || !ibo) return;
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(gl.ARRAY_BUFFER, mesh.data, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.index, gl.STATIC_DRAW);
    };

    const initGL = () => {
      gl = canvas.getContext("webgl", {
        alpha: true,
        antialias: !isHeadless,
        premultipliedAlpha: false,
      }) as WebGLRenderingContext | null;
      if (!gl) return false;
      const compile = (type: number, src: string) => {
        const sh = gl!.createShader(type)!;
        gl!.shaderSource(sh, src);
        gl!.compileShader(sh);
        return gl!.getShaderParameter(sh, gl!.COMPILE_STATUS) ? sh : null;
      };
      const vs = compile(gl.VERTEX_SHADER, VERT);
      const fs = compile(gl.FRAGMENT_SHADER, FRAG);
      if (!vs || !fs) return false;
      prog = gl.createProgram()!;
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
      gl.useProgram(prog);
      vbo = gl.createBuffer();
      ibo = gl.createBuffer();
      uploadMeshToGL(activeMesh);

      const attr = (n: string, size: number, off: number) => {
        const a = gl!.getAttribLocation(prog!, n);
        if (a < 0) return;
        gl!.enableVertexAttribArray(a);
        gl!.vertexAttribPointer(
          a,
          size,
          gl!.FLOAT,
          false,
          PAN_STRIDE * 4,
          off * 4
        );
      };
      attr("a_pos", 3, 0);
      attr("a_nrm", 3, 3);
      attr("a_aux", 4, 6);

      for (const n of [
        "u_vp",
        "u_model",
        "u_offset",
        "u_time",
        "u_intro",
        "u_stack",
        "u_sway",
        "u_eye",
      ]) {
        loc[n] = gl.getUniformLocation(prog, n);
      }
      gl.enable(gl.DEPTH_TEST);
      gl.clearColor(0, 0, 0, 0);
      return true;
    };

    if (!initGL()) {
      gl = null;
      ctx2d = canvas.getContext("2d");
    }

    const onLost = (e: Event) => {
      e.preventDefault();
      gl = null;
    };
    const onRestored = () => {
      if (!initGL()) gl = null;
    };
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    let W = 1;
    let H = 1;
    let dpr = 1;
    const chars = Array.from(word.querySelectorAll<HTMLElement>("[data-ch]"));
    let nat: { x: number; y: number; w: number }[] = [];

    const measure = () => {
      const sr = stage.getBoundingClientRect();
      W = Math.max(1, sr.width);
      H = Math.max(1, sr.height);
      const nextLayout: "portrait" | "landscape-short" | "wide" =
        H > W ? "portrait" : H <= 520 ? "landscape-short" : "wide";
      stage.setAttribute("data-layout", nextLayout);
      setLayoutMode((prev) => (prev === nextLayout ? prev : nextLayout));

      dpr = isHeadless ? 1 : Math.min(window.devicePixelRatio || 1, 2);
      const cw = Math.round(W * dpr);
      const ch = Math.round(H * dpr);
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }
      const saved = chars.map((c) => c.style.transform);
      chars.forEach((c) => (c.style.transform = "none"));
      nat = chars.map((c) => {
        const r = c.getBoundingClientRect();
        return {
          x: r.left + r.width / 2 - sr.left,
          y: r.top + r.height / 2 - sr.top,
          w: r.width,
        };
      });
      chars.forEach((c, i) => (c.style.transform = saved[i]));
    };

    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    measure();
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    const onFonts = () => measure();
    fonts?.addEventListener?.("loadingdone", onFonts);
    fonts?.ready.then(onFonts);

    const items = Array.from(stage.querySelectorAll<HTMLElement>("[data-sc]")).map(
      (el) => ({
        el,
        scene: Number(el.dataset.sc),
        fx: el.dataset.fx as Fx,
        delay: Number(el.dataset.d) || 0,
        last: -1,
      })
    );

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    let spin = 0;
    let spinVel = 0;
    let drag: { id: number; x: number } | null = null;

    const onMove = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      pointer.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
      if (drag && drag.id === e.pointerId) {
        spinVel += (e.clientX - drag.x) * 0.0022;
        drag.x = e.clientX;
      }
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      const t = e.target as HTMLElement;
      if (t.closest("a,button,input,select,.lys-shape-btn")) return;
      drag = { id: e.pointerId, x: e.clientX };
      stage.style.cursor = "grabbing";
    };

    const onUp = () => {
      drag = null;
      stage.style.cursor = "";
    };

    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);

    let raf = 0;
    let running = false;
    let visible = true;
    let last = performance.now();
    const born = last;
    let time = 0;
    let prog01 = -1;
    let shownScene = -1;

    const frame = (now: number) => {
      if (!running) return;
      if (isHeadless) {
        raf = window.setTimeout(
          () => requestAnimationFrame(frame),
          75
        ) as unknown as number;
      } else {
        raf = requestAnimationFrame(frame);
      }

      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const L = look.current;

      if (L.shape !== currentUploadedShape && meshCacheRef.current) {
        currentUploadedShape = L.shape;
        activeMesh = meshCacheRef.current[currentUploadedShape];
        uploadMeshToGL(activeMesh);
      }

      const moving = L.alive && !L.reduced && !isHeadless;
      if (moving) time += dt;

      const r = root.getBoundingClientRect();
      const p = progressFrom(r.top, r.height, H);
      prog01 =
        prog01 < 0 || L.reduced || isHeadless
          ? p
          : prog01 + (p - prog01) * (1 - Math.exp(-dt * 10));
      const coord = sceneCoord(prog01, SCENES, HOLD);
      const scene = Math.round(coord);
      if (scene !== shownScene) {
        shownScene = scene;
        setActiveScene(scene);
      }

      // True portrait vs short mobile landscape vs wide desktop
      const tall = H > W;
      const shortLandscape = !tall && H <= 520;
      const k = keyAt(coord, tall, shortLandscape);
      pointer.x += (pointer.tx - pointer.x) * (1 - Math.exp(-dt * 4));
      pointer.y += (pointer.ty - pointer.y) * (1 - Math.exp(-dt * 4));
      if (moving) {
        spin += spinVel + dt * 0.14;
        spinVel *= Math.exp(-dt * 3);
      } else {
        spin += spinVel;
        spinVel = 0;
      }

      const px = moving ? pointer.x : 0;
      const py = moving ? pointer.y : 0;
      const fov = (30 * Math.PI) / 180;
      const minDim = Math.min(W, H);
      const dist =
        (activeMesh.radius * H) / (k.size * minDim * Math.tan(fov / 2));
      const el = Math.max(-85, Math.min(86, k.el + py * 8)) * (Math.PI / 180);
      const eye: V3 = [
        HEART_CENTER[0],
        HEART_CENTER[1] + Math.sin(el) * dist,
        HEART_CENTER[2] + Math.cos(el) * dist,
      ];
      const proj = perspective(fov, W / H, Math.max(0.1, dist - 5), dist + 7);
      const vp = multiply(proj, lookAt(eye, HEART_CENTER));
      const model = multiply(
        rotY(k.spin + spin + px * 0.35),
        rotX(py * 0.06)
      );
      const intro = L.reduced || isHeadless ? 1 : clamp01((now - born) / 1400);
      const effectiveStack =
        L.forceStackView !== null ? (L.forceStackView ? 1 : 0) : k.stack;

      const gx = (0.5 + k.ox / 2) * W;
      const gy = (0.5 - k.oy / 2) * H;
      const gr = k.size * minDim * 0.95;
      glow.style.transform =
        "translate(" +
        (gx - gr).toFixed(1) +
        "px," +
        (gy - gr).toFixed(1) +
        "px)";
      glow.style.width = glow.style.height = (gr * 2).toFixed(1) + "px";

      if (gl && prog) {
        const g = gl;
        g.viewport(0, 0, canvas.width, canvas.height);
        g.clear(g.COLOR_BUFFER_BIT | g.DEPTH_BUFFER_BIT);
        g.uniformMatrix4fv(loc.u_vp, false, vp);
        g.uniformMatrix4fv(loc.u_model, false, model);
        g.uniform2f(loc.u_offset, k.ox, k.oy);
        g.uniform1f(loc.u_time, time);
        g.uniform1f(loc.u_intro, intro);
        g.uniform1f(loc.u_stack, effectiveStack);
        g.uniform1f(loc.u_sway, moving ? 1 : 0);
        g.uniform3f(loc.u_eye, eye[0], eye[1], eye[2]);
        g.drawElements(
          g.TRIANGLES,
          activeMesh.index.length,
          g.UNSIGNED_SHORT,
          0
        );
      } else if (ctx2d) {
        const c = ctx2d;
        const mvp = multiply(vp, model);
        c.setTransform(dpr, 0, 0, dpr, 0, 0);
        c.clearRect(0, 0, W, H);
        c.lineCap = "round";
        c.lineJoin = "round";
        for (const ring of activeMesh.outlineRings) {
          if (ring.panIndex > 0 && effectiveStack < 0.1) continue;
          c.beginPath();
          ring.pts.forEach((q, i) => {
            const y =
              q[1] +
              (ring.panIndex > 0 ? ring.panIndex * 0.34 * effectiveStack : 0);
            const cx = mvp[0] * q[0] + mvp[4] * y + mvp[8] * q[2] + mvp[12];
            const cy = mvp[1] * q[0] + mvp[5] * y + mvp[9] * q[2] + mvp[13];
            const cw = mvp[3] * q[0] + mvp[7] * y + mvp[11] * q[2] + mvp[15];
            const sx = ((cx / cw + k.ox) * 0.5 + 0.5) * W;
            const sy = (0.5 - (cy / cw + k.oy) * 0.5) * H;
            if (i === 0) c.moveTo(sx, sy);
            else c.lineTo(sx, sy);
          });
          c.closePath();
          c.fillStyle =
            ring.kind === 1
              ? "rgba(214, 220, 226, 0.85)"
              : "rgba(176, 184, 194, 0.75)";
          c.fill();
          c.lineWidth = ring.kind === 1 ? 3 : 1.5;
          c.strokeStyle = ring.kind === 1 ? "#FFFFFF" : "#6D7680";
          c.stroke();
        }
      }

      const still = L.reduced;
      for (const it of items) {
        const v = reveal(coord, it.scene, it.delay);
        const q = Math.round(v * 500) / 500;
        if (q === it.last) continue;
        it.last = q;
        const s = it.el.style;
        const dir = coord < it.scene ? 1 : -1;
        s.visibility = q <= 0 ? "hidden" : "";
        if (it.fx === "draw") {
          s.setProperty("--v", String(q));
          s.opacity = String(Math.min(1, q * 3));
          continue;
        }
        if (it.fx === "line") {
          s.transform = "scaleX(" + q + ")";
          s.opacity = String(Math.min(1, q * 2));
          continue;
        }
        s.opacity = String(q);
        if (still || it.fx === "fade") continue;
        if (it.fx === "clip") {
          const hid = ((1 - q) * 100).toFixed(1);
          s.clipPath =
            dir > 0 ? "inset(0 0 " + hid + "% 0)" : "inset(" + hid + "% 0 0 0)";
          s.transform =
            "translateY(" + ((1 - q) * 0.35 * dir).toFixed(3) + "em)";
        } else {
          s.transform =
            "translateY(" + ((1 - q) * 24 * dir).toFixed(1) + "px)";
        }
      }

      const m = easeInOut(clamp01(coord));
      const out = clamp01(coord - 1);
      const r1 = keyAt(1, tall, shortLandscape).size * minDim * 0.52;
      const cy1 = (0.5 - keyAt(1, tall, shortLandscape).oy / 2) * H;
      chars.forEach((c, i) => {
        const n0 = nat[i];
        if (!n0) return;
        const flank = i === firstIdx || i === lastIdx;
        if (flank && firstIdx !== lastIdx) {
          const side = i === firstIdx ? -1 : 1;
          const lw = n0.w;
          const tx = W / 2 + side * (r1 + lw * 0.55 + minDim * 0.025);
          const dx = (tx - n0.x) * m;
          const dy = (cy1 - n0.y) * m - out * 60;
          const o = coord < 1 ? 1 : 1 - smoothstep(0.1, 0.45, out);
          c.style.transform =
            "translate(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px)";
          c.style.opacity = String(o);
        } else {
          const dx = (W / 2 - n0.x) * m * 0.75;
          const dy = (cy1 - n0.y) * m;
          const o = 1 - smoothstep(0.0, 0.4, m);
          c.style.transform = still
            ? ""
            : "translate(" +
              dx.toFixed(1) +
              "px," +
              dy.toFixed(1) +
              "px) scale(" +
              (1 - m * 0.7).toFixed(3) +
              ")";
          c.style.opacity = String(o);
        }
        c.style.visibility = coord > 1.6 ? "hidden" : "";
      });
    };

    const start = () => {
      if (running || !visible || document.hidden) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
      clearTimeout(raf);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(root);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);
    start();

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      fonts?.removeEventListener?.("loadingdone", onFonts);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      const g = gl as WebGLRenderingContext | null;
      if (g) {
        g.deleteBuffer(vbo);
        g.deleteBuffer(ibo);
        g.deleteProgram(prog);
      }
    };
  }, [name, firstIdx, lastIdx]);

  const jump = (i: number) => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;
    const r = root.getBoundingClientRect();
    const travel = r.height - stage.clientHeight;
    const delta = (i / (SCENES - 1)) * travel + r.top;
    window.scrollBy({
      top: delta,
      behavior: reduced ? "auto" : "smooth",
    });
  };

  const display: React.CSSProperties = { fontFamily, fontWeight: 600 };
  const sans: React.CSSProperties = { fontFamily: SANS };
  const mono: React.CSSProperties = {
    fontFamily: MONO,
    fontVariantNumeric: "tabular-nums",
  };
  const hidden: React.CSSProperties = { opacity: 0 };

  const sizeInfoMap: Record<"18 cm" | "20 cm" | "22 cm", string> = {
    "18 cm": "Loyang Kecil · Cocok untuk mini cake & hantaran",
    "20 cm": "Loyang Sedang · Ukuran standar kue ulang tahun",
    "22 cm": "Loyang Besar · Base cake keluarga & acara",
  };

  return (
    <section
      ref={rootRef}
      id="panggung-3d"
      data-testid="fiinastore-3d-stage"
      data-active-scene={activeScene}
      data-active-shape={currentShape}
      className={"relative w-full " + className}
      style={{
        height:
          "calc(" +
          height +
          " * " +
          (1 + (SCENES - 1) * sceneScroll).toFixed(3) +
          ")",
        background: ink,
      }}
      aria-label={name + " 3D Loyang Showcase"}
    >
      <style>{CSS}</style>
      <div
        ref={stageRef}
        data-layout={layoutMode}
        className="lys-stage sticky top-12 md:top-14 w-full overflow-hidden select-none"
        style={
          {
            height,
            color: bone,
            background: ink,
            ["--lys-red" as string]: crimson,
          } as React.CSSProperties
        }
      >
        {/* Warm butter-cream studio vignette */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(110% 85% at 50% 44%, transparent 50%, #DFD1B8 100%)",
          }}
        />
        {/* Warm ambient studio glow tracking the 3D baking pan */}
        <div
          ref={glowRef}
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 rounded-full"
          style={{
            background:
              "radial-gradient(closest-side, rgba(212, 163, 115, 0.34), rgba(184, 74, 39, 0.08) 52%, transparent 100%)",
            willChange: "transform",
          }}
        />
        <canvas
          ref={canvasRef}
          data-testid="loyang-webgl-canvas"
          aria-hidden
          className="absolute inset-0 block"
          style={{ width: "100%", height: "100%", maxWidth: "none" }}
        />

        {/* ================================ 0 · PEMBUKA ================================ */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute flex items-start justify-between gap-4"
            style={{ left: "5cqw", right: "5cqw", top: "3.5cqh" }}
          >
            <div
              {...sc(0, "clip", 0)}
              style={{
                ...display,
                ...hidden,
                fontSize: "clamp(17px, 2.6cqw, 36px)",
                lineHeight: 0.94,
                letterSpacing: "-0.01em",
              }}
            >
              {name}
              <br />
              <span style={{ color: crimson, fontSize: "0.72em" }}>
                Cetakan Kue
              </span>
            </div>
            <p
              {...sc(0, "rise", 0.2)}
              className="lys-hide-md lys-hide-short lys-hide-portrait"
              style={{
                ...sans,
                ...hidden,
                maxWidth: "26cqw",
                fontSize: "clamp(11px, 0.95cqw, 13.5px)",
                lineHeight: 1.5,
                margin: 0,
                color: "#4A372D",
              }}
            >
              {desc}
            </p>
            <ul
              {...sc(0, "rise", 0.35)}
              className="lys-hide-md lys-hide-short lys-hide-portrait"
              style={{
                ...sans,
                ...hidden,
                listStyle: "none",
                margin: 0,
                padding: 0,
                fontSize: "clamp(11px, 0.92cqw, 13px)",
                lineHeight: 1.55,
                color: "#4A372D",
              }}
            >
              {specs.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            {/* Tagline visible on ALL devices (Portrait, Landscape, Desktop) so top-right is never empty */}
            <div
              {...sc(0, "clip", 0.45)}
              style={{
                ...display,
                ...hidden,
                fontSize: "clamp(14px, 2.2cqw, 32px)",
                lineHeight: 0.95,
                textAlign: "right",
              }}
            >
              Bentuk
              <br />
              Cinta,
              <br />
              <span style={{ color: crimson }}>Jadi Karya</span>
            </div>
          </div>

          {/* Portrait Spec Strip under top bar so mobile portrait has full product context */}
          <div
            {...sc(0, "rise", 0.25)}
            className="lys-only-portrait absolute items-center justify-between gap-2 px-3 py-1.5 rounded-lg border border-[#281C16]/12 bg-[#EFE6D4]/90"
            style={{
              ...sans,
              ...hidden,
              left: "5cqw",
              right: "5cqw",
              top: "12.5cqh",
              fontSize: 10.5,
              color: "#4A372D",
            }}
          >
            <span>Aluminium Berkualitas · Tinggi 5 cm</span>
            <span style={{ ...mono, color: crimson, fontWeight: 700 }}>
              18, 20, 22 cm
            </span>
          </div>

          <div
            ref={wordRef}
            className="lys-wordmark absolute whitespace-nowrap"
            style={{
              ...display,
              left: "50%",
              top: "71%",
              transform: "translate(-50%, -50%)",
              fontSize: "min(15.5cqw, 20cqh)",
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}
          >
            <span
              {...sc(0, "rise", 0.55)}
              style={{
                ...sans,
                ...hidden,
                position: "absolute",
                right: "0.08em",
                bottom: "96%",
                fontSize: "clamp(9px, 1.1cqw, 13.5px)",
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: crimson,
              }}
            >
              LOYANG LOVE SET ISI 3 · RP42.000
            </span>
            <h1 style={{ margin: 0, font: "inherit" }} aria-label={name}>
              {letters.map((c, i) => (
                <span
                  key={i}
                  data-ch
                  className="inline-block"
                  style={{ willChange: "transform" }}
                  aria-hidden
                >
                  <span
                    className="lys-char"
                    style={{ animationDelay: 0.1 + i * 0.055 + "s" }}
                  >
                    {c === " " ? "\u00A0" : c}
                  </span>
                </span>
              ))}
            </h1>
          </div>

          <div
            className="pointer-events-auto absolute flex flex-wrap items-center justify-between gap-2.5"
            style={{ left: "5cqw", right: "5cqw", bottom: "3cqh" }}
          >
            <div
              {...sc(0, "rise", 0.3)}
              className="flex items-center gap-2"
              style={hidden}
            >
              <PanMark color={bone} accent={crimson} />
              <div>
                <div
                  style={{
                    ...mono,
                    fontSize: "clamp(15px, 1.8cqw, 24px)",
                    fontWeight: 700,
                    lineHeight: 1.05,
                  }}
                >
                  Rp42.000
                </div>
                <div
                  className="lys-only-portrait text-[10px] text-[#5C463A]"
                  style={sans}
                >
                  Set Isi 3 · No Satuan
                </div>
              </div>
              <span
                className="lys-hide-portrait lys-hide-short"
                style={{
                  ...sans,
                  fontSize: 11,
                  lineHeight: 1.3,
                  color: "#5C463A",
                  borderBottom: "1px solid " + bone + "40",
                  paddingBottom: 4,
                  paddingRight: "1.5cqw",
                }}
              >
                Loyang Love Set Isi 3 (18, 20, 22 cm) · Tinggi 5 cm · No Satuan
              </span>
            </div>
            <div
              {...sc(0, "rise", 0.5)}
              className="flex items-center gap-2"
              style={{ ...sans, ...hidden }}
            >
              <button
                type="button"
                onClick={() => jump(2)}
                className="px-3 py-2 text-xs font-semibold border border-[#281C16]/25 rounded-md hover:border-[#281C16] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                style={{ background: "#EFE6D4", color: bone }}
              >
                Lihat 3 Ukuran
              </button>
              <button
                type="button"
                onClick={() => onAddToCart?.(FIINA_PRODUCTS[0], 1)}
                className="px-3 py-2 text-xs font-semibold text-[#FAF5EC] rounded-md transition-transform active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
                style={{ background: crimson }}
              >
                + Keranjang Set Love
              </button>
            </div>
          </div>
        </div>

        {/* ================================ 1 · TAMPAK ATAS ================================ */}
        <div className="pointer-events-none absolute inset-0">
          {/* Top Anatomy Header Card — keeps center 3D heart pan 100% unobstructed */}
          <div
            {...sc(1, "rise", 0.15)}
            className="pointer-events-auto absolute flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-[#281C16]/14 bg-[#F6EFE2]/92"
            style={{
              ...sans,
              ...hidden,
              left: "5cqw",
              right: "6cqw",
              top: "3.5cqh",
            }}
          >
            <div>
              <div
                style={{
                  ...mono,
                  fontSize: 10,
                  color: crimson,
                  fontWeight: 700,
                }}
              >
                02 · TAMPAK ATAS &amp; KONSTRUKSI LOYANG
              </div>
              <div
                style={{
                  ...display,
                  fontSize: "clamp(15px, 2cqw, 24px)",
                  lineHeight: 1.15,
                }}
              >
                Siluet Hati Simetris &amp; Bibir Lipat Rapi
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-[#4A372D]">
              <span className="px-2.5 py-1 rounded bg-[#EFE6D4] border border-[#281C16]/12">
                Tinggi 5 cm
              </span>
              <span className="px-2.5 py-1 rounded bg-[#EFE6D4] border border-[#281C16]/12">
                Sudut Rapat
              </span>
              <span className="lys-hide-short px-2.5 py-1 rounded bg-[#EFE6D4] border border-[#281C16]/12">
                Panas Merata
              </span>
            </div>
          </div>

          {/* Bottom Callout Bar — positioned cleanly below the 3D pan and flanking F / e */}
          <div
            {...sc(1, "rise", 0.45)}
            className="pointer-events-auto absolute flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-[#281C16]/14 bg-[#F6EFE2]/92"
            style={{
              ...sans,
              ...hidden,
              left: "5cqw",
              right: "6cqw",
              bottom: "3.5cqh",
              fontSize: 11.5,
            }}
          >
            <div className="text-[#4A372D]">
              <strong style={{ color: bone }}>
                Loyang Love Set Isi 3 (18, 20, 22 cm):
              </strong>{" "}
              Geser atau tarik loyang 3D di tengah untuk memutar sudut pandang.
            </div>
            <button
              type="button"
              onClick={() => jump(2)}
              className="px-3 py-1.5 text-xs font-semibold rounded-md text-[#FAF5EC] cursor-pointer whitespace-nowrap shrink-0"
              style={{ background: crimson }}
            >
              Lihat Susunan 3 Ukuran →
            </button>
          </div>
        </div>

        {/* ================================ 2 · SATU SET TIGA UKURAN ================================ */}
        <div className="pointer-events-none absolute inset-0">
          {/* WIDE & SHORT-LANDSCAPE LAYOUT: 3-column with open center for 3D pan */}
          <div
            className="lys-only-wide pointer-events-auto absolute items-center"
            style={{
              left: "5cqw",
              right: "6.5cqw",
              top: "8cqh",
              bottom: "8cqh",
              gridTemplateColumns: "1fr minmax(140px, 34cqw) 1fr",
              columnGap: "2.5cqw",
            }}
          >
            <div {...sc(2, "rise", 0.1)} style={hidden} className="space-y-2.5">
              <div
                style={{
                  ...mono,
                  fontSize: 10.5,
                  color: crimson,
                  fontWeight: 700,
                }}
              >
                03 · SATU SET, TIGA UKURAN
              </div>
              <h2
                style={{
                  ...display,
                  fontSize: "clamp(17px, 2.6cqw, 38px)",
                  lineHeight: 1.08,
                  margin: 0,
                }}
              >
                Tiga Ukuran Berjenjang dalam Satu Paket.
              </h2>
              <p
                className="lys-hide-short"
                style={{
                  ...sans,
                  fontSize: "clamp(11.5px, 0.98cqw, 14px)",
                  lineHeight: 1.55,
                  color: "#4A372D",
                  margin: 0,
                }}
              >
                Loyang Love dijual langsung per set isi 3 pcs (18 cm, 20 cm, dan
                22 cm, tidak dijual satuan). Saat tidak dipakai, ketiga loyang
                dapat ditumpuk menyatu sehingga hemat ruang lemari dapur.
              </p>
              <div
                style={{
                  ...mono,
                  fontSize: "clamp(15px, 1.8cqw, 24px)",
                  fontWeight: 700,
                  color: bone,
                }}
              >
                Rp42.000 / set{" "}
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: crimson,
                  }}
                >
                  · Isi 3 Pcs (No Satuan)
                </span>
              </div>
            </div>

            {/* Center 3D viewport column */}
            <div />

            <div
              {...sc(2, "rise", 0.25)}
              style={hidden}
              className="flex flex-col items-end text-right space-y-2"
            >
              <div
                className="lys-hide-short"
                style={{
                  ...sans,
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#5C463A",
                }}
              >
                RINCIAN UKURAN DALAM 1 SET
              </div>
              {(
                [
                  {
                    sz: "18 cm",
                    cap: "Loyang Kecil · Cocok untuk mini cake & hantaran",
                  },
                  {
                    sz: "20 cm",
                    cap: "Loyang Sedang · Ukuran standar kue ulang tahun",
                  },
                  {
                    sz: "22 cm",
                    cap: "Loyang Besar · Base cake keluarga & acara",
                  },
                ] as const
              ).map((item) => {
                const isSel = selectedSizePreview === item.sz;
                return (
                  <button
                    key={item.sz}
                    type="button"
                    onClick={() => setSelectedSizePreview(item.sz)}
                    className="lys-short-compact w-full max-w-xs text-right p-2.5 rounded-lg border transition-colors cursor-pointer"
                    style={{
                      background: isSel ? "#EFE5D2" : "rgba(246,239,226,0.88)",
                      borderColor: isSel ? crimson : "rgba(40,28,22,0.14)",
                    }}
                  >
                    <div
                      style={{
                        ...mono,
                        fontSize: 13,
                        fontWeight: 600,
                        color: isSel ? crimson : bone,
                      }}
                    >
                      Diameter {item.sz} · Tinggi 5 cm
                    </div>
                    <div
                      className="lys-hide-short"
                      style={{
                        ...sans,
                        fontSize: 11,
                        color: "#5C463A",
                        marginTop: 2,
                      }}
                    >
                      {item.cap}
                    </div>
                  </button>
                );
              })}
              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setForceStackView((v) => (v === null ? false : !v))
                  }
                  className="px-3 py-1.5 text-xs font-medium border border-[#281C16]/25 rounded-md hover:border-[#281C16] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  style={{ ...sans, background: "#EFE6D4" }}
                >
                  {forceStackView === false
                    ? "Tampilkan 3 Ukuran"
                    : "Gabung / Pisah"}
                </button>
                <button
                  type="button"
                  onClick={() => onAddToCart?.(FIINA_PRODUCTS[0], 1)}
                  className="px-3 py-1.5 text-xs font-semibold text-[#FAF5EC] rounded-md transition-transform active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
                  style={{ ...sans, background: crimson }}
                >
                  + Tambah Set Love
                </button>
              </div>
            </div>
          </div>

          {/* MOBILE PORTRAIT LAYOUT: Top Header + Clear Middle 3D Zone + Bottom Compact Card */}
          <div
            className="lys-only-portrait pointer-events-auto absolute inset-x-0 inset-y-0 flex-col justify-between"
            style={{
              padding: "3cqh 5cqw",
            }}
          >
            {/* Top summary */}
            <div
              {...sc(2, "rise", 0.08)}
              style={{
                ...hidden,
                background: "rgba(246, 239, 226, 0.92)",
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid rgba(40,28,22,0.14)",
              }}
            >
              <div
                style={{
                  ...mono,
                  fontSize: 10,
                  color: crimson,
                  fontWeight: 700,
                }}
              >
                03 · SATU SET, TIGA UKURAN · RP42.000 (NO SATUAN)
              </div>
              <div
                style={{
                  ...display,
                  fontSize: "clamp(17px, 4.8cqw, 23px)",
                  lineHeight: 1.15,
                  marginTop: 2,
                }}
              >
                Tiga Ukuran Berjenjang dalam Satu Paket
              </div>
            </div>

            {/* Bottom segmented size selector & CTA */}
            <div
              {...sc(2, "rise", 0.22)}
              style={{
                ...hidden,
                background: "rgba(246, 239, 226, 0.95)",
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid rgba(40,28,22,0.15)",
              }}
              className="space-y-2"
            >
              <div className="grid grid-cols-3 gap-1.5">
                {(["18 cm", "20 cm", "22 cm"] as const).map((sz) => {
                  const isSel = selectedSizePreview === sz;
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSizePreview(sz)}
                      className="py-1.5 px-2 rounded-md border text-center cursor-pointer transition-colors"
                      style={{
                        ...mono,
                        fontSize: 12,
                        fontWeight: 600,
                        background: isSel ? crimson : "#EFE6D4",
                        color: isSel ? "#FAF5EC" : bone,
                        borderColor: isSel ? crimson : "rgba(40,28,22,0.15)",
                      }}
                    >
                      Ø {sz}
                    </button>
                  );
                })}
              </div>
              <div
                style={{ ...sans, fontSize: 11.5, color: "#4A372D" }}
                className="text-center"
              >
                <strong style={{ color: bone }}>
                  Diameter {selectedSizePreview} · Tinggi 5 cm:
                </strong>{" "}
                {sizeInfoMap[selectedSizePreview]}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    setForceStackView((v) => (v === null ? false : !v))
                  }
                  className="flex-1 py-2 text-xs font-semibold border border-[#281C16]/25 rounded-md cursor-pointer"
                  style={{ ...sans, background: "#EFE6D4", color: bone }}
                >
                  Gabung / Pisah 3D
                </button>
                <button
                  type="button"
                  onClick={() => onAddToCart?.(FIINA_PRODUCTS[0], 1)}
                  className="flex-1 py-2 text-xs font-semibold text-[#FAF5EC] rounded-md cursor-pointer"
                  style={{ ...sans, background: crimson }}
                >
                  + Set Love (Rp42rb)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ============================== 3 · EKSPLORASI BENTUK ============================== */}
        <div
          id="eksplorasi-bentuk"
          className="pointer-events-none absolute inset-0"
          style={display}
        >
          {/* WIDE & SHORT-LANDSCAPE LAYOUT: Left 3 shapes, Open 3D Center, Right 3 shapes + Horizontal Bottom Bar */}
          <div
            className="lys-only-wide pointer-events-auto absolute items-center"
            style={{
              left: "5cqw",
              right: "6.5cqw",
              top: "6cqh",
              bottom: "24cqh",
              gridTemplateColumns: "1fr minmax(180px, 34cqw) 1fr",
              columnGap: "2cqw",
            }}
          >
            <div className="relative flex flex-col gap-[2cqh]">
              {SHAPE_OPTIONS_LEFT.map((opt, idx) => {
                const isSelected = currentShape === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    {...sc(3, "clip", idx * 0.12)}
                    style={{
                      ...hidden,
                      textAlign: "left",
                      background: "none",
                      border: 0,
                      padding: "4px 0",
                      color: isSelected ? crimson : bone,
                    }}
                    onClick={() => handleSelectShape(opt.id)}
                    className="lys-shape-btn group"
                  >
                    <div
                      className="lys-hide-short"
                      style={{
                        ...mono,
                        fontSize: 10,
                        letterSpacing: "0.12em",
                        opacity: 0.75,
                      }}
                    >
                      {opt.code} · {opt.sub}
                    </div>
                    <div
                      style={{
                        ...display,
                        fontSize: "min(3.5cqw, 4.6cqh)",
                        lineHeight: 1.05,
                      }}
                    >
                      {opt.title}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Open 3D Center Column — completely unobstructed */}
            <div />

            <div className="relative flex flex-col items-end gap-[2cqh] text-right">
              {SHAPE_OPTIONS_RIGHT.map((opt, idx) => {
                const isSelected = currentShape === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    {...sc(3, "clip", 0.1 + idx * 0.12)}
                    style={{
                      ...hidden,
                      textAlign: "right",
                      background: "none",
                      border: 0,
                      padding: "4px 0",
                      color: isSelected ? crimson : bone,
                    }}
                    onClick={() => handleSelectShape(opt.id)}
                    className="lys-shape-btn group"
                  >
                    <div
                      className="lys-hide-short"
                      style={{
                        ...mono,
                        fontSize: 10,
                        letterSpacing: "0.12em",
                        opacity: 0.75,
                      }}
                    >
                      {opt.sub} · {opt.code}
                    </div>
                    <div
                      style={{
                        ...display,
                        fontSize: "min(3.5cqw, 4.6cqh)",
                        lineHeight: 1.05,
                      }}
                    >
                      {opt.title}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Horizontal Bottom Inspector Bar for Wide & Short-Landscape (never overlaps center 3D pan) */}
          <div
            {...sc(3, "rise", 0.3)}
            className="lys-only-wide-flex pointer-events-auto absolute items-center justify-between gap-4 px-4 py-2.5 rounded-xl border border-[#281C16]/15 bg-[#F6EFE2]/95"
            style={{
              ...sans,
              ...hidden,
              left: "5cqw",
              right: "6.5cqw",
              bottom: "3.5cqh",
              maxWidth: 680,
              margin: "0 auto",
            }}
          >
            <div className="min-w-0">
              <div
                className="lys-hide-short"
                style={{
                  ...mono,
                  fontSize: 9.5,
                  letterSpacing: "0.1em",
                  color: crimson,
                  fontWeight: 700,
                }}
              >
                04 · KLIK NAMA BENTUK UNTUK UBAH MODEL 3D
              </div>
              <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                <span
                  style={{
                    ...display,
                    fontSize: "clamp(14px, 1.6cqw, 20px)",
                  }}
                >
                  {activeProduct.name}
                </span>
                <span
                  style={{
                    ...mono,
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: crimson,
                  }}
                >
                  {formatRupiah(activeProduct.price)} / set
                </span>
                <span className="text-xs text-[#5C463A]">
                  ({activeProduct.sizes.join(", ")})
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onAddToCart?.(activeProduct, 1)}
              className="px-3.5 py-2 text-xs font-semibold text-[#FAF5EC] rounded-md cursor-pointer whitespace-nowrap shrink-0"
              style={{ ...sans, background: crimson }}
            >
              + Tambah {activeProduct.shortName}
            </button>
          </div>

          {/* MOBILE PORTRAIT LAYOUT: Top active shape header + Open 3D center + Bottom 2x3 shape grid */}
          <div
            className="lys-only-portrait pointer-events-auto absolute inset-x-0 inset-y-0 flex-col justify-between"
            style={{ padding: "3cqh 5cqw" }}
          >
            <div
              {...sc(3, "rise", 0.08)}
              style={{
                ...hidden,
                background: "rgba(246, 239, 226, 0.92)",
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid rgba(40,28,22,0.14)",
              }}
            >
              <div
                style={{
                  ...mono,
                  fontSize: 10,
                  color: crimson,
                  fontWeight: 700,
                }}
              >
                04 · PILIH BENTUK CETAKAN 3D
              </div>
              <div
                style={{
                  ...display,
                  fontSize: "clamp(16px, 4.6cqw, 22px)",
                  lineHeight: 1.15,
                  marginTop: 2,
                }}
              >
                {activeProduct.name}
              </div>
              <div
                style={{
                  ...mono,
                  fontSize: 12,
                  color: "#4A372D",
                  marginTop: 2,
                }}
              >
                {formatRupiah(activeProduct.price)} / set ·{" "}
                {activeProduct.sizes.join(", ")}
              </div>
            </div>

            <div
              {...sc(3, "rise", 0.22)}
              style={{
                ...hidden,
                background: "rgba(246, 239, 226, 0.95)",
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(40,28,22,0.15)",
              }}
              className="space-y-2"
            >
              <div className="grid grid-cols-2 gap-1.5">
                {ALL_STAGE_SHAPES.map((s) => {
                  const active = currentShape === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleSelectShape(s.id)}
                      className="px-2.5 py-1.5 rounded-md text-left border transition-colors cursor-pointer"
                      style={{
                        ...sans,
                        background: active ? crimson : "#EFE6D4",
                        color: active ? "#FAF5EC" : bone,
                        borderColor: active
                          ? crimson
                          : "rgba(40, 28, 22, 0.14)",
                      }}
                    >
                      <div className="text-[11px] font-bold leading-tight truncate">
                        {s.title}
                      </div>
                      <div
                        style={mono}
                        className={`text-[10px] mt-0.5 ${
                          active ? "text-[#FAF5EC]/90" : "text-[#5C463A]"
                        }`}
                      >
                        {formatRupiah(s.price)}/set
                      </div>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => onAddToCart?.(activeProduct, 1)}
                className="w-full py-2 text-xs font-semibold text-[#FAF5EC] rounded-md cursor-pointer"
                style={{ ...sans, background: "#281C16" }}
              >
                + Tambah {activeProduct.shortName} (
                {formatRupiah(activeProduct.price)})
              </button>
            </div>
          </div>
        </div>

        {/* ================================ 4 · KREASI BAKING =============================== */}
        <div className="pointer-events-none absolute inset-0" style={display}>
          {/* Wide & Short-Landscape Left Block */}
          <div
            className="lys-only-wide-block lys-s4-left pointer-events-auto absolute"
            style={{
              left: "5cqw",
              top: "14cqh",
              maxWidth: "46cqw",
            }}
          >
            <div
              {...sc(4, "fade", 0.05)}
              style={{
                ...mono,
                ...hidden,
                fontSize: 10.5,
                letterSpacing: "0.14em",
                color: crimson,
                fontWeight: 700,
                marginBottom: "1cqh",
              }}
            >
              05 · DARI CETAKAN KE MEJA SAJI
            </div>
            <div
              style={{
                fontSize: "min(6cqw, 8.8cqh)",
                lineHeight: 0.94,
              }}
            >
              {tagline.map((t, i) => (
                <div
                  key={i}
                  {...sc(4, "clip", i * 0.12)}
                  style={{
                    ...hidden,
                    fontSize: t.small ? "0.45em" : undefined,
                    lineHeight: t.small ? 1.15 : undefined,
                    color: t.small ? crimson : bone,
                    marginLeft: t.small ? "2em" : i > 1 ? "0.2em" : 0,
                    marginTop: t.small ? "0.08em" : 0,
                    marginBottom: t.small ? "0.18em" : 0,
                  }}
                >
                  {t.text}
                </div>
              ))}
            </div>

            <div
              {...sc(4, "rise", 0.5)}
              className="lys-hide-short mt-4 grid grid-cols-2 gap-3"
              style={{ ...sans, ...hidden, maxWidth: 460 }}
            >
              <div className="p-3 rounded-lg bg-[#EFE6D4] border border-[#281C16]/12">
                <div className="text-xs font-semibold text-[#281C16]">
                  Panas Merata &amp; Tidak Lengket
                </div>
                <div className="text-[11px] text-[#5C463A] mt-0.5">
                  Cocok untuk kue ulang tahun, tart, bolu panggang, brownies
                  kukus, hingga puding &amp; agar-agar.
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[#EFE6D4] border border-[#281C16]/12">
                <div className="text-xs font-semibold text-[#281C16]">
                  Tebal, Kokoh &amp; Awet
                </div>
                <div className="text-[11px] text-[#5C463A] mt-0.5">
                  Tepi lipat rapi aman di tangan, sambungan rapat tidak bocor
                  untuk adonan cair.
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Portrait Top + Bottom Cards for Frame 4 (3D pan sits cleanly in the middle) */}
          <div
            className="lys-only-portrait pointer-events-auto absolute inset-x-0 inset-y-0 flex-col justify-between"
            style={{ padding: "3cqh 5cqw" }}
          >
            <div
              {...sc(4, "rise", 0.08)}
              style={{
                ...hidden,
                background: "rgba(246, 239, 226, 0.92)",
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid rgba(40,28,22,0.14)",
              }}
            >
              <div
                style={{
                  ...mono,
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  color: crimson,
                  fontWeight: 700,
                }}
              >
                05 · DARI CETAKAN KE MEJA SAJI
              </div>
              <div
                style={{
                  ...display,
                  fontSize: "clamp(18px, 5.2cqw, 25px)",
                  lineHeight: 1.08,
                  marginTop: 3,
                }}
              >
                Panggang lebih merata,{" "}
                <span style={{ color: crimson }}>hasil kue lebih istimewa.</span>
              </div>
            </div>

            <div
              {...sc(4, "rise", 0.22)}
              style={{
                ...hidden,
                background: "rgba(246, 239, 226, 0.95)",
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid rgba(40,28,22,0.15)",
              }}
              className="space-y-2.5"
            >
              <div
                style={sans}
                className="grid grid-cols-2 gap-2 text-left"
              >
                <div className="p-2.5 rounded-lg bg-[#EFE6D4] border border-[#281C16]/12">
                  <div className="text-[11px] font-bold text-[#281C16]">
                    Panas Merata
                  </div>
                  <div className="text-[10.5px] text-[#5C463A] mt-0.5 leading-snug">
                    Bolu, tart, brownies &amp; puding matang sempurna.
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#EFE6D4] border border-[#281C16]/12">
                  <div className="text-[11px] font-bold text-[#281C16]">
                    Lipatan Rapi
                  </div>
                  <div className="text-[10.5px] text-[#5C463A] mt-0.5 leading-snug">
                    Tepi halus aman di tangan &amp; sudut rapat.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => jump(5)}
                className="w-full py-2 text-xs font-semibold text-[#FAF5EC] rounded-md cursor-pointer"
                style={{ ...sans, background: crimson }}
              >
                Lanjut ke Pilihan Paket &amp; Checkout →
              </button>
            </div>
          </div>
        </div>

        {/* ============================== 5 · BELANJA SET & CHECKOUT ============================== */}
        <div className="pointer-events-none absolute inset-0" style={display}>
          {/* Mobile Portrait Top Quick Shape Switcher so Portrait Scene 5 has no empty top gap */}
          <div
            {...sc(5, "rise", 0.08)}
            className="lys-only-portrait pointer-events-auto absolute flex-col gap-1.5"
            style={{
              ...sans,
              ...hidden,
              left: "4cqw",
              right: "4cqw",
              top: "2.8cqh",
              background: "rgba(246, 239, 226, 0.92)",
              padding: "9px 12px",
              borderRadius: 10,
              border: "1px solid rgba(40,28,22,0.14)",
            }}
          >
            <div
              style={{
                ...mono,
                fontSize: 9.5,
                color: crimson,
                fontWeight: 700,
              }}
            >
              06 · PILIH CEPAT SET LOYANG &amp; CHECKOUT
            </div>
            <div className="grid grid-cols-3 gap-1">
              {ALL_STAGE_SHAPES.map((s) => {
                const active = currentShape === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelectShape(s.id)}
                    className="px-2 py-1 rounded text-[10px] font-semibold border truncate cursor-pointer"
                    style={{
                      background: active ? crimson : "#EFE6D4",
                      color: active ? "#FAF5EC" : bone,
                      borderColor: active ? crimson : "rgba(40,28,22,0.14)",
                    }}
                  >
                    {s.title.split(" ")[0]} · {s.price / 1000}rb
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className="lys-fin-wrap absolute flex items-center justify-between gap-6"
            style={{
              left: "4cqw",
              right: "5.5cqw",
              bottom: "9.5cqh",
            }}
          >
            {/* Contiguous Purchase Module — Constrained to 100% width so it never overflows mobile */}
            <div
              {...sc(5, "rise", 0.15)}
              className="lys-fin-card pointer-events-auto w-full max-w-xl p-3.5 sm:p-5 rounded-xl border border-[#281C16]/15 bg-[#EFE6D4] box-border"
              style={{ ...sans, ...hidden }}
            >
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[#5C463A]">
                <span>{activeProduct.setCountLabel}</span>
                <span aria-hidden="true">·</span>
                <span>Tinggi {activeProduct.heightCm}</span>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-[#B84A27]">
                  {activeProduct.purchaseRuleLabel}
                </span>
              </div>
              <h3
                style={{
                  ...display,
                  fontSize: "clamp(16px, 2cqw, 26px)",
                  marginTop: 2,
                  marginBottom: 2,
                  lineHeight: 1.15,
                }}
              >
                {activeProduct.name}
              </h3>
              <p className="lys-hide-short text-xs text-[#4A372D] leading-relaxed">
                Ukuran dalam paket:{" "}
                <strong className="text-[#281C16]">
                  {activeProduct.sizes.join(" · ")}
                </strong>
                . Pilih jumlah set untuk masuk ke keranjang atau simulasi
                checkout.
              </p>

              <div className="mt-2.5 pt-2.5 border-t border-[#281C16]/12 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center justify-between sm:block whitespace-nowrap">
                  <div className="text-[10.5px] text-[#5C463A]">Harga Paket</div>
                  <div
                    style={{
                      ...mono,
                      fontSize: "clamp(16px, 1.8cqw, 24px)",
                      fontWeight: 700,
                      color: bone,
                    }}
                  >
                    {formatRupiah(activeProduct.price * stageQty)}
                    <span className="text-[11px] font-normal text-[#5C463A] ml-1">
                      ({stageQty} {activeProduct.unit})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-nowrap">
                  <div className="flex items-center border border-[#281C16]/25 rounded-md bg-[#F6EFE2] shrink-0">
                    <button
                      type="button"
                      aria-label="Kurangi jumlah set"
                      onClick={() => setStageQty((q) => Math.max(1, q - 1))}
                      className="px-2 py-1 text-sm font-bold hover:bg-[#281C16]/10 cursor-pointer"
                    >
                      −
                    </button>
                    <span
                      style={mono}
                      className="px-2 py-1 text-xs font-semibold"
                    >
                      {stageQty}
                    </span>
                    <button
                      type="button"
                      aria-label="Tambah jumlah set"
                      onClick={() => setStageQty((q) => q + 1)}
                      className="px-2 py-1 text-sm font-bold hover:bg-[#281C16]/10 cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onAddToCart?.(activeProduct, stageQty);
                    }}
                    className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold text-[#FAF5EC] rounded-md transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
                    style={{ background: crimson }}
                  >
                    + Keranjang
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onAddToCart?.(activeProduct, stageQty);
                      onOpenCheckout?.();
                    }}
                    className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold text-[#FAF5EC] bg-[#281C16] hover:bg-[#3B2A22] rounded-md transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Checkout
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Set Price Table on Right (Wide Desktop only) */}
            <div
              {...sc(5, "rise", 0.3)}
              className="pointer-events-auto lys-hide-md lys-hide-short lys-hide-portrait flex-1 max-w-md p-5 rounded-xl border border-[#281C16]/15 bg-[#F6EFE2]/95"
              style={{ ...sans, ...hidden }}
            >
              <div className="text-xs font-semibold text-[#5C463A] mb-2">
                DAFTAR HARGA SET POPULER FIINASTORE
              </div>
              <div className="space-y-1.5 text-xs">
                {ALL_STAGE_SHAPES.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-1 border-b border-[#281C16]/10"
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectShape(item.id)}
                      className="text-left font-medium hover:text-[#B84A27] transition-colors cursor-pointer"
                    >
                      {item.title}{" "}
                      <span className="text-[#5C463A] font-normal">
                        ({item.sub})
                      </span>
                    </button>
                    <span style={mono} className="font-semibold">
                      {formatRupiah(item.price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            {...sc(5, "rise", 0.55)}
            className="pointer-events-auto absolute flex items-center justify-between gap-2"
            style={{
              ...sans,
              ...hidden,
              left: "4cqw",
              right: "5.5cqw",
              bottom: "2.2cqh",
              fontSize: "clamp(10px, 1.1cqw, 13.5px)",
              color: bone,
            }}
          >
            <button
              type="button"
              onClick={onScrollToCatalog}
              className="font-semibold hover:text-[#B84A27] transition-colors cursor-pointer truncate"
            >
              ↓ LIHAT KATALOG LENGKAP (11)
            </button>
            <div className="lys-hide-portrait lys-hide-short">
              <PanMark color={crimson} accent={bone} />
            </div>
            <button
              type="button"
              onClick={onOpenCheckout}
              className="font-semibold hover:text-[#B84A27] transition-colors cursor-pointer truncate"
            >
              KERANJANG &amp; CHECKOUT →
            </button>
          </div>
        </div>

        {/* ================================== NAV ================================== */}
        <nav
          aria-label="Navigasi Frame Panggung 3D"
          className="lys-nav pointer-events-auto absolute flex flex-col items-end"
          style={{
            ...sans,
            right: "1.6cqw",
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          {NAV.map((n, i) => (
            <button
              key={n}
              type="button"
              onClick={() => jump(i)}
              aria-current={activeScene === i ? "step" : undefined}
            >
              <span className="lys-lab">
                {String(i + 1).padStart(2, "0")} {n}
              </span>
              <span className="lys-tick" />
            </button>
          ))}
        </nav>
      </div>
    </section>
  );
}

/** Fiinastore Heart-Pan Emblem Mark */
function PanMark({ color, accent }: { color: string; accent: string }) {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 40 40"
      aria-hidden
      style={{ flex: "none" }}
    >
      <path
        d="M20 33 C 12 27, 5 20, 5 13 C 5 8, 9 5, 14 5 C 17 5, 19 7, 20 9 C 21 7, 23 5, 26 5 C 31 5, 35 8, 35 13 C 35 20, 28 27, 20 33 Z"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M20 28 C 14 23, 9 18, 9 13.5 C 9 10.5, 11.5 8.5, 14.5 8.5 C 17 8.5, 18.8 10, 20 11.8 C 21.2 10, 23 8.5, 25.5 8.5 C 28.5 8.5, 31 10.5, 31 13.5 C 31 18, 26 23, 20 28 Z"
        fill="none"
        stroke={accent}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
