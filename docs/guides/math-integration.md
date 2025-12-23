# Math Integration

Math lessons live in the Math content pack and render additional scaffolds (visuals, number sentences, hints) to support Grade 1 CPA progression.

## Key files

- Math content pack: `content/cpa-grade1-math/content-pack.v1.json`
- Station selection + subject switching: `station-selection.js`
- Rendering + visuals: `index.html`

## Common fields used by math pages

Read pages may include:
- `mathConcept` (short concept label/banner)
- `mathTip` (teacher-style tip)
- `visual` (object describing a visual model to render)

Question pages may include:
- `mathContext` (story/scene setter)
- `numberSentence` (displayed prominently; may include blanks)
- `mathHint` (shown after a wrong attempt)

## Validation / testing

- Validate math integration: `node scripts/validate-math-integration.mjs`
- Validate math content pack: `node scripts/validate-math-content-pack.mjs`
- Browser test page: `test-math-integration.html`

