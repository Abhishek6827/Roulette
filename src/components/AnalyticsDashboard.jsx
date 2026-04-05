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
  last11Numbers.forEach((n) => {
    if (n === 0) return;
    if (n % 3 === 1) columnCountsLast11["Col 1"]++;
    else if (n % 3 === 2) columnCountsLast11["Col 2"]++;
    else columnCountsLast11["Col 3"]++;
  });

  // Dozen counts for last 11 numbers
  const rawCounts = { "1-12": 0, "13-24": 0, "25-36": 0 };
  last11Numbers.forEach((n) => {
    if (n >= 1 && n <= 12) rawCounts["1-12"]++;
    else if (n >= 13 && n <= 24) rawCounts["13-24"]++;
    else if (n >= 25 && n <= 36) rawCounts["25-36"]++;
  });

  const totalLast11 = last11Numbers.filter((n) => n > 0).length;

  // Get weighted scores from prediction analysis
  const analysis = prediction?.analysis || null;
  const weightedScores = analysis?.scores || {};

  // Pattern message from analysis
  let patternMessage = "No pattern detected yet";
  let patternColor = "text-gray-400";
  let patternType = "neutral";

  if (analysis) {
    const { streak, shift } = analysis;
    if (streak?.isActive && streak.streakLength >= 2) {
      patternMessage = `Active streak: ${streak.streakDozen} × ${streak.streakLength}`;
      patternColor = "text-emerald-300";
      patternType = "positive";
    } else if (shift?.stage === "confirmed_shift") {
      patternMessage = `Confirmed shift to ${shift.shiftDozen}`;
      patternColor = "text-emerald-300";
      patternType = "positive";
    } else if (shift?.stage === "possible_shift") {
      patternMessage = `Possible shift to ${shift.shiftDozen} — monitoring`;
      patternColor = "text-amber-300";
      patternType = "warning";
    } else if (shift?.stage === "alert") {
      patternMessage = `Shift alert: ${shift.shiftDozen} appearing after absence`;
      patternColor = "text-amber-300";
      patternType = "warning";
    } else {
      patternMessage = "Monitoring trends...";
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-white">📊 Analytics</h2>
        <span className="text-xs text-amber-300">Last 11 spins — weighted</span>
      </div>

      {/* Horizontal card grid — 4 cols on lg, 2 on md, 1 on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {/* Card 1: Hot Numbers */}
        <div className="bg-gray-700 p-3 rounded-lg">
          <h3 className="text-sm font-semibold text-amber-400 mb-2">
            🔥 Hot Numbers
          </h3>
          <div className="flex flex-wrap gap-1">
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
              <span className="text-gray-400 text-xs">No frequent numbers yet</span>
            )}
          </div>
          <div className="text-[10px] text-gray-500 mt-2">
            Numbers that appeared 3+ times in last 15 spins
          </div>
        </div>

        {/* Card 2: Dozen Performance */}
        <div className="bg-gray-700 p-3 rounded-lg">
          <h3 className="text-sm font-semibold text-amber-400 mb-2">
            📊 Dozen Performance
          </h3>
          <div className="grid grid-cols-3 gap-1.5">
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
                  <div className={`text-[10px] font-bold ${labelClass}`}>
                    {d}
                    {isA && <span className="ml-0.5 opacity-60">(A)</span>}
                    {isB && <span className="ml-0.5 opacity-60">(B)</span>}
                  </div>
                  <div className="text-white font-bold text-lg">{rawCounts[d]}</div>
                  <div className="text-[10px] text-gray-400">
                    {totalLast11
                      ? ((rawCounts[d] / totalLast11) * 100).toFixed(0)
                      : 0}%
                    <span className="text-gray-500 ml-1">
                      S:{(weightedScores[d] || 0).toFixed(0)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 3: Pattern Detection */}
        <div className="bg-gray-700 p-3 rounded-lg">
          <h3 className="text-sm font-semibold text-amber-400 mb-2">
            🔍 Patterns
          </h3>
          <div className={`text-sm font-medium ${patternColor}`}>
            {patternMessage}
          </div>

          {analysis?.last5Dozens && analysis.last5Dozens.length > 0 && (
            <div className="mt-2 flex items-center gap-1 flex-wrap">
              <span className="text-[10px] text-gray-500">Recent:</span>
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

          <div className="text-[10px] text-gray-500 mt-2">
            Streak, shift & trend analysis
          </div>
        </div>

        {/* Card 4: Columns + Summary */}
        <div className="bg-gray-700 p-3 rounded-lg">
          <h3 className="text-sm font-semibold text-amber-400 mb-2">
            📈 Summary
          </h3>

          {/* Column stats */}
          <div className="grid grid-cols-3 gap-1.5 mb-2">
            {["Col 1", "Col 2", "Col 3"].map((col) => (
              <div key={col} className="bg-gray-800 p-1.5 rounded text-center">
                <div className="text-[10px] text-amber-400">{col}</div>
                <div className="text-white font-bold text-sm">
                  {columnCountsLast11[col]}
                </div>
                <div className="text-[10px] text-gray-400">
                  {totalLast11
                    ? ((columnCountsLast11[col] / totalLast11) * 100).toFixed(0)
                    : 0}%
                </div>
              </div>
            ))}
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-x-2 text-xs">
            <div className="text-gray-400">Total Spins:</div>
            <div className="text-white font-medium">{history.length}</div>
            <div className="text-gray-400">Analysis:</div>
            <div className="text-white font-medium">Weighted + Pattern</div>
          </div>
        </div>
      </div>
    </div>
  );
}
