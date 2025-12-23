# Legacy: Content Pack Rendering Engine

This folder contains an older documentation set (and code) that proposed a standalone “content pack rendering engine” to be copied into `index.html`.

It is **not** the current architecture.

## Current approach

- Lesson content lives in JSON packs: `content/cpa-grade1-ela/content-pack.v1.json`, `content/cpa-grade1-math/content-pack.v1.json`
- Packs are loaded/merged at runtime by `station-selection.js`
- Canonical authoring doc: `docs/guides/content-packs.md`

These legacy docs are kept for reference only.
