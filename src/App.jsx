"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import RouletteWheel from "./components/RouletteWheel";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import RecentNumbers from "./components/RecentNumbers";
import QuickButtons from "./components/QuickButtons";
import PredictionPanel from "./components/PredictionPanel";
import { runPrediction, getDozen } from "./utils/predictionEngine";

const STORAGE_KEY = "roulette_state_v5";
const HISTORY_CAP = 500;
const PREDICTION_HISTORY_CAP = 30; // store last 30 prediction outcomes

/**
 * Count consecutive losses from the most recent entry backward.
 * WAIT entries are skipped (no bet was placed).
 * Stops counting at the first WIN.
 */
function countLossStreak(predHistory) {
  let streak = 0;
  for (const entry of predHistory) {
    if (entry.outcome === "LOSS") {
      streak++;
    } else if (entry.outcome === "WIN") {
      break; // stop at first win
    }
    // WAIT entries are skipped — no bet was placed
  }
  return streak;
}

export default function App() {
  const [history, setHistory] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Ref to always have the latest prediction available in callbacks
  const predictionRef = useRef(null);
  useEffect(() => {
    predictionRef.current = prediction;
  }, [prediction]);

  // Derive lossStreak from auto-matched prediction history
  const lossStreak = useMemo(
    () => countLossStreak(predictionHistory),
    [predictionHistory]
  );

  // ── Load from localStorage ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        setHistory(saved.history || []);
        setPredictionHistory(saved.predictionHistory || []);
      }
    } catch (e) {
      console.warn("Failed to load roulette state:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // ── Recalculate prediction whenever history or lossStreak changes ──
  useEffect(() => {
    if (!isLoaded) return;
    if (history.length > 0) {
      const result = runPrediction(history, lossStreak);
      setPrediction(result);
    } else {
      setPrediction(null);
    }
  }, [history, lossStreak, isLoaded]);

  // ── Save to localStorage ──
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const payload = JSON.stringify({ history, predictionHistory });
      localStorage.setItem(STORAGE_KEY, payload);
    } catch (e) {
      console.warn("Failed to save roulette state:", e);
    }
  }, [history, predictionHistory, isLoaded]);

  const lastSpinIdRef = useRef(null);
  const lastAppendTimeRef = useRef(0);

  /**
   * Core function: add a new spin result.
   *
   * Before adding, captures the CURRENT prediction and auto-matches
   * the new number against it to determine WIN/LOSS/WAIT.
   */
  const appendResult = useCallback(
    (number, spinId = null) => {
      const num = parseInt(number);
      if (isNaN(num) || num < 0 || num > 36) return;

      const now = Date.now();
      if (spinId !== null && lastSpinIdRef.current === spinId) return;
      if (spinId !== null) lastSpinIdRef.current = spinId;
      if (now - lastAppendTimeRef.current < 500) return;
      lastAppendTimeRef.current = now;

      // ── Auto-match: compare new spin with CURRENT prediction ──
      const currentPred = predictionRef.current;
      const dozen = getDozen(num); // null for 0

      let outcome = "WAIT"; // default if no prediction
      let predSnapshot = null;

      if (currentPred && currentPred.aDozens && currentPred.aDozens.length > 0) {
        // Save a lightweight snapshot of the prediction
        predSnapshot = {
          aDozens: [...currentPred.aDozens],
          bDozen: currentPred.bDozen,
          action: currentPred.action,
          confidence: currentPred.confidence,
          reason: currentPred.reason,
        };

        if (currentPred.action === "BET") {
          // Number 0 (green) is always a loss when betting on dozens
          if (dozen === null) {
            outcome = "LOSS";
          } else if (currentPred.aDozens.includes(dozen)) {
            outcome = "WIN";
          } else {
            outcome = "LOSS";
          }
        } else {
          // System said WAIT — no bet placed
          outcome = "WAIT";
        }
      }

      // Create prediction history entry
      const historyEntry = {
        spin: num,
        dozen,
        prediction: predSnapshot,
        outcome,
        ts: now,
      };

      // Update prediction history
      setPredictionHistory((prev) =>
        [historyEntry, ...prev].slice(0, PREDICTION_HISTORY_CAP)
      );

      // Update spin history
      setHistory((prev) => [num, ...prev].slice(0, HISTORY_CAP));
    },
    []
  );

  const handleSpinResult = useCallback(
    (res) => {
      const number = typeof res === "number" ? res : res?.value;
      const spinId = typeof res === "object" ? res?.spinId : undefined;
      appendResult(number, spinId);
    },
    [appendResult]
  );

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

    setHistory([]);
    setPrediction(null);
    setPredictionHistory([]);

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn("Failed to clear localStorage:", e);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
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

      <div className="relative z-10 container mx-auto px-2 sm:px-3 py-2 sm:py-4 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-2 sm:mb-4">
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
            Roulette Analyzer
          </h1>
        </header>

        {/* Main Content — responsive grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {/* Wheel — hidden on mobile, shown on md+ */}
          <div className="hidden md:flex lg:col-span-1 bg-gray-800/50 backdrop-blur-md rounded-xl p-2 sm:p-3 border border-gray-700 flex-col items-center">
            <RouletteWheel onSpinResult={handleSpinResult} size={240} />
            <div className="flex justify-center mt-2">
              <button
                onClick={handleClear}
                className="px-3 py-1 bg-red-600 text-white text-[11px] rounded-lg hover:bg-red-500 transition-all"
                title="Clear All Data"
              >
                × Clear All
              </button>
            </div>
          </div>

          {/* Board + History — full width mobile, 2-span desktop */}
          <div className="md:col-span-1 lg:col-span-2 bg-gray-800/50 backdrop-blur-md rounded-xl p-2 sm:p-3 border border-gray-700">
            <QuickButtons onAddNumber={addNumber} onBet={handleBet} />

            {/* Prediction History */}
            <div className="mt-2 sm:mt-3">
              <RecentNumbers
                predictionHistory={predictionHistory}
                lossStreak={lossStreak}
              />
            </div>

            {/* Mobile-only: Clear button */}
            <div className="flex justify-center mt-2 md:hidden">
              <button
                onClick={handleClear}
                className="px-3 py-1 bg-red-600 text-white text-[11px] rounded-lg hover:bg-red-500 transition-all"
                title="Clear All Data"
              >
                × Clear All
              </button>
            </div>
          </div>

          {/* Prediction + Analytics */}
          <div className="md:col-span-2 lg:col-span-1 bg-gray-800/50 backdrop-blur-md rounded-xl p-2 sm:p-3 border border-gray-700">
            <PredictionPanel prediction={prediction} lossStreak={lossStreak} />
            <AnalyticsDashboard history={history} prediction={prediction} />
          </div>
        </div>
      </div>
    </div>
  );
}

