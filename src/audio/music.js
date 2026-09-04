// Symphonic & Chiptune Music Engine for Dragon Warrior 3D
// Plays multi-channel procedural arrangements of the iconic Dragon Quest themes

import { soundEngine } from './synth.js';

class MusicManager {
  constructor() {
    this.currentTrack = null;
    this.isPlaying = false;
    this.loopTimeout = null;
    this.stepIndex = 0;
    this.bpm = 120;
    this.activeVoiceNodes = [];
  }

  stop() {
    if (this.loopTimeout) {
      clearTimeout(this.loopTimeout);
      this.loopTimeout = null;
    }
    this.activeVoiceNodes.forEach(node => {
      try { node.stop(); } catch (e) {}
    });
    this.activeVoiceNodes = [];
    this.isPlaying = false;
    this.currentTrack = null;
  }

  playTrack(trackName) {
    if (this.currentTrack === trackName && this.isPlaying) return;
    this.stop();
    soundEngine.init();
    soundEngine.resume();

    this.currentTrack = trackName;
    this.isPlaying = true;
    this.scheduleTrackLoop(trackName, 0);
  }

  scheduleTrackLoop(trackName, loopCount = 0) {
    if (!this.isPlaying || this.currentTrack !== trackName) return;

    const track = TRACKS[trackName];
    if (!track) return;

    const tempo = track.tempo || 120;
    const beatSec = 60 / tempo;
    const stepSec = beatSec / 4; // 16th note step
    const ctx = soundEngine.ctx;
    if (!ctx) return;
    const startTime = ctx.currentTime + 0.05;

    // Track channels: lead, harmony, bass
    const maxSteps = track.length || 32;

    if (track.voices) {
      track.voices.forEach(voice => {
        voice.notes.forEach(noteItem => {
          const noteStart = startTime + noteItem.step * stepSec;
          const duration = (noteItem.duration || 1) * stepSec;
          const freq = soundEngine.noteToFreq(noteItem.pitch);

          if (freq > 20) {
            const osc = soundEngine.playInstrumentNote(
              freq,
              voice.type || 'sawtooth',
              duration * 0.92,
              noteStart,
              voice.volume || 0.25,
              voice.detune || 0,
              voice.filter || 2000
            );
            if (osc) this.activeVoiceNodes.push(osc);
          }
        });
      });
    }

    // Schedule next loop
    const totalDurationSec = maxSteps * stepSec;
    this.loopTimeout = setTimeout(() => {
      if (this.isPlaying && this.currentTrack === trackName) {
        this.scheduleTrackLoop(trackName, loopCount + 1);
      }
    }, totalDurationSec * 1000 - 50);
  }
}

// Melodic patterns adapted from Koichi Sugiyama's legendary Dragon Warrior (DQ1) motifs
const TRACKS = {
  // Alefgard Overworld: Grand, heroic adventure march
  overworld: {
    tempo: 114,
    length: 32,
    voices: [
      {
        type: 'sawtooth',
        volume: 0.22,
        filter: 2400,
        notes: [
          { pitch: 'D4', step: 0, duration: 2 },
          { pitch: 'G4', step: 2, duration: 2 },
          { pitch: 'A4', step: 4, duration: 2 },
          { pitch: 'B4', step: 6, duration: 3 },
          { pitch: 'C5', step: 9, duration: 1 },
          { pitch: 'B4', step: 10, duration: 2 },
          { pitch: 'A4', step: 12, duration: 2 },
          { pitch: 'G4', step: 14, duration: 2 },

          { pitch: 'E4', step: 16, duration: 3 },
          { pitch: 'F#4', step: 19, duration: 1 },
          { pitch: 'G4', step: 20, duration: 4 },
          { pitch: 'D4', step: 24, duration: 4 },
          { pitch: 'A4', step: 28, duration: 4 },
        ]
      },
      {
        type: 'triangle',
        volume: 0.18,
        filter: 1800,
        notes: [
          { pitch: 'B3', step: 0, duration: 2 },
          { pitch: 'D4', step: 2, duration: 2 },
          { pitch: 'F#4', step: 4, duration: 2 },
          { pitch: 'G4', step: 6, duration: 3 },
          { pitch: 'A4', step: 9, duration: 1 },
          { pitch: 'G4', step: 10, duration: 2 },
          { pitch: 'F#4', step: 12, duration: 2 },
          { pitch: 'E4', step: 14, duration: 2 },

          { pitch: 'C4', step: 16, duration: 3 },
          { pitch: 'D4', step: 19, duration: 1 },
          { pitch: 'E4', step: 20, duration: 4 },
          { pitch: 'B3', step: 24, duration: 4 },
          { pitch: 'F#4', step: 28, duration: 4 },
        ]
      },
      {
        type: 'square',
        volume: 0.16,
        filter: 750,
        notes: [
          // Marching bassline
          { pitch: 'G2', step: 0, duration: 2 },
          { pitch: 'G2', step: 2, duration: 2 },
          { pitch: 'D3', step: 4, duration: 2 },
          { pitch: 'G2', step: 6, duration: 2 },
          { pitch: 'G2', step: 8, duration: 2 },
          { pitch: 'B2', step: 10, duration: 2 },
          { pitch: 'D3', step: 12, duration: 2 },
          { pitch: 'B2', step: 14, duration: 2 },

          { pitch: 'C3', step: 16, duration: 2 },
          { pitch: 'G2', step: 18, duration: 2 },
          { pitch: 'C3', step: 20, duration: 2 },
          { pitch: 'E3', step: 22, duration: 2 },
          { pitch: 'D3', step: 24, duration: 2 },
          { pitch: 'A2', step: 26, duration: 2 },
          { pitch: 'D3', step: 28, duration: 2 },
          { pitch: 'F#3', step: 30, duration: 2 },
        ]
      }
    ]
  },

  // Tantegel Castle: Stately royal court theme
  castle: {
    tempo: 96,
    length: 32,
    voices: [
      {
        type: 'sawtooth',
        volume: 0.24,
        filter: 2800,
        notes: [
          { pitch: 'C4', step: 0, duration: 4 },
          { pitch: 'G4', step: 4, duration: 4 },
          { pitch: 'E4', step: 8, duration: 2 },
          { pitch: 'F4', step: 10, duration: 2 },
          { pitch: 'G4', step: 12, duration: 4 },

          { pitch: 'A4', step: 16, duration: 3 },
          { pitch: 'B4', step: 19, duration: 1 },
          { pitch: 'C5', step: 20, duration: 4 },
          { pitch: 'G4', step: 24, duration: 4 },
          { pitch: 'E4', step: 28, duration: 4 },
        ]
      },
      {
        type: 'triangle',
        volume: 0.18,
        filter: 1900,
        notes: [
          { pitch: 'E3', step: 0, duration: 4 },
          { pitch: 'C4', step: 4, duration: 4 },
          { pitch: 'C4', step: 8, duration: 2 },
          { pitch: 'D4', step: 10, duration: 2 },
          { pitch: 'E4', step: 12, duration: 4 },

          { pitch: 'F4', step: 16, duration: 3 },
          { pitch: 'G4', step: 19, duration: 1 },
          { pitch: 'A4', step: 20, duration: 4 },
          { pitch: 'E4', step: 24, duration: 4 },
          { pitch: 'C4', step: 28, duration: 4 },
        ]
      },
      {
        type: 'sawtooth',
        volume: 0.15,
        filter: 650,
        notes: [
          { pitch: 'C3', step: 0, duration: 4 },
          { pitch: 'E3', step: 4, duration: 4 },
          { pitch: 'G3', step: 8, duration: 4 },
          { pitch: 'C3', step: 12, duration: 4 },
          { pitch: 'F3', step: 16, duration: 4 },
          { pitch: 'A3', step: 20, duration: 4 },
          { pitch: 'C3', step: 24, duration: 4 },
          { pitch: 'G2', step: 28, duration: 4 },
        ]
      }
    ]
  },

  // Town of Brecconary: Cozy village theme
  town: {
    tempo: 108,
    length: 32,
    voices: [
      {
        type: 'triangle',
        volume: 0.25,
        filter: 3200,
        notes: [
          { pitch: 'G4', step: 0, duration: 2 },
          { pitch: 'E4', step: 2, duration: 2 },
          { pitch: 'C4', step: 4, duration: 2 },
          { pitch: 'D4', step: 6, duration: 2 },
          { pitch: 'E4', step: 8, duration: 2 },
          { pitch: 'F4', step: 10, duration: 2 },
          { pitch: 'G4', step: 12, duration: 4 },

          { pitch: 'A4', step: 16, duration: 2 },
          { pitch: 'G4', step: 18, duration: 2 },
          { pitch: 'F4', step: 20, duration: 2 },
          { pitch: 'E4', step: 22, duration: 2 },
          { pitch: 'D4', step: 24, duration: 4 },
          { pitch: 'C4', step: 28, duration: 4 },
        ]
      },
      {
        type: 'sine',
        volume: 0.20,
        filter: 2000,
        notes: [
          { pitch: 'E4', step: 0, duration: 2 },
          { pitch: 'C4', step: 2, duration: 2 },
          { pitch: 'G3', step: 4, duration: 2 },
          { pitch: 'B3', step: 6, duration: 2 },
          { pitch: 'C4', step: 8, duration: 2 },
          { pitch: 'D4', step: 10, duration: 2 },
          { pitch: 'E4', step: 12, duration: 4 },

          { pitch: 'F4', step: 16, duration: 2 },
          { pitch: 'E4', step: 18, duration: 2 },
          { pitch: 'D4', step: 20, duration: 2 },
          { pitch: 'C4', step: 22, duration: 2 },
          { pitch: 'B3', step: 24, duration: 4 },
          { pitch: 'G3', step: 28, duration: 4 },
        ]
      },
      {
        type: 'sawtooth',
        volume: 0.12,
        filter: 700,
        notes: [
          { pitch: 'C3', step: 0, duration: 2 },
          { pitch: 'G2', step: 2, duration: 2 },
          { pitch: 'C3', step: 4, duration: 2 },
          { pitch: 'G2', step: 6, duration: 2 },
          { pitch: 'C3', step: 8, duration: 2 },
          { pitch: 'G2', step: 10, duration: 2 },
          { pitch: 'C3', step: 12, duration: 4 },

          { pitch: 'F2', step: 16, duration: 2 },
          { pitch: 'C3', step: 18, duration: 2 },
          { pitch: 'F2', step: 20, duration: 2 },
          { pitch: 'A2', step: 22, duration: 2 },
          { pitch: 'G2', step: 24, duration: 4 },
          { pitch: 'C3', step: 28, duration: 4 },
        ]
      }
    ]
  },

  // Quagmire Cave: Mysterious dungeon ambience
  cave: {
    tempo: 84,
    length: 32,
    voices: [
      {
        type: 'sine',
        volume: 0.22,
        filter: 1200,
        notes: [
          { pitch: 'D3', step: 0, duration: 4 },
          { pitch: 'F3', step: 4, duration: 4 },
          { pitch: 'Ab3', step: 8, duration: 4 },
          { pitch: 'G3', step: 12, duration: 4 },

          { pitch: 'D3', step: 16, duration: 4 },
          { pitch: 'Eb3', step: 20, duration: 4 },
          { pitch: 'Db3', step: 24, duration: 4 },
          { pitch: 'C3', step: 28, duration: 4 },
        ]
      },
      {
        type: 'triangle',
        volume: 0.16,
        filter: 800,
        notes: [
          { pitch: 'D2', step: 0, duration: 8 },
          { pitch: 'Ab2', step: 8, duration: 8 },
          { pitch: 'D2', step: 16, duration: 8 },
          { pitch: 'Db2', step: 24, duration: 8 },
        ]
      }
    ]
  },

  // Battle Theme: Intense, driving DQ battle
  battle: {
    tempo: 144,
    length: 32,
    voices: [
      {
        type: 'sawtooth',
        volume: 0.26,
        filter: 3000,
        notes: [
          { pitch: 'D4', step: 0, duration: 1 },
          { pitch: 'D4', step: 1, duration: 1 },
          { pitch: 'F4', step: 2, duration: 1 },
          { pitch: 'G#4', step: 3, duration: 1 },
          { pitch: 'A4', step: 4, duration: 2 },
          { pitch: 'F4', step: 6, duration: 2 },
          { pitch: 'D4', step: 8, duration: 4 },

          { pitch: 'G4', step: 12, duration: 2 },
          { pitch: 'F4', step: 14, duration: 2 },
          { pitch: 'E4', step: 16, duration: 2 },
          { pitch: 'F4', step: 18, duration: 2 },
          { pitch: 'D4', step: 20, duration: 4 },

          { pitch: 'A4', step: 24, duration: 2 },
          { pitch: 'C5', step: 26, duration: 2 },
          { pitch: 'D5', step: 28, duration: 4 },
        ]
      },
      {
        type: 'square',
        volume: 0.20,
        filter: 900,
        notes: [
          // Driving 16th/8th bassline
          { pitch: 'D2', step: 0, duration: 1 },
          { pitch: 'D2', step: 1, duration: 1 },
          { pitch: 'D3', step: 2, duration: 1 },
          { pitch: 'D2', step: 3, duration: 1 },
          { pitch: 'D2', step: 4, duration: 1 },
          { pitch: 'D2', step: 5, duration: 1 },
          { pitch: 'F2', step: 6, duration: 1 },
          { pitch: 'G2', step: 7, duration: 1 },

          { pitch: 'D2', step: 8, duration: 1 },
          { pitch: 'D2', step: 9, duration: 1 },
          { pitch: 'D3', step: 10, duration: 1 },
          { pitch: 'D2', step: 11, duration: 1 },
          { pitch: 'C3', step: 12, duration: 2 },
          { pitch: 'A2', step: 14, duration: 2 },

          { pitch: 'Bb2', step: 16, duration: 2 },
          { pitch: 'C3', step: 18, duration: 2 },
          { pitch: 'D2', step: 20, duration: 4 },

          { pitch: 'F2', step: 24, duration: 2 },
          { pitch: 'G2', step: 26, duration: 2 },
          { pitch: 'A2', step: 28, duration: 4 },
        ]
      }
    ]
  }
};

export const musicManager = new MusicManager();
