# Testing & Debugging

There is no formal unit test suite; validation is done via scripts + manual checks.

## Run locally

- `./start.sh` → open `http://localhost:8080`

## Validate content

- ELA content pack: `node scripts/validate-content-pack.mjs`
- Math content pack: `node scripts/validate-math-content-pack.mjs`
- Math integration: `node scripts/validate-math-integration.mjs`

## Validate TTS coverage (avoid “computer voice”)

- `node scripts/generate-tts-assets.mjs --check`

## Manual checks

- App checklist: `../reference/test-checklist.md`
- Math visuals test page + validation details: `math-integration-testing.md`
