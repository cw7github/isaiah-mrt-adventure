# Learning Content Standards (Stories, Questions, Skills)

This document defines the **quality bar and writing/authoring standards** for all learning content in this app (stories, passages, questions, answers, and skill-practice items). It is written for anyone adding or editing content, whether you write directly in `index.html` or generate content programmatically.

## Quick Start (If You Only Read One Section)

- Every station should feel like: **Arrive → Explore → Choose → Enjoy**.
- Every comprehension question must be answered by **one specific sentence** the learner can find in the passage.
- Every fill-in-the-blank question must show the **blanked sentence** (never ask “completes the sentence” without showing the sentence).
- Every page should have **one job** (one focus word, one strategy, one phonics pattern, one vocabulary idea).
- Make success likely, but not guessable: **scaffolded mastery**, not “trick questions”.

## Hard Requirements (Pass/Fail)

If any of these are violated, the content is not ready to ship.

- **Evidence-first**: every comprehension question has exactly one evidence sentence (`page.passage`) that appears verbatim in the accumulated passage.
- **3-choice discipline**: every `menu` and every `question` has exactly **3** options.
- **Exact matching**: `correctAnswerName` must match an `answers[i].name` exactly (no paraphrases).
- **One job per page**: no page introduces multiple new skills at once (e.g., don’t mix a new phonics rule + a new comprehension strategy + multiple new vocab words).
- **No missing context**: a question must be solvable from what’s visible on the screen (e.g., cloze items must show the blanked sentence).
- **Autism-safe**: no scary/conflict content; tone stays calm; no trick/negative stems.
- **TTS-safe**: avoid emoji/symbols/odd punctuation/abbreviations; sentences are readable when spoken aloud.
- **Audio-ready**: any learner-facing string that can be spoken via `speak()` has prebuilt audio (or is spoken in prebuilt segments); run `node scripts/generate-tts-assets.mjs --check` before shipping.

## Authoring Workflow (Gold Standard)

Follow this sequence to avoid rework and keep quality high.

1. **Write the station spec** (worksheet): theme, level, lexicon, sight words, phonics target (optional), three menu items, and 3–6 planned evidence sentences.
2. **Draft read pages first**: write short, literal, repetitive sentences; mark 3–6 sentences you will reuse verbatim as question evidence.
3. **Draft questions second** (evidence-first): for each planned evidence sentence, write a question that can be answered only from that sentence; then write two near-miss distractors.
4. **Write hints as recovery**: the learner should *mostly* solve without hints; hints should strongly increase success on try #2.
5. **Add variants** last: variants change phrasing, not meaning; they should not change the correct answer or evidence.
6. **Read it out loud**: if it sounds confusing when spoken, simplify.
7. **Check narration coverage**: run `node scripts/generate-tts-assets.mjs --check`, then generate audio if anything is missing.

## Goals (Non‑Negotiables)

1. **High success rate with real learning**: learners should usually succeed within 1–2 tries, but success must come from *reading the text*, not guessing.
2. **Low cognitive load**: content should be broken into small steps with minimal distractions; language must be concrete and literal.
3. **Evidence-aligned learning loop**: read → retrieve (question) → feedback → continue, with frequent opportunities for retrieval and automaticity (sight words/phonics).
4. **Autism-friendly by default**: predictable structure, no idioms, no “trick” questions, clear instructions, and calm/consistent tone.

## Where Content Lives

- **Story stations (“lessons”)**:
  - Primary: `content/cpa-grade1-ela/content-pack.v1.json`, `content/cpa-grade1-math/content-pack.v1.json`
  - Runtime merge: `station-selection.js` loads a content pack and merges `stations` into `index.html`’s `stationContent`
  - Legacy/inlined stations: `index.html` → `const stationContent = { ... }` (food demo stations + practice shell)
- **Skill practice catalog**: `index.html` → `const skillsCatalog = [ ... ]`
- **Skill practice generation**: `index.html` functions around `startSkillPractice()` and `skillWordBanks`

## Implementation Notes (The App Is Literal)

These constraints affect how content renders and should be authored:

- Word splitting is whitespace-based (`splitSentenceIntoWords()`), so avoid unusual punctuation that may “stick” to words and sound odd in TTS (prefer `. ! ? ,` over `: ; — ( )`).
- “Key sentence” highlighting in the question passage works best when `page.passage` is **verbatim** from a prior read page and ends in `. ! ?`.
- The TTS cache key is `text.toLowerCase().trim()`. Newlines, emoji, and small punctuation differences create “new” strings and can cause missing-audio fallbacks.
- Avoid runtime-composed narration strings unless you also prebuild every possible output (or narrate in reusable segments, sentence-by-sentence).
- In station questions, set `questionType` correctly: use `comprehension` only for comprehension questions; use `sightWord` for decoding/phonics/cloze checks so they don’t pollute comprehension analytics.
- In comprehension questions, avoid including the phrase **“sight word”** in the question text unless you intentionally want it treated as a sight-word-style item (some UI behavior uses string heuristics in addition to `questionType`).

## Global Writing Style (Applies Everywhere)

**Voice + tone**

- Calm, supportive, and matter-of-fact.
- Prefer “You can…” / “Try…” / “Look for…” over evaluative language.
- Praise effort + strategy (“You used the story.”), not traits (“You are so smart.”).

**Clarity rules**

- Use concrete nouns; avoid vague pronouns when it could be confusing (prefer “the fish” over “it” when multiple objects exist).
- Avoid idioms, sarcasm, figurative language, and trick phrasing.
- Prefer short sentences and familiar words; keep one idea per sentence.

**TTS friendliness**

- Avoid abbreviations (“Dr.”, “vs.”), emoji/symbols in prose, and excessive punctuation.
- Prefer writing numbers as words in stories (“two” not “2”) unless a skill explicitly targets digits/number words.
- Avoid quotes unless needed; if used, prefer simple ASCII quotes and keep them consistent.
- Avoid underscores in narrated text (use `____` for cloze blanks). If you must show inside-word patterns like `__ip`, make sure the spoken form is understandable (e.g., “blank ip”).
- Avoid multi-paragraph narration strings with newlines; if you need multi-step help, narrate it one short sentence/paragraph at a time.

## Content Boundaries (Safety + Sensory)

This app is optimized for calm, predictable learning. Prefer “everyday safe” content.

Avoid:

- Violence, threats, weapons, disasters, injury, death.
- Jump scares, horror themes, creepy imagery, or intense negative emotions.
- Unpredictable interpersonal conflict (bullying, humiliation, arguments).

Prefer:

- Friendly helpers, simple social scripts (“The cook smiles.” “I say thank you.”).
- Clear cause-and-effect that is non-threatening (“It is hot, so I want a cold drink.”).
- Positive routines and choices (food, travel, nature, shops, trains).

## Core Pedagogical Principles (Authoring Implications)

Inspired by the “science of learning” tradition (active learning, mastery learning, cognitive load minimization, automaticity, spaced retrieval, and interleaving):

- **Active reading beats passive listening**: assume the learner taps words, reads with support, then answers.
- **One new challenge at a time**: each page should have a clear focus (a sight word, a phonics pattern, a comprehension strategy, or a vocabulary idea).
- **Retrieval is the test and the teaching**: questions should require looking back at the passage and extracting evidence.
- **Scaffold, don’t trick**: distractors should be plausible but clearly ruled out by the text.
- **Direct instruction loop**: teach → practice → check; if the learner misses, the hint should be a concrete action (“Find ___”, “Listen for ___”).
- **Spacing beats massing**: reintroduce target words/skills across multiple pages and across stations; don’t “teach once and abandon.”
- **Structured literacy first**: prioritize decoding; teach sound-letter mapping explicitly; avoid encouraging guessing from context or pictures.

## IXL-Inspired Practice Design (Adapted to This App)

The app is not IXL, but IXL’s public design patterns are a useful benchmark for *high-quality practice*. Here’s how to translate those ideas into authoring standards for this codebase:

**0) Quality, breadth, depth (don’t build hackable content)**

Adapted from Austin Scholar’s “app analysis” criteria and consistent with IXL’s large practice libraries:

- **Quality**: every item is clear, fair, and measures the intended skill (not “test-taking tricks”).
- **Breadth**: cover the full scope of what you claim to teach at that level (avoid “holes”).
- **Depth**: have enough item variety that learners can’t memorize a small loop of questions (use `variants` and sufficiently large pools).

**1) Mastery is earned through consistency**

- Design questions so a learner can’t “luck into” success; they must repeatedly demonstrate the skill.
- Use **multiple, slightly different opportunities** to show the same understanding (via `variants`, repeated vocabulary, and repeated strategy stems).
- Treat mastery as more than “percent correct”: consistency and item difficulty matter; avoid ambiguous items that create “unfair” wrong attempts.
- Think in milestones: early wins, then more consistent performance. In IXL terms, mastery is a high bar; in this app, content should support steady improvement without sudden jumps.

**2) Difficulty adapts best when items are well-leveled**

IXL emphasizes that practice is more informative when item difficulty varies appropriately. For authors, that means:

- Keep a clear difficulty gradient across a station (easy → medium → hardest).
- Make distractors “near misses” that reflect common confusions (wrong setting vs right setting; wrong adjective vs right adjective).
- Avoid wild variability in sentence complexity within the same level.

**3) Actionable next steps beat open-ended choice**

IXL highlights recommendations, skill plans, and suggested skills to reduce “what should I do next?” friction. In this app, we approximate that via recommendations + practice:

- Write comprehension stems/hints using the **strategy keywords** the app recognizes (setting, main idea, feel/feeling, first/next/last, why/because, who/character) so analytics can recommend the right practice.
- When adding a new station, ensure it can be recommended cleanly (add to `getStationOrder()` if it should be in progression).

**4) Audio support is part of accessibility, not a bonus**

IXL explicitly treats audio as a learning support (especially for younger learners). For this app’s content:

- Keep text TTS-friendly (short, literal, minimal punctuation).
- Prefer vocabulary that can be sounded out or is taught explicitly before being tested.
- Use tips and hints that tell the learner what to listen/look for.

**5) Motivation works best when it is specific and frequent**

IXL recommends intermediate milestones on the path to mastery (not just the final goal). In this app:

- Use `successMessage` to reinforce the *specific move* (“You found the setting.” “You used the describing word.”).
- Keep frequent “micro-wins”: short pages, quick checks, predictable structure, and supportive feedback.

## Austin Scholar-Inspired Content Design (Adapted)

The `austin_scholar_substack/` archive has recurring, practical lessons about what makes learning content work in real life. Translated into authoring standards for this app:

### 1) Mastery standard: “can’t get it wrong”

Treat mastery as *automatic, reliable performance*, not “got it once.”

Authoring implications:

- Re-introduce the same target words/ideas across multiple pages in the station (and later stations) so they become automatic.
- Use multiple retrieval opportunities for the same concept (same answer, different question wording via `variants`).
- Avoid moving to harder language until prerequisite patterns are stable (aligns with “go back to fill holes”).

### 2) Don’t let learners “game” the content

A common critique of weak learning apps is that they can be “clicked through” or memorized.

Authoring implications:

- Ensure distractors are plausible and on-theme (no throwaways).
- Prefer **evidence-based questions** with a clear key sentence so guessing is less effective than reading.
- Use `variants` to prevent rote memorization of a single stem.

### 3) Phonics-first reading instruction (avoid “guessing words”)

The archive strongly favors explicit phonics and criticizes whole-word/balanced-literacy approaches that teach kids to guess.

Authoring implications:

- When introducing a new spelling pattern, teach it explicitly (`teachWord`) and repeat it across the station.
- Use hints/tips that direct attention to sound-letter relationships (“Listen for ‘sh’…”).
- Never reward guessing from pictures/icons alone; the text must carry the meaning.

### 4) “Core knowledge” + reading comprehension together

Beyond comprehension skills, reading time can also build background knowledge.

Authoring implications:

- Each station should include 1–3 **tiny, safe, concrete facts** embedded in the story or `readingTip` (e.g., “Bubble tea is a famous drink from Taiwan.”).
- Facts must stay optional/bonus: don’t test “trivia” unless it appears verbatim in the key sentence.
- Keep facts aligned with theme to avoid cognitive overload.

### 5) Engagement through story, culture, and vividness (without losing clarity)

The archive repeatedly shows that people remember what feels vivid and meaningful (stories, music, film), not dry exposition.

Authoring implications:

- Use a micro-story arc (arrive → explore → choose → enjoy) and concrete sensory words (“warm”, “crunchy”, “steam”) that are age-appropriate.
- Prefer repetition and parallel structure over complicated prose (“I see… I see… I see…”).
- Keep everything literal and predictable; “vivid” should not mean “surprising”.

### 6) Motivation is often extrinsic—and that’s fine

The archive argues that personalized extrinsic motivation is a powerful, underused tool.

Authoring implications:

- Keep rewards and feedback aligned to learning actions (read → answer → progress).
- Use `successMessage` as a micro-reward: short, specific, and calm.
- Use choice (`menu`) to create agency without increasing difficulty.

### 7) Compression: say the minimum that teaches the maximum

Good teaching often looks like well-crafted compression: short, memorable phrasing that preserves meaning.

Authoring implications:

- Keep questions and hints short; remove filler words.
- Prefer “Find the words ___” over multi-sentence explanations.
- Keep each page to “one job” and one focused tip.

## Content Types and Required Schema

### 1) Station (Lesson) Object

Each station is a themed lesson with reading pages, one menu choice, and multiple questions.

**Recommended size + pacing**

- Typical: **8–12 pages total** (including menu + questions).
- Typical: **4–6** read pages, **4–7** questions, **1** menu.
- If you go longer: keep vocabulary load low and story structure predictable.

**Required fields**

- `name` (string): display name.
- `icon` (string): emoji icon for UI.
- `level` (number): difficulty level.
- `floor` (number): map placement.
- `stickers` (string[]): reward icons.
- `sightWords` (string[]): sight-word list used for highlighting and distractor generation.
- `previewWords` ({ word, icon, isSightWord, phonicsNote? }[]): preview chips.
- `pages` (array): sequence of pages (read/menu/question).

**Recommended station structures**

- **Full station** (common): `read → question → read → question → read → menu → question → read → question`
- **Mini station** (short): `read → question → menu → read → question`

**Standards**

- Exactly **one** `menu` page per station.
- Keep **thematic coherence**: story setting, menu options, and vocabulary match the station theme.
- Ensure **progression within the station**: start easy, peak difficulty near the end.

**Repetition targets (minimum effective dose)**

These prevent “one-and-done” exposure and reduce memorization-hacking:

- Each *new content word* introduced in the station appears **≥ 3 times** across read pages.
- Each `sightWordFocus` used in the station appears in **≥ 2** read pages (or is deliberately practiced via the auto sight-word check).
- If the station introduces a phonics pattern (`teachWord.sound`), include **≥ 8** total appearances of that pattern across read pages (combined), with at least one example in each position you intend to teach (start/middle/end).

**If you want the station in the main progression**

- Add the station id to `index.html` → `getStationOrder()` (the map/recommendation logic uses this ordered list).

### Station Naming + Consistency

- Station ids: lowercase, no spaces (e.g., `fruit`, `bubbletea`).
- `name`: Title Case, short, concrete (“Fruit Stand”, “Noodle House”).
- Keep item labels consistent across story/menu/questions (if the story says “Fruit Stand”, don’t answer with “The fruit stand”).
- Reuse a small station “lexicon”: the same key nouns/adjectives appear multiple times across the station.

### Station Planning Worksheet (Before You Write Pages)

Write this down first; it prevents drift and makes questions easier to author.

- Theme + setting:
- Target `level`:
- Target sight words (3–6):
- Target phonics (optional): (`sh` / `ch` / `th` / vowel team / etc.)
- New content words (max ~6–10 for the whole station):
- Menu category + three items:
- Evidence sentences you plan to reuse as `page.passage` (3–6):
- Strategy coverage (pick 2–4): setting / character / cause-effect / sequence / main idea / feelings / supporting detail

**Add two more fields (strongly recommended)**

- Planned “question ladder”: 2 easy → 2 medium → 1 harder (define what “harder” means: longer passage, closer distractors, or less explicit wording).
- Station repetition map: for each new content word, write how many times it appears (goal: ≥ 3).

### 2) Read Page (`type: 'read'`)

Read pages are “passages” in this app. The UI splits words by whitespace and supports tap-to-hear and “Read to Me”.

**Required fields**

- `type: 'read'`
- `sentence` (string) or `words` (string[]) (prefer `sentence`)
- `targetWords` (string[]): key words to emphasize and preload for TTS
- `sightWordFocus` (string): the focus sight word for that page
- `readingTip` (string): short, actionable tip (decoding, meaning, or strategy)

**Optional fields**

- `variants` (array of partial page objects): randomly chosen once per session
- `requireSightWordTap` (boolean): if `true`, the learner may need to tap the focus word to continue (when supports are enabled)
- `autoSightWordQuestion` (boolean): if not `false`, the app can insert an automatic fill-in-blank sight-word check the first time a focus word appears
- `teachWord` ({ word, sound, highlight, position }): phonics/digraph emphasis (e.g., `sh`, `ch`, `th`)

**Writing standards**

- Use **first-person, present tense** (“I am…”, “I see…”).
- Use **literal language**: avoid idioms, sarcasm, figurative language, and ambiguous pronouns.
- Use **short sentences** with simple punctuation: prefer `.` `!` `?`.
- Keep **page length appropriate to level** (word counts are total words in `sentence`):
  - Level 1: ~25–45 words
  - Level 2: ~30–50 words
  - Level 3: ~25–60 words (occasional longer “capstone” page is OK)
  - Level 4: ~30–80 words
- Limit **new vocabulary per page**:
  - Introduce at most 2–4 new content words; repeat them 2–4 times across the station.
- Ensure `sightWordFocus` **appears verbatim** in the `sentence` (so the UI can highlight/gate correctly).

**Sentence-level constraints (strong default)**

These keep decoding and working memory demands reasonable:

- Level 1: mostly 3–8 word sentences; avoid more than 10 words in a single sentence.
- Level 2: mostly 4–10 word sentences; avoid more than 12 words in a single sentence.
- Level 3–4: you can occasionally go longer, but avoid stacking multiple clauses (“because … when … so …”) in early levels.
- Avoid lists with 3+ comma clauses; prefer short repeated sentences instead.

### Leveling Rubric (How Difficulty Should Change)

Use this as a north star. It doesn’t need to be perfect, but avoid “level jumps” inside a station.

**Level 1 (Foundations)**

- Sentence frames repeat: “I am…”, “I see…”, “I want…”, “My ___ is…”.
- Mostly short words; minimize consonant clusters and rare spellings.
- Sight words are the main novelty; keep content words concrete (food, colors, simple actions).

**Level 2 (Expansion)**

- Add more adjectives and simple explanations (“golden and crispy”, “thick and long”).
- Add some 2-syllable/compound words that are visually supported and repeated.
- Begin gentle “big idea” questions (main idea) sparingly and with strong hints.

**Level 3 (Phonics spotlight)**

- Introduce one primary phonics feature per station (e.g., `sh`) using `teachWord`.
- Use multiple examples of the pattern across the station (start/end positions).
- Keep comprehension questions anchored to explicit sentences; avoid abstract reasoning beyond feelings.

**Level 4 (Longer passages + integration)**

- Longer passages and more integration (mixing learned words, multiple strategies).
- If introducing `th`/`ch`, keep the station consistent (don’t mix too many new patterns at once).
- Increase “look back and find evidence” expectations; keep the evidence sentence very clear.

**Reading tip standards**

Reading tips should be:

- Short (1–2 sentences).
- Actionable (“Tap ___.” “Listen for ___.” “Find ___ in the sentence.”).
- Aligned to the page’s *one job* (sight word, phonics, vocabulary, or comprehension strategy).

Good patterns:

- Sight word: “Tap ‘the’. Then find it in the sentence.”
- Phonics: “SH makes one sound. Listen: fi-SH.”
- Vocabulary: “Golden means yellow like gold.”
- Comprehension: “The setting is where the story happens.”

**Phonics/digraph standards (when using `teachWord`)**

- The `teachWord.word` must appear exactly in the sentence (case-insensitive, punctuation OK).
- The story should include **multiple examples** of the target pattern (start/middle/end) across pages.
- Tips should explicitly cue the sound (e.g., “Listen for the ‘sh’ sound…”).

### 3) Menu Page (`type: 'menu'`)

Menu pages provide engagement and track preference analytics. They do not (currently) determine correctness of later questions unless you build explicit recall questions.

**Required fields**

- `type: 'menu'`
- `prompt` (string): short instruction
- `menuStory` (string): 1–2 sentence context tied to the story
- `items` (array of exactly 3):
  - `name` (string): short label
  - `description` (string): a simple descriptor (supports vocabulary)
  - `icon` (string): optional/legacy visual

**Standards**

- Keep `prompt` **actionable** (“Pick your ___!”).
- Keep items **same category** (three fruits, three drinks, etc.).
- Avoid items that are too similar to distinguish at the reading level.
- Prefer descriptions that use **already-introduced words** or introduce only one new adjective.

### 4) Question Page (`type: 'question'`)

Questions are multiple choice in this app. The passage shown is the **full accumulated reading** so far. The `page.passage` (“key sentence”) can be highlighted as a scaffold when it matches (typically revealed after a wrong attempt or when the learner asks for help).

#### Key-Sentence Rule (Critical)

Treat `page.passage` as the “evidence sentence”:

- It should be **copied directly** from a prior read page (verbatim, including punctuation when possible).
- It should contain **all information needed** to answer the question.
- Avoid paraphrasing: paraphrase reduces highlighting and increases ambiguity.

#### 4a) Comprehension Question (`questionType: 'comprehension'`)

**Required fields**

- `type: 'question'`
- `questionType: 'comprehension'`
- `questionMode: 'multipleChoice'`
- `question` (string)
- `passage` (string): the **key sentence** that contains the evidence
- `comprehensionHint` (string): a short strategy hint (revealed after a wrong attempt)
- `answers` (array of exactly 3): `{ name, icon? , description? }`
- `correctAnswerName` (string): must match one `answers[i].name` exactly
- `successMessage` (string): positive reinforcement + what they did right

**Question-writing standards**

- Every question must be answerable by **one sentence** in the visible passage (the key sentence).
- Prefer questions that map cleanly to a reading strategy (for analytics + targeted practice):
  - **Setting**: include “setting” or “Where does the story happen?”
  - **Main idea**: include “main idea” or “mostly about”
  - **Characters**: include “who” or “character”
  - **Cause/effect**: include “why” / “because”
  - **Sequence**: include “first / next / last”
  - **Inference (feelings)**: include “feel” / “feeling”
  - Otherwise it is treated as **supporting detail**
- Avoid trick stems (no double-negatives, no “except”, no “best” unless it’s truly a main-idea/title skill).
- Keep question text **short** (typically 4–9 words for early levels).

**Forbidden / discouraged wording**

Avoid these unless the skill explicitly targets them:

- “NOT”, “except”, “least”, “never”, “always”
- double negatives (“Which is not…”, “Which does not…”)
- vague evaluatives (“best”, “most correct”) outside main idea/title skills

**Question ladder (within a station)**

Aim for a predictable ramp:

- Early: setting/labeling/detail questions with very explicit evidence sentences.
- Middle: “why/because” or “how” questions where evidence is still explicit.
- Late: slightly longer evidence sentence, closer distractors, or a more abstract stem (main idea) with a strong hint.

**Strategy keyword conventions (so analytics classify correctly)**

The app classifies reading strategy using keywords found in `question` and `comprehensionHint`. To keep recommendations accurate, prefer these phrases:

| Strategy | Prefer in question/hint | Common stems |
|---|---|---|
| Setting | `setting`, `where` | “Where does the story happen?” “What is the setting?” |
| Main idea | `main idea`, `mostly about` | “What is the main idea?” |
| Characters | `who`, `character` | “Who is the story about?” |
| Cause/effect | `why`, `because` | “Why did ___?” |
| Sequence | `first`, `next`, `last`, `in order` | “What happens first?” |
| Inference (feelings) | `feel`, `feeling` | “How does ___ feel?” |

**Stem bank (copy-ready)**

Use these to stay consistent and keep classification reliable:

- Setting: “Where does the story happen?” / “What is the setting?”
- Character: “Who is in the story?” / “Who is the character?”
- Supporting detail: “What did I see?” / “What did I pick?” / “What is ___ like?”
- Cause/effect: “Why did I ___?” / “Why did ___ happen?”
- Sequence: “What happens first?” / “What happens next?” / “What happens last?”
- Main idea: “What is the main idea?” / “What is this mostly about?”
- Feelings: “How do I feel?” / “How does ___ feel?”

**Hint bank (procedural, not revealing)**

- “Find the words ‘___’.”
- “Read the first sentence again.”
- “Look for the describing word.”
- “Look for the place name.”
- “Look for the word that tells why (because).”
- “Say the sentence out loud. Which answer sounds right?”

**Answer-choice standards**

- Exactly **3** options.
- Options must be the **same type** (all places, all foods, all feelings, all actions).
- Distractors should be **plausible in theme**, but clearly contradicted by the key sentence.
- Keep capitalization consistent (title case for named places/items; sentence case for full-sentence answers).

**Anti-guessing rules**

- If the learner can answer without reading (e.g., two silly distractors), rewrite.
- Don’t let visual/icon cues make the answer obvious; text should do the work.
- Avoid overlapping options (“Fish”, “Fresh fish”, “Fish on ice”) unless the skill is explicitly about precision.

##### Distractor Design Library (Use These Patterns)

Good distractors are “near misses” that teach discrimination. Pick 1–2 patterns per question:

- **Same category**: all choices are the same type (all places, all foods, all feelings).
- **Theme neighbor**: wrong options are plausible in the station theme (bakery vs fruit stand), not random.
- **Text neighbor**: wrong option appears elsewhere in the passage but is not supported by the key sentence.
- **Opposite adjective**: fresh vs dirty; hot vs cold (only if the story teaches the adjective family).
- **Part-to-whole**: “Fish” vs “Fish and shrimp” (only one is supported).
- **Similar-looking word** (sight/phonics): there/their, this/that (only when explicitly taught).

Avoid:

- Joke options.
- Two options that could both be correct.
- One option that is dramatically longer/more specific than the others.

### Common Failure Modes (What to Avoid)

- **Evidence mismatch**: `page.passage` doesn’t appear in the accumulated passage, so the highlight doesn’t help.
- **Two correct answers**: distractors aren’t actually ruled out by text (common with “feelings” and “main idea”).
- **Answer not in choices**: `correctAnswerName` is a paraphrase and doesn’t match an `answers[].name` exactly.
- **Off-level vocabulary**: many new long words introduced in one page without repetition.
- **Ambiguous referents**: multiple “it/they/this” without clear nouns.
- **Hint reveals the answer**: hints should direct attention, not disclose the correct option text.
- **Evidence too global**: the learner must search an entire passage because the key sentence is vague; fix by tightening `page.passage`.

**Hint standards**

- Hints should tell the learner **what to do**, not merely what to think.
- Prefer: “Find the words ‘___’.” / “Look for the describing word.” / “Read the first sentence again.”
- Avoid revealing the exact answer text unless the goal is explicit errorless learning for that item.
- Write `comprehensionHint` so it still sounds natural when prefixed with “Look here.” (the hint ladder may speak “Look here. {hint}”). Avoid starting hints with “Look here.”
- Avoid emoji, special symbols, and multi-step paragraphs in hints; keep them short and speakable.

**Hint timing (important)**

The UI hides `comprehensionHint` by default and reveals it after a wrong attempt. Therefore:

- The question must be solvable *without* the hint (the hint is for recovery).
- The hint should be short enough to be understood quickly when it appears.
- Don’t rely on multi-step hints (“First… then…”) unless the skill is explicitly procedural.

**Success-message standards**

- One short sentence is ideal.
- Praise + strategy label when possible (“Yes! You found the setting.”).
- Avoid over-the-top language; keep tone calm and consistent.

**Success message bank**

- “Yes! You found the setting.”
- “Yes! You used the story to find it.”
- “Nice! You found the describing word.”
- “Great! You remembered what you read.”
- “Yes! You used the hint.”

**Variants**

Use `variants` to provide 2–3 alternative `question` and/or `comprehensionHint` phrasings **without changing** the answer or the key sentence.

#### 4b) Sight Word / Phonics Question (`questionType: 'sightWord'`)

Use this for decoding/phonics prompts like “Which word starts with ‘ch’?” These questions do **not** count toward reading-strategy analytics and typically do not show the full passage.

**Required fields**

- Same as above, except:
  - `questionType: 'sightWord'`
  - `passage` is optional (can be included as authoring context)

**Standards**

- The answer choices should be **words from the prompt sentence** (or tightly related).
- When asking about position (start/middle/end), ensure **only one option** satisfies the condition.
- Keep the hint procedural (“Say each word slowly…”).

#### 4c) Fill-in-the-Blank (Cloze) Questions (Sight Words / Vocabulary)

Use cloze items for sight words (and occasionally for simple vocabulary) when you want the learner to practice reading a sentence frame and selecting the missing word.

**Hard requirement**: the learner must see the **blanked sentence** on screen. Never ask “Which word completes the sentence?” without showing the sentence.

**Standards**

- Put the blanked sentence in `page.passage` and include a visible blank like `____` (4 underscores is the default in this app).
- Keep to **one blank** per item at early levels.
- The correct answer must be a **word already present in the unblanked sentence** (or the station’s `sightWordFocus`).
- Distractors should be plausible and on-level: same part of speech, common confusions, or other sight words from the station.
- Hint should be procedural: “Read the sentence. Which word fits the blank?”

## Authoring Rules for Variants (Important)

The app resolves `page.variants` **once per session** by shallow-merging the chosen variant over the base page.

Standards:

- Variants must not remove required fields.
- Variants must not change what the correct answer should be.
- Keep vocabulary differences minimal; variants are for phrasing, not difficulty spikes.

**Evidence invariance rule (critical)**

If a sentence will be used later as a question’s evidence (`page.passage`), it must appear verbatim in the accumulated passage. Therefore:

- For read pages that contain “future evidence” sentences, keep that sentence **identical in every variant** (or do not vary that page).
- If you vary the evidence sentence, you must also vary every downstream question’s `page.passage` to match (easy to get wrong; avoid).

## Review Rubric (Gold Standard)

### Definition of Done (DoD)

Ship only when all items below are true:

- **Schema**: all required fields exist; all menus/questions have exactly 3 options; `correctAnswerName` matches exactly.
- **Evidence**: every comprehension question has a single key sentence (`page.passage`) that appears verbatim in prior read pages.
- **Context**: no contextless prompts; cloze questions show the blanked sentence on screen.
- **Clarity**: language is literal; pronouns are unambiguous; no trick stems; TTS sounds natural.
- **Leveling**: vocabulary and sentence complexity match the station level; difficulty ramps gradually inside the station.
- **Repetition**: new content words appear ≥ 3 times; phonics patterns appear ≥ 8 times if introduced.
- **Anti-gaming**: distractors are plausible near-misses; no “obvious” answers.
- **Autism-safe**: calm tone, predictable arc, no scary/conflict content.

### Rubric (Aim for “A”)

| Dimension | A (excellent) | B (acceptable) | C (revise) |
|---|---|---|---|
| Evidence | One clean key sentence per question; highlight works | Evidence exists but is slightly paraphrased | Evidence is vague/missing; requires guessing |
| Clarity | Simple, literal, low ambiguity | Minor ambiguity, still recoverable | Confusing referents, figurative language, or long clauses |
| Leveling | Sentence/vocab load matches level; smooth ramp | Occasional spike | Frequent spikes; feels like a different level |
| Distractors | Near-miss, on-theme, teach discrimination | Mostly ok; one weak distractor | Silly/random distractors; multiple plausible answers |
| Hints | Procedural, boosts try #2 success | Sometimes too generic | Reveals answer or doesn’t help |
| Motivation | Frequent micro-wins; specific praise | Praise is generic | Feedback is inconsistent or overstimulating |

### Quick “Read Aloud” Test

If you read the station out loud:

- Do you stumble on punctuation or odd phrasing? Simplify.
- Do you feel forced to add interpretation? Make nouns explicit.
- Can you point to the evidence sentence instantly for every question? If not, rewrite the question or evidence.

## Copy-Paste Templates (Authoring Starter)

These are minimal examples that match the app’s expected schema.

### Read page template

```js
{
  type: 'read',
  image: '🚂🍎',
  sentence: 'I am at the fruit stand. I see red apples.',
  variants: [
    { sentence: 'I am at the fruit stand. I see apples.' },
    { sentence: 'I am at the fruit stand. I see fruit on the table.' }
  ],
  targetWords: ['fruit', 'stand', 'see', 'red', 'apples'],
  sightWordFocus: 'see',
  requireSightWordTap: true,
  readingTip: 'Tap see. Then find it in the sentence.'
}
```

### Read page template (with `teachWord`)

```js
{
  type: 'read',
  sentence: 'The fish shines in the light. I wish I could eat it.',
  teachWord: { word: 'fish', sound: 'sh', highlight: 'fi-SH', position: 'end' },
  targetWords: ['fish', 'shines', 'wish'],
  sightWordFocus: 'the',
  readingTip: 'Fish ends with SH. Listen: fi-SH.'
}
```

### Menu page template

```js
{
  type: 'menu',
  prompt: 'Pick your fruit!',
  menuStory: 'The fruit looks so good. What will you pick?',
  variants: [
    { prompt: 'Choose a fruit.', menuStory: 'Read each choice. Then choose one.' }
  ],
  items: [
    { name: 'Apple', icon: '🍎', description: 'Red and round' },
    { name: 'Orange', icon: '🍊', description: 'Big and juicy' },
    { name: 'Banana', icon: '🍌', description: 'Yellow and sweet' }
  ]
}
```

### Comprehension question template

```js
{
  type: 'question',
  questionType: 'comprehension',
  questionMode: 'multipleChoice',
  passage: 'I am at the fruit stand.',
  question: 'Where does the story happen?',
  comprehensionHint: 'Read the sentence. What place is named?',
  variants: [
    { question: 'Where am I?', comprehensionHint: 'Read the sentence. What place is named?' },
    { question: 'What is the setting?', comprehensionHint: 'Setting means where the story happens.' }
  ],
  answers: [
    { name: 'Fruit Stand', icon: '🍎' },
    { name: 'Fruit Shop', icon: '🛒' },
    { name: 'Fruit Store', icon: '🏪' }
  ],
  correctAnswerName: 'Fruit Stand',
  successMessage: 'Yes! You found the setting.'
}
```

## Skill Practice Standards (Procedural Content)

Skill practice pages are generated in `index.html` via `generateSkillPages()` and typically use the same multiple-choice schema (often via `makeMCQ()`).

Standards when adding a new skill or editing generators:

- Each generated question should still have **3** answer choices and a `correctAnswerName` that matches exactly.
- Include a short `passage` whenever the question benefits from visible context (especially for fill-in-the-blank or grammar items).
- Keep stems and hints **procedural** (“Look at the first letter…”, “Clap the syllables…”) to reduce frustration.
- Avoid introducing unfamiliar proper nouns or off-theme vocabulary in practice pools unless that is the explicit learning goal.
- Keep practice text **deterministic** (seeded) per skill + app version when it will be narrated or prebuilt for TTS; avoid “new random sentences every run” that make audio coverage unbounded.
- If the UI needs special formatting (underscores/blanks/patterns), ensure the narrated text is still understandable when spoken aloud.

### IXL-Style Generator Quality (Adapted)

IXL’s public positioning emphasizes *many* questions that *adapt* and measure learning reliably. For our generators, that translates to:

- **Large pools, low repetition**: ensure each pool has enough items that a 10-question practice session doesn’t repeat the same words over and over.
- **Near-miss distractors**: wrong options should reflect realistic mistakes (letter swaps, similar rhymes, close meanings), not random noise.
- **Consistency over trickiness**: practice should reward sustained correct performance; avoid ambiguous items that create “unfair” wrong attempts.
- **Procedural hints**: the hint should be the strategy, not the answer (“Say it slowly.” “Look at the ending letters.”).
- **Previewability**: the question format should be consistent across items so learners know what kind of thinking is expected.

If you add a new pool, sanity-check it by generating 30–50 items and scanning for:

- accidental repeats
- multiple correct answers
- distractors that are obviously silly
- stems that don’t match the skill’s intent

### Automatic checks you should mentally validate

- Every station has exactly **1** menu page with **3** items.
- Every comprehension question has:
  - a key-sentence `passage`
  - **3** answers
  - a `correctAnswerName` that matches an answer exactly
  - a non-empty `comprehensionHint`
- Every read page has:
  - a non-empty `sentence`
  - non-empty `targetWords`
  - a `sightWordFocus` that appears in the sentence
  - a `readingTip`
- Every comprehension question’s `passage` appears verbatim in the accumulated passage (highlight works).
- Any read-page `variants` preserve any sentence that is used later as a question evidence sentence (or the page has no variants).
- Any station introducing `teachWord.sound` meets the repetition target (≥ 8 appearances across read pages).

### Manual “child experience” checks

- Can the learner answer by **looking back** at the passage, without adult help?
- After a wrong attempt, does the hint make the next attempt much more likely to succeed?
- Are any distractors “silly” or off-theme (which encourages guessing)?
- Does the station feel **predictable and calming** (arrival → explore → choice → enjoy)?
- Does reading feel like “sounding out”, not “guessing from pictures”?

## Current Content Inventory (Audit Snapshot)

As currently authored in `stationContent`:

- Stations: 16 total (including `practice`)
- Pages: 117 total
  - Read pages: 49
  - Question pages: 53
  - Menu pages: 15
- Question types in stations:
  - `comprehension`: 46
  - `sightWord`: 7

Known authoring gaps to fix when you next edit content:

- (none currently known; re-run the content audit after edits)

## Public References Consulted (IXL)

These were used only to extract general practice-design ideas (not copied into app content):

- SmartScore overview: `https://www.ixl.com/help-center/article/1272663/how_does_the_smartscore_work`
- Finding practice skills: `https://www.ixl.com/help-center/article/1274299/how_can_i_find_a_skill_to_work_on`
- Skill recommendations/suggestions: `https://www.ixl.com/help-center/article/2946680/is_there_a_way_to_suggest_skills_to_students`
- Real-Time Diagnostic overview: `https://www.ixl.com/diagnostic`
- Analytics overview: `https://www.ixl.com/analytics`

## Local References Consulted (Austin Scholar archive)

These local files were reviewed for inspiration on mastery learning, reading instruction, motivation, and practice design:

- `austin_scholar_substack/2022-03-03-austin-scholar-2-austins-app-analysis.md`
- `austin_scholar_substack/2022-04-02-austin-scholar-5-knowing-knewton.md`
- `austin_scholar_substack/2022-05-11-austin-scholar-13-the-pros-and-cons.md`
- `austin_scholar_substack/2022-06-15-austin-scholar-18-do-educational.md`
- `austin_scholar_substack/2022-07-27-austin-scholar-24-the-science-of.md`
- `austin_scholar_substack/2022-09-18-austin-scholar-31-benjamin-bloom.md`
- `austin_scholar_substack/2022-10-02-austin-scholar-33-the-truth-about.md`
- `austin_scholar_substack/2022-10-23-austin-scholar-36-the-four-skills.md`
- `austin_scholar_substack/2022-10-30-austin-scholar-37-what-your-kid-needs.md`
- `austin_scholar_substack/2022-11-06-austin-scholar-38-how-to-teach-your.md`
- `austin_scholar_substack/2022-12-04-austin-scholar-42-how-a-jeopardy.md`
- `austin_scholar_substack/2024-04-14-austin-scholar-111-how-kids-at-alpha.md`
- `austin_scholar_substack/2024-04-28-austin-scholar-113-americas-reading.md`
- `austin_scholar_substack/2024-07-21-austin-scholar-125-seven-things-you.md`
- `austin_scholar_substack/2025-07-06-austin-scholar-172-everyone-is-wrong.md`
- `austin_scholar_substack/2025-07-13-austin-scholar-173-the-science-behind.md`
- `austin_scholar_substack/2025-08-10-austin-scholar-177-the-alpha-app.md`
- `austin_scholar_substack/resources/AI Learning Blueprint.pdf`
- `austin_scholar_substack/Stack References/austin-scholar-173-the-science-behind/the-math-academy-way.pdf`
