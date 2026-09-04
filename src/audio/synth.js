// Procedural Web Audio Synthesizer for Dragon Warrior 3D
// Implements custom multi-voice polyphony (Brass, Strings, Flute, Pulse, Bass, Noise)

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.currentTrack = null;
    this.trackTimeout = null;
    this.currentLoopNodes = [];
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    if (typeof window === 'undefined') return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.ctx = new AudioContext();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(0.45, this.ctx.currentTime);
    this.musicGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(0.65, this.ctx.currentTime);
    this.sfxGain.connect(this.masterGain);

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
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.8, this.ctx.currentTime);
    }
  }

  toggleMute() {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  // Convert note name (e.g. "C4", "F#3", "Bb5") or MIDI number to frequency
  noteToFreq(note) {
    if (typeof note === 'number') {
      return 440 * Math.pow(2, (note - 69) / 12);
    }
    const noteMap = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
    const match = note.match(/^([A-G][#b]?)(-?\d+)$/);
    if (!match) return 440;
    const semitone = noteMap[match[1]];
    const octave = parseInt(match[2], 10);
    const midi = (octave + 1) * 12 + semitone;
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  // Play a synthesized note
  playInstrumentNote(freq, type = 'sawtooth', duration = 0.4, time = 0, volume = 0.3, detune = 0, filterFreq = 2200) {
    if (!this.initialized || this.isMuted) return;
    const t0 = time || this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (detune !== 0) osc.detune.setValueAtTime(detune, t0);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterFreq, t0);
    filter.Q.setValueAtTime(1.5, t0);

    // ADSR Envelope
    const attack = 0.02;
    const decay = 0.08;
    const sustain = volume * 0.7;
    const release = 0.08;

    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.linearRampToValueAtTime(volume, t0 + attack);
    gain.gain.linearRampToValueAtTime(sustain, t0 + attack + decay);
    gain.gain.setValueAtTime(sustain, t0 + duration - release);
    gain.gain.linearRampToValueAtTime(0.0001, t0 + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(t0);
    osc.stop(t0 + duration);

    return osc;
  }

  // Play short sound effect
  playSFX(sfxType) {
    if (!this.initialized || this.isMuted) return;
    const t0 = this.ctx.currentTime;

    switch (sfxType) {
      case 'menu_select': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, t0); // D5
        osc.frequency.setValueAtTime(880, t0 + 0.04); // A5
        gain.gain.setValueAtTime(0.2, t0);
        gain.gain.linearRampToValueAtTime(0.001, t0 + 0.09);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t0);
        osc.stop(t0 + 0.09);
        break;
      }
      case 'menu_move': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, t0);
        gain.gain.setValueAtTime(0.12, t0);
        gain.gain.linearRampToValueAtTime(0.001, t0 + 0.035);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t0);
        osc.stop(t0 + 0.035);
        break;
      }
      case 'text_beep': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(660, t0);
        gain.gain.setValueAtTime(0.08, t0);
        gain.gain.linearRampToValueAtTime(0.001, t0 + 0.025);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t0);
        osc.stop(t0 + 0.025);
        break;
      }
      case 'sword_attack': {
        // Noise burst + pitched sweep
        const bufferSize = this.ctx.sampleRate * 0.15;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1200, t0);
        filter.frequency.linearRampToValueAtTime(400, t0 + 0.15);
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.35, t0);
        gain.gain.linearRampToValueAtTime(0.001, t0 + 0.15);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        noise.start(t0);
        break;
      }
      case 'critical_hit': {
        // High impact explosive hit
        this.playSFX('sword_attack');
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, t0);
        osc.frequency.exponentialRampToValueAtTime(55, t0 + 0.35);
        gain.gain.setValueAtTime(0.5, t0);
        gain.gain.linearRampToValueAtTime(0.001, t0 + 0.35);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t0);
        osc.stop(t0 + 0.35);
        break;
      }
      case 'spell_cast': {
        // Arpeggiated shimmer
        const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t0 + idx * 0.04);
          gain.gain.setValueAtTime(0.25, t0 + idx * 0.04);
          gain.gain.linearRampToValueAtTime(0.001, t0 + idx * 0.04 + 0.18);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(t0 + idx * 0.04);
          osc.stop(t0 + idx * 0.04 + 0.18);
        });
        break;
      }
      case 'hurt_spell': {
        // Fireball explosion sound
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(350, t0);
        osc.frequency.exponentialRampToValueAtTime(60, t0 + 0.3);
        gain.gain.setValueAtTime(0.4, t0);
        gain.gain.linearRampToValueAtTime(0.001, t0 + 0.3);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t0);
        osc.stop(t0 + 0.3);
        break;
      }
      case 'heal_spell': {
        // Gentle heavenly chord
        const chord = [392.00, 493.88, 587.33, 783.99]; // G chord
        chord.forEach(freq => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t0);
          gain.gain.setValueAtTime(0.15, t0);
          gain.gain.linearRampToValueAtTime(0.001, t0 + 0.6);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(t0);
          osc.stop(t0 + 0.6);
        });
        break;
      }
      case 'chest_open': {
        // Famous Dragon Warrior chest jingle!
        const melody = [
          { f: 523.25, d: 0.12 }, // C5
          { f: 659.25, d: 0.12 }, // E5
          { f: 783.99, d: 0.12 }, // G5
          { f: 1046.50, d: 0.35 } // C6
        ];
        let offset = 0;
        melody.forEach(note => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(note.f, t0 + offset);
          gain.gain.setValueAtTime(0.3, t0 + offset);
          gain.gain.linearRampToValueAtTime(0.001, t0 + offset + note.d);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(t0 + offset);
          osc.stop(t0 + offset + note.d);
          offset += note.d * 0.9;
        });
        break;
      }
      case 'stairs': {
        // Descending/ascending stairs chime
        const notes = [880, 784, 698, 659, 587];
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, t0 + idx * 0.05);
          gain.gain.setValueAtTime(0.12, t0 + idx * 0.05);
          gain.gain.linearRampToValueAtTime(0.001, t0 + idx * 0.05 + 0.08);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(t0 + idx * 0.05);
          osc.stop(t0 + idx * 0.05 + 0.08);
        });
        break;
      }
      case 'swamp_damage': {
        // Toxic squelch & hurt groan
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, t0);
        osc.frequency.linearRampToValueAtTime(70, t0 + 0.15);
        gain.gain.setValueAtTime(0.3, t0);
        gain.gain.linearRampToValueAtTime(0.001, t0 + 0.15);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t0);
        osc.stop(t0 + 0.15);
        break;
      }
      case 'level_up': {
        // Iconic DQ Level Up fanfare!
        const notes = [
          { f: 523.25, d: 0.1 },
          { f: 523.25, d: 0.1 },
          { f: 523.25, d: 0.1 },
          { f: 659.25, d: 0.25 },
          { f: 587.33, d: 0.1 },
          { f: 659.25, d: 0.1 },
          { f: 783.99, d: 0.5 }
        ];
        let offset = 0;
        notes.forEach(n => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(n.f, t0 + offset);
          gain.gain.setValueAtTime(0.3, t0 + offset);
          gain.gain.linearRampToValueAtTime(0.001, t0 + offset + n.d);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(t0 + offset);
          osc.stop(t0 + offset + n.d);
          offset += n.d * 0.85;
        });
        break;
      }
      case 'victory': {
        // Dragon Warrior battle victory fanfare!
        const fanfare = [
          { f: 659.25, d: 0.12 }, // E5
          { f: 659.25, d: 0.12 }, // E5
          { f: 659.25, d: 0.12 }, // E5
          { f: 659.25, d: 0.25 }, // E5
          { f: 523.25, d: 0.15 }, // C5
          { f: 587.33, d: 0.15 }, // D5
          { f: 659.25, d: 0.35 }, // E5
          { f: 587.33, d: 0.15 }, // D5
          { f: 659.25, d: 0.60 }  // E5
        ];
        let offset = 0;
        fanfare.forEach(n => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(n.f, t0 + offset);
          gain.gain.setValueAtTime(0.28, t0 + offset);
          gain.gain.linearRampToValueAtTime(0.001, t0 + offset + n.d);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(t0 + offset);
          osc.stop(t0 + offset + n.d);
          offset += n.d * 0.88;
        });
        break;
      }
      case 'flute_note': {
        // Sweet airy flute note for the Fairy Flute
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, t0);
        gain.gain.setValueAtTime(0.001, t0);
        gain.gain.linearRampToValueAtTime(0.3, t0 + 0.05);
        gain.gain.linearRampToValueAtTime(0.001, t0 + 0.5);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t0);
        osc.stop(t0 + 0.5);
        break;
      }
      case 'jump': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, t0);
        osc.frequency.exponentialRampToValueAtTime(440, t0 + 0.12);
        gain.gain.setValueAtTime(0.2, t0);
        gain.gain.linearRampToValueAtTime(0.001, t0 + 0.12);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t0);
        osc.stop(t0 + 0.12);
        break;
      }
      case 'footstep_grass': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(100 + Math.random() * 40, t0);
        gain.gain.setValueAtTime(0.05, t0);
        gain.gain.linearRampToValueAtTime(0.001, t0 + 0.04);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t0);
        osc.stop(t0 + 0.04);
        break;
      }
      case 'footstep_stone': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320 + Math.random() * 80, t0);
        gain.gain.setValueAtTime(0.08, t0);
        gain.gain.linearRampToValueAtTime(0.001, t0 + 0.035);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t0);
        osc.stop(t0 + 0.035);
        break;
      }
      default:
        break;
    }
  }

  // Play a specific musical flute note (C5, D5, E5, G5, A5)
  playFluteTone(freq) {
    if (!this.initialized || this.isMuted) return;
    const t0 = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const vibrato = this.ctx.createOscillator();
    const vibratoGain = this.ctx.createGain();

    vibrato.frequency.setValueAtTime(5.5, t0);
    vibratoGain.gain.setValueAtTime(8, t0);
    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc.frequency);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t0);

    gain.gain.setValueAtTime(0.001, t0);
    gain.gain.linearRampToValueAtTime(0.35, t0 + 0.06);
    gain.gain.setValueAtTime(0.3, t0 + 0.35);
    gain.gain.linearRampToValueAtTime(0.001, t0 + 0.65);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    vibrato.start(t0);
    osc.start(t0);
    vibrato.stop(t0 + 0.65);
    osc.stop(t0 + 0.65);
  }
}

export const soundEngine = new SoundEngine();
