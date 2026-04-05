"use client";

/**
 * RecentNumbers — Prediction History Display
 *
 * Shows each spin result with auto-matched outcome:
 *   GREEN border  → correct prediction (WIN)
 *   RED border    → wrong prediction (LOSS)
 *   YELLOW border → system said WAIT (no bet)
 *   GRAY border   → no prediction available
 */

const redNumbers = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);

function getNumberColor(num) {
  if (num === 0) return "bg-green-600";
  return redNumbers.has(num) ? "bg-red-600" : "bg-black";
}

// Border + ring styles per outcome
function getOutcomeStyle(outcome) {
  switch (outcome) {
    case "WIN":
      return {
        ring: "ring-2 ring-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]",
        label: "WIN",
        labelClass: "bg-emerald-600 text-emerald-100",
      };
    case "LOSS":
      return {
        ring: "ring-2 ring-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]",
        label: "LOSS",
        labelClass: "bg-red-600 text-red-100",
      };
    case "WAIT":
      return {
        ring: "ring-2 ring-yellow-500/60 shadow-[0_0_6px_rgba(234,179,8,0.25)]",
        label: "WAIT",
        labelClass: "bg-yellow-600 text-yellow-100",
      };
    default:
      return {
        ring: "ring-1 ring-gray-600",
        label: "",
        labelClass: "bg-gray-600 text-gray-300",
      };
  }
}

export default function RecentNumbers({ predictionHistory = [], lossStreak = 0 }) {
  const entries = predictionHistory.slice(0, 15);

  if (!entries.length) {
    return (
      <div className="text-center py-2">
        <p className="text-gray-400 text-sm italic">No spins recorded yet...</p>
        <p className="text-gray-500 text-xs mt-1">Click numbers on the board or spin the wheel</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-amber-400">
          📋 Prediction History
        </h3>
        {/* Loss streak badge */}
        {lossStreak > 0 && (
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-md ${
              lossStreak >= 3
                ? "bg-red-600/30 text-red-400 ring-1 ring-red-500/40"
                : lossStreak === 2
                ? "bg-amber-600/30 text-amber-400 ring-1 ring-amber-500/40"
                : "bg-yellow-600/30 text-yellow-300 ring-1 ring-yellow-500/30"
            }`}
          >
            Loss Streak: {lossStreak}
            {lossStreak >= 3 && " ⛔"}
          </span>
        )}
      </div>

      {/* Spin entries */}
      <div className="flex flex-wrap gap-2">
        {entries.map((entry, idx) => {
          const numberBg = getNumberColor(entry.spin);
          const style = getOutcomeStyle(entry.outcome);

          return (
            <div key={entry.ts ?? idx} className="relative group">
              <div
                className={`${numberBg} ${style.ring} w-8 h-8 flex items-center justify-center rounded-full text-white font-bold text-xs shadow-md transition-transform group-hover:scale-110`}
                title={`Spin: ${entry.spin} | Dozen: ${entry.dozen || "0"} | ${
                  entry.outcome
                }${
                  entry.prediction
                    ? ` | Predicted: A=[${entry.prediction.aDozens.join(",")}] B=${entry.prediction.bDozen}`
                    : ""
                }`}
              >
                {entry.spin}
              </div>

              {/* Outcome label below circle */}
              <div className="flex justify-center mt-0.5">
                <span
                  className={`text-[8px] font-bold px-1 py-px rounded ${style.labelClass}`}
                >
                  {style.label || "—"}
                </span>
              </div>

              {/* Tooltip on hover showing prediction details */}
              {entry.prediction && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 w-40">
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs shadow-xl">
                    <div className="text-gray-400 mb-1">Prediction was:</div>
                    <div className="text-emerald-400">
                      BET: {entry.prediction.aDozens.join(", ")}
                    </div>
                    <div className="text-red-400">
                      AVOID: {entry.prediction.bDozen}
                    </div>
                    <div className="text-gray-300 mt-1">
                      {entry.prediction.confidence} confidence
                    </div>
                    <div className="text-gray-300">
                      Action: {entry.prediction.action}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick legend */}
      <div className="flex items-center justify-center gap-3 mt-2 text-[10px] text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> WIN
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> LOSS
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" /> WAIT
        </span>
      </div>
    </div>
  );
}
