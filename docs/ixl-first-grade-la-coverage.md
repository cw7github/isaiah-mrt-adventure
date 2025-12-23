# IXL First Grade Language Arts Coverage (App Audit)

**Reference only.** The app’s current scope/sequence is driven by the Cabrillo Point Academy Grade 1 ELA “I Can” checklist; see `docs/cpa-grade1-ela-checklist-plan.md`.

This document answers: **“Does the app cover the IXL First Grade Language Arts scope?”** using the IXL topic list you provided as a taxonomy/benchmark.

## Current App Inventory (What Exists Today)

**Skill practice**
- `index.html` has `skillsCatalog` with **93 skills** across:
  - Reading foundations (41)
  - Reading strategies (14)
  - Vocabulary (12)
  - Grammar (24)
  - Sight words (2)

**Story/lesson content**
- `index.html` has `stationContent` with **15 story stations** (food-stop themed) plus Skill Practice.
- Only 3 story stations explicitly teach a digraph pattern via `teachWord`: **SH, CH, TH**.

## Bottom Line

The app covers **many** of the same *major strands* as IXL Grade 1 (phonics/phonemic awareness, basic comprehension strategies, core grammar mechanics), but it **does not cover all 208 IXL skills** and it does **not** match IXL’s breadth/depth of item types and text libraries.

The biggest gap isn’t “no skills at all” — it’s **coverage granularity** (IXL breaks topics into many micro-skills) and **decodable text libraries by pattern/genre** (IXL has many sets; the app currently has 15 themed narrative stations).

## Coverage Map (IXL → App)

Status definitions:
- **Covered**: the app has a direct skill/practice equivalent.
- **Partial**: similar goal exists, but missing sub-variants, formats, or breadth expected by IXL.
- **Not covered**: no clear equivalent in current app.

### Reading foundations

| IXL topic | App mapping (skill IDs / lessons) | Status | Notes |
|---|---|---|---|
| A. Consonants and vowels | `consonant-or-vowel`, `vowels-letter`, `vowels-word` | Covered | App focuses on identification rather than “sorting” UI. |
| B. Syllables | `syllables-count`, `syllables-which`, `two-syllable-build` | Covered | App covers counting + building 2-syllable words; doesn’t include an explicit “sort by syllable count” activity. |
| C. Rhyming | `rhyming-choose`, `rhyming-odd`, `rhyming-complete` | Covered | No “complete a poem” format, but rhyme selection/completion exists. |
| D. Blending and segmenting | `blend-sounds` | Partial | Blending exists; missing explicit “identify each phoneme” and “put sounds in order” activities. |
| E. Phoneme manipulation | `phoneme-change-first`, `phoneme-change-last`, `phoneme-change-vowel` | Covered | Matches “change a sound” style tasks. |
| F. Consonant sounds and letters | `start-letter`, `end-letter`, `first-sound`, `last-sound` | Partial | Letter-position tasks exist; missing “which two words start/end with the same sound” comparisons. |
| G. Consonant digraphs | `digraph-find`, `digraph-choose`, `spelling-digraph` | Partial | App digraph work is **SH/CH/TH only**; IXL includes additional patterns (and multiple task formats). |
| H. Consonant blends | `blends-start` | Partial | App focuses on **initial blends**; missing final blends (e.g., **ng/nk**) and “fill missing blend / sort blend vs digraph” variants. |
| I–M. Short vowels (a/e/i/o/u) | `short-vowel-fill`, `spelling-cvc` | Partial | App covers “choose the vowel/spelling” broadly; not separated into per‑vowel story sets or picture/sentence matching formats. |
| N. Short vowels (mixed) | `short-vowel-fill`, `spelling-cvc` | Partial | Missing explicit “identify the short vowel sound” and “complete the sentence with the correct short-vowel word” variants. |
| O. Short vs. long vowel sounds | (indirect via `silent-e`, `long-vowel-silent-e`) | Partial | App doesn’t have a dedicated “short vs long” sorting/comparison skill. |
| P. Silent e | `silent-e`, `long-vowel-silent-e` | Covered | |
| Q. Vowel teams | `vowel-team-ai`, `vowel-team-ay`, `vowel-team-ea`, `vowel-team-ee`, `vowel-team-oa`, `vowel-team-ow` | Covered | Note: story stations are not organized as “vowel team stories” the way IXL is. |
| R. Long vowel patterns | (limited) | Partial | App teaches silent‑e + vowel teams, but not IXL-style “sort long vowel patterns” by multiple spellings per vowel. |
| S. Short/long vowel patterns | (limited) | Not covered | No dedicated “match/sort short vs long vowel patterns” skill in catalog. |
| T. R-controlled vowels | `r-controlled-ar`, `r-controlled-er`, `r-controlled-ir`, `r-controlled-or`, `r-controlled-ur` | Covered | |
| U. Diphthongs | `diphthong-oi`, `diphthong-oy`, `diphthong-ou`, `diphthong-ow` | Covered | |
| V. Two-syllable words | `two-syllable-build` (+ syllable skills) | Partial | Missing explicit “complete two‑syllable word / sentence” variants. |
| W. Sight words | `sight-blank`, `spelling-sight` + story reading | Partial | App doesn’t mirror IXL’s “set 1–7” progression; it covers cloze + spelling and sight words embedded in stories. |
| X. Decodable texts | 15 story stations (`stationContent`) | Partial | App has decodable-ish narrative stations, but not IXL’s broad libraries by phonics pattern (short‑a stories, silent‑e stories, vowel team stories, r‑controlled stories). |

### Reading strategies

| IXL topic | App mapping | Status | Notes |
|---|---|---|---|
| Y. Reality vs. fiction | `reality-fiction` | Covered | |
| Z. Main idea | `main-idea`, `best-title` | Covered | |
| AA. Sequence | `sequence-first` | Covered | |
| BB. Point of view | `point-of-view` | Covered | |
| CC. Inference | `inference-feeling`, `prediction-next` | Partial | Covers feelings + “what happens next”; no dedicated “What am I?” riddle-type inference. |
| DD. Setting and character | `setting`, `character`, `character-actions` | Covered | |
| EE. Text features | `text-features` | Covered | |
| FF–GG. Read-along / read-alone literary texts | Story stations + narration controls | Partial | The app supports read-aloud and tapping words, but has limited genre variety (no fantasy/myths/fables library). |
| HH–II. Read-along / read-alone informational texts | (limited) | Not covered | No dedicated informational text sets (animals, famous places/people, etc.) comparable to IXL’s organization. |

### Vocabulary

| IXL topic | App mapping | Status | Notes |
|---|---|---|---|
| JJ. Nouns and adjectives | `noun-type`, `parts-noun`, `parts-adj`, `adjectives-compare`, `number-words` | Covered | App covers the concepts, but not picture-driven sentence-completion formats exactly like IXL. |
| KK. Categories | `categories-odd` | Partial | App has “odd one out” but not explicit “sort words into categories.” |
| LL. Synonyms/antonyms | `synonyms`, `antonyms` | Covered | |
| MM. Multiple-meaning words | `multiple-meaning` | Covered | |
| NN. Shades of meaning | `shades-of-meaning`, `shades-order` | Partial | App supports related-meaning + ordering; does not do open-response “describe the difference.” |
| OO. Prefixes/suffixes | `prefix-un`, `suffix-ful` | Partial | Narrow set (un-, -ful) vs broad IXL category. |
| PP. Context clues | `context-clues` | Covered | |
| QQ. Reference skills | `abc-order` | Partial | App supports **word** ABC order; does not include “letters in ABC order” explicitly. |

### Grammar and mechanics

| IXL topic | App mapping | Status | Notes |
|---|---|---|---|
| RR. Sentences | `sentence-type`, `punctuation-endmark`, `complete-sentence`, `unscramble-sentence`, `wh-words` | Covered | App covers the main sentence mechanics; IXL has more micro-skills/variants. |
| SS. Nouns | `parts-noun`, `noun-type`, `proper-nouns`, `plurals`, `irregular-plurals`, `possessive-nouns` | Covered | Some IXL noun subskills are more granular (e.g., -s vs -es), but the category is represented. |
| TT. Pronouns | `pronouns`, `possessive-pronouns`, `pronoun-reference` | Partial | Doesn’t explicitly separate subject vs object pronouns as separate skills (depends on how `pronouns` items are authored). |
| UU. Verbs | `parts-verb` | Covered | |
| VV. Subject-verb agreement | `subject-verb` | Covered | |
| WW. Verb tense | `verb-tense` | Partial | App covers tense at a high level; IXL includes additional forms (to be/to have, -ed/-ing matching). |
| XX. Articles | `articles-a-an` | Covered | |
| YY. Adjectives | `parts-adj`, `adjectives-compare` | Partial | Missing explicit “sense words” and “how many/what kind” as separate micro-skills. |
| ZZ. Prepositions | `prepositions` | Covered | |
| AAA. Linking words | `conjunctions`, `time-order` | Partial | Covers conjunctions/time-order words; lacks “put the sentences in order” as a dedicated grammar task (sequence exists in strategies). |
| BBB. Contractions | `contractions` | Covered | |
| CCC. Capitalization | `capitalization` | Covered | |

## High-Impact Gaps to Close Next (If “Full IXL-like Coverage” Is the Goal)

1. **Phoneme segmenting**: add explicit “identify each sound” and “put sounds in order” activities (Reading foundations D).
2. **Consonant blends completeness**: add final blends (e.g., **ng/nk**) + missing-blend + sort blend vs digraph (Reading foundations H).
3. **Short vs long vowel contrasts**: add explicit comparison/sorting skills and more pattern variety (Reading foundations O/S/R).
4. **Sight word scope**: add a clearer leveled sight-word progression (sets/bands) + fluency-style review (Reading foundations W).
5. **Decodable text libraries by pattern**: add story stations grouped by phonics targets (short vowels, silent‑e, vowel teams, r‑controlled) to match IXL’s “decodable texts” organization (Reading foundations X).
6. **Informational text sets**: add non-fiction stations (animals, nature, people, places) with text features (Reading strategies HH/II).
7. **Prefix/suffix breadth**: expand beyond `un-` and `-ful` if you want parity with IXL’s broader affix category (Vocabulary OO).

## Recommendation (Learning + Product)

If the goal is “IXL-level scope,” treat IXL as a **benchmark taxonomy** and build toward it in two tracks:
- **Track A: More skills** (fill the missing micro-skills above).
- **Track B: More texts** (pattern-based decodable libraries + informational genres), because reading comprehension skill quality depends heavily on the breadth of passages, not just question templates.
