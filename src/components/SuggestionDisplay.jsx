"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

function TargetIcon(props) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={"h-5 w-5 " + (props.className || "")}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.6"
      />
      <circle
        cx="12"
        cy="12"
        r="5"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.6"
      />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <path
        d="M12 3v3M21 12h-3M12 21v-3M6 12H3"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.6"
      />
    </svg>
  );
}

export default function SuggestionDisplay({ topDozens }) {
  const [changed, setChanged] = useState(false);
  const keySig = useMemo(() => topDozens.join("|"), [topDozens]);

  useEffect(() => {
    setChanged(true);
    const t = setTimeout(() => setChanged(false), 450);
    return () => clearTimeout(t);
  }, [keySig]);

  if (!topDozens || topDozens.length === 0) return null;

  return (
    <section aria-label="Suggested dozens" className="mb-4">
      {/* Header - WHITE TEXT */}
      <motion.div
        className="flex items-center gap-2 mb-2 justify-center"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <TargetIcon className="text-amber-400" />
        <h3 className="text-lg font-semibold text-white text-pretty">
          Suggested Dozens
        </h3>
      </motion.div>

      {/* Container */}
      <motion.div
        key={keySig}
        className="rounded-xl bg-gray-700 p-3 ring-1 ring-amber-500/30 border border-amber-400/20"
        initial={false}
        animate={{
          boxShadow: changed
            ? "0 0 0 4px rgba(251,191,36,0.25)"
            : "0 0 0 0px rgba(0,0,0,0)",
          scale: changed ? 1.01 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 24,
          mass: 0.6,
        }}
      >
        {/* Chip list */}
        <motion.div
          layout
          className="flex flex-wrap items-center justify-center gap-2"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {topDozens.map((d, idx) => (
            <motion.button
              key={`${d}-${idx}`}
              type="button"
              layout
              initial={{ opacity: 0, scale: 0.9, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
                mass: 0.5,
              }}
              aria-label={`Suggested dozen ${d}`}
              className="
                group relative overflow-hidden
                rounded-full px-4 py-2 text-sm font-bold
                text-white bg-amber-600 hover:bg-amber-500
                shadow-lg
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400
                transition-all duration-200
                active:translate-y-[1px]
              "
            >
              <span className="relative z-10">{d}</span>

              {/* Soft gloss sweep on hover */}
              <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="absolute -left-1/2 top-0 h-full w-[120%] rotate-12 bg-white/10 blur-sm" />
              </span>

              {/* Subtle inner ring for depth */}
              <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/10" />
            </motion.button>
          ))}
        </motion.div>
      </motion.div>

      <div className="text-xs text-gray-400 text-center mt-2">
        Based on last 11 spins analysis
      </div>
    </section>
  );
}
