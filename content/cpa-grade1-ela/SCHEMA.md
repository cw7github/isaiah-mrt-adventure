# CPA Grade 1 ELA Content Pack (Schema)

This folder contains **authoring-ready lesson content** that follows `docs/content-standards.md` and is aligned to `docs/cpa-grade1-ela-checklist-plan.md`.

The primary file is `content/cpa-grade1-ela/content-pack.v1.json`.

## Design goals

- **Evidence-first** comprehension (every comprehension question is answered by one exact sentence).
- **3-choice discipline** for every `menu` and `question`.
- **One job per screen**.
- **TTS-safe + audio-ready** text (assume ElevenLabs voice “Angela” for all learner-facing narration).

## Top-level JSON shape

```json
{
  "schemaVersion": 1,
  "source": { "plan": "...", "contentStandards": "...", "checklistPdf": "..." },
  "uiDefaults": { "...": "..." },
  "stationOrder": ["stationId1", "stationId2"],
  "stations": {
    "stationId": { "name": "...", "pages": [ ... ] }
  }
}
```

## Station object (mirrors `stationContent` style)

Required:
- `name` (string)
- `icon` (string)
- `level` (number)
- `line` (string): `RF | RL | RI | L | REVIEW | EXT` (EXT = optional W/SL extensions)
- `checklistTargets` (string[]): checklist codes covered (e.g., `RL.1.1`)
- `sightWords` (string[])
- `previewWords` (array of `{ word, icon, isSightWord, phonicsNote? }`)
- `pages` (array): sequence of `read | menu | question | activitySpec` pages

Optional:
- `stickers` (string[])
- `scenePack` (object): image placeholders for future background art
- `audio` (object): narration voice/style notes
- `notes` (string): implementation notes for later

## Page objects

### Common assessment metadata (recommended)

For **scored** pages (questions and future activities), these optional fields make mastery/analytics much more accurate:

- `itemId` (string): stable unique id (useful for audits + deduping).
- `skillId` (string): the **one primary atomic skill** this page measures.
- `difficulty` (number): 1–5 or 0–1; used for adaptive recommendations (optional).
- `checklistTargets` (string[]): page-level checklist codes if different from station-level.

### Read page (`type: "read"`)
Required:
- `sentence` (string)
- `targetWords` (string[])
- `sightWordFocus` (string)
- `readingTip` (string)

Optional:
- `image` (string): emoji or future asset path
- `backgroundImage` (boolean)
- `requireSightWordTap` (boolean) *(use sparingly; never required for answering questions)*
- `teachWord` (object): `{ word, sound, highlight, position }` *(only when deliberately teaching a pattern)*
- `ui` (object): visual/animation notes (not yet implemented)

### Menu page (`type: "menu"`)
Required:
- `prompt` (string)
- `menuStory` (string)
- `items` (array of exactly 3): `{ name, icon, description }`

Optional:
- `ui` (object)

### Question page (`type: "question"`)
Required:
- `questionType` (`"comprehension"` or `"sightWord"`)
- `questionMode` (`"multipleChoice"`)
- `question` (string)
- `passage` (string) *(required for comprehension; optional for sightWord but included here for clarity)*
- `comprehensionHint` (string)
- `answers` (array of exactly 3): `{ name, icon? }`
- `correctAnswerName` (string) *(exact match to an answer name)*
- `successMessage` (string)

Optional:
- `variants` (array): alternate `question`/`comprehensionHint` phrasings without changing `passage` or the correct answer.
- `ui` (object): e.g., `keySentenceHighlightPolicy`, confetti, etc.
- `itemId` / `skillId` / `difficulty` / `checklistTargets` (see “Common assessment metadata” above)

### Activity spec page (`type: "activitySpec"`)
This is a **future-only** placeholder for non-MCQ interactions needed by the CPA plan (sort, phoneme boxes, ordering, writing scaffold). It is not used by the app yet, but keeps implementation requirements attached to the exact lesson step.

Required:
- `activityType` (string): e.g., `sort`, `phonemeBoxes`, `order3`, `writingScaffold`
- `prompt` (string)
- `data` (object): activity-specific payload (bins/cards, phonemes/word, etc.)
- `successCriteria` (string)

Optional:
- `itemId` / `skillId` / `difficulty` / `checklistTargets` (see “Common assessment metadata” above)
