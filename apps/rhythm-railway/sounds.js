/**
 * RHYTHM RAILWAY - SOUND SYSTEM
 * Audio management for rhythm patterns
 * Uses Web Audio API for precise timing and synthesis
 */

class RhythmSoundEngine {
  constructor() {
    // Initialize Web Audio API
    this.audioContext = null;
    this.masterGain = null;
    this.isInitialized = false;

    // Sound parameters for different instruments
    this.instruments = {
      drum: { frequency: 100, type: 'sine', decay: 0.3, gain: 0.8 },
      cymbal: { frequency: 3000, type: 'square', decay: 0.5, gain: 0.4 },
      bell: { frequency: 800, type: 'sine', decay: 0.6, gain: 0.6 },
      guitar: { frequency: 400, type: 'sawtooth', decay: 0.4, gain: 0.6 },
      bass: { frequency: 60, type: 'triangle', decay: 0.5, gain: 0.9 },
      silence: { frequency: 0, type: 'sine', decay: 0, gain: 0 }
    };

    // Metronome click
    this.metronome = { frequency: 1000, type: 'sine', decay: 0.05, gain: 0.3 };
  }

  /**
   * Initialize audio context (must be called on user interaction)
   */
  async init() {
    if (this.isInitialized) return;

    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // Create master gain node for volume control
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 0.7;

      this.isInitialized = true;
      console.log('🎵 Sound engine initialized!');
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Play a sound with specified parameters
   * @param {string} soundType - Type of sound (drum, cymbal, bell, etc.)
   * @param {number} duration - Duration in seconds
   */
  playSound(soundType, duration = 0.3) {
    if (!this.isInitialized) {
      console.warn('Sound engine not initialized');
      return;
    }

    const instrument = this.instruments[soundType] || this.instruments.drum;

    // Don't play silence
    if (soundType === 'silence') return;

    const now = this.audioContext.currentTime;

    // Create oscillator
    const oscillator = this.audioContext.createOscillator();
    oscillator.type = instrument.type;
    oscillator.frequency.value = instrument.frequency;

    // Create gain envelope for natural decay
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = instrument.gain;
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + instrument.decay);

    // Add some harmonic richness with a filter
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = instrument.frequency * 2;
    filter.Q.value = 1;

    // Connect nodes
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    // Play sound
    oscillator.start(now);
    oscillator.stop(now + instrument.decay);
  }

  /**
   * Play metronome tick
   */
  playMetronome() {
    if (!this.isInitialized) return;

    const now = this.audioContext.currentTime;

    const oscillator = this.audioContext.createOscillator();
    oscillator.type = this.metronome.type;
    oscillator.frequency.value = this.metronome.frequency;

    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = this.metronome.gain;
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + this.metronome.decay);

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.start(now);
    oscillator.stop(now + this.metronome.decay);
  }

  /**
   * Play success/celebration sound
   */
  playSuccess() {
    if (!this.isInitialized) return;

    const notes = [
      { freq: 523.25, time: 0 },      // C5
      { freq: 659.25, time: 0.15 },   // E5
      { freq: 783.99, time: 0.3 }     // G5
    ];

    notes.forEach(note => {
      setTimeout(() => {
        const now = this.audioContext.currentTime;

        const oscillator = this.audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.value = note.freq;

        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 0.5;
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);

        oscillator.start(now);
        oscillator.stop(now + 0.5);
      }, note.time * 1000);
    });
  }

  /**
   * Play perfect hit sound (extra satisfying)
   */
  playPerfect() {
    if (!this.isInitialized) return;

    const now = this.audioContext.currentTime;

    // Play a bright, sparkly sound
    const oscillator1 = this.audioContext.createOscillator();
    oscillator1.type = 'sine';
    oscillator1.frequency.value = 1200;

    const oscillator2 = this.audioContext.createOscillator();
    oscillator2.type = 'sine';
    oscillator2.frequency.value = 1600;

    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = 0.4;
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator1.start(now);
    oscillator2.start(now);
    oscillator1.stop(now + 0.3);
    oscillator2.stop(now + 0.3);
  }

  /**
   * Play miss/error sound
   */
  playMiss() {
    if (!this.isInitialized) return;

    const now = this.audioContext.currentTime;

    const oscillator = this.audioContext.createOscillator();
    oscillator.type = 'sawtooth';
    oscillator.frequency.value = 100;
    oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.2);

    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = 0.3;
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.start(now);
    oscillator.stop(now + 0.2);
  }

  /**
   * Play train chug sound
   */
  playTrainChug() {
    if (!this.isInitialized) return;

    const now = this.audioContext.currentTime;

    // Create rhythmic "chug-chug" sound
    for (let i = 0; i < 4; i++) {
      const startTime = now + (i * 0.15);

      const oscillator = this.audioContext.createOscillator();
      oscillator.type = 'sawtooth';
      oscillator.frequency.value = 80 + (i * 10);

      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = 0.4;
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);

      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.1);
    }
  }

  /**
   * Set master volume
   * @param {number} volume - Volume level (0-1)
   */
  setVolume(volume) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Resume audio context (for mobile browsers)
   */
  resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}

// Create global sound engine instance
const soundEngine = new RhythmSoundEngine();

// ===== FALLBACK: Simple Beep Sounds (if Web Audio fails) =====
class SimpleSoundEngine {
  constructor() {
    this.isInitialized = false;
  }

  async init() {
    this.isInitialized = true;
    console.log('🔊 Simple sound mode (visual feedback only)');
  }

  playSound(soundType, duration) {
    // Visual-only mode - sounds play in user's imagination!
    console.log(`🎵 ${soundType} sound (${duration}ms)`);
  }

  playMetronome() {
    console.log('⏱️ tick');
  }

  playSuccess() {
    console.log('🎉 Success!');
  }

  playPerfect() {
    console.log('✨ Perfect!');
  }

  playMiss() {
    console.log('❌ Miss');
  }

  playTrainChug() {
    console.log('🚂 Chug-chug!');
  }

  setVolume(volume) {
    console.log(`🔊 Volume: ${volume}`);
  }

  resume() {
    // Nothing to resume
  }
}

// Export sound engine
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { soundEngine, SimpleSoundEngine, RhythmSoundEngine };
}
