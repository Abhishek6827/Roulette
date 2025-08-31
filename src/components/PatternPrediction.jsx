export default function PatternPrediction({ history }) {
  if (!history || history.length === 0) return null;

  let count1 = 0,
    count2 = 0,
    count3 = 0;

  // last 30 numbers consider karenge
  const lastNumbers = history.slice(-30);

  lastNumbers.forEach((n) => {
    if (n >= 1 && n <= 12) count1++;
    else if (n >= 13 && n <= 24) count2++;
    else if (n >= 25 && n <= 36) count3++;
  });

  const counts = [
    { name: "1-12", count: count1 },
    { name: "13-24", count: count2 },
    { name: "25-36", count: count3 },
  ];

  // Minimum count wala dozen as likely next
  counts.sort((a, b) => a.count - b.count);
  const likelyNext = counts[0].name;

  return (
    <div className="mt-4 text-lg font-semibold text-purple-700">
      Predicted Next Likely Dozen:{" "}
      <span className="bg-purple-300 px-2 py-1 rounded">{likelyNext}</span>
    </div>
  );
}
