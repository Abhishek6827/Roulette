"use client";

export default function RecentNumbers({
  items,
  numbers = [],
  onRemoveLast,
  onMarkOutcome,
}) {
  const redNumbers = [
    1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
  ];

  const getColor = (num) => {
    if (num === 0) return "bg-green-600";
    return redNumbers.includes(num) ? "bg-red-600" : "bg-black";
  };

  const latest = (
    Array.isArray(items) && items.length
      ? items.map((it) => ({
          value: it.value,
          outcome: it.outcome ?? null,
          ts: it.ts,
        }))
      : numbers
          .slice(-12)
          .reverse()
          .map((n, idx) => ({ value: n, outcome: null, ts: idx }))
  ).slice(0, 12);

  if (!latest.length) {
    return <p className="text-gray-400 italic">No recent numbers yet...</p>;
  }

  return (
    <div className="flex items-center justify-between gap-3 mt-4">
      <div className="flex flex-wrap gap-2">
        {latest.map((it, idx) => {
          const color = getColor(it.value);
          const outcomeRing =
            it.outcome === "win"
              ? "ring-2 ring-emerald-400"
              : it.outcome === "lose"
              ? "ring-2 ring-red-500"
              : "ring-0";
          return (
            <div key={it.ts ?? idx} className="relative group">
              <div
                className={`${color} ${outcomeRing} w-10 h-10 flex items-center justify-center rounded-full text-white font-bold shadow-md transition-transform group-hover:scale-105`}
                title={`Recent #${idx + 1}${
                  it.outcome ? ` • ${it.outcome}` : ""
                }`}
              >
                {it.value}
              </div>

              {typeof onMarkOutcome === "function" && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    aria-label="Mark win"
                    onClick={() => onMarkOutcome(it.ts, "win")}
                    className="w-5 h-5 rounded-full bg-emerald-600 hover:bg-emerald-500 shadow ring-1 ring-black/40 flex items-center justify-center"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M5 13l4 4L19 7"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    aria-label="Mark loss"
                    onClick={() => onMarkOutcome(it.ts, "lose")}
                    className="w-5 h-5 rounded-full bg-red-600 hover:bg-red-500 shadow ring-1 ring-black/40 flex items-center justify-center"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M6 6l12 12M18 6l-12 12"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {onRemoveLast && (
        <button
          onClick={onRemoveLast}
          aria-label="Remove last number"
          className="px-3 py-1.5 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 transition"
        >
          Remove Last
        </button>
      )}
    </div>
  );
}
