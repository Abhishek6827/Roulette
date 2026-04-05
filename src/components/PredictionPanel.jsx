"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Icons ─────────────────────────────────────────────────

function TargetIcon(props) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={"h-5 w-5 " + (props.className || "")}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <path d="M12 3v3M21 12h-3M12 21v-3M6 12H3" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
    </svg>
  );
}

function ShieldIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={"h-5 w-5 " + (props.className || "")}>
      <path d="M12 2l7 4v5c0 5.25-3.5 8.75-7 10-3.5-1.25-7-4.75-7-10V6l7-4z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
    </svg>
  );
}

// ─── Confidence Bar ────────────────────────────────────────

function ConfidenceBar({ level }) {
  const config = {
    HIGH: { width: "100%", color: "bg-emerald-500", glow: "shadow-emerald-500/40", text: "text-emerald-400" },
    MEDIUM: { width: "60%", color: "bg-amber-500", glow: "shadow-amber-500/40", text: "text-amber-400" },
    LOW: { width: "30%", color: "bg-red-500", glow: "shadow-red-500/40", text: "text-red-400" },
  };
  const c = config[level] || config.LOW;

  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs font-bold ${c.text} uppercase tracking-wider`}>{level}</span>
      <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${c.color} shadow-lg ${c.glow}`}
          initial={{ width: 0 }}
          animate={{ width: c.width }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// ─── Dozen Pill ────────────────────────────────────────────

function DozenPill({ label, type }) {
  const isA = type === "A";
  const base = isA
    ? "bg-emerald-600 hover:bg-emerald-500 ring-emerald-400/30"
    : "bg-red-600 hover:bg-red-500 ring-red-400/30";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.85, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: -8 }}
      transition={{ type: "spring", stiffness: 500, damping: 30, mass: 0.5 }}
      className={`
        relative overflow-hidden rounded-full px-4 py-2 text-sm font-bold
        text-white ${base} shadow-lg ring-1
        transition-all duration-200
      `}
    >
      <span className="relative z-10 flex items-center gap-1.5">
        {isA ? (
          <span className="text-[10px] bg-white/20 rounded px-1 py-0.5 uppercase tracking-wider">Bet</span>
        ) : (
          <span className="text-[10px] bg-white/20 rounded px-1 py-0.5 uppercase tracking-wider">Avoid</span>
        )}
        {label}
      </span>
      {/* Gloss sweep */}
      <span className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300">
        <span className="absolute -left-1/2 top-0 h-full w-[120%] rotate-12 bg-white/10 blur-sm" />
      </span>
      <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/10" />
    </motion.div>
  );
}

// ─── Action Badge ──────────────────────────────────────────

function ActionBadge({ action }) {
  const isBet = action === "BET";

  return (
    <motion.div
      key={action}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-xl text-base font-extrabold uppercase tracking-wider
        ${isBet
          ? "bg-emerald-600/20 text-emerald-400 ring-1 ring-emerald-500/40"
          : "bg-amber-600/20 text-amber-400 ring-1 ring-amber-500/40"
        }
      `}
    >
      {isBet ? (
        <motion.span
          className="w-3 h-3 rounded-full bg-emerald-400"
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      ) : (
        <motion.span
          className="w-3 h-3 rounded-full bg-amber-400"
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      {action}
    </motion.div>
  );
}

// ─── Loss Streak Indicator ─────────────────────────────────

function LossIndicator({ count }) {
  if (count === 0) return null;

  const severity = count >= 3 ? "text-red-400" : count === 2 ? "text-amber-400" : "text-yellow-400";
  const bg = count >= 3 ? "bg-red-600/20 ring-red-500/40" : count === 2 ? "bg-amber-600/20 ring-amber-500/40" : "bg-yellow-600/20 ring-yellow-500/40";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${severity} ${bg} ring-1`}
    >
      <span>⚠</span>
      <span>{count} Loss{count > 1 ? "es" : ""}</span>
      {count >= 3 && <span className="text-[10px] opacity-80 ml-1">(FORCE WAIT)</span>}
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────

export default function PredictionPanel({ prediction, lossStreak = 0 }) {
  const [changed, setChanged] = useState(false);

  const keySig = useMemo(
    () => prediction ? `${prediction.aDozens?.join("|")}-${prediction.bDozen}-${prediction.action}` : "",
    [prediction]
  );

  useEffect(() => {
    if (!prediction) return;
    setChanged(true);
    const t = setTimeout(() => setChanged(false), 500);
    return () => clearTimeout(t);
  }, [keySig]);

  // No prediction yet
  if (!prediction || !prediction.aDozens || prediction.aDozens.length === 0) {
    return (
      <section aria-label="Prediction panel" className="mb-4">
        <motion.div
          className="flex items-center gap-2 mb-2 justify-center"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <TargetIcon className="text-amber-400" />
          <h3 className="text-lg font-semibold text-white">Prediction</h3>
        </motion.div>
        <div className="rounded-xl bg-gray-700 p-4 ring-1 ring-gray-600 border border-gray-600 text-center">
          <p className="text-gray-400 text-sm">Enter at least 5 spins to start prediction analysis.</p>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Prediction panel" className="mb-4">
      {/* Header */}
      <motion.div
        className="flex items-center gap-2 mb-3 justify-center"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <TargetIcon className="text-amber-400" />
        <h3 className="text-lg font-semibold text-white">Dynamic Prediction</h3>
      </motion.div>

      {/* Main Card */}
      <motion.div
        key={keySig}
        className="rounded-xl bg-gray-700/80 backdrop-blur-sm p-4 ring-1 ring-amber-500/30 border border-amber-400/20 space-y-4"
        initial={false}
        animate={{
          boxShadow: changed
            ? "0 0 0 4px rgba(251,191,36,0.25)"
            : "0 0 0 0px rgba(0,0,0,0)",
          scale: changed ? 1.01 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 24, mass: 0.6 }}
      >
        {/* Action + Loss */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <ActionBadge action={prediction.action} />
          <LossIndicator count={lossStreak} />
        </div>

        {/* ── UX Messages: WAIT / SHIFT ── */}
        {prediction.action === "WAIT" && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-900/30 border border-amber-500/30 rounded-lg p-3 text-center"
          >
            <p className="text-amber-300 text-sm font-medium">
              ⏸ Pattern unclear. Wait for a better opportunity.
            </p>
            {lossStreak >= 3 && (
              <p className="text-red-400 text-xs mt-1 font-semibold">
                ⛔ Force WAIT active — {lossStreak} consecutive losses detected.
              </p>
            )}
          </motion.div>
        )}

        {prediction.analysis?.shift?.stage &&
          prediction.analysis.shift.stage !== "none" &&
          prediction.analysis.shift.shiftDozen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-2 text-center"
          >
            <p className="text-purple-300 text-sm font-medium">
              ⚡ Trend shift detected in {prediction.analysis.shift.shiftDozen}. Be cautious.
            </p>
          </motion.div>
        )}

        {/* A Dozens (BET) */}
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <TargetIcon className="text-emerald-400 h-3.5 w-3.5" />
            A Dozens — Bet On
          </div>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence mode="popLayout">
              {prediction.aDozens.map((d) => (
                <DozenPill key={d} label={d} type="A" />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* B Dozen (AVOID) */}
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <ShieldIcon className="text-red-400 h-3.5 w-3.5" />
            B Dozen — Avoid
          </div>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence mode="popLayout">
              <DozenPill key={prediction.bDozen} label={prediction.bDozen} type="B" />
            </AnimatePresence>
          </div>
        </div>

        {/* Confidence */}
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1.5">Confidence</div>
          <ConfidenceBar level={prediction.confidence} />
        </div>

        {/* Reason */}
        <div className="bg-gray-800/60 rounded-lg p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Analysis</div>
          <p className="text-sm text-gray-200 leading-relaxed">{prediction.reason}</p>
        </div>

        {/* Shift / Streak Alerts */}
        {prediction.analysis && (
          <div className="flex flex-wrap gap-2">
            {prediction.analysis.streak?.isActive && prediction.analysis.streak.streakLength >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-600/20 text-blue-400 text-xs font-medium ring-1 ring-blue-500/30"
              >
                🔥 Streak: {prediction.analysis.streak.streakDozen} × {prediction.analysis.streak.streakLength}
              </motion.div>
            )}
            {prediction.analysis.shift?.stage !== "none" && prediction.analysis.shift?.shiftDozen && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ring-1 ${
                  prediction.analysis.shift.stage === "confirmed_shift"
                    ? "bg-purple-600/20 text-purple-400 ring-purple-500/30"
                    : prediction.analysis.shift.stage === "possible_shift"
                    ? "bg-amber-600/20 text-amber-400 ring-amber-500/30"
                    : "bg-yellow-600/20 text-yellow-400 ring-yellow-500/30"
                }`}
              >
                {prediction.analysis.shift.stage === "confirmed_shift" ? "⚡" : "⚠"}{" "}
                Shift: {prediction.analysis.shift.shiftDozen} ({prediction.analysis.shift.stage.replace("_", " ")})
              </motion.div>
            )}
          </div>
        )}
      </motion.div>

      <div className="text-xs text-gray-500 text-center mt-2">
        Dynamic A/B classification — last 11 spins weighted analysis
      </div>
    </section>
  );
}
