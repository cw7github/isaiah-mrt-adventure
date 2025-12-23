# Adaptive Recommendations (Next Best Action)

The app recommends the **next best action** (continue a story station vs. do a short skill practice) so the learner doesn’t have to decide what to practice.

This is currently a **hybrid recommender**:
- Fast guardrails from lightweight analytics (recent struggle)
- Mastery-based scoring (BKT + forgetting + review due) for targeted practice

## What the app tracks

Stored inside per-child progress (`isaiahProgress_child_{childId}`) under:

- Per-station question performance: `analytics.stations[stationId]`
  - `totalQuestions`, `firstTryCorrect`, `wrongFirstTry`, `totalAttempts`, `lastAt`
  - Optional: `choices` for menu selections (what foods the learner picks)
- Per-skill practice performance: `analytics.skills[skillId]`
- Per-reading-strategy performance (derived from station question text): `analytics.strategies[strategyId]`
- Recent history:
  - `analytics.recentAnswers` (last ~30 first-attempt results)
  - `analytics.recentMistakes` (last ~20 first-attempt wrongs)

These analytics are saved locally and also synced to Firestore as part of the child’s `progress` object (if cloud save is enabled).

The app also stores a per-skill mastery model:
- `progress.mastery` (see `docs/student-assessment-and-adaptive-learning-plan.md`)

## Recommendation logic (high-level)

When the learner is on the MRT map screen (`getRecommendedNextAction()` in `index.html`):

1. **Recent struggle guardrail (analytics)**
   - If first-try accuracy over the recent window is low, recommend a targeted skill practice that matches the most common recent mistake pattern.
2. **Weakest strategy guardrail (analytics)**
   - If there’s enough data and a strategy is consistently weak, recommend practicing it.
3. **Mastery-based scoring (BKT + forgetting)**
   - Score skills by a weighted combination of:
     - **gap**: `1 - pKnown` (after decay)
     - **review due**: how overdue the skill is for spaced review
     - **importance**: category weight + teacher-priority boosts
   - Recommend practice when it’s clearly valuable (review is due, or pKnown is low).
4. **Default**
   - Continue the next unlocked story station.

If a skill is recommended, the UI also shows a secondary “Story next” option.

## UI location

- MRT map screen: the recommendation card + buttons live in `index.html` under `#mrtRecommendation`.

## Tuning thresholds (where to edit)

In `index.html`, search for `getRecommendedNextAction()`:

- Recent struggle window size: `recent.slice(-8)`
- Recent-accuracy threshold: `recentAccuracy < 0.6`
- Weakest-strategy minimum sample size: `total >= 6`
- Weakest-strategy threshold: `acc < 0.75`
- Mastery min opportunities before recommending: `MIN_OPPS`
- Review window: `reviewWindowMs`

If you want the app to recommend practice more aggressively, raise accuracy thresholds or reduce minimum sample sizes.
