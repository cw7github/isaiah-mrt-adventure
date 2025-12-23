# Student Assessment + Adaptive Learning (Backend/Algorithm Plan)

This doc describes the app’s **v2 progress + assessment direction** that makes it easy for teachers/parents to:
- see where a child is truly strong/weak (by checklist skill, not just “stations completed”), and
- automatically put the **right next lesson** in front of the child with minimal decision fatigue.

It is designed to fit the current architecture:
- Static `index.html` app
- Local-first progress in `localStorage`
- Optional cloud sync via Firebase Auth + Firestore (`docs/firebase-backend.md`)
- Lightweight event logging (`parents/{uid}/children/{childId}/events`)

---

## Status (what’s implemented now)

Implemented in the app today:
- `progress.mastery` using **BKT + forgetting** (per-skill `pKnown`, `dueAt`, opportunities, streak)
- First-attempt mastery updates (supported answers count less)
- Merge-safe-ish mastery sync (merge attempts by id, then recompute)
- Mastery-aware recommendations (`getRecommendedNextAction()`)
- Parent Dashboard “Top needs / Review due / Strengths” from mastery
- Weekly progress email export (`.eml`) from the dashboard

Still mostly “plan / next steps”:
- Checklist-coded skill IDs and explicit per-page `skillId` / `itemId` tagging across content packs
- Robust multi-device aggregation for analytics (beyond simple merges)
- Teacher assignments/goals + station/skill bundles aligned to the CPA checklists

## 0) Current system (what exists today)

### Progress state
Stored per child (`isaiahProgress_child_{childId}`) and synced to Firestore as `children/{childId}.progress`:
- `completedStations`, `masteredWords`
- `counters` (per-device counters for stickers/pages completed; CRDT-ish merge via `max`)
- `analytics` (schema v1):
  - `stations[stationId]` question stats
  - `skills[skillId]` practice stats
  - `strategies[strategyId]` stats (derived from comprehension stems)
  - `recentAnswers`, `recentMistakes`
- `mastery` (schema v1):
  - per-skill attempt history (bounded) + computed skill state
  - `pKnown` (with forgetting), `opportunities`, `streak`, `masteredAt`, `dueAt`

### Recommendations
`getRecommendedNextAction()` (see `docs/adaptive-recommendations.md`) is hybrid:
- analytics-based guardrails (recent struggle / weakest strategy)
- mastery-based scoring (gap + review due + importance)

### Remaining gaps / limitations (for teacher-grade assessment)
1. **Skill identity is not fully canonical**: many story questions are classified heuristically; content packs should add explicit `skillId` + `itemId`.
2. **Checklist alignment is partial**: station `checklistTargets` exists, but mastery is not yet reported directly in checklist terms.
3. **Cross-device analytics merge is still lossy**: `analytics` merges are coarse; mastery merges are better but still bounded.
4. **Review scheduling is basic**: `dueAt` exists per skill, but “station selection by skill need” is still early.
5. **Diagnostics can be richer**: add clearer “why this is a need” examples + error pattern summaries.

---

## 1) Design goals (what v2 must do)

### For teachers/parents
- **At-a-glance**: “Top 3 needs”, “Top 3 strengths”, “What to do next”.
- **Checklist view**: show CPA “I Can” items as: Not started / Emerging / Developing / Mastered / Review due.
- **Evidence**: show *why* the system says a skill is weak (recent examples + common error pattern).
- **Low effort**: no manual grading except for skills that can’t be auto-graded (writing/speaking).

### For the learner experience
- **Right level**: keep tasks in the child’s “productive struggle” zone (not too easy, not too hard).
- **Fast routing**: after a miss, quickly route to a micro-practice that fixes the actual gap.
- **Spaced retrieval**: keep mastered skills fresh with short, predictable reviews.

### Engineering constraints
- Local-first; cloud sync is additive.
- Keep Firestore writes small and inexpensive.
- Avoid heavy server requirements; prefer client-side aggregation + optional backend later.

---

## 2) Canonical “skill” identity (the spine of assessment)

To assess proficiency, every scored screen must map to **one primary atomic skill**.

### 2.1 Skill IDs
Use stable IDs, ideally aligned to checklist codes where possible:
- Reading Foundations: `RF.1.2.C:begin-middle-end-sounds` (or similar)
- Literature comprehension: `RL.1.1:wh-key-details`
- Language conventions: `L.1.1:pronouns`
- Math: `1.OA.A.1:add-within-10` (etc from the CPA math checklist plan)

If the checklist code is too broad, add a scoped suffix:
- `RL.1.1:who`, `RL.1.1:where`, `RL.1.1:why`

### 2.2 Content tagging (required for v2)
Add per-page metadata (in content packs, and/or generated practice items):
- `skillId` (string, required for scored pages)
- `difficulty` (0–1 or 1–5; derived from level, passage complexity, distractor similarity)
- `itemId` (stable unique id for deduping + audits)
- Optional: `checklistTargets` (page-level; station-level is not enough for assessment)

This is the single biggest prerequisite for “good analytics.”

---

## 3) Data model changes (local + Firestore)

### 3.1 New progress fields (high level)
Add to `progress`:
- `mastery` (per-skill proficiency state; compact + merge-safe)
- `reviewQueue` (small list of due skills with `dueAt`)
- `goals` (optional parent/teacher focus settings)
- `assignments` (optional teacher-curated station/skill bundles)
- `assessmentVersion` (for migrations)

### 3.2 Mastery state (per-skill)
Keep it small, merge-safe, and derived from attempts.

Recommended shape:
```json
{
  "mastery": {
    "schemaVersion": 1,
    "skills": {
      "RL.1.1:who": {
        "pKnown": 0.72,
        "opportunities": 18,
        "streak": 2,
        "lastAt": 1730000000000,
        "masteredAt": null,
        "dueAt": 1730600000000,
        "supportUsedRate": 0.28
      }
    },
    "updatedAt": 1730000000000
  }
}
```

### 3.3 Merge strategy (multi-device correctness)
Treat mastery/attempt aggregates as CRDT-like per-device counters (same concept as `progress.counters`):
- Each device only increments its own bucket.
- Merge uses `max` per device bucket (idempotent).
- Total is computed by summing buckets.

Two implementation options:
1. **Per-device mastery evidence buckets** (preferred for correctness without reading event logs).
2. **Event-log aggregation on demand** (simpler schema, but dashboard may query many events).

For small families, (2) is acceptable; for scaling, (1) is safer + cheaper.

---

## 4) Proficiency algorithm (sophisticated, but implementable)

### 4.1 Core model: Bayesian Knowledge Tracing (BKT) + time-based forgetting
For each skill `k`, maintain `pKnown_k` (probability the child “knows” it).

**BKT update per opportunity**
- Given prior `p`, guess `g`, slip `s`, learn `t`:

If correct:
```
pGiven = (p*(1-s)) / (p*(1-s) + (1-p)*g)
```

If incorrect:
```
pGiven = (p*s) / (p*s + (1-p)*(1-g))
```

Then apply learning transition:
```
pNext = pGiven + (1 - pGiven) * t
```

**Forgetting between opportunities**
Apply exponential decay toward a baseline `pBase`:
```
decay = exp(-lambda * deltaDays)
pDecayed = pBase + (pNext - pBase) * decay
```

This supports:
- mastery that grows with consistent success
- retention checks (skills can become “review due” if not practiced)

### 4.2 Parameter defaults (good enough to start)
Start with conservative defaults and tune later:
- `g` (guess): `0.33` for 3-choice MCQ (or `0.25` if distractors are strong)
- `s` (slip): `0.10`
- `t` (learn): `0.12` (phonics) / `0.08` (comprehension) / `0.10` (math)
- `pBase`: `0.15` (never decay below this)
- `lambda`: `0.08` (≈ half-life ~8–9 days)

Then allow per-skill overrides (e.g., sight words learn faster, “why” questions slower).

### 4.3 Evidence strength (don’t over-credit supported answers)
Weight updates based on support:
- wrong first attempt → full update (strong signal)
- correct first attempt with hint shown → partial credit (weaker signal)
- correct after multiple attempts → treat first attempt as incorrect for mastery; optionally add a small learning bump

Also consider adding response-time bands later (fast correct = stronger evidence of automaticity).

### 4.4 Mastery labels (what teachers see)
Compute a label from `pKnown`, `opportunities`, and spacing:
- **Not started**: `< 3` opportunities
- **Emerging**: `pKnown < 0.50`
- **Developing**: `0.50 ≤ pKnown < 0.85`
- **Mastered**: `pKnown ≥ 0.85` and `streak ≥ 3`
- **Review due**: mastered but `now > dueAt` or `pKnown decayed < 0.80`

This matches the learning principle in `docs/content-standards.md`: mastery is consistent, not “got it once.”

---

## 5) Turning proficiency into “what should we do next?”

### 5.1 Candidate pool (keep it simple for kids)
At decision points (map screen / after reward), consider:
- next story station in the planned sequence (if not blocked)
- 1–2 micro-practice sets (8–12 items) for the top weak/due skills
- 1 short review set (mixed skills)

### 5.1.1 Decision points (where routing happens)
- **Map screen**: pick the next “primary” action (continue station vs practice).
- **After station reward**: decide whether to insert review or continue momentum.
- **After a wrong answer**: fast-fix micro-practice (same skill, easier) then retry.
- **After repeated struggle** (e.g., 3 wrong first tries in 5 questions): pause new content; shift to foundation gaps.

### 5.2 Scoring function (expected learning value)
For each skill `k`, compute a priority score:
```
gap = 1 - pKnown_k
due = clamp(0..1, (now - dueAt_k) / reviewWindowMs)
importance = skillPriority_k  // teacher-set or checklist-based
prereq = prereqsMet(k) ? 1 : 0

score_k = prereq * ( 0.55*gap + 0.35*due + 0.10*importance )
```

Then pick:
- the top 1–3 skills for practice (“Top needs”)
- a “story continue” option to preserve motivation

### 5.3 Station selection
Stations should declare which skills they practice (via `checklistTargets` + page `skillId`s).

Compute station score as the max/mean of its included skills:
```
score_station = mean(score_k for k in stationSkills)
```

Then recommend the highest scoring station that:
- is unlocked (or teacher-assigned)
- matches the child’s level band (to avoid jumps)
- is not identical to the last 1–2 stations (variety)

### 5.4 “Fast fix” routing
If the child misses a question and the system can identify the skill:
- offer 3–5 question micro-practice immediately (same skill, easier items)
- then return to the story question (spaced retrieval within-session)

This can massively reduce frustration and makes progress feel smoother.

### 5.5 Session planning (make “10 minutes” easy)
Instead of deciding after every page, the app can build a small **session plan** at the start of play:
- Step 1: a short “warm” review (1–2 due skills, 3–5 items each)
- Step 2: the main station or mini-unit (story)
- Step 3: a short targeted practice (top need skill, 6–10 items)

Guardrails:
- keep it predictable (same structure most days)
- keep transitions low (no rapid screen-mode switching)
- always end with a win (easy review or favorite station)

### 5.6 Teacher/parent overrides (without breaking adaptivity)
Allow a parent/teacher to set any combination of:
- **focus skills** (boost `importance`)
- **blocked skills** (temporarily exclude)
- **must-do stations** (assignment list)
- **time budget** (short session plan)

The recommender still runs, but inside those constraints.

---

## 6) Teacher/parent dashboards (what to show)

### 6.0 Dashboard design principles (for busy adults)
- **Start with actions, not charts**: “Do this next” beats a wall of numbers.
- **Show confidence**: avoid overreacting to 1–2 misses (require minimum opportunities).
- **Separate skill vs station**: teachers care about *skills*; kids care about *stations*.
- **Explain in plain language**: “Middle sound is hard” is better than “RF.1.2.C”.
- **One screen, two taps max**: a parent should find “what to practice” in <30 seconds.

### 6.1 Dashboard v1 (fast wins; uses mastery model)
Per child:
- **Today**: minutes played, stations completed, accuracy trend
- **Top needs (3)**: skill name + label + last practiced + “Start practice” button
- **Strengths (3)**: mastered skills (recently solid)
- **Review due (3)**: skills that are slipping

### 6.2 Checklist view (CPA-aligned)
Show the CPA checklist items grouped by strand, each with:
- status badge (Not started / Emerging / Developing / Mastered / Review due)
- “evidence” popover (last 3 attempts summary)
- “assign” toggle (teacher can prioritize)

### 6.3 Error-pattern insights (high leverage for parents)
Show “common misses” patterns:
- **WH mix-ups**: misses on `who` vs `where`
- **phoneme position**: “middle sound” consistently missed
- **syllables**: mistakes mostly on 2-syllable words
- **categories**: errors on “odd one out” vs “sort”

This is often more actionable than raw %.

### 6.4 Reports
Generate a simple weekly report (export/share later):
- mastered this week
- needs practice next week
- suggested offline activities (clap syllables, “find the first sound”, etc.)

### 6.5 Optional “teacher tools” (when you want more control)
- **Focus toggles**: e.g., “Syllables”, “Beginning/Middle/End sounds”, “WH questions”, “Categories”.
- **Time budget**: “We only have 10 minutes” → app selects a micro-session (2 read + 6 questions + 1 review).
- **Assignments**: teacher picks 1–3 stations for the week; child sees only a simple “Next stop” button.
- **Notes**: quick note per skill (“confuses /b/ and /d/”) stored per child.
- **Rubric check** (for writing/speaking): parent taps “Observed / Not yet” (Mode B items).

---

## 7) Implementation roadmap (practical phases)

### Phase 1 — Instrumentation (required)
- Add `skillId` + `itemId` to all scored pages (story questions and practice items).
- Record support metadata on first attempt: hint shown, evidence selections, time-to-answer (optional).
- Decide aggregation strategy (per-device evidence buckets vs event-log aggregation).

### Phase 2 — Mastery engine (client-side)
- Implement `updateMasteryFromAttempt()` using BKT + forgetting.
- Store `progress.mastery` and sync like other progress fields.
- Keep dashboards using only `progress` (no extra Firestore reads).

### Phase 3 — Recommendation engine v2
- Replace heuristic-only selection with mastery-based scoring.
- Keep “Continue story” always visible (motivation guardrail).

### Phase 4 — Teacher goals + assignments
- Add “Focus areas” toggles (e.g., syllables, WH questions, categories).
- Add “Assign station/skill bundle” and “Auto mode” (system fills daily practice).

### Phase 5 (optional) — Server-side aggregation
If needed later for scale:
- add a scheduled aggregator (Cloud Function or Vercel cron) to roll up events into mastery,
- keep raw events TTL-limited for auditing.

---

## 8) Where this plugs into the codebase

Primary touchpoints:
- `index.html`:
  - progress schema (`saveProgress()` / `loadProgress()` / `mergeProgress()`)
  - analytics + recommendations (`recordQuestionAnalytics()` / `getRecommendedNextAction()`)
  - Parent Dashboard UI (`renderDashboardModal()` / `showDashboardChildDetail()`)
- `docs/firebase-backend.md` (update once mastery schema is implemented)
- Content packs (e.g., `content/cpa-grade1-ela/content-pack.v1.json`) should become the canonical source for `skillId` tagging.
