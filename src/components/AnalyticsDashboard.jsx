"use client";

export default function AnalyticsDashboard({
  history = [],
  prediction = null,
}) {
  const last11Numbers = history.slice(0, 11);
  const last15Numbers = history.slice(0, 15);

  // Frequency Map for hot numbers
  const freqMap = {};
  last15Numbers.forEach((n) => (freqMap[n] = (freqMap[n] || 0) + 1));

  // Only hot numbers (3+ occurrences)
  const hotNumbers = Object.keys(freqMap)
    .filter((n) => freqMap[n] >= 3)
    .slice(0, 8);

  // Column stats for last 11 numbers
  const columnCountsLast11 = { "Col 1": 0, "Col 2": 0, "Col 3": 0 };
  last11Numbers.forEach((num) => {
    if (num !== 0) {
      if (num % 3 === 1) columnCountsLast11["Col 1"]++;
      else if (num % 3 === 2) columnCountsLast11["Col 2"]++;
      else columnCountsLast11["Col 3"]++;
    }
  });

  // Dozen counts from prediction analysis (weighted + raw)
  const analysis = prediction?.analysis;
  const rawCounts = analysis?.frequency?.raw || { "1-12": 0, "13-24": 0, "25-36": 0 };
  const weightedScores = analysis?.scores || { "1-12": 0, "13-24": 0, "25-36": 0 };

  const totalLast11 = last11Numbers.filter((n) => n !== 0).length;

  // Streak & shift info
  const streak = analysis?.streak;
  const shift = analysis?.shift;

  // Build pattern message
  let patternMessage = "No clear trend in last 11 spins";
  let patternType = "neutral"; // neutral, positive, warning

  if (streak?.isActive && streak.streakLength >= 3) {
    patternMessage = `🔥 Strong streak: ${streak.streakDozen} (${streak.streakLength} consecutive)`;
    patternType = "positive";
  } else if (streak?.isActive && streak.streakLength >= 2) {
    patternMessage = `📈 Building streak: ${streak.streakDozen} (${streak.streakLength} consecutive)`;
    patternType = "positive";
  } else if (shift?.stage === "confirmed_shift") {
    patternMessage = `⚡ Confirmed shift to ${shift.shiftDozen}`;
    patternType = "positive";
  } else if (shift?.stage === "possible_shift") {
    patternMessage = `⚠️ Possible shift to ${shift.shiftDozen} — monitoring`;
    patternType = "warning";
  } else if (shift?.stage === "alert") {
    patternMessage = `👀 Shift alert: ${shift.shiftDozen} appearing after absence`;
    patternType = "warning";
  } else {
    // Fallback to frequency-based message
    const sorted = Object.entries(rawCounts).sort((a, b) => b[1] - a[1]);
    if (sorted[0][1] >= 5) {
      patternMessage = `Strong trend: ${sorted[0][0]} (${sorted[0][1]}/11 spins)`;
      patternType = "positive";
    } else if (sorted[0][1] >= 4) {
      patternMessage = `Possible trend: ${sorted[0][0]} (${sorted[0][1]}/11 spins)`;
    }
  }

  const patternColor =
    patternType === "positive"
      ? "text-emerald-300"
      : patternType === "warning"
      ? "text-amber-300"
      : "text-white";

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold text-white">Analytics</h2>
      </div>

      <div className="text-xs text-amber-300 mb-3 text-center">
        Last 11 spins — weighted analysis
      </div>

      {/* Hot Numbers */}
      <div className="bg-gray-700 p-3 rounded-lg mb-4">
        <h3 className="text-sm font-semibold text-amber-400 mb-2 text-center">
          🔥 Frequent Numbers (Last 15 spins)
        </h3>
        <div className="flex flex-wrap gap-1 justify-center">
          {hotNumbers.length > 0 ? (
            hotNumbers.map((n) => (
              <span
                key={n}
                className="px-2 py-1 bg-red-600 text-white text-xs rounded font-bold"
              >
                {n}
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-xs">
              No frequent numbers yet
            </span>
          )}
        </div>
        <div className="text-xs text-gray-400 text-center mt-2">
          Numbers that appeared 3+ times
        </div>
      </div>

      {/* Dozen Performance — Raw + Weighted */}
      <div className="bg-gray-700 p-3 rounded-lg mb-4">
        <h3 className="text-sm font-semibold text-amber-400 mb-2 text-center">
          📊 Dozen Performance
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {["1-12", "13-24", "25-36"].map((d) => {
            const isB = prediction?.bDozen === d;
            const isA = prediction?.aDozens?.includes(d);
            const ringClass = isB
              ? "ring-2 ring-red-500/60"
              : isA
              ? "ring-2 ring-emerald-500/60"
              : "";
            const labelClass = isB
              ? "text-red-400"
              : isA
              ? "text-emerald-400"
              : "text-amber-400";

            return (
              <div
                key={d}
                className={`bg-gray-800 p-2 rounded-lg text-center ${ringClass} transition-all`}
              >
                <div className={`text-xs font-bold mb-1 ${labelClass}`}>
                  {d}
                  {isA && <span className="ml-1 text-[9px] opacity-70">(A)</span>}
                  {isB && <span className="ml-1 text-[9px] opacity-70">(B)</span>}
                </div>
                <div className="text-white font-bold text-lg">{rawCounts[d]}</div>
                <div className="text-xs text-gray-400">
                  {totalLast11
                    ? ((rawCounts[d] / totalLast11) * 100).toFixed(0)
                    : 0}
                  %
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">
                  Score: {(weightedScores[d] || 0).toFixed(1)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Column Performance */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {["Col 1", "Col 2", "Col 3"].map((col) => (
          <div key={col} className="bg-gray-700 p-2 rounded-lg text-center">
            <div className="text-xs text-amber-400 mb-1">{col}</div>
            <div className="text-white font-bold text-lg">
              {columnCountsLast11[col]}
            </div>
            <div className="text-xs text-gray-400">
              {totalLast11
                ? ((columnCountsLast11[col] / totalLast11) * 100).toFixed(0)
                : 0}
              %
            </div>
          </div>
        ))}
      </div>

      {/* Pattern Detection */}
      <div className="bg-gray-700 p-3 rounded-lg">
        <h3 className="text-sm font-semibold text-amber-400 mb-2 text-center">
          🔍 Pattern Detection
        </h3>
        <div className={`text-sm text-center font-medium ${patternColor}`}>
          {patternMessage}
        </div>

        {/* Last 5 dozens sequence */}
        {analysis?.last5Dozens && analysis.last5Dozens.length > 0 && (
          <div className="mt-2 flex items-center justify-center gap-1">
            <span className="text-[10px] text-gray-500 mr-1">Recent:</span>
            {analysis.last5Dozens.map((d, i) => (
              <span
                key={i}
                className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                  d === prediction?.bDozen
                    ? "bg-red-600/30 text-red-300"
                    : "bg-emerald-600/30 text-emerald-300"
                }`}
              >
                {d}
              </span>
            ))}
          </div>
        )}

        <div className="text-xs text-gray-400 text-center mt-2">
          Streak, shift & trend analysis
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-700 p-3 rounded-lg mt-3">
        <h3 className="text-sm font-semibold text-amber-400 mb-2 text-center">
          📈 Summary
        </h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-gray-300">Total Spins:</div>
          <div className="text-white font-medium">{history.length}</div>

          <div className="text-gray-300">Last 11 Spins:</div>
          <div className="text-white font-medium">{last11Numbers.length}</div>

          <div className="text-gray-300">Analysis:</div>
          <div className="text-white font-medium">Weighted + Pattern</div>
        </div>
      </div>
    </div>
  );
}
