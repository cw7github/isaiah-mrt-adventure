/**
 * Audio Player Utility for ELA Content
 *
 * Features:
 * - Queue management for sequential audio playback
 * - Word-by-word highlighting synchronization
 * - Preloading and caching
 * - Loading state management
 * - Pause/resume/skip controls
 */

class AudioPlayer {
  constructor(options = {}) {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.manifestPath = options.manifestPath || 'content/cpa-grade1-ela/audio-manifest.json';
    this.manifest = null;
    this.cache = new Map(); // Audio buffer cache
    this.queue = [];
    this.currentAudio = null;
    this.currentSource = null;
    this.currentAudioId = null;
    this.pausedAt = 0;
    this.startedAt = 0;
    this.isPlaying = false;
    this.isPaused = false;
    this.onWordHighlight = options.onWordHighlight || null;
    this.onPlaybackComplete = options.onPlaybackComplete || null;
    this.onQueueComplete = options.onQueueComplete || null;
    this.onError = options.onError || null;
    this.volume = options.volume !== undefined ? options.volume : 1.0;
  }

  /**
   * Initialize the audio player and load manifest
   */
  async initialize() {
    try {
      const response = await fetch(this.manifestPath);
      if (!response.ok) {
        throw new Error(`Failed to load audio manifest: ${response.status}`);
      }
      this.manifest = await response.json();
      console.log(`Audio manifest loaded: ${this.manifest.totalAudioClips} clips available`);
      return true;
    } catch (error) {
      console.error('Failed to initialize audio player:', error);
      if (this.onError) this.onError(error);
      return false;
    }
  }

  /**
   * Get audio entry from manifest by ID
   */
  getAudioEntry(audioId) {
    if (!this.manifest) {
      throw new Error('Audio player not initialized. Call initialize() first.');
    }
    return this.manifest.audioMap[audioId];
  }

  /**
   * Preload audio file into cache
   */
  async preload(audioId, options = {}) {
    // Check cache first
    if (this.cache.has(audioId)) {
      return this.cache.get(audioId);
    }

    const entry = this.getAudioEntry(audioId);
    if (!entry) {
      const error = new Error(`Audio ID not found in manifest: ${audioId}`);
      if (!options.silent) {
        console.warn(error.message);
        if (this.onError) this.onError(error);
      }
      return null;
    }

    try {
      const response = await fetch(entry.audioPath);
      if (!response.ok) {
        // Handle missing audio files gracefully
        if (response.status === 404) {
          const error = new Error(`Audio file not found: ${entry.audioPath} (not yet generated)`);
          if (!options.silent) {
            console.warn(error.message);
          }
          // Cache a null entry to avoid repeated 404s
          this.cache.set(audioId, null);
          return null;
        }
        throw new Error(`Failed to load audio file: ${entry.audioPath} (${response.status})`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      // Cache the buffer
      this.cache.set(audioId, {
        buffer: audioBuffer,
        entry: entry,
        duration: audioBuffer.duration
      });

      return this.cache.get(audioId);
    } catch (error) {
      console.error(`Failed to preload audio ${audioId}:`, error);
      if (this.onError && !options.silent) this.onError(error);
      // Cache the failure to avoid retrying
      this.cache.set(audioId, null);
      return null;
    }
  }

  /**
   * Preload multiple audio files
   */
  async preloadBatch(audioIds) {
    const promises = audioIds.map(id => this.preload(id).catch(err => {
      console.warn(`Failed to preload ${id}:`, err);
      return null;
    }));
    return Promise.all(promises);
  }

  /**
   * Play a single audio clip
   */
  async play(audioId, options = {}) {
    await this.preload(audioId);
    const cached = this.cache.get(audioId);

    // If audio is missing or failed to load, skip silently or with error
    if (!cached || !cached.buffer) {
      console.warn(`Skipping playback for ${audioId}: audio not available`);
      if (this.onPlaybackComplete) {
        this.onPlaybackComplete(audioId);
      }
      return Promise.resolve();
    }

    // Stop any currently playing audio
    this.stop();

    // Create source
    this.currentSource = this.audioContext.createBufferSource();
    this.currentSource.buffer = cached.buffer;

    // Create gain node for volume control
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = this.volume;

    this.currentSource.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Handle word highlighting if provided
    if (options.wordTimings && this.onWordHighlight) {
      this.scheduleWordHighlights(options.wordTimings, this.audioContext.currentTime);
    } else if (options.enableAutoWordSync && this.onWordHighlight && cached.entry.text) {
      // Auto-generate word timings if not provided
      const wordTimings = generateWordTimings(cached.entry.text, cached.duration);
      this.scheduleWordHighlights(wordTimings, this.audioContext.currentTime);
    }

    // Handle completion
    return new Promise((resolve, reject) => {
      this.currentSource.onended = () => {
        this.isPlaying = false;
        this.currentSource = null;
        if (this.onPlaybackComplete) {
          this.onPlaybackComplete(audioId);
        }
        resolve();
      };

      try {
        this.currentSource.start(0);
        this.isPlaying = true;
        this.isPaused = false;
        this.currentAudioId = audioId;
        this.startedAt = this.audioContext.currentTime;
        this.pausedAt = 0;
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Schedule word-by-word highlighting
   * @param {Array} wordTimings - Array of {word, startTime, endTime}
   * @param {Number} startTime - AudioContext start time
   */
  scheduleWordHighlights(wordTimings, startTime) {
    const currentTime = this.audioContext.currentTime;

    wordTimings.forEach((timing, index) => {
      const highlightTime = (startTime + timing.startTime - currentTime) * 1000;

      setTimeout(() => {
        if (this.onWordHighlight) {
          this.onWordHighlight({
            word: timing.word,
            index: index,
            isLast: index === wordTimings.length - 1
          });
        }
      }, Math.max(0, highlightTime));
    });
  }

  /**
   * Add audio to queue
   */
  enqueue(audioId, options = {}) {
    this.queue.push({ audioId, options });
  }

  /**
   * Add multiple audio clips to queue
   */
  enqueueBatch(audioItems) {
    audioItems.forEach(item => {
      if (typeof item === 'string') {
        this.enqueue(item);
      } else {
        this.enqueue(item.audioId, item.options);
      }
    });
  }

  /**
   * Preload upcoming audio in queue (intelligent preloading)
   * @param {Number} lookahead - How many items ahead to preload (default 3)
   */
  async preloadQueue(lookahead = 3) {
    const itemsToPreload = this.queue.slice(0, lookahead);
    const preloadPromises = itemsToPreload.map(item =>
      this.preload(item.audioId, { silent: true })
    );
    await Promise.allSettled(preloadPromises);
  }

  /**
   * Process the queue sequentially
   */
  async processQueue() {
    if (this.queue.length === 0) {
      if (this.onQueueComplete) {
        this.onQueueComplete();
      }
      return;
    }

    // Preload upcoming items while playing current one
    if (this.queue.length > 0) {
      this.preloadQueue(3).catch(err => {
        console.warn('Background preload failed:', err);
      });
    }

    const { audioId, options } = this.queue.shift();

    try {
      await this.play(audioId, options);
      // Recursively process next item
      await this.processQueue();
    } catch (error) {
      console.error(`Error playing queued audio ${audioId}:`, error);
      if (this.onError) this.onError(error);
      // Continue with next item even if one fails
      await this.processQueue();
    }
  }

  /**
   * Clear the queue
   */
  clearQueue() {
    this.queue = [];
  }

  /**
   * Stop current playback
   */
  stop() {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch (e) {
        // Already stopped
      }
      this.currentSource = null;
    }
    this.isPlaying = false;
    this.isPaused = false;
  }

  /**
   * Pause playback
   */
  pause() {
    if (this.isPlaying && !this.isPaused && this.currentSource) {
      this.pausedAt = this.audioContext.currentTime - this.startedAt;
      this.stop();
      this.isPaused = true;
    }
  }

  /**
   * Resume playback from paused position
   */
  async resume() {
    if (this.isPaused && this.currentAudioId) {
      const cached = this.cache.get(this.currentAudioId);
      if (!cached || !cached.buffer) {
        console.warn('Cannot resume: audio buffer not available');
        this.isPaused = false;
        return;
      }

      // Create new source and resume from paused position
      this.currentSource = this.audioContext.createBufferSource();
      this.currentSource.buffer = cached.buffer;

      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = this.volume;

      this.currentSource.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      return new Promise((resolve) => {
        this.currentSource.onended = () => {
          this.isPlaying = false;
          this.currentSource = null;
          if (this.onPlaybackComplete) {
            this.onPlaybackComplete(this.currentAudioId);
          }
          resolve();
        };

        // Start from paused position
        const offset = this.pausedAt;
        const duration = cached.duration - offset;
        this.currentSource.start(0, offset, duration);
        this.isPlaying = true;
        this.isPaused = false;
        this.startedAt = this.audioContext.currentTime - offset;
      });
    }
  }

  /**
   * Skip to next item in queue
   */
  skip() {
    this.stop();
    return this.processQueue();
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Clear cache to free memory
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      cachedItems: this.cache.size,
      queueLength: this.queue.length,
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      currentAudioId: this.currentAudioId
    };
  }

  /**
   * Get current playback position (in seconds)
   */
  getCurrentTime() {
    if (this.isPaused) {
      return this.pausedAt;
    }
    if (this.isPlaying) {
      return this.audioContext.currentTime - this.startedAt;
    }
    return 0;
  }

  /**
   * Check if audio exists in manifest
   */
  hasAudio(audioId) {
    return !!this.getAudioEntry(audioId);
  }

  /**
   * Preload a page's audio (convenience method)
   * Automatically preloads all audio for a given page
   */
  async preloadPage(stationId, pageIndex) {
    const pagePrefix = `${stationId}_page${pageIndex}`;
    const audioTypes = ['sentence', 'readingtip', 'question', 'passage', 'hint', 'success', 'prompt'];

    const preloadPromises = audioTypes.map(type =>
      this.preload(`${pagePrefix}_${type}`, { silent: true })
    );

    await Promise.allSettled(preloadPromises);
  }

  /**
   * Preload a station's announcement
   */
  async preloadStationAnnouncement(stationId) {
    return this.preload(`${stationId}_announcement`, { silent: true });
  }
}

// Helper function to create word timings from text
// This generates estimated timings - you can replace with actual word-level timestamps if available
function generateWordTimings(text, totalDuration) {
  const words = text.split(/\s+/);
  const avgWordDuration = totalDuration / words.length;

  return words.map((word, index) => ({
    word: word,
    startTime: index * avgWordDuration,
    endTime: (index + 1) * avgWordDuration
  }));
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AudioPlayer, generateWordTimings };
}
