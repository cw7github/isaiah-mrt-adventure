# Isaiah's MRT Food Adventure — Comprehensive Content Review (Grade 1 ELA & Math)

**Date:** 2025-12-23  
**Reviewed files:**  
- `content/cpa-grade1-ela/content-pack.v1.json`  
- `content/cpa-grade1-math/content-pack.v1.json`

## Scope Notes (Schema Reality Check)

- `menu` pages in these packs use `prompt` / `menuStory` / `items[{name, icon, description}]` and are **not scored** (no `isCorrect`). The checklist item “exactly one `isCorrect: true`” is **N/A** to these packs.
- ELA contains `activitySpec` pages (future placeholders per `content/cpa-grade1-ela/SCHEMA.md`). The current app renderer in `index.html` only handles `read | menu | question`, so `activitySpec` pages can soft-lock a station.

## Issue Log (All Issues Found)

STATION: rf_f2_blend_and_segment  
PAGE: 1  
SEVERITY: Critical  
CATEGORY: Technical  
ISSUE: `activitySpec` pages are not rendered by the current lesson engine (only `read/menu/question`), so the station can get stuck on this page.  
CURRENT: `{ type: "activitySpec", activityType: "phonemeBlend", prompt: "Blend the sounds.", data: { phonemes: ["m","a","p"], answer: "map" } }`  
SUGGESTED FIX: Replace with supported `question` pages (MCQ “Blend m a p. What word?”) or implement an `activitySpec` renderer before shipping these stations.

STATION: rf_f2_blend_and_segment  
PAGE: 6  
SEVERITY: Critical  
CATEGORY: Technical  
ISSUE: `activitySpec` page type is unsupported by the renderer; this can soft-lock the lesson flow.  
CURRENT: `{ type: "activitySpec", activityType: "phonemeBoxes", prompt: "Tap each sound in map." }`  
SUGGESTED FIX: Convert to supported MCQ items (e.g., “How many sounds are in map?” with counters/visuals) or implement the activity runtime.

STATION: rf_f3_sound_positions  
PAGE: 1  
SEVERITY: Critical  
CATEGORY: Technical  
ISSUE: `activitySpec` page type is unsupported by the renderer; this can soft-lock the station.  
CURRENT: `{ type: "activitySpec", activityType: "phonemePositions", prompt: "Find the first, middle, and last sounds in sun." }`  
SUGGESTED FIX: Replace with supported MCQ (e.g., “What is the first sound in sun?”) or implement the activity runtime.

STATION: rf_f4_short_long_vowels  
PAGE: 1  
SEVERITY: Critical  
CATEGORY: Technical  
ISSUE: `activitySpec` page type is unsupported by the renderer; this can soft-lock the station.  
CURRENT: `{ type: "activitySpec", activityType: "listenChooseWord", prompt: "Listen. Which word has a long vowel sound?" }`  
SUGGESTED FIX: Convert to supported MCQ (“Which word has a long vowel sound?”) and use existing audio/word display conventions, or implement activity support.

STATION: rf_f8_syllables_vowel_clues  
PAGE: 1  
SEVERITY: Critical  
CATEGORY: Technical  
ISSUE: `activitySpec` page type is unsupported by the renderer; this can soft-lock the station.  
CURRENT: `{ type: "activitySpec", activityType: "syllableClap", prompt: "Clap the syllables in robot." }`  
SUGGESTED FIX: Replace with MCQ approximations (e.g., “How many syllables in robot?”) or implement the activity runtime.

STATION: rf_f9_two_syllable_words  
PAGE: 1  
SEVERITY: Critical  
CATEGORY: Technical  
ISSUE: `activitySpec` page type is unsupported by the renderer; this can soft-lock the station.  
CURRENT: `{ type: "activitySpec", activityType: "syllableBuild", prompt: "Put the syllables together: sun + set" }`  
SUGGESTED FIX: Replace with MCQ (“sun + set makes ___”) or implement the activity runtime.

STATION: rf_f12_fluency_fix_words  
PAGE: 1  
SEVERITY: Critical  
CATEGORY: Technical  
ISSUE: `activitySpec` page type is unsupported by the renderer; this can soft-lock the station.  
CURRENT: `{ type: "activitySpec", activityType: "readAloud", prompt: "Read this part out loud. Then read it again smoothly." }`  
SUGGESTED FIX: Replace with supported fluency checks (MCQ about “fix the word”) or implement the activity runtime.

STATION: rl_l2_retell_message  
PAGE: 1  
SEVERITY: Critical  
CATEGORY: Technical  
ISSUE: `activitySpec` page type is unsupported by the renderer; this can soft-lock the station.  
CURRENT: `{ type: "activitySpec", activityType: "order3", prompt: "Put the events in order." }`  
SUGGESTED FIX: Replace with 2–3 supported MCQs (“What happened first/next/last?”) or implement ordering activity support.

STATION: l_v2_categories  
PAGE: 1  
SEVERITY: Critical  
CATEGORY: Technical  
ISSUE: `activitySpec` page type is unsupported by the renderer; this can soft-lock the station.  
CURRENT: `{ type: "activitySpec", activityType: "sort", prompt: "Sort the words into groups." }`  
SUGGESTED FIX: Replace with supported MCQs that simulate sorting (e.g., “Which word belongs in Foods?”) or implement `sort` activity support.

STATION: l_v5_use_new_words  
PAGE: 2  
SEVERITY: Critical  
CATEGORY: Technical  
ISSUE: `activitySpec` page type is unsupported by the renderer; this can soft-lock the station.  
CURRENT: `{ type: "activitySpec", activityType: "writingScaffold", prompt: "Use the word gentle in your own sentence." }`  
SUGGESTED FIX: Replace with supported selection-style scaffolds (choose best completion) or implement writing scaffold support.

STATION: rf_f11_sight_words_band_a  
PAGE: 6  
SEVERITY: Minor  
CATEGORY: Technical  
ISSUE: `targetWords` contains words that do not appear in the sentence (`been`, `about`), which can cause incorrect highlighting/audio-preload strings.  
CURRENT: `targetWords: ["as","a","kid","been",...,"about",...]` with sentence `A kid called Fast could do an act as good as a cat and a dog down at a park.`  
SUGGESTED FIX: Remove the non-present words from `targetWords`, or rewrite the sentence to actually include them.

STATION: l_g9_commas_dates_lists  
PAGE: 0 and 1  
SEVERITY: Minor  
CATEGORY: Technical  
ISSUE: `targetWords` includes punctuation-attached tokens (`"5,"`, `"apples,"`, `"bananas,"`) which don’t match the app’s “clean word” handling and can create TTS cache misses.  
CURRENT: page[0] `targetWords: ["write","date","May","5,","2025"]`; page[1] `targetWords: ["write","list","apples,","bananas,","and","pears"]`  
SUGGESTED FIX: Change to `["5"]`, `["apples"]`, `["bananas"]` (no commas) and keep punctuation only in the sentence text.

STATION: rf_f11_sight_words_band_b  
PAGE: 0, 2, 6  
SEVERITY: Major  
CATEGORY: Quality  
ISSUE: Read passages are semantically incoherent (“word-salad” style), which undermines fluency practice and can be confusing for Grade 1/autism-friendly UX.  
CURRENT: Example page[0] `I go in first for each kid. He had his bag. If I find her hat I get it from him.`  
SUGGESTED FIX: Rewrite read pages as 2–4 short, coherent MRT/food-themed sentences that still include the Band B sight words (each/find/first/for/from/get/go/had/has/have/he/her/him/his/how/if/in/into/is).

STATION: rf_f11_sight_words_band_b  
PAGE: 3  
SEVERITY: Major  
CATEGORY: Quality  
ISSUE: Menu prompt/story does not match the menu items (prompt says “question word”, but items are verbs).  
CURRENT: `prompt: "Pick a question word!"`, `menuStory: "I practice who, what, and where."`, items: `find / have / get`  
SUGGESTED FIX: Either (A) change items to `who/what/where` (and adjust descriptions/icons), or (B) change prompt/story to “Pick an action word!” (and update the `ui.imagePrompt`).

STATION: rf_f11_sight_words_band_b  
PAGE: 5  
SEVERITY: Major  
CATEGORY: Pedagogy  
ISSUE: The hint teaches the wrong meaning cue for the blank.  
CURRENT: passage `I ____ find it.`; hint `Which word means in the direction of?`; correct `go`  
SUGGESTED FIX: Use a Grade 1-true hint like “Which word means move?” or “Which word makes the sentence sound right?”

STATION: rf_f11_sight_words_band_c  
PAGE: 0, 2, 6  
SEVERITY: Major  
CATEGORY: Quality  
ISSUE: Read passages are semantically incoherent, making the station feel random rather than meaningful sight-word practice.  
CURRENT: Example page[0] `It is one more day. I like it now. Look at my number. I made it of oil on a pan or other long stick.`  
SUGGESTED FIX: Rewrite read pages with coherent, concrete sentences (train numbers / food items) while using Band C words (it/like/look/make/many/more/my/not/now/one/or/other, etc.).

STATION: rf_f11_sight_words_band_c  
PAGE: 1  
SEVERITY: Major  
CATEGORY: Pedagogy  
ISSUE: The hint is incorrect (“look” does not mean “are”).  
CURRENT: passage `I ____ at my number.`; hint `Which word means are?`; correct `look`  
SUGGESTED FIX: Change hint to “Which word means see?” or “Which word makes the sentence sound right?”

STATION: rf_f11_sight_words_band_c  
PAGE: 4  
SEVERITY: Major  
CATEGORY: Pedagogy  
ISSUE: The hint is incorrect (“may” does not mean “not in”).  
CURRENT: passage `I ____ make one.`; hint `Which word means not in?`; correct `may`  
SUGGESTED FIX: Change hint to “May means might/can.” or use a simpler cue: “Which word makes the sentence sound right?”

STATION: rf_f11_sight_words_band_d  
PAGE: 0, 2, 6  
SEVERITY: Major  
CATEGORY: Quality  
ISSUE: Read passages are semantically incoherent, increasing cognitive load and reducing the value of fluency practice.  
CURRENT: Example page[0] `I see the people sit out. She said they are there. Some see them so this is time than that part.`  
SUGGESTED FIX: Rewrite as coherent, literal, short sentences that still use Band D sight words (this/that/these/they/their/them/then/there, etc.).

STATION: rf_f11_sight_words_band_d  
PAGE: 3  
SEVERITY: Major  
CATEGORY: Quality  
ISSUE: Menu story label is inaccurate (“action sight words”) for demonstratives (`this/that/these`).  
CURRENT: `menuStory: "I practice reading action sight words."` with items `this/that/these`  
SUGGESTED FIX: Update menuStory to “I practice pointing words.” (or “words that point: this/that/these”) and align the `ui.imagePrompt` wording.

STATION: rf_f11_sight_words_band_d  
PAGE: 4  
SEVERITY: Major  
CATEGORY: Pedagogy  
ISSUE: The hint is incorrect (“sit” does not mean “speak”).  
CURRENT: passage `They ____ out there.`; hint `Which word means speak?`; correct `sit`  
SUGGESTED FIX: Change hint to “Which action word fits?” or “Which word means sit down?”

STATION: rf_f11_sight_words_band_e  
PAGE: 0, 2, 6  
SEVERITY: Major  
CATEGORY: Quality  
ISSUE: Read passages are semantically incoherent, which undermines the goal of meaningful sight-word fluency practice.  
CURRENT: Example page[0] `We use two words to write when you will go up. Was I with what? Were we which way when who would use water?`  
SUGGESTED FIX: Rewrite read pages into coherent MRT/food-themed sentences that still include Band E words (to/two/up/use/was/were/will/with/when/who/what/which/you/your, etc.).

STATION: rf_f11_sight_words_band_e  
PAGE: 3  
SEVERITY: Major  
CATEGORY: Quality  
ISSUE: Menu prompt/story/UI mismatch: it says “color word” but the items are verb tense/time words (`was/were/will`).  
CURRENT: `prompt: "Pick a color word!"` with items `was / were / will` and `ui.imagePrompt` mentioning colored circles  
SUGGESTED FIX: Either change items to actual color words, or change prompt/story/UI to “Pick a time word!” (past vs future) and update descriptions/icons accordingly.

STATION: rf_f11_sight_words_band_e  
PAGE: 1  
SEVERITY: Major  
CATEGORY: Pedagogy  
ISSUE: The hint is unrelated to the blank/correct answer.  
CURRENT: passage `We use ____ words.`; hint `Which word means make the door move?`; correct `two`  
SUGGESTED FIX: Change hint to “Two means 2.” or “Which word means 2?”

STATION: rf_f11_sight_words_band_e  
PAGE: 4  
SEVERITY: Major  
CATEGORY: Pedagogy  
ISSUE: The hint is unrelated to the blank/correct answer.  
CURRENT: passage `You ____ with us.`; hint `What do you do at night?`; correct `were`  
SUGGESTED FIX: Change hint to “Were tells about the past.” or “Which word makes the sentence about before?”

STATION: oa_add_word_problems  
PAGE: 2  
SEVERITY: Major  
CATEGORY: Pedagogy  
ISSUE: Word problem shows the operation via `numberSentence` (the app displays `numberSentence`), enabling pattern-matching instead of reasoning from the story.  
CURRENT: `questionType: "wordProblem"`, `question: "How many apples do I have now?"`, `numberSentence: "3 + 2 = ____"`  
SUGGESTED FIX: Remove `numberSentence` for wordProblem pages (or only reveal it after answering via UI logic).

STATION: oa_add_word_problems  
PAGE: 4  
SEVERITY: Major  
CATEGORY: Pedagogy  
ISSUE: Word problem shows the operation via `numberSentence`.  
CURRENT: `numberSentence: "6 + 5 = ____"`  
SUGGESTED FIX: Remove `numberSentence` (or hide until after answer).

STATION: oa_add_word_problems  
PAGE: 6  
SEVERITY: Major  
CATEGORY: Pedagogy  
ISSUE: Word problem shows the operation via `numberSentence`.  
CURRENT: `numberSentence: "7 + 4 = ____"`  
SUGGESTED FIX: Remove `numberSentence` (or hide until after answer).

STATION: oa_add_word_problems  
PAGE: 8  
SEVERITY: Major  
CATEGORY: Pedagogy  
ISSUE: Word problem shows the operation via `numberSentence`.  
CURRENT: `numberSentence: "9 + 6 = ____"`  
SUGGESTED FIX: Remove `numberSentence` (or hide until after answer).

STATION: oa_add_word_problems  
PAGE: 9  
SEVERITY: Major  
CATEGORY: Pedagogy  
ISSUE: Word problem shows the operation via `numberSentence`.  
CURRENT: `numberSentence: "8 + 7 = ____"`  
SUGGESTED FIX: Remove `numberSentence` (or hide until after answer).

STATION: oa_sub_word_problems  
PAGE: 2  
SEVERITY: Major  
CATEGORY: Pedagogy  
ISSUE: Word problem shows the operation via `numberSentence`.  
CURRENT: `numberSentence: "7 - 3 = ____"`  
SUGGESTED FIX: Remove `numberSentence` for wordProblem pages (or only reveal after answering).

STATION: oa_sub_word_problems  
PAGE: 4  
SEVERITY: Major  
CATEGORY: Pedagogy  
ISSUE: Word problem shows the operation via `numberSentence`.  
CURRENT: `numberSentence: "12 - 5 = ____"`  
SUGGESTED FIX: Remove `numberSentence` (or hide until after answer).

STATION: oa_sub_word_problems  
PAGE: 6  
SEVERITY: Major  
CATEGORY: Pedagogy  
ISSUE: Word problem shows the operation via `numberSentence`.  
CURRENT: `numberSentence: "15 - 8 = ____"`  
SUGGESTED FIX: Remove `numberSentence` (or hide until after answer).

STATION: oa_sub_word_problems  
PAGE: 8  
SEVERITY: Major  
CATEGORY: Pedagogy  
ISSUE: Word problem shows the operation via `numberSentence`.  
CURRENT: `numberSentence: "16 - 9 = ____"`  
SUGGESTED FIX: Remove `numberSentence` (or hide until after answer).

STATION: oa_sub_word_problems  
PAGE: 9  
SEVERITY: Major  
CATEGORY: Pedagogy  
ISSUE: Word problem shows the operation via `numberSentence`.  
CURRENT: `numberSentence: "13 - 7 = ____"`  
SUGGESTED FIX: Remove `numberSentence` (or hide until after answer).

STATION: md_interpret_data  
PAGE: 12  
SEVERITY: Major  
CATEGORY: Pedagogy  
ISSUE: Word problem shows the operation via `numberSentence`.  
CURRENT: `questionType: "wordProblem"`, `numberSentence: "6 - 4 = ___"`  
SUGGESTED FIX: Remove `numberSentence` (or reveal only after answering), and rely on the graph comparison wording.

STATION: nbt_add_no_regroup  
PAGE: 4  
SEVERITY: Major  
CATEGORY: Standards  
ISSUE: Misaligned with `1.NBT.C.4` scope: includes 2-digit + 2-digit addition (not just 2-digit + 1-digit or 2-digit + multiple of 10).  
CURRENT: `numberSentence: "34 + 21 = ___"` (checklistTargets: `1.NBT.C.4`)  
SUGGESTED FIX: Replace with `34 + 1-digit` (possibly with regroup) or `34 + 10/20/30`, or change the target standard (Grade 2+) if keeping 2-digit+2-digit.

STATION: nbt_add_no_regroup  
PAGE: 7  
SEVERITY: Major  
CATEGORY: Standards  
ISSUE: Misaligned with `1.NBT.C.4` scope (2-digit + 2-digit).  
CURRENT: `numberSentence: "52 + 33 = ___"`  
SUGGESTED FIX: Use `52 + 30` or `52 + 8` style problems (and support with base-ten visuals), or move to Grade 2 standards.

STATION: nbt_add_no_regroup  
PAGE: 10  
SEVERITY: Major  
CATEGORY: Standards  
ISSUE: Misaligned with `1.NBT.C.4` scope (2-digit + 2-digit).  
CURRENT: `numberSentence: "14 + 32 = ___"`  
SUGGESTED FIX: Use `32 + 4` or `14 + 10/20/30` type problems, or move to Grade 2 standards.

STATION: nbt_add_with_regroup  
PAGE: 4  
SEVERITY: Major  
CATEGORY: Standards  
ISSUE: Misaligned with `1.NBT.C.4` scope (2-digit + 2-digit).  
CURRENT: `numberSentence: "36 + 17 = ___"`  
SUGGESTED FIX: Keep regrouping but within Grade 1 scope: `36 + 8` (regroup) rather than `36 + 17`.

STATION: nbt_add_with_regroup  
PAGE: 7  
SEVERITY: Major  
CATEGORY: Standards  
ISSUE: Misaligned with `1.NBT.C.4` scope (2-digit + 2-digit).  
CURRENT: `numberSentence: "48 + 26 = ___"`  
SUGGESTED FIX: Use `48 + 7` (regroup) or `48 + 20` (multiple of 10), and show base-ten blocks.

STATION: nbt_add_with_regroup  
PAGE: 9  
SEVERITY: Major  
CATEGORY: Standards  
ISSUE: Misaligned with `1.NBT.C.4` scope (2-digit + 2-digit).  
CURRENT: `numberSentence: "29 + 15 = ___"`  
SUGGESTED FIX: Use `29 + 6` (regroup) or `29 + 10` (multiple of 10).

STATION: nbt_add_with_regroup  
PAGE: 10  
SEVERITY: Major  
CATEGORY: Standards  
ISSUE: Misaligned with `1.NBT.C.4` scope (2-digit + 2-digit).  
CURRENT: `numberSentence: "57 + 38 = ___"`  
SUGGESTED FIX: Use `57 + 3` (regroup) or `57 + 40` (multiple of 10), or move to Grade 2 standards if keeping this.

STATION: g_3d_shapes  
PAGE: station-level  
SEVERITY: Major  
CATEGORY: Standards  
ISSUE: Checklist target `1.G.A.2` is about composing 2D/3D shapes into new shapes, but this station is mostly identification + attribute facts (faces/edges/roll).  
CURRENT: Questions like “What shape is the soda can?” and “How many faces does a cube have?”  
SUGGESTED FIX: Either (A) rewrite to composition tasks with 3D shapes (combine cube/cone/cylinder into a composite) to match `1.G.A.2`, or (B) change checklistTargets to the correct standard for identifying 3D shapes/attributes.

STATION: g_3d_shapes  
PAGE: 7  
SEVERITY: Major  
CATEGORY: Correctness  
ISSUE: The text teaches an incorrect/over-simplified property: cones *can* roll (typically in a circle) and can also slide; stating “It cannot roll.” is inaccurate.  
CURRENT: `I see an ice cream cone... It cannot roll.`  
SUGGESTED FIX: Change to “A cone can roll and slide.” (or “It can roll in a circle.”) and update follow-up questions if you want “roll” to have exactly one correct choice.

STATION: review_math_sprint_1  
PAGE: station-level  
SEVERITY: Major  
CATEGORY: Completeness  
ISSUE: Review sprint claims multiple checklistTargets but includes only 1 question, so it cannot cover the listed OA + NBT + G scope.  
CURRENT: `checklistTargets: ["1.OA.C.6","1.NBT.B.2","1.G.A.1"]` with a single addition question page.  
SUGGESTED FIX: Add several review questions covering each listed target, or narrow `checklistTargets` to only the standard actually assessed.

STATION: review_math_sprint_2  
PAGE: station-level  
SEVERITY: Major  
CATEGORY: Completeness  
ISSUE: Review sprint claims multiple checklistTargets but includes only 1 question, so it cannot cover the listed OA + NBT + G scope.  
CURRENT: `checklistTargets: ["1.OA.D.8","1.NBT.C.4","1.G.A.3"]` with a single missing-addend question page.  
SUGGESTED FIX: Add several review questions covering each listed target, or narrow `checklistTargets` to only the standard actually assessed.

STATION: l_g10_spelling_strategies  
PAGE: 8/11, 9/12, 10/13  
SEVERITY: Minor  
CATEGORY: Technical  
ISSUE: Exact duplicate question pages appear twice in the same station, reducing variety and violating the “no duplicates within a station” rule.  
CURRENT: Pages 8–10 are repeated verbatim as pages 11–13 (same question, passage, answers, correctAnswerName, and successMessage).  
SUGGESTED FIX: Remove the duplicate set, or replace the duplicates with new spelling-pattern items (e.g., new CVC patterns, common digraph patterns, or additional sight-word spelling checks aligned to L.1.2.D/E).

## Summary Statistics

1) **Total stations reviewed:** 86 (ELA 56 + Math 30)  
2) **Total pages reviewed:** 823 (including 429 question pages)  
3) **Issues by severity:** Critical 10 / Major 35 / Minor 3  
4) **Issues by category:** Technical 13 / Pedagogy 17 / Quality 7 / Standards 8 / Correctness 1 / Completeness 2  
5) **Stations with no issues (62):**
   - **ELA (40):** rf_f1_print_concepts, rf_f5_consonant_blends, rf_f6_read_short_words, rf_f7a_silent_e, rf_f7b_vowel_teams_ee_ea, rf_f7c_vowel_teams_ai_ay, rf_f7d_vowel_teams_oa_ow, rf_f10_word_endings, rl_l1_key_details_wh, rl_l3_character_setting_events, rl_l4_feeling_words, rl_l5_fiction_vs_nonfiction, rl_l6_narrator, rl_l7_pictures_and_words, rl_l8_compare_characters, rl_l9_stories_poems_prediction, ri_n1_key_details_wh, ri_n2_main_topic_details, ri_n3_connections, ri_n4_new_words, ri_n5_text_features, ri_n6_pictures_vs_words, ri_n7_reasons_support_main_idea, ri_n8_compare_two_texts, ri_n9_nonfiction_prediction, l_g1_capitals_endmarks, l_g2_nouns, l_g3_plurals_verbs, l_g4_pronouns, l_g5_verb_tense, l_g6_adjectives_determiners, l_g7_conjunctions_prepositions, l_g8_sentence_types_compound, l_v1_context_word_parts, l_v3_real_life_word_use, l_v4_shades_of_meaning, review_sprint_1, review_sprint_2, review_sprint_3, review_sprint_4  
   - **Math (22):** oa_counting_up_down, oa_add_three_numbers, oa_fact_families, oa_add_facts_20, oa_sub_facts_20, oa_equal_sign, oa_missing_number, nbt_count_to_120, nbt_tens_and_ones, nbt_teen_numbers, nbt_count_by_tens, nbt_compare_numbers, nbt_ten_more_less, nbt_subtract_tens, md_compare_lengths, md_measure_length, md_tell_time, md_organize_data, g_shape_attributes, g_2d_shapes, g_compose_shapes, g_halves_quarters

6) **Overall quality score:** **6/10**  
**Justification:** Evidence-sentence structure and arithmetic correctness are strong across most stations, but (a) 9 ELA stations contain `activitySpec` pages that can soft-lock in the current runtime, (b) Sight Words Band B–E need a rewrite for coherence and accurate hints, and (c) several Math stations exceed/miss the intended Grade 1 standard scope (notably `1.NBT.C.4` and `1.G.A.2`).
