"use client";

import { motion } from "framer-motion";

export default function QuickButtons({ onAddNumber, onBet, disabled = false }) {
  const redNumbers = new Set([
    1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
  ]);

  const numberAt = (rowIndex, colIndex) => {
    const base = 3 * (colIndex + 1);
    if (rowIndex === 0) return base;
    if (rowIndex === 1) return base - 1;
    return base - 2;
  };

  const handleNumberClick = (n) => {
    if (disabled) return;
    onAddNumber?.(n);
  };

  const handleBetClick = (id) => {
    if (disabled) return;
    onBet?.(id);
  };

  // Animation variants
  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.1 } },
    tap: { scale: 0.95, transition: { duration: 0.1 } },
  };

  const numberButtonClass = (n) => {
    const isRed = redNumbers.has(n);
    const base =
      "flex items-center justify-center text-white text-sm font-medium rounded-md transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-amber-400";
    const size = "h-full w-full px-2";
    const color = isRed
      ? "bg-red-600 hover:bg-red-700 shadow-lg"
      : "bg-black hover:bg-gray-900 shadow-lg";
    return `${base} ${size} ${color}`;
  };

  const zeroButtonClass =
    "flex items-center justify-center text-white text-base font-semibold rounded-md bg-emerald-700 hover:bg-emerald-800 transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-amber-400 h-full w-full shadow-lg";

  const sideButtonClass =
    "flex items-center justify-center text-white text-xs font-semibold rounded-md bg-emerald-700 hover:bg-emerald-800 transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-amber-400 h-full w-full px-2 shadow-lg";

  const outsideButtonClass =
    "flex items-center justify-center text-white text-sm font-medium rounded-md bg-emerald-700 hover:bg-emerald-800 transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-amber-400 h-full w-full px-3 shadow-lg";

  const outsideRedClass =
    "flex items-center justify-center text-white text-sm font-medium rounded-md bg-red-600 hover:bg-red-700 transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-amber-400 h-full w-full px-3 shadow-lg";

  const outsideBlackClass =
    "flex items-center justify-center text-white text-sm font-medium rounded-md bg-black hover:bg-gray-900 transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-amber-400 h-full w-full px-3 shadow-lg";

  return (
    <div className="w-full flex justify-center">
      <motion.div
        className="rounded-xl border-2 border-amber-500 p-4 bg-emerald-900 text-white shadow-2xl"
        aria-label="Roulette table"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Main grid: 60px (0) + 12 columns (numbers) + 80px (2 TO 1) */}
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: "60px repeat(12, minmax(0, 1fr)) 80px",
            gridAutoRows: "46px",
          }}
        >
          {/* 0 (spans 3 rows) */}
          <motion.button
            type="button"
            aria-label="Bet on 0"
            disabled={disabled}
            className={zeroButtonClass}
            style={{ gridColumn: "1 / 2", gridRow: "1 / span 3" }}
            onClick={() => handleNumberClick(0)}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            0
          </motion.button>

          {/* Numbers 1–36 (3 rows × 12 columns) */}
          {Array.from({ length: 12 }).map((_, col) =>
            [0, 1, 2].map((row) => {
              const n = numberAt(row, col);
              return (
                <motion.button
                  key={`${row}-${col}`}
                  type="button"
                  aria-label={`Bet on ${n}`}
                  disabled={disabled}
                  className={numberButtonClass(n)}
                  style={{
                    gridColumn: `${2 + col} / ${3 + col}`,
                    gridRow: `${1 + row} / ${2 + row}`,
                  }}
                  onClick={() => handleNumberClick(n)}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (row * 12 + col) * 0.01 }}
                >
                  {n}
                </motion.button>
              );
            })
          )}

          {/* "2 TO 1" column on the right aligned with each row */}
          {[1, 2, 3].map((row) => (
            <motion.button
              key={`2to1-${row}`}
              type="button"
              aria-label={`Bet on 2 to 1 row ${row}`}
              disabled={disabled}
              className={sideButtonClass}
              style={{ gridColumn: "14 / 15", gridRow: `${row} / ${row + 1}` }}
              onClick={() => handleBetClick(`col-${row}`)}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              2 TO 1
            </motion.button>
          ))}

          {/* Dozens row aligned beneath the numbers (row 4) */}
          <motion.button
            type="button"
            aria-label="Bet on 1st 12 (1-12)"
            disabled={disabled}
            className={outsideButtonClass}
            style={{ gridColumn: "2 / 6", gridRow: "4 / 5" }}
            onClick={() => handleBetClick("dozen-1")}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            1st 12
          </motion.button>
          <motion.button
            type="button"
            aria-label="Bet on 2nd 12 (13-24)"
            disabled={disabled}
            className={outsideButtonClass}
            style={{ gridColumn: "6 / 10", gridRow: "4 / 5" }}
            onClick={() => handleBetClick("dozen-2")}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            2nd 12
          </motion.button>
          <motion.button
            type="button"
            aria-label="Bet on 3rd 12 (25-36)"
            disabled={disabled}
            className={outsideButtonClass}
            style={{ gridColumn: "10 / 14", gridRow: "4 / 5" }}
            onClick={() => handleBetClick("dozen-3")}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            3rd 12
          </motion.button>

          {/* Outside bets row aligned beneath dozens (row 5) */}
          <motion.button
            type="button"
            aria-label="Bet on 1 to 18"
            disabled={disabled}
            className={outsideButtonClass}
            style={{ gridColumn: "2 / 4", gridRow: "5 / 6" }}
            onClick={() => handleBetClick("low")}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            1–18
          </motion.button>
          <motion.button
            type="button"
            aria-label="Bet on Even"
            disabled={disabled}
            className={outsideButtonClass}
            style={{ gridColumn: "4 / 6", gridRow: "5 / 6" }}
            onClick={() => handleBetClick("even")}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            EVEN
          </motion.button>
          <motion.button
            type="button"
            aria-label="Bet on Red"
            disabled={disabled}
            className={outsideRedClass}
            style={{ gridColumn: "6 / 8", gridRow: "5 / 6" }}
            onClick={() => handleBetClick("red")}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            RED
          </motion.button>
          <motion.button
            type="button"
            aria-label="Bet on Black"
            disabled={disabled}
            className={outsideBlackClass}
            style={{ gridColumn: "8 / 10", gridRow: "5 / 6" }}
            onClick={() => handleBetClick("black")}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            BLACK
          </motion.button>
          <motion.button
            type="button"
            aria-label="Bet on Odd"
            disabled={disabled}
            className={outsideButtonClass}
            style={{ gridColumn: "10 / 12", gridRow: "5 / 6" }}
            onClick={() => handleBetClick("odd")}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            ODD
          </motion.button>
          <motion.button
            type="button"
            aria-label="Bet on 19 to 36"
            disabled={disabled}
            className={outsideButtonClass}
            style={{ gridColumn: "12 / 14", gridRow: "5 / 6" }}
            onClick={() => handleBetClick("high")}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            19–36
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
