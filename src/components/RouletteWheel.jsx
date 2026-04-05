/* eslint-disable react/prop-types */
"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";

// European roulette numbers in wheel order with colors
const WHEEL_NUMBERS = [
  { value: 0, color: "green" },
  { value: 32, color: "red" },
  { value: 15, color: "black" },
  { value: 19, color: "red" },
  { value: 4, color: "black" },
  { value: 21, color: "red" },
  { value: 2, color: "black" },
  { value: 25, color: "red" },
  { value: 17, color: "black" },
  { value: 34, color: "red" },
  { value: 6, color: "black" },
  { value: 27, color: "red" },
  { value: 13, color: "black" },
  { value: 36, color: "red" },
  { value: 11, color: "black" },
  { value: 30, color: "red" },
  { value: 8, color: "black" },
  { value: 23, color: "red" },
  { value: 10, color: "black" },
  { value: 5, color: "red" },
  { value: 24, color: "black" },
  { value: 16, color: "red" },
  { value: 33, color: "black" },
  { value: 1, color: "red" },
  { value: 20, color: "black" },
  { value: 14, color: "red" },
  { value: 31, color: "black" },
  { value: 9, color: "red" },
  { value: 22, color: "black" },
  { value: 18, color: "red" },
  { value: 29, color: "black" },
  { value: 7, color: "red" },
  { value: 28, color: "black" },
  { value: 12, color: "red" },
  { value: 35, color: "black" },
  { value: 3, color: "red" },
  { value: 26, color: "black" },
];

export default function RouletteWheel({
  onSpinResult,
  size = 300,
  spinsMin = 6,
  spinsMax = 8,
  duration = 4,
  disabled = false,
}) {
  const prefersReducedMotion = useReducedMotion();

  // Internal render size is always 420 for crisp SVG; we scale via CSS
  const S = 420;
  const center = S / 2;
  const radius = S / 2;
  const sliceAngle = (2 * Math.PI) / WHEEL_NUMBERS.length;
  const sliceDeg = 360 / WHEEL_NUMBERS.length;

  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotate, setWheelRotate] = useState(0);
  const currentWRef = useRef(0);

  useEffect(() => {
    currentWRef.current = wheelRotate;
  }, [wheelRotate]);

  const ticks = useMemo(
    () => Array.from({ length: WHEEL_NUMBERS.length }, (_, i) => i),
    []
  );

  const ease = prefersReducedMotion ? "linear" : [0.12, 0.6, 0.04, 1];
  const mod = (n, m) => ((n % m) + m) % m;

  const spinWheel = () => {
    if (isSpinning || disabled) return;
    setIsSpinning(true);

    const idx = Math.floor(Math.random() * WHEEL_NUMBERS.length);
    const targetBase = -((idx + 0.5) * sliceDeg);
    const currentW = currentWRef.current;
    const spins =
      Math.floor(Math.random() * (spinsMax - spinsMin + 1)) + spinsMin;
    const deltaToBase = mod(targetBase - currentW, 360);
    const targetW = currentW + spins * 360 + deltaToBase;

    const d = prefersReducedMotion ? 0.6 : duration;
    setWheelRotate(targetW);

    window.setTimeout(() => {
      try {
        onSpinResult && onSpinResult(WHEEL_NUMBERS[idx].value);
      } finally {
        setIsSpinning(false);
      }
    }, d * 1000);
  };

  // ── Gradient IDs (unique per instance) ──
  const gradId = useMemo(() => `whl_${Math.random().toString(36).slice(2, 8)}`, []);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Felt background frame with golden outer ring */}
      <div
        className="rounded-full p-1"
        style={{
          background: "linear-gradient(135deg, #d4a017 0%, #f5d66a 25%, #b8860b 50%, #f5d66a 75%, #d4a017 100%)",
          boxShadow:
            "0 0 20px rgba(212,160,23,0.3), 0 20px 40px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.3)",
        }}
      >
        <div
          className="rounded-full p-3"
          style={{
            background: "linear-gradient(145deg, #0b3a2d, #06261e)",
            boxShadow: "inset 0 2px 8px rgba(0,0,0,0.5)",
          }}
        >
          {/* Wheel wrapper with fixed pointer overlay */}
          <div className="relative">
            {/* Pointer (fixed, top-center) — premium golden arrow */}
            <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-3 z-10">
              <svg
                width="28"
                height="32"
                viewBox="0 0 28 32"
                aria-hidden="true"
                style={{ filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.5))" }}
              >
                <defs>
                  <linearGradient id={`${gradId}_ptr`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fde68a" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#b45309" />
                  </linearGradient>
                </defs>
                <polygon
                  points="14,2 24,22 4,22"
                  fill={`url(#${gradId}_ptr)`}
                  stroke="#78350f"
                  strokeWidth="1.5"
                />
                <circle cx="14" cy="22" r="3" fill="#78350f" />
                <circle cx="14" cy="22" r="1.5" fill="#fbbf24" />
              </svg>
            </div>

            {/* Wheel SVG — fixed internal size, CSS-scaled */}
            <motion.svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${S} ${S}`}
              animate={{ rotate: wheelRotate }}
              transition={{
                duration: prefersReducedMotion ? 0.6 : duration,
                ease,
              }}
              style={{ originX: "50%", originY: "50%", maxWidth: size, maxHeight: size }}
              role="img"
              aria-label="Roulette wheel"
              className="pointer-events-none"
            >
              <defs>
                {/* Metallic rim gradient */}
                <radialGradient id={`${gradId}_rim`} cx="50%" cy="50%" r="50%">
                  <stop offset="88%" stopColor="#1a1a2e" stopOpacity="0" />
                  <stop offset="92%" stopColor="#2d2d44" stopOpacity="0.5" />
                  <stop offset="96%" stopColor="#3d3d5c" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#1a1a2e" />
                </radialGradient>
                {/* Hub gradient */}
                <radialGradient id={`${gradId}_hub`} cx="50%" cy="40%" r="50%">
                  <stop offset="0%" stopColor="#2d2d44" />
                  <stop offset="60%" stopColor="#111827" />
                  <stop offset="100%" stopColor="#0b0f19" />
                </radialGradient>
                {/* Gold accent */}
                <linearGradient id={`${gradId}_gold`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" />
                  <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.6" />
                </linearGradient>
              </defs>

              {/* Outer dark ring */}
              <circle cx={center} cy={center} r={radius} fill="#0a0a14" />
              <circle cx={center} cy={center} r={radius - 2} fill="#0b0f19" stroke="#1e1e3a" strokeWidth="1" />

              {/* Ball track ring */}
              <circle cx={center} cy={center} r={radius - 8} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />

              {/* Main colored ring */}
              <circle cx={center} cy={center} r={radius - 12} fill="#064e3b" stroke="#052e23" strokeWidth="4" />

              {/* Numbered slices */}
              {WHEEL_NUMBERS.map((num, i) => {
                const startAngle = i * sliceAngle - Math.PI / 2;
                const endAngle = startAngle + sliceAngle;
                const innerR = radius - 65;

                const x1 = center + (radius - 14) * Math.cos(startAngle);
                const y1 = center + (radius - 14) * Math.sin(startAngle);
                const x2 = center + (radius - 14) * Math.cos(endAngle);
                const y2 = center + (radius - 14) * Math.sin(endAngle);
                const x3 = center + innerR * Math.cos(endAngle);
                const y3 = center + innerR * Math.sin(endAngle);
                const x4 = center + innerR * Math.cos(startAngle);
                const y4 = center + innerR * Math.sin(startAngle);

                const outerR = radius - 14;
                const largeArc = sliceAngle > Math.PI ? 1 : 0;
                const pathData = `
                  M ${x4} ${y4}
                  L ${x1} ${y1}
                  A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2}
                  L ${x3} ${y3}
                  A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4}
                  Z
                `;

                const textAngle = startAngle + sliceAngle / 2;
                const textR = radius - 40;
                const textX = center + textR * Math.cos(textAngle);
                const textY = center + textR * Math.sin(textAngle);

                const fill =
                  num.color === "red"
                    ? "#c81e1e"
                    : num.color === "black"
                    ? "#111827"
                    : "#047857";

                return (
                  <g key={num.value}>
                    <path
                      d={pathData}
                      fill={fill}
                      stroke="rgba(255,255,255,0.15)"
                      strokeWidth="1"
                    />
                    <text
                      x={textX}
                      y={textY}
                      fill="#ffffff"
                      fontSize="13"
                      fontWeight="700"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${
                        (textAngle * 180) / Math.PI + 90
                      } ${textX} ${textY})`}
                      style={{
                        paintOrder: "stroke",
                        stroke: "rgba(0,0,0,0.6)",
                        strokeWidth: 2,
                        letterSpacing: "0.5px",
                      }}
                    >
                      {num.value}
                    </text>
                  </g>
                );
              })}

              {/* Pocket dividers */}
              {ticks.map((i) => {
                const angle = i * sliceAngle - Math.PI / 2;
                const inner = radius - 65;
                const outer = radius - 14;
                return (
                  <line
                    key={`tick-${i}`}
                    x1={center + inner * Math.cos(angle)}
                    y1={center + inner * Math.sin(angle)}
                    x2={center + outer * Math.cos(angle)}
                    y2={center + outer * Math.sin(angle)}
                    stroke="rgba(212,160,23,0.25)"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Inner gold ring (separator) */}
              <circle
                cx={center}
                cy={center}
                r={radius - 65}
                fill="none"
                stroke={`url(#${gradId}_gold)`}
                strokeWidth="2.5"
              />

              {/* Ball track outer edge */}
              <circle
                cx={center}
                cy={center}
                r={radius - 12}
                fill="none"
                stroke="rgba(212,160,23,0.15)"
                strokeWidth="1.5"
              />

              {/* Inner hub — dark with subtle gradient */}
              <circle cx={center} cy={center} r={radius - 68} fill={`url(#${gradId}_hub)`} />
              <circle
                cx={center}
                cy={center}
                r={radius - 68}
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
              />

              {/* Diamond markers on the ball track */}
              {[0, 4, 8, 12, 18, 22, 27, 32].map((i) => {
                const angle = i * sliceAngle - Math.PI / 2;
                const dR = radius - 8;
                const dx = center + dR * Math.cos(angle);
                const dy = center + dR * Math.sin(angle);
                return (
                  <circle
                    key={`diamond-${i}`}
                    cx={dx}
                    cy={dy}
                    r="3"
                    fill="rgba(212,160,23,0.4)"
                    stroke="rgba(212,160,23,0.6)"
                    strokeWidth="0.5"
                  />
                );
              })}

              {/* Center emblem */}
              <circle cx={center} cy={center} r={radius - 100} fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
              <circle cx={center} cy={center} r={radius - 115} fill="#111827" />
              <circle
                cx={center}
                cy={center}
                r={radius - 130}
                fill="none"
                stroke="rgba(212,160,23,0.3)"
                strokeWidth="1"
              />
              {/* Star/cross pattern in center */}
              <circle cx={center} cy={center} r={radius - 140} fill="#0b0f19" />
              <circle
                cx={center}
                cy={center}
                r={radius - 150}
                fill="none"
                stroke="rgba(212,160,23,0.2)"
                strokeWidth="0.5"
              />

              {/* Outer rim overlay for depth */}
              <circle cx={center} cy={center} r={radius} fill={`url(#${gradId}_rim)`} />
              <circle cx={center} cy={center} r={radius} fill="none" stroke="#0a0a14" strokeWidth="3" />
            </motion.svg>
          </div>
        </div>
      </div>

      {/* Spin button — premium style */}
      <motion.button
        type="button"
        onClick={spinWheel}
        disabled={isSpinning || disabled}
        className="px-6 py-2 rounded-lg text-white text-sm font-semibold shadow-lg
          focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200"
        style={{
          background: isSpinning
            ? "linear-gradient(135deg, #374151, #4b5563)"
            : "linear-gradient(135deg, #047857, #059669, #10b981)",
          boxShadow: isSpinning ? "none" : "0 4px 14px rgba(4,120,87,0.4)",
        }}
        whileHover={!isSpinning && !disabled ? { scale: 1.05, boxShadow: "0 6px 20px rgba(4,120,87,0.5)" } : {}}
        whileTap={!isSpinning && !disabled ? { scale: 0.95 } : {}}
      >
        {isSpinning ? "Spinning…" : "🎰 Spin Wheel"}
      </motion.button>
    </div>
  );
}
