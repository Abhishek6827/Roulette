/**
 * Dynamic A/B Dozen Classification Engine
 *
 * A = 2 dozens (where we BET)
 * B = 1 dozen  (to AVOID)
 *
 * Uses weighted frequency, streak detection, shift detection,
 * loss control, and confidence scoring.
 */

// ─── Helpers ───────────────────────────────────────────────

const DOZENS = ["1-12", "13-24", "25-36"];

/**
 * Map a roulette number to its dozen label.
 * Returns null for 0 (green).
 */
export function getDozen(number) {
  const n = Number(number);
  if (n <= 0 || n > 36 || isNaN(n)) return null;
  if (n <= 12) return "1-12";
  if (n <= 24) return "13-24";
  return "25-36";
}

// ─── 1. Frequency Analysis (Weighted) ──────────────────────

/**
 * Analyse the last 11 spins with recency weighting.
 *
 * Weight scheme:
 *   positions 0-2 (most recent 3)  → weight 3
 *   positions 3-4                  → weight 2
 *   positions 5-10                 → weight 1
 *
 * Returns { raw: {}, weighted: {}, total: {raw, weighted} }
 */
export function analyzeFrequency(spins) {
  const last11 = spins.slice(0, 11);

  const raw = { "1-12": 0, "13-24": 0, "25-36": 0 };
  const weighted = { "1-12": 0, "13-24": 0, "25-36": 0 };

  last11.forEach((num, idx) => {
    const d = getDozen(num);
    if (!d) return; // skip 0

    raw[d]++;

    let w = 1;
    if (idx <= 2) w = 3;       // last 3 spins → highest weight
    else if (idx <= 4) w = 2;  // next 2 spins → medium weight

    weighted[d] += w;
  });

  const totalRaw = Object.values(raw).reduce((a, b) => a + b, 0);
  const totalWeighted = Object.values(weighted).reduce((a, b) => a + b, 0);

  return { raw, weighted, total: { raw: totalRaw, weighted: totalWeighted } };
}

// ─── 2. Streak Detection ───────────────────────────────────

/**
 * Detect consecutive same-dozen streaks in the last N spins.
 *
 * Returns {
 *   streakDozen: "1-12" | null,
 *   streakLength: number,
 *   isActive: boolean  (streak includes the most recent spin)
 * }
 */
export function detectStreak(spins, depth = 7) {
  const recent = spins.slice(0, depth);
  if (recent.length === 0) return { streakDozen: null, streakLength: 0, isActive: false };

  const dozenSeq = recent.map(getDozen).filter(Boolean);
  if (dozenSeq.length === 0) return { streakDozen: null, streakLength: 0, isActive: false };

  // Find the longest consecutive run starting from the most recent spin
  let currentDozen = dozenSeq[0];
  let currentLen = 1;

  for (let i = 1; i < dozenSeq.length; i++) {
    if (dozenSeq[i] === currentDozen) {
      currentLen++;
    } else {
      break;
    }
  }

  // Also scan for the longest streak anywhere in the window
  let bestDozen = currentDozen;
  let bestLen = currentLen;
  let bestIsActive = true;

  let scanDozen = dozenSeq[0];
  let scanLen = 1;
  for (let i = 1; i < dozenSeq.length; i++) {
    if (dozenSeq[i] === scanDozen) {
      scanLen++;
    } else {
      if (scanLen > bestLen) {
        bestDozen = scanDozen;
        bestLen = scanLen;
        bestIsActive = (i - scanLen === 0); // was it starting from position 0?
      }
      scanDozen = dozenSeq[i];
      scanLen = 1;
    }
  }
  // Final segment check
  if (scanLen > bestLen) {
    bestDozen = scanDozen;
    bestLen = scanLen;
    bestIsActive = false; // older segment
  }

  // Prefer the active streak if it's >= 2
  if (currentLen >= 2) {
    return { streakDozen: currentDozen, streakLength: currentLen, isActive: true };
  }

  // Otherwise report best streak found
  return {
    streakDozen: bestLen >= 2 ? bestDozen : null,
    streakLength: bestLen >= 2 ? bestLen : 0,
    isActive: bestLen >= 2 ? bestIsActive : false,
  };
}

// ─── 3. Shift Detection ───────────────────────────────────

/**
 * Detect if a dozen is suddenly appearing after being absent.
 *
 * Scans last 11 spins. If a dozen had 0 appearances in spins 3-10
 * but appears in the most recent 1-3 spins → shift.
 *
 * Returns {
 *   shiftDozen: "1-12" | null,
 *   stage: "none" | "alert" | "possible_shift" | "confirmed_shift",
 *   recentCount: number  (appearances in last 3)
 * }
 */
export function detectShift(spins) {
  const last11 = spins.slice(0, 11);
  if (last11.length < 5) return { shiftDozen: null, stage: "none", recentCount: 0 };

  const recentSlice = last11.slice(0, 3);    // most recent 3
  const olderSlice = last11.slice(3);          // spins 4–11

  const recentDozens = {};
  const olderDozens = {};

  recentSlice.forEach((n) => {
    const d = getDozen(n);
    if (d) recentDozens[d] = (recentDozens[d] || 0) + 1;
  });

  olderSlice.forEach((n) => {
    const d = getDozen(n);
    if (d) olderDozens[d] = (olderDozens[d] || 0) + 1;
  });

  // Find a dozen that appears in recent but was very rare in older spins
  let shiftDozen = null;
  let shiftStage = "none";
  let shiftRecentCount = 0;

  for (const d of DOZENS) {
    const recentCount = recentDozens[d] || 0;
    const olderCount = olderDozens[d] || 0;

    // Dozen was absent or very rare (0-1 in 8 spins) and now appearing
    if (recentCount >= 1 && olderCount <= 1) {
      if (recentCount >= 3) {
        // 3 consecutive or 3/3 recent → confirmed shift
        shiftDozen = d;
        shiftStage = "confirmed_shift";
        shiftRecentCount = recentCount;
        break; // confirmed is strongest
      } else if (recentCount === 2) {
        shiftDozen = d;
        shiftStage = "possible_shift";
        shiftRecentCount = recentCount;
      } else if (recentCount === 1 && !shiftDozen) {
        shiftDozen = d;
        shiftStage = "alert";
        shiftRecentCount = recentCount;
      }
    }
  }

  return { shiftDozen, stage: shiftStage, recentCount: shiftRecentCount };
}

// ─── 4. Select Weakest Dozen as B ──────────────────────────

/**
 * Determine which dozen is the weakest (B = avoid).
 *
 * Uses a composite score:
 *   - Weighted frequency (primary)
 *   - Streak bonus (if a dozen is on a streak, boost it)
 *   - Shift penalty (if a dozen just started appearing, be cautious)
 *
 * The dozen with the lowest composite score = B.
 */
export function selectWeakDozenAsB(frequency, streak, shift) {
  const scores = {};

  for (const d of DOZENS) {
    // Base: weighted frequency
    scores[d] = frequency.weighted[d] || 0;

    // Streak bonus: if this dozen is currently streaking, boost its score
    if (streak.streakDozen === d && streak.isActive) {
      scores[d] += streak.streakLength * 1.5;
    }

    // Shift handling: if this dozen is newly appearing, DON'T immediately trust it
    // A shift dozen that's only at "alert" stage should not get full credit
    if (shift.shiftDozen === d) {
      if (shift.stage === "alert") {
        // Just appeared once — reduce trust, could be noise
        scores[d] -= 1;
      } else if (shift.stage === "possible_shift") {
        // Appeared twice — moderate trust
        scores[d] += 0.5;
      } else if (shift.stage === "confirmed_shift") {
        // 3 times — confirmed, give strong boost → it's now A
        scores[d] += 3;
      }
    }
  }

  // The dozen with the LOWEST score is B (weakest)
  const sorted = DOZENS.slice().sort((a, b) => scores[a] - scores[b]);
  const bDozen = sorted[0];

  return { bDozen, scores };
}

// ─── 5. Decide A and B ────────────────────────────────────

/**
 * Master decision: which 2 dozens are A (bet) and which 1 is B (avoid).
 */
export function decideAandB(spins) {
  const frequency = analyzeFrequency(spins);
  const streak = detectStreak(spins);
  const shift = detectShift(spins);
  const { bDozen, scores } = selectWeakDozenAsB(frequency, streak, shift);

  const aDozens = DOZENS.filter((d) => d !== bDozen);

  return {
    aDozens,
    bDozen,
    frequency,
    streak,
    shift,
    scores,
  };
}

// ─── 6. Confidence ─────────────────────────────────────────

/**
 * Calculate prediction confidence.
 *
 * HIGH:   strong trend or confirmed shift, clear weakest dozen
 * MEDIUM: moderate pattern, some signals agree
 * LOW:    mixed signals, no clear trend → should WAIT
 */
export function calculateConfidence(analysis) {
  const { frequency, streak, shift, scores } = analysis;

  // Score spread: how much weaker is B compared to the best A?
  const sortedScores = DOZENS.map((d) => scores[d]).sort((a, b) => b - a);
  const spread = sortedScores[0] - sortedScores[2]; // best vs worst

  // Factors that increase confidence
  let confidenceScore = 0;

  // Strong frequency separation
  if (spread >= 8) confidenceScore += 3;
  else if (spread >= 5) confidenceScore += 2;
  else if (spread >= 3) confidenceScore += 1;

  // Active streak
  if (streak.isActive && streak.streakLength >= 3) confidenceScore += 2;
  else if (streak.isActive && streak.streakLength >= 2) confidenceScore += 1;

  // Confirmed shift
  if (shift.stage === "confirmed_shift") confidenceScore += 2;
  else if (shift.stage === "possible_shift") confidenceScore += 1;

  // Mixed signal penalty: if a dozen has very similar weighted frequencies
  const weightedVals = Object.values(frequency.weighted);
  const maxWeighted = Math.max(...weightedVals);
  const minWeighted = Math.min(...weightedVals);
  if (maxWeighted - minWeighted <= 2) confidenceScore -= 2; // very evenly distributed

  // Classify
  if (confidenceScore >= 4) return "HIGH";
  if (confidenceScore >= 2) return "MEDIUM";
  return "LOW";
}

// ─── 7. BET or WAIT Decision ──────────────────────────────

/**
 * Determine whether to BET or WAIT.
 *
 * WAIT conditions:
 *   - LOW confidence
 *   - 2+ consecutive losses
 *   - Mixed frequency (no clear weakest)
 *   - Shift in alert stage (wait for confirmation)
 *   - A↔B fluctuation pattern
 */
export function shouldBetOrWait(analysis, lossStreak, confidence) {
  const { frequency, streak, shift, scores } = analysis;
  const reasons = [];

  // ── FORCE WAIT: 3+ losses ──
  if (lossStreak >= 3) {
    return {
      action: "WAIT",
      reason: `FORCE WAIT: ${lossStreak} consecutive losses. Wait for pattern to stabilize.`,
    };
  }

  // ── 2 losses: WAIT only if confidence is not HIGH ──
  if (lossStreak === 2 && confidence !== "HIGH") {
    return {
      action: "WAIT",
      reason: "2 consecutive losses with uncertain pattern — re-evaluating.",
    };
  }

  // ── WAIT: LOW confidence ──
  if (confidence === "LOW") {
    reasons.push("Low confidence — no clear pattern");
  }

  // ── WAIT: alert-stage shift (unconfirmed) ──
  if (shift.stage === "alert") {
    reasons.push(`Shift alert in ${shift.shiftDozen} — wait for confirmation`);
  }

  // ── WAIT: mixed frequency (all similar) ──
  const weightedVals = Object.values(frequency.weighted);
  const maxW = Math.max(...weightedVals);
  const minW = Math.min(...weightedVals);
  if (maxW - minW <= 1 && frequency.total.raw >= 6) {
    reasons.push("Dozens are evenly distributed — mixed pattern");
  }

  // ── WAIT: A↔B fluctuation (alternating dozens in last 5) ──
  const last5Dozens = analysis.last5Dozens || [];
  if (last5Dozens.length >= 4) {
    const unique = new Set(last5Dozens);
    if (unique.size === 3) {
      reasons.push("All three dozens active recently — fluctuation detected");
    }
  }

  // If LOW confidence and any reason exists → WAIT
  if (reasons.length > 0 && confidence === "LOW") {
    return { action: "WAIT", reason: reasons.join(". ") + "." };
  }

  // ── BET: pattern is clear enough ──
  let betReason = "";

  if (streak.isActive && streak.streakLength >= 2) {
    betReason = `Active streak in ${streak.streakDozen} (${streak.streakLength} consecutive)`;
  } else if (shift.stage === "confirmed_shift") {
    betReason = `Confirmed shift to ${shift.shiftDozen}`;
  } else if (shift.stage === "possible_shift") {
    betReason = `Possible shift to ${shift.shiftDozen} — proceeding with caution`;
  } else {
    const sortedDozens = DOZENS.slice().sort((a, b) => scores[b] - scores[a]);
    betReason = `${sortedDozens[0]} and ${sortedDozens[1]} trending, ${sortedDozens[2]} weakest`;
  }

  if (lossStreak === 1) {
    betReason += " (1 loss — cautious)";
  } else if (lossStreak === 2) {
    betReason += " (2 losses — HIGH confidence override)";
  }

  if (reasons.length > 0) {
    betReason += ". Note: " + reasons.join("; ");
  }

  return { action: "BET", reason: betReason };
}

// ─── 8. Main Entry Point ──────────────────────────────────

/**
 * Run the full prediction pipeline.
 *
 * @param {number[]} spins  - Full history, most recent first
 * @param {number} lossStreak - Consecutive loss count
 * @returns {Object} prediction result
 */
export function runPrediction(spins, lossStreak = 0) {
  // Need at least 5 spins for meaningful analysis
  if (!spins || spins.length < 5) {
    return {
      aDozens: [],
      bDozen: null,
      action: "WAIT",
      confidence: "LOW",
      reason: "Not enough data — need at least 5 spins for analysis.",
      analysis: null,
    };
  }

  const analysis = decideAandB(spins);

  // Add last 5 dozens for fluctuation detection
  const last5 = spins.slice(0, 5).map(getDozen).filter(Boolean);
  analysis.last5Dozens = last5;

  const confidence = calculateConfidence(analysis);
  const { action, reason } = shouldBetOrWait(analysis, lossStreak, confidence);

  return {
    aDozens: analysis.aDozens,
    bDozen: analysis.bDozen,
    action,
    confidence,
    reason,
    analysis: {
      frequency: analysis.frequency,
      streak: analysis.streak,
      shift: analysis.shift,
      scores: analysis.scores,
      last5Dozens: last5,
    },
  };
}
