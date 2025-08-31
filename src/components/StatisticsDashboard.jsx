export default function StatisticsDashboard({ dozenCounts }) {
  const total = Object.values(dozenCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="w-full max-w-md bg-white p-4 rounded-xl shadow">
      <h2 className="text-lg font-bold mb-3">📊 Dozen Statistics</h2>
      {["1-12", "13-24", "25-36"].map((d) => (
        <div key={d} className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span>{d}</span>
            <span>
              {dozenCounts[d]} (
              {total ? ((dozenCounts[d] / total) * 100).toFixed(1) : 0}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 h-4 rounded">
            <div
              className="bg-green-500 h-4 rounded"
              style={{
                width: total ? `${(dozenCounts[d] / total) * 100}%` : "0%",
              }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
}
