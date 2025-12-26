# CPA Grade 1 Math Content Pack (Schema)

This folder contains **authoring-ready lesson content** for Grade 1 Mathematics that follows `docs/content-standards.md` (adapted for math) and is aligned to the CPA Grade 1 Mathematics "I Can" Checklist.

The primary file is `content/cpa-grade1-math/content-pack.v1.json`.

## Design Goals

- **Concrete-first**: Every concept is introduced with visual/manipulative representations before abstract symbols.
- **3-choice discipline**: Every `menu` and `question` has exactly 3 options.
- **One skill per screen**: Each page teaches one math concept or skill.
- **TTS-safe + audio-ready**: All text is readable aloud via ElevenLabs voice "Angela".
- **Story-based context**: Math problems embedded in MRT Food Adventure themes.

## Math Domain Lines (MRT Lines)

| Line | Domain | Color | Description |
|------|--------|-------|-------------|
| OA | Operations & Algebraic Thinking | Red | Addition, subtraction, word problems, fact families |
| NBT | Numbers & Base Ten | Blue | Counting, place value, comparing, 2-digit operations |
| MD | Measurement & Data | Green | Length, time, organizing data |
| G | Geometry | Purple | Shapes, attributes, halves/quarters |

## Top-level JSON Shape

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

## Station Object

Required:
- `name` (string): Display name (theme-appropriate, e.g., "Counting Fruits")
- `icon` (string): Emoji icon
- `level` (number): Difficulty 1-4
- `line` (string): `OA | NBT | MD | G`
- `checklistTargets` (string[]): Standard codes covered (e.g., `1.OA.A.1`)
- `mathFocus` (string[]): Key math vocabulary/concepts
- `previewConcepts` (array of `{ concept, icon, example }`): Preview cards
- `pages` (array): Sequence of pages

Optional:
- `stickers` (string[]): Reward stickers
- `manipulatives` (string[]): Visual aids used (blocks, counters, number line)
- `audio` (object): Voice/style notes
- `notes` (string): Implementation notes

## Page Objects

### Common Assessment Metadata

For scored pages:
- `itemId` (string): Stable unique ID
- `skillId` (string): Primary atomic skill measured
- `difficulty` (number): 1-5 scale
- `checklistTargets` (string[]): Page-level checklist codes

### Read/Teach Page (`type: "read"`)

For introducing math concepts with story context.

Required:
- `sentence` (string): Story text with math context
- `mathConcept` (string): The math idea being taught
- `mathTip` (string): Actionable learning tip

Optional:
- `image` (string): Emoji or asset path
- `visual` (object): `{ type: "numberLine" | "blocks" | "counters" | "shapes", data: {...} }`
- `teachNumber` (object): `{ number, representation, highlight }` for number instruction

### Menu Page (`type: "menu"`)

Required:
- `prompt` (string): Short instruction
- `menuStory` (string): 1-2 sentence context
- `items` (array of exactly 3): `{ name, icon, description }`

### Question Page (`type: "question"`)

Required:
- `questionType` (`"computation"` | `"wordProblem"` | `"comparison"` | `"placeValue"` | `"measurement"` | `"geometry"`)
- `questionMode` (`"multipleChoice"`)
- `question` (string): The math question
- `mathContext` (string): Story setup for the problem
- `mathHint` (string): Strategy hint
- `answers` (array of exactly 3): `{ name, icon? }`
- `correctAnswerName` (string): Exact match to answer name
- `successMessage` (string): Reinforcement with strategy praise

Optional:
- `numberSentence` (string): The math equation shown (e.g., "3 + 2 = ____")
- `visual` (object): Visual representation of the problem
- `variants` (array): Alternate number/context versions

### Activity Spec Page (`type: "activitySpec"`)

Future placeholder for interactive math activities.

Required:
- `activityType` (string): `count`, `compare`, `sort`, `measure`, `build`, `numberLine`, `placeValueChart`
- `prompt` (string)
- `data` (object): Activity-specific payload
- `successCriteria` (string)

## Math-Specific Content Standards

### Word Problem Structure

Word problems should follow this pattern:
1. **Setup**: Establish story context (1-2 sentences)
2. **Action**: What happens mathematically (1 sentence)
3. **Question**: What to find (1 sentence)

Example:
```
Setup: "I am at the fruit stand. I see 5 apples."
Action: "I pick 3 more apples."
Question: "How many apples do I have now?"
```

### Number Representations

Always show numbers in multiple ways when teaching:
- **Concrete**: Objects/counters (e.g., apple emojis)
- **Pictorial**: Ten frames, number lines, base-ten blocks
- **Abstract**: Numerals and equations

### Hint Standards for Math

Math hints should be procedural strategies:
- "Count all the objects."
- "Start with the bigger number."
- "Use the number line. Jump forward."
- "Think: tens and ones."
- "Look at the shapes. Count the sides."

### Distractor Design for Math

Good math distractors represent common errors:
- **Off-by-one**: 7 instead of 8 (counting error)
- **Operation confusion**: 5 instead of 1 (added instead of subtracted)
- **Place value error**: 21 instead of 12 (reversed digits)
- **Partial answer**: Only answered part of the problem

## Station Templates by Domain

### OA (Operations & Algebraic Thinking)
Focus: Word problems, fact families, strategies, missing numbers
Theme suggestions: Sharing food, counting passengers, buying items

### NBT (Numbers & Base Ten)
Focus: Counting sequences, place value, comparing, mental math
Theme suggestions: Train car numbers, station floors, counting items

### MD (Measurement & Data)
Focus: Length comparison, telling time, organizing information
Theme suggestions: Train schedules, measuring ingredients, sorting items

### G (Geometry)
Focus: Shape attributes, composing shapes, equal parts
Theme suggestions: Windows, food shapes, cutting/sharing items equally
