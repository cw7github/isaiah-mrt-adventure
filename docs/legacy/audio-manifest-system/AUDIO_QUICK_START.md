# Audio System Quick Start Guide

> **Legacy doc**: This describes the older audio-manifest pipeline (`content/*/audio-manifest.json` + `assets/audio/...`).  
> For the current `assets/tts/` + `index.html` → `speak()` system, see `../../AUDIO_SYSTEM.md`.

## What Was Created

### 1. Audio Manifest
**File:** `/content/cpa-grade1-ela/audio-manifest.json` (810 KB)

Registry of **2,683 audio clips** needed for ELA content:
- 780 answer choices
- 260 questions
- 260 passages
- 260 comprehension hints
- 260 success messages
- 179 sentences
- 179 reading tips
- 168 menu item names
- 168 menu item descriptions
- 56 station announcements
- 56 menu prompts
- 56 menu stories
- 1 UI template

### 2. Generation Scripts

**Extract texts:** `/scripts/extract-audio-texts.mjs`
```bash
node scripts/extract-audio-texts.mjs
```
Scans content pack and generates audio manifest.

**Generate audio:** `/scripts/generate-audio.mjs`
```bash
# Setup
export ELEVENLABS_API_KEY=your_key_here

# Test run
node scripts/generate-audio.mjs --dry-run

# Generate all
node scripts/generate-audio.mjs

# Generate one station
node scripts/generate-audio.mjs --station=rf_f1_print_concepts
```

### 3. Audio Player Library

**File:** `/lib/audio-player.js`

Features:
- Queue management
- Sequential playback
- Word highlighting sync
- Preloading/caching
- Volume control

**Basic usage:**
```javascript
const player = new AudioPlayer({
  manifestPath: 'content/cpa-grade1-ela/audio-manifest.json'
});

await player.initialize();
await player.play('rf_f1_print_concepts_page0_sentence');
```

### 4. Helper Functions

**File:** `/lib/ela-audio-helper.js`

Easy audio ID generation:
```javascript
ELAAudio.announcement('rf_f1_print_concepts')
ELAAudio.sentence('rf_f1_print_concepts', 0)
ELAAudio.question('rf_f1_print_concepts', 1)
ELAAudio.answer('rf_f1_print_concepts', 1, 0)
```

### 5. Documentation

- **Full Guide:** `/docs/AUDIO_SYSTEM.md`
- **Example:** `/examples/audio-integration-example.html`
- **This file:** `/AUDIO_QUICK_START.md`

### 6. Audio Directory

**Location:** `/assets/audio/ela/`

Will contain generated MP3 files:
```
rf_f1_print_concepts_page0_sentence.mp3
rf_f1_print_concepts_page0_readingtip.mp3
rf_f1_print_concepts_page1_question.mp3
...
```

## Next Steps

### Step 1: Get ElevenLabs Access

1. Sign up at https://elevenlabs.io
2. Get API key from dashboard
3. Find Angela's voice ID (or choose similar voice)

### Step 2: Configure Voice ID

Edit `/scripts/generate-audio.mjs`:
```javascript
const VOICE_IDS = {
  'elevenlabs:angela': 'YOUR_VOICE_ID_HERE' // Replace this
};
```

### Step 3: Generate Audio

```bash
# Set environment variable
export ELEVENLABS_API_KEY=your_key_here

# Test with dry run
node scripts/generate-audio.mjs --dry-run

# Generate one station first
node scripts/generate-audio.mjs --station=rf_f1_print_concepts

# Generate all (will take ~45 minutes with rate limiting)
node scripts/generate-audio.mjs
```

### Step 4: Test Playback

Open `/examples/audio-integration-example.html` in browser to test.

### Step 5: Integrate into App

Add to your HTML:
```html
<script src="lib/audio-player.js"></script>
<script src="lib/ela-audio-helper.js"></script>
```

Initialize in your app:
```javascript
const audioPlayer = new AudioPlayer({
  manifestPath: 'content/cpa-grade1-ela/audio-manifest.json'
});
await audioPlayer.initialize();
```

## Cost Estimate

Total characters: ~200,000
- Free tier: 10,000 chars/month (not enough)
- Creator: $5/month for 30,000 chars (not enough)
- Pro: $22/month for 100,000 chars (need 2 months)
- **Estimated cost: $22-44 for initial generation**

## File Naming Convention

Format: `{stationId}_page{pageIndex}_{field}.mp3`

Examples:
- `rf_f1_print_concepts_announcement.mp3` - Station announcement
- `rf_f1_print_concepts_page0_sentence.mp3` - Read page sentence
- `rf_f1_print_concepts_page1_question.mp3` - Question text
- `rf_f1_print_concepts_page1_answer0.mp3` - First answer choice
- `rf_f1_print_concepts_page1_hint.mp3` - Comprehension hint
- `rf_f1_print_concepts_page1_success.mp3` - Success message

## Quick Reference

### Play single audio
```javascript
await audioPlayer.play('rf_f1_print_concepts_page0_sentence');
```

### Queue multiple clips
```javascript
audioPlayer.clearQueue();
audioPlayer.enqueue(ELAAudio.sentence('rf_f1_print_concepts', 0));
audioPlayer.enqueue(ELAAudio.readingTip('rf_f1_print_concepts', 0));
await audioPlayer.processQueue();
```

### Preload audio
```javascript
await audioPlayer.preload('rf_f1_print_concepts_page1_question');
```

### Get all audio for a page
```javascript
const audioIds = getAudioIdsForPage('rf_f1_print_concepts', 0, pageData);
await audioPlayer.preloadBatch(audioIds);
```

### Control playback
```javascript
audioPlayer.stop();
audioPlayer.skip();
audioPlayer.setVolume(0.8);
audioPlayer.clearQueue();
```

## Troubleshooting

**"Manifest not found"**
- Run `node scripts/extract-audio-texts.mjs` first

**"API key not set"**
- Run `export ELEVENLABS_API_KEY=your_key`

**"Voice ID not found"**
- Update VOICE_IDS in generate-audio.mjs

**Audio not playing**
- Check browser console
- Verify audio files exist
- Check manifest path is correct

**Generation taking too long**
- Use `--station` flag to generate one at a time
- Rate limit is 1 req/sec (adjustable in script)

## Support

See full documentation: `/docs/AUDIO_SYSTEM.md`

Example integration: `/examples/audio-integration-example.html`
