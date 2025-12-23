# CPA Grade 1 ELA “I Can” Checklist → Lesson Content Plan

**Source of truth for scope:** `Gr._1_English_Language_Arts_I_Can_Checklist_CPA_23-24.pdf`  
**Reference only:** IXL scope docs (useful taxonomy, but not the target).

**Related:** Grade 1 Math plan → `docs/cpa-grade1-math-checklist-plan.md`

This plan translates Cabrillo Point Academy’s Grade 1 ELA checklist into an app-friendly **scope + sequence** using the “MRT lines + stations” model:

- **Skills stay atomic** for mastery/analytics (each checklist item is trackable).
- **Stations bundle 3–8 related skills** (one core + adjacent variants + 1–2 review).
- **One job per screen** (each page targets one behavior).
- **Station completion requires per-skill mastery** (not just “finished pages”).
- **Minimize fill‑in‑the‑blank** (use sparingly, mainly for sight-word fluency); emphasize **WH comprehension**, **syllables**, **begin/middle/end sounds**, and **categories**.

---

## 1) Content Architecture (How We Cover the Checklist)

### 1.1 Lines (Big strands)

We organize lines by the checklist domains so the UI scales without showing dozens of micro-skills at once:

- **Foundations Line (RF)**: phonological awareness, phonics, decoding, fluency, sight words.
- **Literature Line (RL)**: story comprehension and literary analysis appropriate to Grade 1.
- **Informational Line (RI)**: nonfiction comprehension, text features, reasons/evidence.
- **Writing Workshop Line (W)**: opinion/informative/narrative writing + revise/publish/research.
- **Speak & Listen Line (SL)**: conversation norms, directions, presentations, recitation.
- **Language Line (L)**: grammar/mechanics + vocabulary/word meaning strategies.
- **Review / Mixed Mastery Line**: spiral review across RF/RL/RI/L with short “sprints.”

### 1.2 Skill checklists inside stations

Each station shows a compact checklist (3–8 dots). Each dot maps to one atomic skill (a checklist item or a tightly-scoped sub-skill).

For unusually large sets (especially **“first 100 sight words”**), keep the student UI small by using **bands**:
- Show **3–6 dots** (“Band 1”, “Band 2”…), where each band contains ~15–25 words.
- Still track **word-level mastery under the hood** for analytics and “what to practice next.”
- Require “band completion” to mean “most words mastered” (e.g., ≥80% of words in the band).

**Example** (5-dot station):
- Dot 1: “Count syllables” (RF.1.3.D / RF.1.3.E support)
- Dot 2: “Build two-syllable words” (RF.1.3.E)
- Dot 3: “Read two-syllable words” (RF.1.3.E)
- Dot 4: “Find the main topic” (RI.1.2)
- Dot 5: “Tell one detail” (RI.1.2)

### 1.3 Mastery rules (default)

Use consistent mastery so progress is meaningful and not “click-through”:
- **Per-skill mastery:** 10 items, ≥80% correct overall, ≥60% first-try correct.
- **Support policy:** show key-sentence highlight only after a wrong attempt or when hint is used (already implemented).
- **Review spacing:** a mastered skill must reappear in Review/Mixed stations at least 3 times over 2–4 weeks.

For writing/speaking items, mastery may require **parent confirmation** or a simple rubric (see §6).

### 1.4 Coverage modes (what “meets the checklist” means in this app)

Some checklist items (especially writing/speaking) are real-world performance skills that don’t always fit a fully auto-graded app experience. Use these coverage modes so we stay honest and build what actually helps:

- **Mode A — Auto-graded (core app scope):** the student can demonstrate the skill on-screen and the app can grade it reliably (RF/RL/RI/L).
- **Mode B — App-assisted + parent check:** the app provides prompts/scaffolds, the student produces an artifact (spoken/typed/drawn/off-screen writing), and a parent confirms completion (most W/SL items, plus handwriting).
- **Mode C — Offline recommended:** the app may provide optional prompts, but the skill is primarily practiced off-screen (handwriting, real conversation norms).

**Recommended default product scope:** prioritize Mode A first (RF/RL/RI/L + Review). Implement W/SL as Mode B “extension stations” that can be skipped without blocking overall progression.

---

## 2) Required Screen Types (Minimum set to meet the checklist well)

Some checklist items cannot be measured well with only multiple-choice. Keep the set small and reusable.

### 2.1 Already in app (usable)
- **Read pages** (tap-to-hear words, Read-to-Me).
- **Comprehension questions** with evidence-first key sentence.
- **Skill practice (MCQ)**.

### 2.2 Add (high priority)
- **Sort (2–3 bins):** vowels/consonants, syllable counts, categories, fiction/nonfiction.
- **Phoneme tiles / boxes:** blend, segment, identify beginning/middle/end sounds.
- **Order (3-step):** retell events (first/next/last), sentence ordering.
- **Writing scaffold:** “build a sentence” (word bank → sentence strip), then optional typing.

### 2.3 Add (nice-to-have, but needed for SL/W full fidelity)
- **Audio record** (student retell / recite / present) *or* “parent-led” prompts if recording isn’t implemented. Parent can approve.
- **Draw/annotate** (SL.1.5 support) *or* “draw on paper” + parent confirm if drawing isn’t implemented.

---

## 3) Scope & Sequence by Line (Station Bundles)

The station lists below are designed so **every checklist item** is introduced, practiced, and reviewed.

### 3.1 Foundations Line (RF)

**RF Station F1 — Print Concepts & Sentence Features**
- Targets: RF.1.1, RF.1.1.A (+ supports L.1.2.B)
- Screens: book-handling mini (front/back, left→right), find first word, identify capital, choose end mark.

**RF Station F2 — Blend & Segment (CVC)**
- Targets: RF.1.2.B, RF.1.2.D
- Screens: blend phonemes → word; segment word → sounds; “tap each sound” boxes.

**RF Station F3 — Sound Positions (begin/middle/end)**
- Targets: RF.1.2.C
- Screens: “Which sound is first/middle/last?” with CVC words; minimal pairs for contrast.

**RF Station F4 — Short vs Long Vowel (listening)**
- Targets: RF.1.2.A
- Screens: hear word → choose short/long; match two words with same vowel sound.

**RF Station F5 — Consonant Blends**
- Targets: RF.1.3.A
- Screens: hear / blend clusters (st, pl…); build words with blends; light spelling via letter tiles.

**RF Station F6 — Read Short Words (CVC + simple sentences)**
- Targets: RF.1.3.B
- Screens: read CVC lists, then read short decodable sentences; quick comprehension check (“what did I read?”).

**RF Station F7 — Long Vowels (silent-e + vowel teams)**
*(Implement as a short series so it stays tight and decodable.)*

**RF Station F7a — Silent‑E Long Vowels**
- Targets: RF.1.3.C
- Screens: silent‑e minimal pairs; read silent‑e sentences.

**RF Station F7b — Vowel Teams: `ee`, `ea`**
- Targets: RF.1.3.C
- Screens: spot the vowel team; read `ee/ea` sentences.

**RF Station F7c — Vowel Teams: `ai`, `ay`**
- Targets: RF.1.3.C
- Screens: spot the vowel team; read `ai/ay` sentences.

**RF Station F7d — Vowel Teams: `oa`, `ow`**
- Targets: RF.1.3.C
- Screens: spot the vowel team; read `oa/ow` sentences.

**RF Station F8 — Syllables & Vowel Clues**
- Targets: RF.1.3.D
- Screens: count vowels → predict syllables; clap/count syllables; sort by 1/2/3 syllables.

**RF Station F9 — Two-Syllable Words**
- Targets: RF.1.3.E
- Screens: build from syllables; read two-syllable words; choose correct word to complete a sentence.

**RF Station F10 — Word Endings**
- Targets: RF.1.3.F
- Screens: read base vs ending (-s, -ed, -ing); match meaning/time; read in sentences.

**RF Station F11 — “Tricky Words” + Sight Words (First 100)**
*(Implement as a banded series so kids see small progress, while mastery stays word‑level.)*
- Targets: RF.1.3.G + checklist note (“first 100 sight words”)
- Screens: rapid recognition; read in phrases/sentences; optional cloze (limited) + spelling selection.
- Suggested structure: 5 bands × ~20 words (Band A–E), revisited frequently via Review/Mixed.
- Reference list: `docs/fry-sight-words-100.md`

**RF Station F12 — Fluency & Self-Correction**
- Targets: RF.1.4, RF.1.4.A, RF.1.4.B, RF.1.4.C
- Screens: read grade-level passage; read aloud with pacing (app model); “fix the word” self-correct moments.

### 3.2 Literature Line (RL)

**RL Station L1 — Key Details (WH)**
- Targets: RL.1.1
- Screens: short story → WH questions where evidence is one sentence (who/what/where/when/why).

**RL Station L2 — Retell + Message**
- Targets: RL.1.2
- Screens: order events (first/next/last); select key details; “What did the author teach?” (simple moral/lesson).

**RL Station L3 — Characters, Setting, Events**
- Targets: RL.1.3
- Screens: identify character/setting; match event to picture; one short “story map” screen.

**RL Station L4 — Feeling Words**
- Targets: RL.1.4
- Screens: find feeling words; choose which word shows feeling; connect feeling to a sentence.

**RL Station L5 — Fiction vs Nonfiction**
- Targets: RL.1.5 (and supports RI line)
- Screens: classify short texts; explain “how you know” using one detail.

**RL Station L6 — Who Is Telling the Story?**
- Targets: RL.1.6
- Screens: identify narrator (“I” vs “he/she”); point-of-view shift questions.

**RL Station L7 — Pictures + Words**
- Targets: RL.1.7
- Screens: use illustration + sentence to answer; “Which detail comes from the picture?”

**RL Station L8 — Compare Characters**
- Targets: RL.1.9
- Screens: compare two characters’ experiences; same/different; “who did what?”

**RL Station L9 — Grade-Level Stories & Poems + Prediction**
- Targets: RL.1.10, RL.1.10.A, RL.1.10.B
- Screens: read a poem + story excerpt; activate prior knowledge; make prediction; confirm prediction.

### 3.3 Informational Line (RI)

**RI Station N1 — Nonfiction Key Details (WH)**
- Targets: RI.1.1
- Screens: short nonfiction paragraph + WH detail questions.

**RI Station N2 — Main Topic + Details**
- Targets: RI.1.2, RI.1.7
- Screens: pick main topic; pick supporting detail; use picture+words for main idea.

**RI Station N3 — Connections**
- Targets: RI.1.3
- Screens: connect person→event, event→idea; “because/so” relationships (simple).

**RI Station N4 — New Words (Ask/Answer)**
- Targets: RI.1.4 (and supports L.1.4.A)
- Screens: word-in-context; “What does ___ mean here?” with a sentence clue.

**RI Station N5 — Text Features**
- Targets: RI.1.5
- Screens: headings/captions/labels; “Where would you look to find ___?”

**RI Station N6 — Pictures vs Words**
- Targets: RI.1.6
- Screens: classify details as “from picture” vs “from words.”

**RI Station N7 — Reasons Support Main Idea**
- Targets: RI.1.8
- Screens: main idea sentence + “Which reason supports it?” (evidence-first).

**RI Station N8 — Compare Two Texts**
- Targets: RI.1.9
- Screens: same/different between two short passages on same topic.

**RI Station N9 — Grade-Level Nonfiction + Prediction**
- Targets: RI.1.10, RI.1.10.A, RI.1.10.B
- Screens: read nonfiction; activate prior knowledge; predict next; confirm.

### 3.4 Writing Workshop Line (W)

Writing can be valuable, but it is often **better done off-screen** in Grade 1 (handwriting practice, sharing writing with a parent/teacher). In this app, treat writing as **Mode B (app-assisted + parent check)** by default:

- Avoid long typing and any “blank page” requirements.
- Prefer **sentence frames + word banks + picture planning**.
- Offer an “optional off-screen step” (write it on paper) with a parent confirm.

**W Station W1 — Opinion (Because)**
- Targets: W.1.1
- Screens: pick topic → pick opinion → pick 1–2 reasons → build 1–2 sentences (“I think __ because __.”) → optional “write it on paper” parent confirm.

**W Station W2 — Informative (Facts)**
- Targets: W.1.2
- Screens: read a mini nonfiction text → pick facts → build “I learned…” sentences (2 facts) → optional “draw a picture” parent confirm.

**W Station W3 — Narrative (Beginning/Middle/End)**
- Targets: W.1.3
- Screens: plan (3-picture sequence) → build 3 short sentences with time words (first/next/last) → optional oral retell.

**W Station W4 — Add Details (Revise)**
- Targets: W.1.5
- Screens: show “draft” sentence → “friend suggestion” audio (2–3 options) → choose one detail to add (where/when/what) → rebuild revised version.

**W Station W5 — Publish**
- Targets: W.1.6
- Screens: choose title + illustration → “read my writing aloud” playback; simple share/export in parent view (or “show to parent” completion).

**W Station W6 — Mini Research & Write**
- Targets: W.1.7
- Screens: explore 2 short sources (two passages or passage + image) → build 1–2 “I learned…” sentences (word bank) → optional draw on paper.

**W Station W7 — Answer Questions Using Sources**
- Targets: W.1.8
- Screens: question → find evidence sentence → build a 1‑sentence answer using words from the text (word bank / short typing).

### 3.5 Speak & Listen Line (SL)

Many SL outcomes require real conversation and authentic audiences. Treat SL as **Mode B (app-assisted + parent check)** by default:

- Use **prompt cards** and short modeled examples.
- If recording isn’t implemented, the “success criteria” can be a parent check (or a short in-app comprehension check about what was heard).

**SL Station S1 — Conversation Skills**
- Targets: SL.1.1, SL.1.1.A, SL.1.1.B, SL.1.1.C
- Screens: short role-play prompts; “ask a question” stems; parent notes for turn-taking practice.

**SL Station S2 — Two-Step Directions**
- Targets: SL.1.2.A (supports SL.1.2)
- Screens: do-this-then-that (tap, drag, then choose); restate direction in own words (optional recording).

**SL Station S3 — Ask/Answer About What You Hear/See**
- Targets: SL.1.2
- Screens: play a short audio or show an image; WH questions about it.

**SL Station S4 — Ask/Answer About a Speaker**
- Targets: SL.1.3
- Screens: “speaker says…” audio; questions about what was said; “What is the speaker talking about?”

**SL Station S5 — Describe With Details**
- Targets: SL.1.4, SL.1.6
- Screens: prompt (“Describe this place/thing”) → sentence frame choices → optional recording in complete sentences.

**SL Station S6 — Poems/Rhymes/Songs**
- Targets: SL.1.4.A
- Screens: listen → echo line by line → recite with expression (recording optional / parent check).

**SL Station S7 — Use Drawings to Clarify**
- Targets: SL.1.5
- Screens: “choose a picture” (if no drawing tool) *or* draw 1 picture to explain; add 1 sentence caption.

### 3.6 Language Line (L)

**L Station G1 — Letters, Capitals, End Marks**
- Targets: L.1.1.A, L.1.2.A, L.1.2.B (supports RF.1.1.A)
- Screens: capitals for names/dates, pick correct end mark; **handwriting/letter printing is primarily offline** (optional trace/formation practice if implemented).

**L Station G2 — Nouns (Common/Proper/Possessive)**
- Targets: L.1.1.B
- Screens: identify nouns; name vs common; possessive “’s” in simple phrases.

**L Station G3 — Plurals + Matching Verbs**
- Targets: L.1.1.C
- Screens: “one vs many”; pick matching verb (run/runs); simple sentence building.

**L Station G4 — Pronouns**
- Targets: L.1.1.D
- Screens: choose correct pronoun; replace noun with pronoun; keep meaning.

**L Station G5 — Verb Tense**
- Targets: L.1.1.E
- Screens: yesterday/today/tomorrow; choose past/present/future verb forms.

**L Station G6 — Adjectives + Determiners**
- Targets: L.1.1.F, L.1.1.H
- Screens: add describing word; choose determiner (a/the/this/that/my/many/few).

**L Station G7 — Conjunctions + Prepositions**
- Targets: L.1.1.G, L.1.1.I
- Screens: connect ideas (and/but/or/so/because); choose best preposition in context.

**L Station G8 — Simple/Compound + Sentence Types**
- Targets: L.1.1.J (supports sentence-type skills)
- Screens: statement/question/command/exclamation; combine two simple sentences with conjunction.

**L Station G9 — Commas in Dates + Lists**
- Targets: L.1.2.C
- Screens: format a date; add commas in a list; “which sentence is correct?”

**L Station G10 — Spelling Strategies**
- Targets: L.1.2.D, L.1.2.E
- Screens: use sight words + spelling patterns; spell new words using sound-letter knowledge.

**L Station V1 — Meaning From Context + Word Parts**
- Targets: L.1.4, L.1.4.A, L.1.4.B, L.1.4.C
- Screens: sentence clue; prefix/suffix meaning; root + endings (jump/jumping/jumped).

**L Station V2 — Categories + Explain**
- Targets: L.1.5.A, L.1.5.B
- Screens: sort into categories; explain why a word belongs (sentence frame).

**L Station V3 — Real-Life Word Use**
- Targets: L.1.5.C
- Screens: choose word that fits real-life context (cozy places, etc.).

**L Station V4 — Shades of Meaning**
- Targets: L.1.5.D (verbs) and **L.1.5.E (adjectives)** *(the PDF lists L.1.5.D twice; treat the second as the adjectives variant)*
- Screens: order verbs by strength (peek→stare); order adjectives (small→gigantic); act-it-out optional.

**L Station V5 — Use New Words**
- Targets: L.1.6
- Screens: choose a new word; use it in a sentence; “use it again” in a new context (writing/speaking tie-in).

---

## 4) Checklist Coverage Crosswalk (All Items)

Each checklist item must appear in at least one “Introduce + Practice” station and in Review/Mixed stations.

### 4.1 Foundational Reading Skills (RF)
- RF.1.1, RF.1.1.A → RF Station F1
- RF.1.2 (umbrella) → RF Stations F2–F4
- RF.1.2.A → RF Station F4
- RF.1.2.B, RF.1.2.D → RF Station F2
- RF.1.2.C → RF Station F3
- RF.1.3 (umbrella) → RF Stations F5–F11
- RF.1.3.B → RF Station F6
- RF.1.3.A → RF Station F5
- RF.1.3.C → RF Stations F7a–F7d
- RF.1.3.D → RF Station F8
- RF.1.3.E → RF Station F9
- RF.1.3.F → RF Station F10
- RF.1.3.G + “first 100 sight words” → RF Station F11 + Review line
- RF.1.4, RF.1.4.A/B/C → RF Station F12 (and all reading lines as ongoing practice)

### 4.2 Read Literature (RL)
- RL.1.1 → RL Station L1
- RL.1.2 → RL Station L2
- RL.1.3 → RL Station L3
- RL.1.4 → RL Station L4
- RL.1.5 → RL Station L5
- RL.1.6 → RL Station L6
- RL.1.7 → RL Station L7
- RL.1.9 → RL Station L8
- RL.1.10, RL.1.10.A, RL.1.10.B → RL Station L9 + spiral in all story reading

### 4.3 Read Informational Text (RI)
- RI.1.1 → RI Station N1
- RI.1.2 → RI Station N2
- RI.1.3 → RI Station N3
- RI.1.4 → RI Station N4
- RI.1.5 → RI Station N5
- RI.1.6 → RI Station N6
- RI.1.7 → RI Station N2
- RI.1.8 → RI Station N7
- RI.1.9 → RI Station N8
- RI.1.10, RI.1.10.A, RI.1.10.B → RI Station N9 + spiral in all nonfiction reading

### 4.4 Writing (W)
- W.1.1 → W Station W1
- W.1.2 → W Station W2
- W.1.3 → W Station W3
- W.1.5 → W Station W4
- W.1.6 → W Station W5
- W.1.7 → W Station W6
- W.1.8 → W Station W7

### 4.5 Speaking & Listening (SL)
- SL.1.1, SL.1.1.A/B/C → SL Station S1
- SL.1.2 → SL Station S3
- SL.1.2.A → SL Station S2
- SL.1.3 → SL Station S4
- SL.1.4, SL.1.6 → SL Station S5
- SL.1.4.A → SL Station S6
- SL.1.5 → SL Station S7

### 4.6 Language (L)
- L.1.1 (umbrella) → L Stations G1–G8
- L.1.1.A → L Station G1
- L.1.1.B → L Station G2
- L.1.1.C → L Station G3
- L.1.1.D → L Station G4
- L.1.1.E → L Station G5
- L.1.1.F + L.1.1.H → L Station G6
- L.1.1.G + L.1.1.I → L Station G7
- L.1.1.J → L Station G8
- L.1.2 (umbrella) → L Stations G1, G9, G10
- L.1.2.A/B → L Station G1
- L.1.2.C → L Station G9
- L.1.2.D/E → L Station G10
- L.1.4 + A/B/C → L Station V1
- L.1.5 (umbrella) → L Stations V2–V4
- L.1.5.A/B → L Station V2
- L.1.5.C → L Station V3
- L.1.5.D (verbs) + L.1.5.E (adjectives) → L Station V4
- L.1.6 → L Station V5

### 4.7 Coverage mode summary (by domain)

- **RF/RL/RI/L:** Mode A (auto-graded) is the expected default.
- **W/SL:** Mode B (app-assisted + parent check) is the expected default; build deeper input (recording/drawing) only if it’s worth the complexity.

---

## 5) Priority Emphasis (Isaiah-focused weighting)

Even while covering the whole checklist, prioritize time and item volume on:

1. **WH comprehension (key details)**: RL.1.1, RI.1.1 (daily)
2. **Syllables**: RF.1.3.D/E (frequent)
3. **Beginning/middle/end sounds**: RF.1.2.C/D (frequent)
4. **Categories**: L.1.5.A/B (frequent)

And reduce:
- Heavy cloze/fill‑in‑blank outside sight-word fluency (keep cloze optional).

---

## 6) “Definition of Done” for new stations (Checklist-aligned QA)

For each station:
- Every checklist skill has a clear **success criterion** (what counts as mastery).
- Item pool has enough variety to prevent memorization (≥ 60 unique prompts/items per station bundle; more for high-need skills).
- Prompts are **TTS-safe** and prebuilt audio exists for learner-facing strings.
- Evidence-first comprehension: each question points to one clean key sentence.
- Review hooks: each newly mastered skill is scheduled into Review/Mixed stations.
