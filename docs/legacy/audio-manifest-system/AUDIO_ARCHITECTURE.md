# Audio System Architecture

> **Legacy doc**: This is the older audio-manifest architecture (`content/*/audio-manifest.json` + `assets/audio/...`).  
> For the current `assets/tts/` + `index.html` → `speak()` system, see `../../AUDIO_SYSTEM.md`.

## System Overview Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        ELA AUDIO GENERATION SYSTEM                       │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ 1. CONTENT SOURCE                                                        │
└─────────────────────────────────────────────────────────────────────────┘

    content/cpa-grade1-ela/content-pack.v1.json (419 KB)
    │
    │  52 stations × ~50 pages each = 2,683 text strings
    │
    ▼

┌─────────────────────────────────────────────────────────────────────────┐
│ 2. MANIFEST GENERATION                                                   │
└─────────────────────────────────────────────────────────────────────────┘

    scripts/extract-audio-texts.mjs
    │
    │  Scans content pack
    │  Extracts all text that needs audio:
    │    - Read page sentences
    │    - Question text
    │    - Answer choices
    │    - Hints, tips, success messages
    │    - Menu prompts and items
    │
    ▼

    content/cpa-grade1-ela/audio-manifest.json (791 KB)
    │
    │  {
    │    "audioMap": {
    │      "rf_f1_print_concepts_page0_sentence": {
    │        "text": "I am at the library...",
    │        "audioPath": "assets/audio/ela/rf_f1_...mp3",
    │        "type": "sentence",
    │        "generated": false
    │      }
    │    }
    │  }
    │
    ▼

┌─────────────────────────────────────────────────────────────────────────┐
│ 3. AUDIO GENERATION                                                      │
└─────────────────────────────────────────────────────────────────────────┘

    scripts/generate-audio.mjs
    │
    │  ┌──────────────┐
    │  │ ElevenLabs   │ ◄── ELEVENLABS_API_KEY
    │  │ TTS API      │ ◄── Voice: Angela
    │  └──────────────┘
    │        │
    │        │  For each text in manifest:
    │        │    1. Call API with text
    │        │    2. Receive MP3 audio
    │        │    3. Save to assets/audio/ela/
    │        │    4. Update manifest (generated: true)
    │        │    5. Wait (rate limiting)
    │        │
    │        ▼
    │
    │  assets/audio/ela/
    │    ├── rf_f1_print_concepts_announcement.mp3
    │    ├── rf_f1_print_concepts_page0_sentence.mp3
    │    ├── rf_f1_print_concepts_page0_readingtip.mp3
    │    └── ... (2,683 MP3 files total)
    │
    ▼

┌─────────────────────────────────────────────────────────────────────────┐
│ 4. CLIENT-SIDE PLAYBACK                                                  │
└─────────────────────────────────────────────────────────────────────────┘

    Browser / App
    │
    │  lib/audio-player.js (7.6 KB)
    │  lib/ela-audio-helper.js (7.3 KB)
    │
    │  ┌────────────────────────────────────┐
    │  │ AudioPlayer Class                  │
    │  ├────────────────────────────────────┤
    │  │ • Load manifest                    │
    │  │ • Preload audio files              │
    │  │ • Queue management                 │
    │  │ • Sequential playback              │
    │  │ • Word highlighting sync           │
    │  │ • Volume control                   │
    │  │ • Cache management                 │
    │  └────────────────────────────────────┘
    │           │
    │           ▼
    │  ┌────────────────────────────────────┐
    │  │ Web Audio API                      │
    │  │ (Browser Native)                   │
    │  └────────────────────────────────────┘
    │           │
    │           ▼
    │       🔊 Audio Output
    │
    ▼
```

## Data Flow

### Generation Flow

```
Content Pack
    ↓
Extract Script → Analyze content
    ↓
Audio Manifest → Map text to audio IDs
    ↓
Generate Script → Call ElevenLabs API
    ↓
MP3 Files → Save to assets/audio/ela/
    ↓
Update Manifest → Mark as generated
```

### Playback Flow

```
User Action (e.g., "Show Page")
    ↓
App Code → Get audio ID using ELAAudio helper
    ↓
AudioPlayer → Check cache
    │
    ├─ (Cache Hit) → Play immediately
    │
    └─ (Cache Miss) → Fetch MP3 from assets/
           ↓
       Decode audio
           ↓
       Add to cache
           ↓
       Play audio
           ↓
    (Optional) Trigger word highlights
           ↓
    Completion callback
```

## Component Interaction

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            YOUR APP                                      │
│                                                                          │
│  showReadPage(stationId, pageIndex) {                                   │
│    // Get audio IDs                                                     │
│    const sentenceId = ELAAudio.sentence(stationId, pageIndex);         │
│    const tipId = ELAAudio.readingTip(stationId, pageIndex);            │
│                                                                          │
│    // Queue and play                                                    │
│    audioPlayer.clearQueue();                                            │
│    audioPlayer.enqueue(sentenceId);                                     │
│    audioPlayer.enqueue(tipId);                                          │
│    await audioPlayer.processQueue();                                    │
│  }                                                                       │
└─────────────────────────────────────────────────────────────────────────┘
           │                              │
           │                              │
           ▼                              ▼
┌─────────────────────┐       ┌──────────────────────────┐
│  ELAAudio Helper    │       │  AudioPlayer             │
│                     │       │                          │
│  • announcement()   │       │  • initialize()          │
│  • sentence()       │       │  • play()                │
│  • question()       │       │  • enqueue()             │
│  • answer()         │       │  • processQueue()        │
│  • hint()           │       │  • preload()             │
│  • success()        │       │  • stop()                │
│  • ...              │       │  • skip()                │
│                     │       │  • setVolume()           │
│  Returns audio IDs  │       │  Manages playback        │
└─────────────────────┘       └──────────────────────────┘
           │                              │
           │                              │
           ▼                              ▼
       "rf_f1_print_          ┌──────────────────────────┐
        concepts_page0_        │  Audio Manifest          │
        sentence"              │                          │
                              │  • Load manifest.json    │
                              │  • Map ID → audio path   │
                              │  • Track generated status│
                              └──────────────────────────┘
                                        │
                                        ▼
                              ┌──────────────────────────┐
                              │  MP3 Files               │
                              │                          │
                              │  • Fetch from assets/    │
                              │  • Decode with Web Audio │
                              │  • Cache in memory       │
                              └──────────────────────────┘
                                        │
                                        ▼
                                   🔊 Speaker
```

## File Organization

```
isaiah_school/
│
├── content/
│   └── cpa-grade1-ela/
│       ├── content-pack.v1.json          ← Source content
│       └── audio-manifest.json           ← Generated manifest
│
├── assets/
│   └── audio/
│       └── ela/                          ← Generated MP3 files
│           ├── rf_f1_print_concepts_announcement.mp3
│           ├── rf_f1_print_concepts_page0_sentence.mp3
│           └── ... (2,683 files)
│
├── scripts/
│   ├── extract-audio-texts.mjs           ← Generate manifest
│   ├── generate-audio.mjs                ← Generate audio files
│   └── audio-stats.mjs                   ← View statistics
│
├── lib/
│   ├── audio-player.js                   ← Playback engine
│   └── ela-audio-helper.js               ← Helper functions
│
├── docs/
│   ├── AUDIO_SYSTEM.md                   ← Full documentation
│   └── AUDIO_ARCHITECTURE.md             ← This file
│
├── examples/
│   └── audio-integration-example.html    ← Demo/test page
│
├── AUDIO_QUICK_START.md                  ← Quick reference
└── AUDIO_SYSTEM_SUMMARY.md               ← Summary report
```

## Audio ID Naming Convention

```
Format: {stationId}_page{pageIndex}_{field}

Examples:
├── Announcements:    rf_f1_print_concepts_announcement
│
├── Read Pages:       rf_f1_print_concepts_page0_sentence
│                     rf_f1_print_concepts_page0_readingtip
│
├── Question Pages:   rf_f1_print_concepts_page1_question
│                     rf_f1_print_concepts_page1_passage
│                     rf_f1_print_concepts_page1_hint
│                     rf_f1_print_concepts_page1_answer0
│                     rf_f1_print_concepts_page1_answer1
│                     rf_f1_print_concepts_page1_answer2
│                     rf_f1_print_concepts_page1_success
│
└── Menu Pages:       rf_f1_print_concepts_page2_prompt
                      rf_f1_print_concepts_page2_menustory
                      rf_f1_print_concepts_page2_item0_name
                      rf_f1_print_concepts_page2_item0_desc
                      rf_f1_print_concepts_page2_item1_name
                      rf_f1_print_concepts_page2_item1_desc
```

## Cache Strategy

```
┌────────────────────────────────────────────────────────────┐
│                    CACHE HIERARCHY                          │
└────────────────────────────────────────────────────────────┘

Level 1: Browser Cache (HTTP)
    ↓
    • MP3 files served with cache headers
    • Browser caches for future page loads

Level 2: AudioPlayer Memory Cache
    ↓
    • Decoded AudioBuffer objects
    • Ready for instant playback
    • Managed by AudioPlayer class

Preloading Strategy:
    ↓
    When entering station:
      1. Load current page audio (priority 1)
      2. Load next 2-3 pages (priority 2)
      3. Clear old cache when memory high

    Between pages:
      1. Keep current page in cache
      2. Preload next page
      3. Drop pages >2 pages behind
```

## Playback States

```
┌─────────────────────────────────────────────────────────┐
│                   PLAYER STATE MACHINE                   │
└─────────────────────────────────────────────────────────┘

         ┌─────────────┐
         │ INITIALIZED │
         └──────┬──────┘
                │
                │ initialize()
                ▼
         ┌─────────────┐
    ┌───│    READY     │◄───┐
    │   └──────┬──────┘    │
    │          │            │
    │  play()  │            │ onended
    │          ▼            │
    │   ┌─────────────┐    │
    │   │   PLAYING   │────┘
    │   └──────┬──────┘
    │          │
    │  stop()  │
    │  skip()  │
    │          │
    └──────────┘

Queue Processing:

    [Audio1, Audio2, Audio3]
              ▼
         Play Audio1
              ▼
         onended
              ▼
         Play Audio2
              ▼
         onended
              ▼
         Play Audio3
              ▼
         onended
              ▼
    onQueueComplete()
```

## API Call Flow (Generation)

```
┌────────────────────────────────────────────────────────┐
│              ELEVENLABS API INTEGRATION                 │
└────────────────────────────────────────────────────────┘

For each text in manifest:

1. Prepare Request
   ├─ Text: "I am at the library..."
   ├─ Voice ID: Angela's ID
   ├─ Model: eleven_monolingual_v1
   └─ Settings: stability, similarity_boost

2. Make HTTPS Request
   POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}
   Headers:
     - xi-api-key: {API_KEY}
     - Content-Type: application/json

3. Handle Response
   ├─ Success (200): Receive MP3 binary
   │   ├─ Save to assets/audio/ela/
   │   ├─ Update manifest (generated: true)
   │   └─ Continue to next
   │
   └─ Error (4xx/5xx): Retry logic
       ├─ Attempt 1: Wait 2s, retry
       ├─ Attempt 2: Wait 4s, retry
       └─ Attempt 3: Wait 6s, retry
           └─ Fail: Log error, continue to next

4. Rate Limiting
   └─ Wait 1000ms before next request

5. Progress Tracking
   └─ Update console: "[123/2683] rf_f1_..."
```

## Error Handling

```
┌────────────────────────────────────────────────────────┐
│                   ERROR SCENARIOS                       │
└────────────────────────────────────────────────────────┘

Generation Errors:
├─ API Key Missing
│  └─ Fail fast, show clear message
│
├─ Voice ID Invalid
│  └─ Fail fast, show clear message
│
├─ Network Error
│  └─ Retry with exponential backoff
│
├─ Rate Limit Hit
│  └─ Wait and retry
│
└─ File Write Error
   └─ Log error, continue with next

Playback Errors:
├─ Manifest Not Found
│  └─ Show error, disable audio features
│
├─ Audio File Missing
│  └─ Skip gracefully, log warning
│
├─ Decode Error
│  └─ Skip audio, continue with visuals
│
└─ Browser Not Supported
   └─ Disable audio features, show message
```

## Performance Optimization

```
┌────────────────────────────────────────────────────────┐
│                PERFORMANCE STRATEGIES                   │
└────────────────────────────────────────────────────────┘

1. Preloading
   • Load next 2-3 pages ahead
   • Start during page display time
   • User doesn't wait for audio

2. Caching
   • Keep decoded buffers in memory
   • Avoid re-decoding same audio
   • Clear old cache to limit memory

3. Lazy Loading
   • Only load manifest on audio init
   • Only fetch MP3 when needed
   • Don't block app startup

4. Compression
   • Use MP3 format (smaller than WAV)
   • ElevenLabs provides optimized files
   • ~50-100KB per clip average

5. Parallel Processing
   • Preload multiple files concurrently
   • Don't block playback queue
   • Use Promise.all for batches
```

## Integration Points

```
┌────────────────────────────────────────────────────────┐
│              APP INTEGRATION POINTS                     │
└────────────────────────────────────────────────────────┘

App Startup:
  └─ Initialize AudioPlayer
     └─ Load manifest
        └─ Ready for use

Station Entry:
  └─ Play announcement
     └─ Preload first 3 pages
        └─ Start lesson

Page Display (Read):
  └─ Queue sentence + reading tip
     └─ Process queue
        └─ Highlight words during playback
           └─ Enable next button on complete

Page Display (Question):
  └─ Queue question + passage
     └─ Process queue
        └─ Show answer choices

Answer Selection:
  └─ Play answer audio
     └─ If correct: Play success message
        └─ If wrong: Play hint
           └─ Continue lesson

Menu Page:
  └─ Play prompt + story
     └─ Play item audio on hover/focus
        └─ Proceed on selection

Settings:
  └─ Volume control
     └─ Sound on/off toggle
        └─ Audio speed (future)
```

This architecture provides a complete, scalable solution for TTS audio generation and playback in the ELA learning application.
