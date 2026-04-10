// utils/compatibilityScore.js

/**
 * Computes a compatibility score (0–100) between a seeker and a listing/host.
 *
 * @param {Object} seekerPrefs  - req.user.preferences (seeker)
 * @param {Object} listing      - Listing document
 * @param {Object|null} hostPrefs - listing.host.preferences (may be null/undefined)
 * @returns {number} score 0-100
 */
function computeCompatibility(seekerPrefs, listing, hostPrefs) {
  let score = 0;

  // ── 1. Budget match (20 pts) ────────────────────────────────────────────────
  const rent = listing.rent || 0;
  const budgetMin = seekerPrefs.budgetMin || 0;
  const budgetMax = seekerPrefs.budgetMax || 0;

  if (budgetMax > 0) {
    if (rent >= budgetMin && rent <= budgetMax) {
      // Fully within budget
      score += 20;
    } else {
      // Partial credit if close (within 20% of the budget span)
      const range = budgetMax - budgetMin || budgetMax;
      const tolerance = range * 0.2;
      if (rent < budgetMin && budgetMin - rent <= tolerance) {
        score += 10;
      } else if (rent > budgetMax && rent - budgetMax <= tolerance) {
        score += 10;
      }
    }
  } else {
    // No budget preference set – award neutral 10 pts
    score += 10;
  }

  // ── 2. Gender preference (10 pts) ──────────────────────────────────────────
  const listingGender = listing.preferredGender || 'any';
  const seekerGender  = seekerPrefs.gender || 'any';

  if (
    listingGender === 'any' ||
    seekerGender  === 'any' ||
    listingGender === seekerGender
  ) {
    score += 10;
  }

  // ── 3. Smoking (10 pts) ────────────────────────────────────────────────────
  // Full points if seeker doesn't smoke OR listing allows smoking
  if (!seekerPrefs.smoking || listing.smokingAllowed) {
    score += 10;
  }

  // ── 4. Pets (10 pts) ──────────────────────────────────────────────────────
  // Full points if seeker has no pets OR listing allows pets
  if (!seekerPrefs.pets || listing.petsAllowed) {
    score += 10;
  }

  // ── Host-specific criteria ─────────────────────────────────────────────────
  // If hostPrefs not available, award neutral 50 pts for all 5 remaining criteria
  if (!hostPrefs) {
    score += 50;
    return Math.min(100, Math.max(0, Math.round(score)));
  }

  // ── 5. Food preference (10 pts) ───────────────────────────────────────────
  const seekerFood = seekerPrefs.food || 'any';
  const hostFood   = hostPrefs.food   || 'any';

  if (seekerFood === 'any' || hostFood === 'any' || seekerFood === hostFood) {
    score += 10;
  }

  // ── 6. Sleep schedule (10 pts) ────────────────────────────────────────────
  const seekerSleep = seekerPrefs.sleep || 'flexible';
  const hostSleep   = hostPrefs.sleep   || 'flexible';

  if (seekerSleep === 'flexible' || hostSleep === 'flexible' || seekerSleep === hostSleep) {
    score += 10;
  }

  // ── 7. Noise level (10 pts) ───────────────────────────────────────────────
  const seekerNoise = seekerPrefs.noise || 'moderate';
  const hostNoise   = hostPrefs.noise   || 'moderate';

  if (seekerNoise === hostNoise) {
    score += 10;
  } else if (seekerNoise === 'moderate' || hostNoise === 'moderate') {
    // Moderate is a middle ground – partial credit
    score += 5;
  }

  // ── 8. Cleanliness (10 pts) ───────────────────────────────────────────────
  const seekerClean = seekerPrefs.cleanliness || 3;
  const hostClean   = hostPrefs.cleanliness   || 3;
  const cleanDiff   = Math.abs(seekerClean - hostClean);
  score += Math.max(0, 10 - cleanDiff * 3);

  // ── 9. Work schedule (10 pts) ─────────────────────────────────────────────
  const seekerWork = seekerPrefs.workSchedule || 'office';
  const hostWork   = hostPrefs.workSchedule   || 'office';

  if (seekerWork === hostWork) {
    score += 10;
  } else if (seekerWork === 'hybrid' || hostWork === 'hybrid') {
    score += 5;
  }

  return Math.min(100, Math.max(0, Math.round(score)));
}

module.exports = { computeCompatibility };
