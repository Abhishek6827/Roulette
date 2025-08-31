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
  size = 420,
  spinsMin = 6,
  spinsMax = 8,
  duration = 4, // seconds
  disabled = false,
}) {
  const prefersReducedMotion = useReducedMotion();
  const center = size / 2;
  const radius = size / 2;
  const sliceAngle = (2 * Math.PI) / WHEEL_NUMBERS.length;
  const sliceDeg = 360 / WHEEL_NUMBERS.length;

  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotate, setWheelRotate] = useState(0); // degrees

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

    // Pick a random winning pocket index
    const idx = Math.floor(Math.random() * WHEEL_NUMBERS.length);

    // The pointer sits at -90deg (top-center). We want the mid-angle of idx to end there.
    // midAngleScreen(i) = -90 + (i + 0.5) * sliceDeg + finalW  === -90
    // => finalW ≡ - (i + 0.5) * sliceDeg (mod 360)
    const targetBase = -((idx + 0.5) * sliceDeg); // degrees
    const currentW = currentWRef.current;

    // Ensure we spin forward by a whole number of spins plus the delta to align exactly to targetBase
    const spins =
      Math.floor(Math.random() * (spinsMax - spinsMin + 1)) + spinsMin;
    const deltaToBase = mod(targetBase - currentW, 360); // minimal forward delta to align modulo 360
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

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Felt background frame */}
      <div
        className="rounded-2xl p-4"
        style={{
          background: "linear-gradient(145deg, #0b3a2d, #06261e)",
          boxShadow:
            "inset 0 2px 6px rgba(255,255,255,0.05), 0 20px 40px rgba(0,0,0,0.35)",
        }}
      >
        {/* Wheel wrapper with fixed pointer overlay */}
        <div className="relative">
          {/* Pointer (fixed, top-center) */}
          <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-2 z-10">
            <svg
              width="32"
              height="28"
              viewBox="0 0 32 28"
              aria-hidden="true"
              className="drop-shadow-[0_3px_6px_rgba(0,0,0,0.45)]"
            >
              <polygon
                points="16,0 28,20 4,20"
                fill="#fbbf24"
                stroke="#0b0f19"
                strokeWidth="2"
              />
              <circle cx="16" cy="20" r="3" fill="#0b0f19" opacity="0.8" />
            </svg>
          </div>

          {/* Wheel */}
          <motion.svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            animate={{ rotate: wheelRotate }}
            transition={{
              duration: prefersReducedMotion ? 0.6 : duration,
              ease,
            }}
            style={{ originX: "50%", originY: "50%" }}
            role="img"
            aria-label="Roulette wheel"
            className="pointer-events-none drop-shadow-[0_12px_28px_rgba(0,0,0,0.35)]"
          >
            {/* Outer metallic rim and felt ring */}
            <circle cx={center} cy={center} r={radius} fill="#0a3d2e" />
            <circle
              cx={center}
              cy={center}
              r={radius - 4}
              fill="#0b0f19"
              stroke="#0f172a"
              strokeWidth="2"
            />
            <circle
              cx={center}
              cy={center}
              r={radius - 10}
              fill="#064e3b"
              stroke="#052e23"
              strokeWidth="6"
            />

            {/* Numbered slices */}
            {WHEEL_NUMBERS.map((num, i) => {
              const startAngle = i * sliceAngle - Math.PI / 2;
              const endAngle = startAngle + sliceAngle;

              const x1 = center + radius * Math.cos(startAngle);
              const y1 = center + radius * Math.sin(startAngle);
              const x2 = center + radius * Math.cos(endAngle);
              const y2 = center + radius * Math.sin(endAngle);

              const largeArc = sliceAngle > Math.PI ? 1 : 0;
              const pathData = `
                M ${center} ${center}
                L ${x1} ${y1}
                A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
                Z
              `;

              const textAngle = startAngle + sliceAngle / 2;
              const textR = radius - 42;
              const textX = center + textR * Math.cos(textAngle);
              const textY = center + textR * Math.sin(textAngle);

              const fill =
                num.color === "red"
                  ? "#dc2626"
                  : num.color === "black"
                  ? "#0b0f19"
                  : "#047857";

              return (
                <g key={num.value}>
                  <path
                    d={pathData}
                    fill={fill}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  <text
                    x={textX}
                    y={textY}
                    fill="#ffffff"
                    fontSize="14"
                    fontWeight="700"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${
                      (textAngle * 180) / Math.PI
                    } ${textX} ${textY})`}
                    style={{
                      paintOrder: "stroke",
                      stroke: "rgba(0,0,0,0.5)",
                      strokeWidth: 0.5,
                    }}
                  >
                    {num.value}
                  </text>
                </g>
              );
            })}

            {/* Pocket separators on the outer edge */}
            {ticks.map((i) => {
              const angle = i * sliceAngle - Math.PI / 2;
              const inner = radius - 6;
              const outer = radius;
              const x1 = center + inner * Math.cos(angle);
              const y1 = center + inner * Math.sin(angle);
              const x2 = center + outer * Math.cos(angle);
              const y2 = center + outer * Math.sin(angle);
              return (
                <line
                  key={`tick-${i}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#0f172a"
                  strokeWidth="1.5"
                  opacity="0.7"
                />
              );
            })}

            {/* Inner rings / hub for more realistic depth */}
            <circle
              cx={center}
              cy={center}
              r={radius - 62}
              fill="none"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="2"
            />
            <circle cx={center} cy={center} r={radius - 90} fill="#0b0f19" />
            <circle
              cx={center}
              cy={center}
              r={radius - 112}
              fill="#111827"
              stroke="#0f172a"
              strokeWidth="2"
            />

            {/* Outer border accent */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#0b0f19"
              strokeWidth="6"
            />
          </motion.svg>
        </div>
      </div>

      {/* Spin button */}
      <motion.button
        type="button"
        onClick={spinWheel}
        disabled={isSpinning || disabled}
        className="px-6 py-2 rounded-lg bg-emerald-700 text-white shadow-md hover:bg-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:opacity-60 disabled:cursor-not-allowed"
        whileHover={!isSpinning && !disabled ? { scale: 1.04 } : {}}
        whileTap={!isSpinning && !disabled ? { scale: 0.96 } : {}}
      >
        {isSpinning ? "Spinning…" : "Spin Wheel"}
      </motion.button>
    </div>
  );
}
