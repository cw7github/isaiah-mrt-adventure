# Audio System Integration Guide

> **Legacy doc**: This guide targets the older audio-manifest pipeline (`content/*/audio-manifest.json` + `assets/audio/...`).  
> For the current `assets/tts/` + `index.html` → `speak()` system, see `../../AUDIO_SYSTEM.md`.

This guide explains how to use the audio system in Isaiah's MRT Food Adventure app.

## System Overview

The audio system consists of three main components:

1. **Audio Manifest** (`content/cpa-grade1-ela/audio-manifest.json`) - Maps text to audio file paths
2. **Audio Player** (`lib/audio-player.js`) - Browser-based audio playback with queue management
3. **Generation Script** (`scripts/generate-audio.mjs`) - TTS generation via ElevenLabs API

## Quick Start

### 1. Initialize Audio Player

```javascript
import { AudioPlayer } from './lib/audio-player.js';

const audioPlayer = new AudioPlayer({
  manifestPath: 'content/cpa-grade1-ela/audio-manifest.json',
  volume: 1.0,
  onWordHighlight: (data) => {
    // Highlight word during playback
    console.log('Highlight:', data.word, data.index);
  },
  onPlaybackComplete: (audioId) => {
    console.log('Completed:', audioId);
  },
  onError: (error) => {
    console.error('Audio error:', error);
  }
});

// Initialize (loads manifest)
await audioPlayer.initialize();
```

### 2. Play Audio

```javascript
// Play a single audio clip
await audioPlayer.play('rf_f1_print_concepts_announcement');

// Play with auto word sync
await audioPlayer.play('rf_f1_print_concepts_page0_sentence', {
  enableAutoWordSync: true
});

// Play with custom word timings
await audioPlayer.play('rf_f1_print_concepts_page0_sentence', {
  wordTimings: [
    { word: 'I', startTime: 0, endTime: 0.2 },
    { word: 'am', startTime: 0.2, endTime: 0.4 },
    // ... more timings
  ]
});
```

### 3. Queue Multiple Audio Clips

```javascript
// Add to queue
audioPlayer.enqueue('rf_f1_print_concepts_announcement');
audioPlayer.enqueue('rf_f1_print_concepts_page0_sentence');
audioPlayer.enqueue('rf_f1_print_concepts_page0_readingtip');

// Or batch enqueue
audioPlayer.enqueueBatch([
  'rf_f1_print_concepts_announcement',
  { audioId: 'rf_f1_print_concepts_page0_sentence', options: { enableAutoWordSync: true } },
  'rf_f1_print_concepts_page0_readingtip'
]);

// Process queue
await audioPlayer.processQueue();
```

### 4. Preloading

```javascript
// Preload a single audio
await audioPlayer.preload('rf_f1_print_concepts_page1_question');

// Preload multiple
await audioPlayer.preloadBatch([
  'rf_f1_print_concepts_page1_question',
  'rf_f1_print_concepts_page1_passage',
  'rf_f1_print_concepts_page1_hint'
]);

// Preload entire page (convenience method)
await audioPlayer.preloadPage('rf_f1_print_concepts', 0);

// Preload station announcement
await audioPlayer.preloadStationAnnouncement('rf_f1_print_concepts');
```

### 5. Playback Control

```javascript
// Pause playback
audioPlayer.pause();

// Resume playback
await audioPlayer.resume();

// Stop playback
audioPlayer.stop();

// Skip to next in queue
await audioPlayer.skip();

// Adjust volume (0.0 to 1.0)
audioPlayer.setVolume(0.8);
```

## Audio ID Naming Convention

Audio IDs follow this pattern:

- **UI Elements**: `ui_{element}` (e.g., `ui_train_announcement`)
- **Station Announcements**: `{stationId}_announcement`
- **Page Content**: `{stationId}_page{pageIndex}_{type}`

### Content Types

- `sentence` - Main reading sentence
- `readingtip` - Reading instruction
- `question` - Question text
- `passage` - Reading passage
- `hint` - Comprehension hint
- `success` - Success message
- `prompt` - Activity/menu prompt
- `answer{N}` - Answer option (N = 0, 1, 2, ...)
- `menustory` - Menu story text
- `item{N}_name` - Menu item name
- `item{N}_desc` - Menu item description

### Example IDs

```
rf_f1_print_concepts_announcement
rf_f1_print_concepts_page0_sentence
rf_f1_print_concepts_page0_readingtip
rf_f1_print_concepts_page1_question
rf_f1_print_concepts_page1_passage
rf_f1_print_concepts_page1_hint
rf_f1_print_concepts_page1_answer0
rf_f1_print_concepts_page1_success
```

## Error Handling

The audio player gracefully handles missing audio files:

```javascript
// Missing audio files are cached as null to avoid repeated 404s
await audioPlayer.play('nonexistent_audio_id');
// Logs warning and continues (calls onPlaybackComplete)

// Check if audio exists before playing
if (audioPlayer.hasAudio('some_audio_id')) {
  await audioPlayer.play('some_audio_id');
}

// Get audio entry from manifest
const entry = audioPlayer.getAudioEntry('rf_f1_print_concepts_page0_sentence');
console.log(entry.text); // "I am at the library. I pick a book..."
```

## Word-by-Word Highlighting (Karaoke Mode)

### Auto Word Sync

The easiest method - automatically estimates word timings:

```javascript
await audioPlayer.play('rf_f1_print_concepts_page0_sentence', {
  enableAutoWordSync: true
});

// Callback receives:
// { word: "I", index: 0, isLast: false }
// { word: "am", index: 1, isLast: false }
// { word: "at", index: 2, isLast: false }
// ... etc
```

### Custom Word Timings

For precise synchronization (if you have word-level timestamps):

```javascript
const wordTimings = [
  { word: 'I', startTime: 0.0, endTime: 0.15 },
  { word: 'am', startTime: 0.15, endTime: 0.30 },
  { word: 'at', startTime: 0.30, endTime: 0.45 },
  // ... more timings
];

await audioPlayer.play('rf_f1_print_concepts_page0_sentence', {
  wordTimings: wordTimings
});
```

### Highlight Callback

```javascript
const audioPlayer = new AudioPlayer({
  onWordHighlight: (data) => {
    // Remove previous highlight
    document.querySelectorAll('.word-highlight').forEach(el => {
      el.classList.remove('word-highlight');
    });

    // Add highlight to current word
    const wordElement = document.querySelector(`[data-word-index="${data.index}"]`);
    if (wordElement) {
      wordElement.classList.add('word-highlight');
    }

    // Clear highlight on last word
    if (data.isLast) {
      setTimeout(() => {
        document.querySelectorAll('.word-highlight').forEach(el => {
          el.classList.remove('word-highlight');
        });
      }, 500);
    }
  }
});
```

## Cache Management

```javascript
// Get cache stats
const stats = audioPlayer.getCacheStats();
console.log(stats);
// {
//   cachedItems: 15,
//   queueLength: 3,
//   isPlaying: true,
//   isPaused: false,
//   currentAudioId: 'rf_f1_print_concepts_page0_sentence'
// }

// Clear cache to free memory
audioPlayer.clearCache();

// Get current playback position
const currentTime = audioPlayer.getCurrentTime(); // in seconds
```

## Generating Audio Files

### Prerequisites

1. Set up ElevenLabs API key:
```bash
export ELEVENLABS_API_KEY=your_key_here
```

2. Update voice ID in `scripts/generate-audio.mjs`:
```javascript
const VOICE_IDS = {
  'elevenlabs:angela': 'actual_voice_id_from_elevenlabs'
};
```

### Generate Audio

```bash
# Preview what will be generated
node scripts/generate-audio.mjs --dry-run

# Generate all missing audio
node scripts/generate-audio.mjs

# Generate for specific station
node scripts/generate-audio.mjs --station=rf_f1_print_concepts

# Regenerate all audio (even existing)
node scripts/generate-audio.mjs --force
```

### Regenerate Manifest

If you update the content pack, regenerate the manifest:

```bash
node scripts/extract-audio-texts.mjs
```

This will create a new `audio-manifest.json` with all text from the content pack.

## Integration Example: Page Component

```javascript
class PageComponent {
  constructor(stationId, pageIndex, audioPlayer) {
    this.stationId = stationId;
    this.pageIndex = pageIndex;
    this.audioPlayer = audioPlayer;
  }

  async loadPage() {
    // Preload page audio
    await this.audioPlayer.preloadPage(this.stationId, this.pageIndex);

    // Queue announcement, sentence, and reading tip
    const pagePrefix = `${this.stationId}_page${this.pageIndex}`;

    this.audioPlayer.enqueueBatch([
      { audioId: `${pagePrefix}_sentence`, options: { enableAutoWordSync: true } },
      `${pagePrefix}_readingtip`
    ]);

    // Start playback
    await this.audioPlayer.processQueue();
  }

  async showQuestion() {
    const pagePrefix = `${this.stationId}_page${this.pageIndex}`;

    this.audioPlayer.enqueueBatch([
      `${pagePrefix}_question`,
      `${pagePrefix}_passage`
    ]);

    await this.audioPlayer.processQueue();
  }

  async showHint() {
    const pagePrefix = `${this.stationId}_page${this.pageIndex}`;
    await this.audioPlayer.play(`${pagePrefix}_hint`);
  }

  async showSuccess() {
    const pagePrefix = `${this.stationId}_page${this.pageIndex}`;
    await this.audioPlayer.play(`${pagePrefix}_success`);
  }
}
```

## Best Practices

1. **Preload Early**: Preload audio while showing animations or transitions
2. **Handle Missing Audio**: Always use callbacks to handle missing files gracefully
3. **Queue Management**: Use queue for sequential playback, direct play for immediate feedback
4. **Memory Management**: Clear cache periodically if you have many audio files
5. **User Control**: Provide pause/resume controls for accessibility
6. **Loading States**: Show loading indicator while preloading
7. **Error Recovery**: Gracefully continue even if some audio files fail to load

## Troubleshooting

### Audio doesn't play

1. Check if manifest is loaded: `await audioPlayer.initialize()`
2. Check if audio file exists: `audioPlayer.hasAudio('audio_id')`
3. Check browser console for errors
4. Verify audio files are generated: `ls assets/audio/ela/`

### Word highlighting is off

1. Use custom word timings for precise sync
2. Adjust estimation in `generateWordTimings()` if using auto sync
3. Check that `onWordHighlight` callback is set

### 404 errors

1. Audio files not generated yet - run `node scripts/generate-audio.mjs`
2. Audio manifest out of date - run `node scripts/extract-audio-texts.mjs`
3. Path issues - check that `audioPath` matches actual file location

### Playback stutters

1. Preload audio before playing
2. Check network connection
3. Reduce concurrent operations
4. Verify audio file quality

## API Reference

### AudioPlayer Constructor Options

```typescript
{
  manifestPath?: string;           // Path to audio manifest (default: 'content/cpa-grade1-ela/audio-manifest.json')
  volume?: number;                  // Volume 0.0-1.0 (default: 1.0)
  onWordHighlight?: (data) => void; // Word highlight callback
  onPlaybackComplete?: (audioId) => void; // Playback complete callback
  onQueueComplete?: () => void;     // Queue complete callback
  onError?: (error) => void;        // Error callback
}
```

### Methods

- `initialize()` - Load manifest
- `play(audioId, options)` - Play audio
- `preload(audioId, options)` - Preload audio
- `preloadBatch(audioIds)` - Preload multiple
- `preloadPage(stationId, pageIndex)` - Preload page audio
- `preloadStationAnnouncement(stationId)` - Preload announcement
- `enqueue(audioId, options)` - Add to queue
- `enqueueBatch(items)` - Add multiple to queue
- `processQueue()` - Process queue
- `pause()` - Pause playback
- `resume()` - Resume playback
- `stop()` - Stop playback
- `skip()` - Skip current
- `setVolume(volume)` - Set volume
- `clearQueue()` - Clear queue
- `clearCache()` - Clear cache
- `getCacheStats()` - Get stats
- `getCurrentTime()` - Get position
- `hasAudio(audioId)` - Check if exists
- `getAudioEntry(audioId)` - Get manifest entry
