"use client";

import SuggestionDisplay from "./SuggestionDisplay";

export default function AnalyticsDashboard({
  history = [],
  topDozens = [],
  dozenCounts = { "1-12": 0, "13-24": 0, "25-36": 0 },
  onRemoveLast,
}) {
  const last11Numbers = history.slice(0, 11);
  const last15Numbers = history.slice(-15);

  // Frequency Map for hot numbers
  const freqMap = {};
  last15Numbers.forEach((n) => (freqMap[n] = (freqMap[n] || 0) + 1));

  // Sirf hot numbers (3+ occurrences)
  const hotNumbers = Object.keys(freqMap)
    .filter((n) => freqMap[n] >= 3)
    .slice(0, 8); // Max 8 numbers show karo

  // Column stats for last 11 numbers
  const columnCountsLast11 = { "Col 1": 0, "Col 2": 0, "Col 3": 0 };
  last11Numbers.forEach((num) => {
    if (num !== 0) {
      if (num % 3 === 1) columnCountsLast11["Col 1"]++;
      else if (num % 3 === 2) columnCountsLast11["Col 2"]++;
      else columnCountsLast11["Col 3"]++;
    }
  });

  // Pattern Detector
  const dozenTrendLast11 = { "1-12": 0, "13-24": 0, "25-36": 0 };
  last11Numbers.forEach((num) => {
    if (num >= 1 && num <= 12) dozenTrendLast11["1-12"]++;
    else if (num >= 13 && num <= 24) dozenTrendLast11["13-24"]++;
    else if (num >= 25 && num <= 36) dozenTrendLast11["25-36"]++;
  });

  const strongestDozen = Object.entries(dozenTrendLast11).sort(
    (a, b) => b[1] - a[1]
  )[0];

  let patternMessage = "No clear trend in last 11 spins";
  if (strongestDozen[1] >= 5) {
    patternMessage = `Strong trend: ${strongestDozen[0]} (${strongestDozen[1]}/11 spins)`;
  } else if (strongestDozen[1] === 4) {
    patternMessage = `Possible trend: ${strongestDozen[0]} (${strongestDozen[1]}/11 spins)`;
  }

  const totalLast11 = last11Numbers.filter((n) => n !== 0).length;

  return (
    <div className="w-full bg-gray-800 bg-opacity-70 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold text-white">Analytics Dashboard</h2>
        {onRemoveLast && (
          <button
            onClick={onRemoveLast}
            aria-label="Undo last number"
            className="px-3 py-1 text-sm rounded bg-amber-600 text-white hover:bg-amber-500 transition-all"
          >
            Undo Last
          </button>
        )}
      </div>

      <div className="text-xs text-amber-300 mb-3 text-center">
        Based on last 11 spins analysis
      </div>

      <SuggestionDisplay topDozens={topDozens} />

      {/* Hot Numbers Only - Clean Layout */}
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

      {/* Dozen Performance - Last 11 Spins */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {["1-12", "13-24", "25-36"].map((d) => (
          <div key={d} className="bg-gray-700 p-2 rounded-lg text-center">
            <div className="text-xs text-amber-400 mb-1">{d}</div>
            <div className="text-white font-bold text-lg">
              {dozenTrendLast11[d]}
            </div>
            <div className="text-xs text-gray-400">
              {totalLast11
                ? ((dozenTrendLast11[d] / totalLast11) * 100).toFixed(0)
                : 0}
              %
            </div>
          </div>
        ))}
      </div>

      {/* Column Performance - Last 11 Spins */}
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
          📊 Pattern Insight
        </h3>
        <div className="text-white text-sm text-center">{patternMessage}</div>
        <div className="text-xs text-gray-400 text-center mt-2">
          Based on last 11 spins data
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="bg-gray-700 p-3 rounded-lg mt-3">
        <h3 className="text-sm font-semibold text-amber-400 mb-2 text-center">
          📈 Summary
        </h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-gray-300">Total Spins:</div>
          <div className="text-white font-medium">{history.length}</div>

          <div className="text-gray-300">Last 11 Spins:</div>
          <div className="text-white font-medium">{last11Numbers.length}</div>

          <div className="text-gray-300">Analysis Based:</div>
          <div className="text-white font-medium">Last 11 spins</div>
        </div>
      </div>
    </div>
  );
}
