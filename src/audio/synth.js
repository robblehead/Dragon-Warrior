// Authentic NES 2A03 APU Chiptune Sound Synthesizer (Pulse, Triangle, Noise)

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.initialized = false;
    this.noiseBuffer = null;
  }

  init() {
    if (this.initialized) return;
    if (typeof window === 'undefined') return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    this.ctx = new AudioContext();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.75, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(0.38, this.ctx.currentTime);
    this.musicGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(0.6, this.ctx.currentTime);
    this.sfxGain.connect(this.masterGain);

    // Pre-generate 1 second LFSR-style white noise buffer for NES noise channel
    const len = this.ctx.sampleRate;
    this.noiseBuffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = this.noiseBuffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      // Stepped sample-and-hold noise emulates NES hardware noise grit
      if (i % 4 === 0) last = Math.random() * 2 - 1;
      data[i] = last;
    }

    this.initialized = true;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.75, this.ctx.currentTime);
    }
  }

  toggleMute() {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  noteToFreq(note) {
    if (typeof note === 'number') {
      return 440 * Math.pow(2, (note - 69) / 12);
    }
    const noteMap = {
      C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5,
      'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11
    };
    const match = String(note).match(/^([A-G][#b]?)(-?\d+)$/);
    if (!match) return 440;
    const semitone = noteMap[match[1]];
    const octave = parseInt(match[2], 10);
    const midi = (octave + 1) * 12 + semitone;
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  /**
   * Plays an NES APU channel note (square / pulse or triangle).
   */
  playAPUNote(freq, channel = 'square', duration = 0.25, time = 0, volume = 0.22) {
    if (!this.initialized || this.isMuted || !this.ctx) return null;
    const t0 = time || this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = channel === 'triangle' ? 'triangle' : 'square';
    osc.frequency.setValueAtTime(freq, t0);

    // Crisp NES step envelope
    if (channel === 'triangle') {
      gain.gain.setValueAtTime(volume * 1.1, t0);
      gain.gain.setValueAtTime(volume * 1.1, Math.max(t0, t0 + duration - 0.015));
      gain.gain.linearRampToValueAtTime(0.0001, t0 + duration);
    } else {
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.linearRampToValueAtTime(volume, t0 + 0.008);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.01, volume * 0.55), t0 + duration * 0.7);
      gain.gain.linearRampToValueAtTime(0.0001, t0 + duration);
    }

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(t0);
    osc.stop(t0 + duration);
    return osc;
  }

  playNoiseHit(duration = 0.08, time = 0, volume = 0.12, filterFreq = 1800) {
    if (!this.initialized || this.isMuted || !this.ctx || !this.noiseBuffer) return;
    const t0 = time || this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(filterFreq, t0);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    src.start(t0);
    src.stop(t0 + duration);
  }

  playToneSeq(notes, wave = 'square', gainVal = 0.22, stepScale = 0.92) {
    if (!this.initialized || this.isMuted || !this.ctx) return;
    const t0 = this.ctx.currentTime;
    let offset = 0;
    for (const n of notes) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = wave;
      osc.frequency.setValueAtTime(n.f, t0 + offset);
      gain.gain.setValueAtTime(gainVal, t0 + offset);
      gain.gain.linearRampToValueAtTime(0.001, t0 + offset + n.d);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t0 + offset);
      osc.stop(t0 + offset + n.d);
      offset += n.d * stepScale;
    }
  }

  playSFX(sfxType) {
    if (!this.initialized || this.isMuted || !this.ctx) return;
    const t0 = this.ctx.currentTime;

    switch (sfxType) {
      case 'text_beep': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(520, t0);
        gain.gain.setValueAtTime(0.07, t0);
        gain.gain.linearRampToValueAtTime(0.001, t0 + 0.022);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t0);
        osc.stop(t0 + 0.022);
        break;
      }

      case 'menu_cursor':
      case 'menu_move': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(660, t0);
        gain.gain.setValueAtTime(0.11, t0);
        gain.gain.linearRampToValueAtTime(0.001, t0 + 0.03);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t0);
        osc.stop(t0 + 0.03);
        break;
      }

      case 'menu_select': {
        this.playToneSeq([
          { f: 587.33, d: 0.045 },
          { f: 880.0, d: 0.07 }
        ], 'square', 0.16, 0.9);
        break;
      }

      case 'bump': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(110, t0);
        osc.frequency.linearRampToValueAtTime(65, t0 + 0.07);
        gain.gain.setValueAtTime(0.25, t0);
        gain.gain.linearRampToValueAtTime(0.001, t0 + 0.07);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t0);
        osc.stop(t0 + 0.07);
        break;
      }

      case 'stairs': {
        for (let i = 0; i < 6; i++) {
          this.playNoiseHit(0.04, t0 + i * 0.055, 0.22, 900 - i * 80);
        }
        break;
      }

      case 'door_open': {
        this.playNoiseHit(0.06, t0, 0.25, 1400);
        this.playToneSeq([
          { f: 440, d: 0.05 },
          { f: 660, d: 0.08 }
        ], 'square', 0.18, 1.0);
        break;
      }

      case 'swamp_step': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(98, t0);
        osc.frequency.linearRampToValueAtTime(75, t0 + 0.12);
        gain.gain.setValueAtTime(0.22, t0);
        gain.gain.linearRampToValueAtTime(0.001, t0 + 0.12);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t0);
        osc.stop(t0 + 0.12);
        this.playNoiseHit(0.1, t0, 0.18, 450);
        break;
      }

      case 'attack_hit': {
        this.playNoiseHit(0.14, t0, 0.32, 1100);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(340, t0);
        osc.frequency.exponentialRampToValueAtTime(90, t0 + 0.12);
        gain.gain.setValueAtTime(0.22, t0);
        gain.gain.linearRampToValueAtTime(0.001, t0 + 0.12);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t0);
        osc.stop(t0 + 0.12);
        break;
      }

      case 'receive_damage': {
        this.playNoiseHit(0.16, t0, 0.35, 650);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(190, t0);
        osc.frequency.linearRampToValueAtTime(60, t0 + 0.18);
        gain.gain.setValueAtTime(0.28, t0);
        gain.gain.linearRampToValueAtTime(0.001, t0 + 0.18);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t0);
        osc.stop(t0 + 0.18);
        break;
      }

      case 'critical_hit': {
        this.playNoiseHit(0.22, t0, 0.4, 1600);
        this.playToneSeq([
          { f: 580, d: 0.06 },
          { f: 320, d: 0.08 },
          { f: 140, d: 0.16 }
        ], 'square', 0.3, 0.9);
        break;
      }

      case 'spell_cast': {
        this.playToneSeq([
          { f: 523.25, d: 0.045 },
          { f: 659.25, d: 0.045 },
          { f: 783.99, d: 0.045 },
          { f: 1046.5, d: 0.045 },
          { f: 1318.5, d: 0.06 },
          { f: 1567.98, d: 0.1 }
        ], 'square', 0.2, 0.9);
        break;
      }

      case 'hurt_spell': {
        this.playNoiseHit(0.25, t0, 0.35, 900);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(280, t0);
        osc.frequency.exponentialRampToValueAtTime(55, t0 + 0.28);
        gain.gain.setValueAtTime(0.25, t0);
        gain.gain.linearRampToValueAtTime(0.001, t0 + 0.28);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t0);
        osc.stop(t0 + 0.28);
        break;
      }

      case 'heal': {
        this.playToneSeq([
          { f: 523.25, d: 0.07 },
          { f: 659.25, d: 0.07 },
          { f: 783.99, d: 0.07 },
          { f: 1046.5, d: 0.18 }
        ], 'triangle', 0.28, 0.88);
        break;
      }

      case 'chest_open': {
        this.playToneSeq([
          { f: 523.25, d: 0.11 },
          { f: 659.25, d: 0.11 },
          { f: 783.99, d: 0.11 },
          { f: 1046.5, d: 0.32 }
        ], 'square', 0.2, 0.92);
        break;
      }

      case 'victory': {
        this.playToneSeq([
          { f: 659.25, d: 0.11 },
          { f: 659.25, d: 0.11 },
          { f: 659.25, d: 0.11 },
          { f: 659.25, d: 0.22 },
          { f: 523.25, d: 0.14 },
          { f: 587.33, d: 0.14 },
          { f: 659.25, d: 0.3 },
          { f: 587.33, d: 0.14 },
          { f: 659.25, d: 0.45 }
        ], 'square', 0.22, 0.9);
        break;
      }

      case 'level_up': {
        this.playToneSeq([
          { f: 523.25, d: 0.1 },
          { f: 523.25, d: 0.1 },
          { f: 523.25, d: 0.1 },
          { f: 659.25, d: 0.22 },
          { f: 587.33, d: 0.1 },
          { f: 659.25, d: 0.1 },
          { f: 783.99, d: 0.45 }
        ], 'square', 0.24, 0.9);
        break;
      }

      case 'inn_sleep': {
        this.playToneSeq([
          { f: 523.25, d: 0.16 },
          { f: 659.25, d: 0.16 },
          { f: 783.99, d: 0.16 },
          { f: 659.25, d: 0.16 },
          { f: 587.33, d: 0.16 },
          { f: 659.25, d: 0.16 },
          { f: 523.25, d: 0.4 }
        ], 'triangle', 0.28, 0.95);
        break;
      }

      case 'flute': {
        this.playToneSeq([
          { f: 659.25, d: 0.18 },
          { f: 783.99, d: 0.18 },
          { f: 880.0,  d: 0.22 },
          { f: 783.99, d: 0.18 },
          { f: 659.25, d: 0.35 }
        ], 'triangle', 0.3, 0.95);
        break;
      }

      case 'curse': {
        this.playToneSeq([
          { f: 392.0,  d: 0.18 },
          { f: 369.99, d: 0.18 },
          { f: 349.23, d: 0.18 },
          { f: 329.63, d: 0.22 },
          { f: 261.63, d: 0.55 }
        ], 'square', 0.22, 0.95);
        break;
      }

      default:
        break;
    }
  }
}

export const soundEngine = new SoundEngine();
