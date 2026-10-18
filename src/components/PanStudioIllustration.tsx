import * as React from "react";
import { PanShapeId } from "../data/products";

interface PanStudioIllustrationProps {
  kind: PanShapeId;
  sizesLabel?: string;
  heightLabel?: string;
  className?: string;
  compact?: boolean;
}

export const PanStudioIllustration: React.FC<PanStudioIllustrationProps> = ({
  kind,
  sizesLabel,
  heightLabel = "5 cm",
  className = "",
  compact = false,
}) => {
  const uid = React.useId().replace(/:/g, "");

  return (
    <div
      className={
        "relative w-full overflow-hidden select-none bg-[#EFE6D4] " + className
      }
    >
      <svg
        viewBox="0 0 420 315"
        className="w-full h-full block"
        role="img"
        aria-label={`Visualisasi Studio Loyang ${kind}`}
      >
        <defs>
          {/* Warm Studio Tabletop Backdrop */}
          <linearGradient id={`bg-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F5EFE2" />
            <stop offset="62%" stopColor="#EDE2CE" />
            <stop offset="63%" stopColor="#E1D1B8" />
            <stop offset="100%" stopColor="#D6C2A5" />
          </linearGradient>

          {/* Brushed Silver Aluminum Outer Wall */}
          <linearGradient id={`alu-wall-${uid}`} x1="0" y1="0" x2="1" y2="0.2">
            <stop offset="0%" stopColor="#B8C0C8" />
            <stop offset="22%" stopColor="#E6EAEE" />
            <stop offset="48%" stopColor="#FFFFFF" />
            <stop offset="74%" stopColor="#C8CFD6" />
            <stop offset="100%" stopColor="#9DA6B0" />
          </linearGradient>

          {/* Inner Aluminum Basin */}
          <linearGradient id={`alu-inner-${uid}`} x1="0.1" y1="0" x2="0.9" y2="1">
            <stop offset="0%" stopColor="#9EA7B0" />
            <stop offset="38%" stopColor="#D6DCE2" />
            <stop offset="75%" stopColor="#EEF2F5" />
            <stop offset="100%" stopColor="#B7C0C8" />
          </linearGradient>

          {/* Bright Rolled Rim Specular */}
          <linearGradient id={`alu-rim-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#CFD6DC" />
            <stop offset="100%" stopColor="#F8FAFC" />
          </linearGradient>

          {/* Soft Contact Shadow */}
          <radialGradient id={`shadow-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#281C16" stopOpacity="0.28" />
            <stop offset="65%" stopColor="#281C16" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#281C16" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Studio Backdrop & Warm Oak Table Horizon */}
        <rect width="420" height="315" fill={`url(#bg-${uid})`} />
        <line
          x1="0"
          y1="196"
          x2="420"
          y2="196"
          stroke="#C8B294"
          strokeWidth="1"
        />
        {/* Subtle Linen Napkin Fold on Left */}
        <path
          d="M0 175 L118 196 L92 315 L0 315 Z"
          fill="#FAF5EB"
          fillOpacity="0.55"
        />
        <path
          d="M0 183 L110 198"
          stroke="#D7C4A8"
          strokeWidth="1"
          strokeDasharray="3 3"
        />

        {/* Ambient Contact Shadow */}
        <ellipse
          cx="210"
          cy="228"
          rx="155"
          ry="42"
          fill={`url(#shadow-${uid})`}
        />

        {/* ==== SHAPE 1: LOYANG LOVE (SET ISI 3) ==== */}
        {kind === "love" && (
          <g>
            {/* Left 18cm Heart Pan */}
            <g transform="translate(115, 182) scale(0.76)">
              <HeartPanIso
                wall={`url(#alu-wall-${uid})`}
                inner={`url(#alu-inner-${uid})`}
                rim={`url(#alu-rim-${uid})`}
              />
            </g>
            {/* Right 22cm Heart Pan */}
            <g transform="translate(298, 184) scale(0.92)">
              <HeartPanIso
                wall={`url(#alu-wall-${uid})`}
                inner={`url(#alu-inner-${uid})`}
                rim={`url(#alu-rim-${uid})`}
              />
            </g>
            {/* Center-Top 20cm Heart Pan (Stacked like client reference) */}
            <g transform="translate(206, 134) scale(0.86)">
              <ellipse
                cx="0"
                cy="42"
                rx="78"
                ry="30"
                fill={`url(#shadow-${uid})`}
              />
              <HeartPanIso
                wall={`url(#alu-wall-${uid})`}
                inner={`url(#alu-inner-${uid})`}
                rim={`url(#alu-rim-${uid})`}
              />
            </g>
          </g>
        )}

        {/* ==== SHAPE 2: LOYANG BULAT GAGANG (SET ISI 3) ==== */}
        {kind === "bulat" && (
          <g>
            {/* Left 18cm Round Pan with Ring Handle */}
            <g transform="translate(116, 188) scale(0.76)">
              <RoundPanIso
                wall={`url(#alu-wall-${uid})`}
                inner={`url(#alu-inner-${uid})`}
                rim={`url(#alu-rim-${uid})`}
                withHandle
              />
            </g>
            {/* Right 22cm Round Pan with Ring Handle */}
            <g transform="translate(296, 188) scale(0.92)">
              <RoundPanIso
                wall={`url(#alu-wall-${uid})`}
                inner={`url(#alu-inner-${uid})`}
                rim={`url(#alu-rim-${uid})`}
                withHandle
              />
            </g>
            {/* Top Center 20cm Round Pan with Ring Handle */}
            <g transform="translate(206, 134) scale(0.84)">
              <ellipse
                cx="0"
                cy="42"
                rx="82"
                ry="28"
                fill={`url(#shadow-${uid})`}
              />
              <RoundPanIso
                wall={`url(#alu-wall-${uid})`}
                inner={`url(#alu-inner-${uid})`}
                rim={`url(#alu-rim-${uid})`}
                withHandle
              />
            </g>
          </g>
        )}

        {/* ==== SHAPE 3: LOYANG SEGI (SET ISI 3 / ISI 2) ==== */}
        {kind === "segi" && (
          <g>
            <g transform="translate(116, 174) scale(0.88)">
              <RectPanIso
                w={116}
                d={66}
                h={44}
                wall={`url(#alu-wall-${uid})`}
                inner={`url(#alu-inner-${uid})`}
                rim={`url(#alu-rim-${uid})`}
              />
            </g>
            <g transform="translate(302, 174) scale(0.82)">
              <RectPanIso
                w={112}
                d={64}
                h={44}
                wall={`url(#alu-wall-${uid})`}
                inner={`url(#alu-inner-${uid})`}
                rim={`url(#alu-rim-${uid})`}
              />
            </g>
            <g transform="translate(208, 206) scale(0.74)">
              <RectPanIso
                w={106}
                d={60}
                h={44}
                wall={`url(#alu-wall-${uid})`}
                inner={`url(#alu-inner-${uid})`}
                rim={`url(#alu-rim-${uid})`}
              />
            </g>
          </g>
        )}

        {/* ==== SHAPE 4: LOYANG BRONIS POLOS (SET ISI 3) ==== */}
        {kind === "bronis" && (
          <g>
            {[
              { x: 112, y: 174, s: 0.94 },
              { x: 216, y: 178, s: 0.84 },
              { x: 312, y: 182, s: 0.75 },
            ].map((item, idx) => (
              <g
                key={idx}
                transform={`translate(${item.x}, ${item.y}) scale(${item.s})`}
              >
                <RectPanIso
                  w={82}
                  d={92}
                  h={42}
                  wall={`url(#alu-wall-${uid})`}
                  inner={`url(#alu-inner-${uid})`}
                  rim={`url(#alu-rim-${uid})`}
                />
              </g>
            ))}
          </g>
        )}

        {/* ==== SHAPE 5: LOYANG BRONIS RIGI / AGAR (SET ISI 3) ==== */}
        {kind === "rigi" && (
          <g>
            {[
              { x: 272, y: 150, s: 0.96 },
              { x: 204, y: 175, s: 0.85 },
              { x: 138, y: 198, s: 0.74 },
            ].map((item, idx) => (
              <g
                key={idx}
                transform={`translate(${item.x}, ${item.y}) scale(${item.s})`}
              >
                <RectPanIso
                  w={136}
                  d={56}
                  h={44}
                  wall={`url(#alu-wall-${uid})`}
                  inner={`url(#alu-inner-${uid})`}
                  rim={`url(#alu-rim-${uid})`}
                  fluted
                />
              </g>
            ))}
          </g>
        )}

        {/* ==== SHAPE 6: LOYANG PAI / BULAT RIGI (SET ISI 3) ==== */}
        {kind === "pai" && (
          <g>
            {[
              { y: 192, s: 1.05 },
              { y: 164, s: 0.88 },
              { y: 138, s: 0.72 },
            ].map((layer, idx) => (
              <g
                key={idx}
                transform={`translate(210, ${layer.y}) scale(${layer.s})`}
              >
                <FlutedPiePanIso
                  wall={`url(#alu-wall-${uid})`}
                  inner={`url(#alu-inner-${uid})`}
                  rim={`url(#alu-rim-${uid})`}
                />
              </g>
            ))}
          </g>
        )}

        {/* ==== SHAPE 7: LOYANG BULAT TEBAL (SET ISI 5 NESTED) ==== */}
        {kind === "bulat-tebal" && (
          <g>
            {[
              { y: 196, s: 1.08 },
              { y: 178, s: 0.94 },
              { y: 161, s: 0.81 },
              { y: 145, s: 0.68 },
              { y: 130, s: 0.56 },
            ].map((layer, idx) => (
              <g
                key={idx}
                transform={`translate(210, ${layer.y}) scale(${layer.s})`}
              >
                <RoundPanIso
                  wall={`url(#alu-wall-${uid})`}
                  inner={`url(#alu-inner-${uid})`}
                  rim={`url(#alu-rim-${uid})`}
                  withHandle={false}
                />
              </g>
            ))}
          </g>
        )}

        {/* ==== SHAPE 8: LOYANG SEGI TEBAL (SET ISI 5 NESTED) ==== */}
        {kind === "segi-tebal" && (
          <g>
            {[
              { y: 198, s: 1.12 },
              { y: 180, s: 0.97 },
              { y: 163, s: 0.83 },
              { y: 147, s: 0.7 },
              { y: 132, s: 0.57 },
            ].map((layer, idx) => (
              <g
                key={idx}
                transform={`translate(210, ${layer.y}) scale(${layer.s})`}
              >
                <RectPanIso
                  w={138}
                  d={74}
                  h={45}
                  wall={`url(#alu-wall-${uid})`}
                  inner={`url(#alu-inner-${uid})`}
                  rim={`url(#alu-rim-${uid})`}
                />
              </g>
            ))}
          </g>
        )}

        {/* ==== SHAPE 9: LOYANG OVEN KUE KERING (17x17 & 30x30) ==== */}
        {kind === "oven" && (
          <g>
            {/* Besar 30x30 cm */}
            <g transform="translate(254, 174) scale(1.04)">
              <RectPanIso
                w={144}
                d={82}
                h={20}
                wall={`url(#alu-wall-${uid})`}
                inner={`url(#alu-inner-${uid})`}
                rim={`url(#alu-rim-${uid})`}
              />
            </g>
            {/* Kecil 17x17 cm */}
            <g transform="translate(120, 194) scale(0.72)">
              <RectPanIso
                w={124}
                d={72}
                h={20}
                wall={`url(#alu-wall-${uid})`}
                inner={`url(#alu-inner-${uid})`}
                rim={`url(#alu-rim-${uid})`}
              />
            </g>
          </g>
        )}

        {/* ==== SHAPE 10: LOYANG LIDAH KUCING (3 BARIS CEKUNGAN) ==== */}
        {kind === "lidah-kucing" && (
          <g transform="translate(210, 176)">
            <RectPanIso
              w={188}
              d={94}
              h={16}
              wall={`url(#alu-wall-${uid})`}
              inner={`url(#alu-inner-${uid})`}
              rim={`url(#alu-rim-${uid})`}
            />
            {/* 3 rows of cat-tongue oval indent wells */}
            {[-22, 0, 22].map((rowY, rIdx) => (
              <g key={rIdx} transform={`translate(0, ${rowY - 8})`}>
                {[-56, -28, 0, 28, 56].map((colX, cIdx) => (
                  <ellipse
                    key={cIdx}
                    cx={colX}
                    cy={0}
                    rx="10"
                    ry="6.5"
                    fill={`url(#alu-wall-${uid})`}
                    stroke="#8F98A2"
                    strokeWidth="0.9"
                  />
                ))}
              </g>
            ))}
          </g>
        )}

        {/* Technical Dimension Callouts (Clean Editorial Typography) */}
        {!compact && (
          <g>
            {/* Top-left specification label */}
            <text
              x="18"
              y="28"
              fill="#5A463B"
              fontSize="10"
              fontFamily='"JetBrains Mono", monospace'
              letterSpacing="0.08em"
            >
              ALUMINIUM PRESS · TINGGI {heightLabel.toUpperCase()}
            </text>

            {/* Bottom dimension scale bar */}
            {sizesLabel && (
              <g transform="translate(210, 292)">
                <line
                  x1="-140"
                  y1="0"
                  x2="140"
                  y2="0"
                  stroke="#7D6556"
                  strokeWidth="1"
                  strokeOpacity="0.45"
                />
                <circle cx="-140" cy="0" r="2.2" fill="#B84A27" />
                <circle cx="140" cy="0" r="2.2" fill="#B84A27" />
                <rect
                  x="-96"
                  y="-10"
                  width="192"
                  height="20"
                  rx="3"
                  fill="#F5EFE2"
                />
                <text
                  x="0"
                  y="3.5"
                  textAnchor="middle"
                  fill="#281C16"
                  fontSize="10.5"
                  fontWeight="600"
                  fontFamily='"JetBrains Mono", monospace'
                >
                  {sizesLabel}
                </text>
              </g>
            )}
          </g>
        )}
      </svg>
    </div>
  );
};

function HeartPanIso({
  wall,
  inner,
  rim,
}: {
  wall: string;
  inner: string;
  rim: string;
}) {
  return (
    <g>
      {/* Extruded 3D Outer Wall of Heart */}
      <path
        d="M -78 -12 L -78 26 C -78 48, -32 68, 0 84 C 32 68, 78 48, 78 26 L 78 -12 Z"
        fill={wall}
        stroke="#8E97A2"
        strokeWidth="1"
      />
      {/* Front Center Seam Line (Sambungan Rapi) */}
      <line
        x1="0"
        y1="44"
        x2="0"
        y2="84"
        stroke="#7D8690"
        strokeWidth="1.2"
      />
      {/* Inner Basin of Heart */}
      <path
        d="M 0 -16 C -18 -38, -78 -36, -78 -10 C -78 16, -28 32, 0 46 C 28 32, 78 16, 78 -10 C 78 -36, 18 -38, 0 -16 Z"
        fill={inner}
        stroke={rim}
        strokeWidth="3.5"
      />
      {/* Inner Floor Depth Line */}
      <path
        d="M 0 2 C -14 -14, -56 -12, -58 4 C -52 18, -20 28, 0 38 C 20 28, 52 18, 58 4 C 56 -12, 14 -14, 0 2 Z"
        fill="none"
        stroke="#9BA4AE"
        strokeWidth="1"
        strokeOpacity="0.65"
      />
    </g>
  );
}

function RoundPanIso({
  wall,
  inner,
  rim,
  withHandle,
}: {
  wall: string;
  inner: string;
  rim: string;
  withHandle?: boolean;
}) {
  return (
    <g>
      {/* Cylinder Wall */}
      <path
        d="M -82 0 L -82 38 A 82 32 0 0 0 82 38 L 82 0 Z"
        fill={wall}
        stroke="#8C95A0"
        strokeWidth="1"
      />
      {/* Top Basin */}
      <ellipse
        cx="0"
        cy="0"
        rx="82"
        ry="32"
        fill={inner}
        stroke={rim}
        strokeWidth="3.5"
      />
      {/* Inner Bottom Floor */}
      <ellipse
        cx="0"
        cy="12"
        rx="68"
        ry="22"
        fill="none"
        stroke="#949EA8"
        strokeWidth="1"
        strokeOpacity="0.7"
      />
      {/* Characteristic Ring Handle on Front Wall (Gagang Praktis) */}
      {withHandle && (
        <g transform="translate(-26, 26)">
          <rect
            x="-7"
            y="-4"
            width="14"
            height="7"
            rx="1.5"
            fill="#C7CFD7"
            stroke="#6F7882"
            strokeWidth="1"
          />
          <circle
            cx="0"
            cy="5"
            r="6.5"
            fill="none"
            stroke="#5E6670"
            strokeWidth="2.2"
          />
          <circle
            cx="0"
            cy="4.5"
            r="6.5"
            fill="none"
            stroke="#F8FAFC"
            strokeWidth="1"
          />
        </g>
      )}
    </g>
  );
}

function RectPanIso({
  w,
  d,
  h,
  wall,
  inner,
  rim,
  fluted = false,
}: {
  w: number;
  d: number;
  h: number;
  wall: string;
  inner: string;
  rim: string;
  fluted?: boolean;
}) {
  const hw = w / 2;
  const hd = d / 2;
  const skew = 22;

  return (
    <g>
      {/* Front & Side Extruded Wall */}
      <path
        d={`M ${-hw - skew} ${-hd} L ${-hw - skew} ${-hd + h} L ${-hw + skew} ${hd + h} L ${hw + skew} ${hd + h} L ${hw + skew} ${hd} L ${hw - skew} ${-hd} Z`}
        fill={wall}
        stroke="#8A939E"
        strokeWidth="1"
      />
      {/* Vertical Fluted Rigi Lines if enabled */}
      {fluted && (
        <g stroke="#7E8792" strokeWidth="1.1" strokeOpacity="0.65">
          {Array.from({ length: 15 }).map((_, i) => {
            const x = -hw + skew + ((i + 1) / 16) * (w);
            return (
              <line
                key={i}
                x1={x}
                y1={hd}
                x2={x}
                y2={hd + h}
              />
            );
          })}
        </g>
      )}
      {/* Folded Corner Seam */}
      <line
        x1={-hw + skew}
        y1={hd}
        x2={-hw + skew}
        y2={hd + h}
        stroke="#78818C"
        strokeWidth="1.3"
      />
      {/* Top Open Basin */}
      <polygon
        points={`${-hw - skew},${-hd} ${hw - skew},${-hd} ${hw + skew},${hd} ${-hw + skew},${hd}`}
        fill={inner}
        stroke={rim}
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
    </g>
  );
}

function FlutedPiePanIso({
  wall,
  inner,
  rim,
}: {
  wall: string;
  inner: string;
  rim: string;
}) {
  // Build scalloped wave points around ellipse
  const waves = 28;
  const rx = 92;
  const ry = 36;
  const pts: string[] = [];
  for (let i = 0; i <= waves * 4; i++) {
    const a = (i / (waves * 4)) * Math.PI * 2;
    const wave = 1 + 0.045 * Math.cos(waves * a);
    const x = Math.cos(a) * rx * wave;
    const y = Math.sin(a) * ry * wave;
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }

  return (
    <g>
      {/* Fluted Slanted Wall */}
      <path
        d={`M ${-rx} 0 L ${-rx * 0.9} 22 A ${rx * 0.9} ${ry * 0.88} 0 0 0 ${rx * 0.9} 22 L ${rx} 0 Z`}
        fill={wall}
        stroke="#86909A"
        strokeWidth="1"
      />
      {/* Vertical Fluted Ribbing along Front Rim */}
      <g stroke="#7C8590" strokeWidth="1.1" strokeOpacity="0.65">
        {Array.from({ length: 15 }).map((_, i) => {
          const t = ((i + 1) / 16) * Math.PI;
          const xTop = Math.cos(t) * rx;
          const yTop = Math.sin(t) * ry;
          const xBot = Math.cos(t) * rx * 0.9;
          const yBot = Math.sin(t) * ry * 0.88 + 22;
          return <line key={i} x1={xTop} y1={yTop} x2={xBot} y2={yBot} />;
        })}
      </g>
      {/* Scalloped Top Rim */}
      <polygon
        points={pts.join(" ")}
        fill={inner}
        stroke={rim}
        strokeWidth="2.8"
      />
      {/* Flat Inner Pie Floor */}
      <ellipse
        cx="0"
        cy="6"
        rx={rx * 0.76}
        ry={ry * 0.68}
        fill="none"
        stroke="#929BA5"
        strokeWidth="1.1"
      />
    </g>
  );
}
