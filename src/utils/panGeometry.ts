export type V3 = [number, number, number];
export type StageShape = "love" | "bulat" | "segi" | "bronis" | "rigi" | "pai";

export const PAN_STRIDE = 10; // pos(3), normal(3), u(1), panIndex(1), partKind(1), radial(1)

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const norm = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

/**
 * Parametric 2D point [x, z] on the perimeter of a baking pan shape for angle t in [0, 2*PI).
 * Normalized so max radius is roughly ~1.05 for the 22cm pan.
 */
export function shapePerimeterPoint(
  shape: StageShape,
  t: number
): { x: number; z: number } {
  if (shape === "love") {
    // Classic symmetric heart cake pan silhouette
    // t = 0 is top cleft, t = PI is bottom point
    const x = 0.96 * Math.pow(Math.sin(t), 3);
    const z = -(
      0.78 * Math.cos(t) -
      0.31 * Math.cos(2 * t) -
      0.12 * Math.cos(3 * t) -
      0.04 * Math.cos(4 * t)
    );
    return { x, z: z - 0.08 };
  }

  if (shape === "bulat") {
    return { x: Math.sin(t) * 0.96, z: Math.cos(t) * 0.96 };
  }

  if (shape === "pai") {
    // Round shallow tart pan with 28 crimped fluted waves around the perimeter
    const flutes = 28;
    const r = 0.96 + 0.042 * Math.cos(flutes * t);
    return { x: Math.sin(t) * r, z: Math.cos(t) * r };
  }

  // Superellipse helper for rounded-corner rectangular/square pans
  const rectPoint = (halfW: number, halfD: number, cornerRadius: number) => {
    // Map angle t around a rounded rectangle perimeter
    const cx = Math.sin(t);
    const cz = Math.cos(t);
    const p = cornerRadius; // exponent for superellipse (higher = sharper folded corner)
    const ax = Math.abs(cx);
    const az = Math.abs(cz);
    const denom = Math.pow( Math.pow(ax, p) + Math.pow(az, p), 1 / p ) || 1;
    const x = Math.sign(cx) * (ax / denom) * halfW;
    const z = Math.sign(cz) * (az / denom) * halfD;
    return { x, z };
  };

  if (shape === "segi") {
    return rectPoint(0.88, 0.88, 12);
  }

  if (shape === "bronis") {
    // Rectangular brownie loaf pan (longer X, narrower Z)
    return rectPoint(1.08, 0.64, 12);
  }

  // "rigi" — Rectangular brownie / agar loaf pan with vertical corrugated flutes along the walls
  const base = rectPoint(1.08, 0.66, 10);
  const fluteWave = 0.028 * Math.sin(36 * t);
  const len = Math.hypot(base.x, base.z) || 1;
  return {
    x: base.x + (base.x / len) * fluteWave,
    z: base.z + (base.z / len) * fluteWave,
  };
}

export interface PanMeshData {
  data: Float32Array;
  index: Uint16Array;
  vertices: number;
  radius: number;
  outlineRings: { pts: V3[]; panIndex: number; kind: number }[];
}

/**
 * Builds a 3-pan nested set (22cm = panIndex 0, 20cm = panIndex 1, 18cm = panIndex 2)
 * with double-sided walls, rolled top bead rim, pressed bottom plate, and optional ring handles.
 */
export function buildPanSetMesh(shape: StageShape): PanMeshData {
  const v: number[] = [];
  const idx: number[] = [];
  const outlineRings: { pts: V3[]; panIndex: number; kind: number }[] = [];
  let count = 0;

  const push = (
    p: V3,
    n: V3,
    u: number,
    panIndex: number,
    partKind: number,
    radial: number
  ) => {
    v.push(
      p[0],
      p[1],
      p[2],
      n[0],
      n[1],
      n[2],
      u,
      panIndex,
      partKind,
      radial
    );
    return count++;
  };

  // Three nested sizes: 22cm (1.0), 20cm (0.87), 18cm (0.74)
  const panScales = [1.0, 0.86, 0.72];
  const segs = shape === "rigi" || shape === "pai" ? 168 : 112;
  const baseHeight = shape === "pai" ? 0.24 : 0.44;
  const wallFlare = shape === "pai" ? 1.12 : 1.03; // slight draft angle so pans nest cleanly
  const wallThick = 0.032;

  for (let panIdx = 0; panIdx < 3; panIdx++) {
    const scale = panScales[panIdx];
    const h = baseHeight * (0.94 + 0.06 * scale);
    const yBottom = -h * 0.5;
    const yTop = h * 0.5;

    const perimeter: { x: number; z: number; nx: number; nz: number; u: number }[] = [];
    for (let i = 0; i <= segs; i++) {
      const u = i / segs;
      const t = u * Math.PI * 2;
      const p0 = shapePerimeterPoint(shape, t);
      const dt = 0.025;
      // Avoid crossing the sharp heart cusps at t=0 and t=PI when taking tangent differences
      const pPrev = shapePerimeterPoint(shape, t - dt);
      const pNext = shapePerimeterPoint(shape, t + dt);
      let tx = pNext.x - pPrev.x;
      let tz = pNext.z - pPrev.z;
      const len = Math.hypot(tx, tz);
      let nx = len > 1e-4 ? tz / len : 0;
      let nz = len > 1e-4 ? -tx / len : -1;

      if (shape === "love") {
        // At top cleft (t ~ 0 or 2*PI), normal points inward/upward (-Z); at bottom tip (t ~ PI), normal points +Z
        const distToZero = Math.min(t, Math.PI * 2 - t);
        const distToPi = Math.abs(t - Math.PI);
        if (distToZero < 0.14) {
          const w = 1 - distToZero / 0.14;
          nx = nx * (1 - w);
          nz = nz * (1 - w) + -1 * w;
          const l = Math.hypot(nx, nz) || 1;
          nx /= l;
          nz /= l;
        } else if (distToPi < 0.14) {
          const w = 1 - distToPi / 0.14;
          nx = nx * (1 - w);
          nz = nz * (1 - w) + 1 * w;
          const l = Math.hypot(nx, nz) || 1;
          nx /= l;
          nz /= l;
        }
      }

      perimeter.push({
        x: p0.x * scale,
        z: p0.z * scale,
        nx,
        nz,
        u,
      });
    }

    // Save 2D fallback contour rings
    const topContour: V3[] = [];
    const botContour: V3[] = [];
    for (let i = 0; i <= segs; i += 2) {
      const pm = perimeter[i];
      topContour.push([pm.x * wallFlare, yTop, pm.z * wallFlare]);
      botContour.push([pm.x, yBottom, pm.z]);
    }
    outlineRings.push({ pts: topContour, panIndex: panIdx, kind: 1 });
    outlineRings.push({ pts: botContour, panIndex: panIdx, kind: 0 });

    // 1. Outer Wall & Inner Wall
    const outerBotRow: number[] = [];
    const outerTopRow: number[] = [];
    const innerBotRow: number[] = [];
    const innerTopRow: number[] = [];

    for (let i = 0; i <= segs; i++) {
      const pm = perimeter[i];
      const oxBot = pm.x;
      const ozBot = pm.z;
      const oxTop = pm.x * wallFlare;
      const ozTop = pm.z * wallFlare;

      const ixBot = oxBot - pm.nx * wallThick;
      const izBot = ozBot - pm.nz * wallThick;
      const ixTop = oxTop - pm.nx * wallThick;
      const izTop = ozTop - pm.nz * wallThick;

      const outN: V3 = norm([pm.nx, 0.08, pm.nz]);
      const inN: V3 = norm([-pm.nx, 0.12, -pm.nz]);

      outerBotRow.push(push([oxBot, yBottom, ozBot], outN, pm.u, panIdx, 0, 1.0));
      outerTopRow.push(push([oxTop, yTop, ozTop], outN, pm.u, panIdx, 0, 1.0));

      innerBotRow.push(
        push([ixBot, yBottom + 0.018, izBot], inN, pm.u, panIdx, 0, 0.92)
      );
      innerTopRow.push(push([ixTop, yTop, izTop], inN, pm.u, panIdx, 0, 0.92));
    }

    for (let i = 0; i < segs; i++) {
      // Outer wall quad
      idx.push(
        outerBotRow[i],
        outerBotRow[i + 1],
        outerTopRow[i],
        outerBotRow[i + 1],
        outerTopRow[i + 1],
        outerTopRow[i]
      );
      // Inner wall quad (reversed winding)
      idx.push(
        innerBotRow[i],
        innerTopRow[i],
        innerBotRow[i + 1],
        innerBotRow[i + 1],
        innerTopRow[i],
        innerTopRow[i + 1]
      );
    }

    // 2. Rolled Top Rim / Wire Bead (6-sided tube around top edge)
    const rimTubeSegs = 6;
    const rimRadius = 0.028;
    const rimRings: number[][] = [];
    for (let i = 0; i <= segs; i++) {
      const pm = perimeter[i];
      const cx = (pm.x * wallFlare - pm.nx * (wallThick * 0.35));
      const cz = (pm.z * wallFlare - pm.nz * (wallThick * 0.35));
      const ring: number[] = [];
      for (let r = 0; r <= rimTubeSegs; r++) {
        const a = (r / rimTubeSegs) * Math.PI * 2;
        const cosA = Math.cos(a);
        const sinA = Math.sin(a);
        const px = cx + pm.nx * cosA * rimRadius;
        const py = yTop + sinA * rimRadius;
        const pz = cz + pm.nz * cosA * rimRadius;
        const nrm: V3 = norm([pm.nx * cosA, sinA, pm.nz * cosA]);
        ring.push(push([px, py, pz], nrm, pm.u, panIdx, 1, 1.0));
      }
      rimRings.push(ring);
    }
    for (let i = 0; i < segs; i++) {
      const rA = rimRings[i];
      const rB = rimRings[i + 1];
      for (let r = 0; r < rimTubeSegs; r++) {
        idx.push(rA[r], rB[r], rA[r + 1], rB[r], rB[r + 1], rA[r + 1]);
      }
    }

    // 3. Bottom Floor Plate (with subtle pressed inner bevel ring for specular catch)
    const topCenterIdx = push(
      [0, yBottom + 0.018, 0],
      [0, 1, 0],
      0,
      panIdx,
      2,
      0.0
    );
    const botCenterIdx = push(
      [0, yBottom, 0],
      [0, -1, 0],
      0,
      panIdx,
      2,
      0.0
    );

    const floorTopMidRing: number[] = [];
    const floorTopOuterRing: number[] = [];
    const floorBotOuterRing: number[] = [];

    for (let i = 0; i <= segs; i++) {
      const pm = perimeter[i];
      const ix = pm.x - pm.nx * wallThick;
      const iz = pm.z - pm.nz * wallThick;
      // Mid bevel ring at 72% radius
      floorTopMidRing.push(
        push(
          [ix * 0.72, yBottom + 0.024, iz * 0.72],
          norm([pm.nx * 0.08, 1, pm.nz * 0.08]),
          pm.u,
          panIdx,
          2,
          0.72
        )
      );
      floorTopOuterRing.push(
        push(
          [ix, yBottom + 0.018, iz],
          [0, 1, 0],
          pm.u,
          panIdx,
          2,
          0.95
        )
      );
      floorBotOuterRing.push(
        push([pm.x, yBottom, pm.z], [0, -1, 0], pm.u, panIdx, 2, 0.95)
      );
    }

    for (let i = 0; i < segs; i++) {
      // Inner disc to mid bevel ring
      idx.push(topCenterIdx, floorTopMidRing[i + 1], floorTopMidRing[i]);
      // Mid bevel ring to outer floor edge
      idx.push(
        floorTopMidRing[i],
        floorTopMidRing[i + 1],
        floorTopOuterRing[i],
        floorTopMidRing[i + 1],
        floorTopOuterRing[i + 1],
        floorTopOuterRing[i]
      );
      // Underside disc
      idx.push(botCenterIdx, floorBotOuterRing[i], floorBotOuterRing[i + 1]);
    }

    // 4. Characteristic Side Ring Handle on Loyang Bulat (from client photo_12)
    if (shape === "bulat") {
      const handleAngles = [0, Math.PI];
      for (const hAngle of handleAngles) {
        const hx = Math.sin(hAngle) * 0.98 * scale;
        const hz = Math.cos(hAngle) * 0.98 * scale;
        const hSegs = 12;
        const hRadius = 0.085 * scale;
        const hThick = 0.016;
        const ringVerts: number[] = [];
        for (let k = 0; k <= hSegs; k++) {
          const a = (k / hSegs) * Math.PI * 2;
          const tangX = Math.cos(hAngle);
          const tangZ = -Math.sin(hAngle);
          const outX = Math.sin(hAngle);
          const outZ = Math.cos(hAngle);
          const px =
            hx +
            outX * (0.035 + Math.max(0, Math.sin(a)) * 0.02) +
            tangX * Math.cos(a) * hRadius;
          const py = yTop * 0.15 + Math.sin(a) * hRadius;
          const pz =
            hz +
            outZ * (0.035 + Math.max(0, Math.sin(a)) * 0.02) +
            tangZ * Math.cos(a) * hRadius;
          const nrm: V3 = norm([outX, Math.sin(a) * 0.5, outZ]);
          ringVerts.push(
            push([px, py, pz], nrm, k / hSegs, panIdx, 1, 1.05),
            push(
              [px + outX * hThick, py, pz + outZ * hThick],
              nrm,
              k / hSegs,
              panIdx,
              1,
              1.05
            )
          );
        }
        for (let k = 0; k < hSegs; k++) {
          const i0 = ringVerts[k * 2];
          const i1 = ringVerts[k * 2 + 1];
          const i2 = ringVerts[(k + 1) * 2];
          const i3 = ringVerts[(k + 1) * 2 + 1];
          idx.push(i0, i1, i2, i1, i3, i2);
        }
      }
    }
  }

  let radius = 1.15;
  for (let i = 0; i < v.length; i += PAN_STRIDE) {
    const d = Math.hypot(v[i], v[i + 1], v[i + 2]);
    if (d > radius) radius = d;
  }

  return {
    data: new Float32Array(v),
    index: new Uint16Array(idx),
    vertices: count,
    radius,
    outlineRings,
  };
}
