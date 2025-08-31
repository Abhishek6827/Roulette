"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import RouletteWheel from "./components/RouletteWheel";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import RecentNumbers from "./components/RecentNumbers";
import QuickButtons from "./components/QuickButtons";
import NumberInput from "./components/NumberInput";

const STORAGE_KEY = "roulette_state_v3";
const HISTORY_CAP = 500;
const RECENT_CAP = 12;

export default function App() {
  const [numbersInput, setNumbersInput] = useState("");
  const [history, setHistory] = useState([]);
  const [topDozens, setTopDozens] = useState([]);
  const [dozenCounts, setDozenCounts] = useState({
    "1-12": 0,
    "13-24": 0,
    "25-36": 0,
  });
  const [recentItems, setRecentItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        setNumbersInput(saved.numbersInput || "");
        setHistory(saved.history || []);
        setTopDozens(saved.topDozens || []);
        setDozenCounts(
          saved.dozenCounts || { "1-12": 0, "13-24": 0, "25-36": 0 }
        );
        setRecentItems(saved.recentItems || []);
      }
    } catch (e) {
      console.warn("Failed to load roulette state:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isLoaded) return;

    try {
      const payload = JSON.stringify({
        numbersInput,
        history,
        topDozens,
        dozenCounts,
        recentItems,
      });
      localStorage.setItem(STORAGE_KEY, payload);
    } catch (e) {
      console.warn("Failed to save roulette state:", e);
    }
  }, [numbersInput, history, topDozens, dozenCounts, recentItems, isLoaded]);

  const lastSpinIdRef = useRef(null);
  const lastAppendTimeRef = useRef(0);

  const calculateSuggestion = useCallback((nums) => {
    const last11 = nums.slice(0, 11); // Last 11 spins

    let count1 = 0,
      count2 = 0,
      count3 = 0;
    last11.forEach((n) => {
      if (n >= 1 && n <= 12) count1++;
      else if (n >= 13 && n <= 24) count2++;
      else if (n >= 25 && n <= 36) count3++;
    });

    const suggestions = [
      { name: "1-12", count: count1 },
      { name: "13-24", count: count2 },
      { name: "25-36", count: count3 },
    ];

    // Sort by count (descending) to find the MOST frequent dozens
    suggestions.sort((a, b) => b.count - a.count);

    // Take the 2 MOST frequent dozens as suggestions
    setTopDozens(suggestions.slice(0, 2).map((s) => s.name));
    setDozenCounts({ "1-12": count1, "13-24": count2, "25-36": count3 });
  }, []);

  const appendResult = useCallback(
    (number, spinId = null) => {
      const num = parseInt(number);
      if (isNaN(num) || num < 0 || num > 36) return;

      const now = Date.now();
      if (spinId !== null && lastSpinIdRef.current === spinId) return;
      if (spinId !== null) lastSpinIdRef.current = spinId;
      if (now - lastAppendTimeRef.current < 500) return;

      lastAppendTimeRef.current = now;

      setHistory((prev) => {
        const updated = [num, ...prev].slice(0, HISTORY_CAP);
        calculateSuggestion(updated);
        return updated;
      });

      setRecentItems((prev) => {
        const lastTs = prev[0]?.ts || 0;
        const tsUnique = now <= lastTs ? lastTs + 1 : now;
        return [{ value: num, outcome: null, ts: tsUnique }, ...prev].slice(
          0,
          RECENT_CAP
        );
      });
    },
    [calculateSuggestion]
  );

  const handleSpinResult = useCallback(
    (res) => {
      const number = typeof res === "number" ? res : res?.value;
      const spinId = typeof res === "object" ? res?.spinId : undefined;
      appendResult(number, spinId);
    },
    [appendResult]
  );

  const markRecentOutcome = useCallback((ts, outcome) => {
    setRecentItems((prev) =>
      prev.map((it) => (it.ts === ts ? { ...it, outcome } : it))
    );
  }, []);

  const removeLast = useCallback(() => {
    if (history.length === 0) return;

    const updatedHistory = history.slice(1);
    setHistory(updatedHistory);
    setRecentItems((prev) => (prev.length > 0 ? prev.slice(1) : []));
    calculateSuggestion(updatedHistory);
  }, [history, calculateSuggestion]);

  const addNumber = useCallback(
    (num) => {
      appendResult(num);
    },
    [appendResult]
  );

  const handleBet = useCallback((betType) => {
    console.log("Bet placed on:", betType);
  }, []);

  const handleClear = useCallback(() => {
    lastSpinIdRef.current = null;
    lastAppendTimeRef.current = 0;

    setNumbersInput("");
    setHistory([]);
    setTopDozens([]);
    setRecentItems([]);
    setDozenCounts({ "1-12": 0, "13-24": 0, "25-36": 0 });

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn("Failed to clear localStorage:", e);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute w-4 h-4 bg-white rounded-full opacity-10"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-3 py-4 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
            Roulette Analyzer
          </h1>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-3">
          {/* Wheel Container */}
          <div className="lg:col-span-1 bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-3 border border-gray-700 flex flex-col items-center">
            <RouletteWheel onSpinResult={handleSpinResult} size={280} />

            {/* Manual Input */}
            <div className="mt-4 w-full">
              <h3 className="text-sm font-semibold text-amber-400 mb-2 text-center">
                Manual Input
              </h3>
              <div className="flex justify-center">
                <NumberInput
                  numbersInput={numbersInput}
                  setNumbersInput={setNumbersInput}
                  onAddNumber={addNumber}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-2 mt-2">
                <button
                  onClick={removeLast}
                  className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-500"
                  title="Undo Last"
                >
                  ↩ Undo
                </button>
                <button
                  onClick={handleClear}
                  className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-500"
                  title="Clear All"
                >
                  × Clear
                </button>
              </div>
            </div>
          </div>

          {/* Quick Buttons Container */}
          <div className="lg:col-span-2 bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-3 border border-gray-700">
            <QuickButtons onAddNumber={addNumber} onBet={handleBet} />

            {/* Recent Numbers */}
            <div className="mt-4">
              <RecentNumbers
                items={recentItems}
                onRemoveLast={removeLast}
                onMarkOutcome={markRecentOutcome}
              />
            </div>
          </div>

          {/* Analytics - Made smaller */}
          <div className="lg:col-span-1 bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-3 border border-gray-700">
            <AnalyticsDashboard
              history={history}
              topDozens={topDozens}
              dozenCounts={dozenCounts}
              onRemoveLast={removeLast}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
