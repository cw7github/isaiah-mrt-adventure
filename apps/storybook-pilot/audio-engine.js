/**
 * MIDNIGHT PIZZA TRAIN - ElevenLabs Audio Engine
 *
 * Provides high-quality narration with precise word-by-word highlighting
 * synchronized to ElevenLabs TTS audio with millisecond-accurate timings.
 */

class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.currentAudio = null;
    this.audioQueue = [];
    this.isPlaying = false;
    this.manifest = null;
    this.sfxManifest = null;
    this.onWordHighlight = null;
    this.onSegmentStart = null;
    this.onComplete = null;
    this.wordTimers = [];
    this.baseUrl = 'assets/audio/';
    this.sfxBaseUrl = 'assets/sfx/';

    // Preloaded audio cache
    this.audioCache = new Map();
    this.sfxCache = new Map();
  }

  async init() {
    // Load manifests
    try {
      const [audioRes, sfxRes] = await Promise.all([
        fetch(this.baseUrl + 'manifest.json'),
        fetch(this.sfxBaseUrl + 'manifest.json')
      ]);

      this.manifest = await audioRes.json();
      this.sfxManifest = await sfxRes.json();

      console.log('%c🎙️ Audio Engine: Loaded manifests', 'color: #E8C882');
      console.log(`   Pages: ${Object.keys(this.manifest.pages).length}`);
      console.log(`   Sound Effects: ${Object.keys(this.sfxManifest.effects).length}`);

      // Preload first page and sound effects
      await this.preloadPage(1);
      await this.preloadSFX();

      return true;
    } catch (err) {
      console.warn('Audio Engine: Could not load manifests, falling back to Web Speech API');
      return false;
    }
  }

  async preloadPage(pageNum) {
    const pageData = this.manifest?.pages?.[pageNum];
    if (!pageData) return;

    const promises = pageData.segments.map(segment => {
      const url = this.baseUrl + segment.audioFile;
      if (!this.audioCache.has(url)) {
        return fetch(url)
          .then(r => r.blob())
          .then(blob => {
            this.audioCache.set(url, URL.createObjectURL(blob));
          })
          .catch(() => {});
      }
    });

    await Promise.all(promises);
  }

  async preloadSFX() {
    if (!this.sfxManifest?.effects) return;

    const promises = Object.values(this.sfxManifest.effects).map(sfx => {
      const url = this.sfxBaseUrl + sfx.file;
      if (!this.sfxCache.has(sfx.file)) {
        return fetch(url)
          .then(r => r.blob())
          .then(blob => {
            this.sfxCache.set(sfx.file, URL.createObjectURL(blob));
          })
          .catch(() => {});
      }
    });

    await Promise.all(promises);
  }

  /**
   * Play narration for a page with word highlighting
   */
  async playPage(pageNum, callbacks = {}) {
    const { onWordHighlight, onSegmentStart, onComplete } = callbacks;

    this.onWordHighlight = onWordHighlight;
    this.onSegmentStart = onSegmentStart;
    this.onComplete = onComplete;

    const pageData = this.manifest?.pages?.[pageNum];
    if (!pageData) {
      console.warn(`Audio Engine: No data for page ${pageNum}`);
      if (onComplete) onComplete();
      return;
    }

    // Preload next page
    if (pageNum < 10) {
      this.preloadPage(pageNum + 1);
    }

    // Clear any existing playback
    this.stop();
    this.isPlaying = true;

    // Build queue of segments
    this.audioQueue = [...pageData.segments];

    // Start playing segments
    await this.playNextSegment();
  }

  async playNextSegment() {
    if (!this.isPlaying || this.audioQueue.length === 0) {
      this.isPlaying = false;
      if (this.onComplete) this.onComplete();
      return;
    }

    const segment = this.audioQueue.shift();
    const url = this.baseUrl + segment.audioFile;
    const audioUrl = this.audioCache.get(url) || url;

    // Notify segment start (for voice indicator)
    if (this.onSegmentStart) {
      this.onSegmentStart({
        voice: segment.voice,
        emotion: segment.emotion
      });
    }

    // Create audio element
    this.currentAudio = new Audio(audioUrl);

    // Setup word highlighting timers
    this.setupWordTimers(segment);

    // Play audio
    return new Promise((resolve) => {
      this.currentAudio.onended = () => {
        this.clearWordTimers();
        resolve();
        this.playNextSegment();
      };

      this.currentAudio.onerror = () => {
        console.warn('Audio playback error:', segment.audioFile);
        this.clearWordTimers();
        resolve();
        this.playNextSegment();
      };

      this.currentAudio.play().catch(err => {
        console.warn('Audio play failed:', err);
        this.clearWordTimers();
        resolve();
        this.playNextSegment();
      });
    });
  }

  setupWordTimers(segment) {
    if (!segment.wordTimings || !this.onWordHighlight) return;

    // Calculate cumulative word index offset based on previous segments
    let wordOffset = 0;

    segment.wordTimings.forEach((timing, index) => {
      // Skip emotion tags like [warm], [excited], etc.
      if (timing.word.startsWith('[') && timing.word.endsWith(']')) {
        return;
      }

      const timer = setTimeout(() => {
        if (this.isPlaying && this.onWordHighlight) {
          this.onWordHighlight({
            word: timing.word,
            index: wordOffset + index,
            startMs: timing.startMs,
            endMs: timing.endMs
          });
        }
      }, timing.startMs);

      this.wordTimers.push(timer);
    });
  }

  clearWordTimers() {
    this.wordTimers.forEach(timer => clearTimeout(timer));
    this.wordTimers = [];
  }

  /**
   * Play a sound effect
   */
  async playSFX(name, volume = 0.5) {
    const sfx = this.sfxManifest?.effects?.[name];
    if (!sfx) {
      console.warn(`SFX not found: ${name}`);
      return;
    }

    const url = this.sfxBaseUrl + sfx.file;
    const audioUrl = this.sfxCache.get(sfx.file) || url;

    const audio = new Audio(audioUrl);
    audio.volume = volume;

    try {
      await audio.play();
    } catch (err) {
      console.warn('SFX play failed:', err);
    }
  }

  /**
   * Speak a single word (for tap-to-hear)
   */
  speakWord(word) {
    // Use Web Speech API for individual words
    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.rate = 0.8;
    utterance.pitch = 1.0;

    const voices = synth.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en'));
    if (preferredVoice) utterance.voice = preferredVoice;

    synth.speak(utterance);
  }

  /**
   * Stop all playback
   */
  stop() {
    this.isPlaying = false;
    this.audioQueue = [];
    this.clearWordTimers();

    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  /**
   * Get total duration for a page
   */
  getPageDuration(pageNum) {
    const pageData = this.manifest?.pages?.[pageNum];
    if (!pageData) return 0;

    return pageData.segments.reduce((total, seg) => total + (seg.duration || 0), 0) * 1000;
  }

  /**
   * Get word count for a page (excluding emotion tags)
   */
  getPageWordCount(pageNum) {
    const pageData = this.manifest?.pages?.[pageNum];
    if (!pageData) return 0;

    let count = 0;
    pageData.segments.forEach(seg => {
      if (seg.wordTimings) {
        seg.wordTimings.forEach(t => {
          if (!t.word.startsWith('[')) count++;
        });
      }
    });
    return count;
  }
}

// Export singleton
window.audioEngine = new AudioEngine();
