// Authentic NES 2A03 Chiptune Music Engine for Dragon Warrior
// Dual Pulse (Square) + Triangle Bass multi-channel arrangements inspired by Koichi Sugiyama

import { soundEngine } from './synth.js';

class MusicManager {
  constructor() {
    this.currentTrack = null;
    this.isPlaying = false;
    this.loopTimeout = null;
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
    this.scheduleTrackLoop(trackName);
  }

  scheduleTrackLoop(trackName) {
    if (!this.isPlaying || this.currentTrack !== trackName) return;

    const track = TRACKS[trackName];
    if (!track) return;

    const tempo = track.tempo || 120;
    const beatSec = 60 / tempo;
    const stepSec = beatSec / 4; // 16th note step
    const ctx = soundEngine.ctx;
    if (!ctx) return;

    const startTime = ctx.currentTime + 0.04;
    const maxSteps = track.length || 32;

    if (track.voices) {
      track.voices.forEach(voice => {
        voice.notes.forEach(noteItem => {
          const noteStart = startTime + noteItem.step * stepSec;
          const duration = (noteItem.duration || 1) * stepSec;
          const freq = soundEngine.noteToFreq(noteItem.pitch);
          if (freq > 20) {
            const osc = soundEngine.playAPUNote(
              freq,
              voice.channel || 'square',
              duration * 0.92,
              noteStart,
              voice.volume || 0.18
            );
            if (osc) this.activeVoiceNodes.push(osc);
          }
        });
      });
    }

    const totalDurationSec = maxSteps * stepSec;
    this.loopTimeout = setTimeout(() => {
      this.activeVoiceNodes = [];
      if (this.isPlaying && this.currentTrack === trackName) {
        this.scheduleTrackLoop(trackName);
      }
    }, Math.max(50, totalDurationSec * 1000 - 45));
  }
}

const TRACKS = {
  // Title / Overture March
  title: {
    tempo: 112,
    length: 32,
    voices: [
      {
        channel: 'square',
        volume: 0.18,
        notes: [
          { pitch: 'Bb3', step: 0, duration: 2 },
          { pitch: 'Eb4', step: 2, duration: 4 },
          { pitch: 'F4', step: 6, duration: 2 },
          { pitch: 'G4', step: 8, duration: 2 },
          { pitch: 'Ab4', step: 10, duration: 2 },
          { pitch: 'Bb4', step: 12, duration: 4 },
          { pitch: 'G4', step: 16, duration: 3 },
          { pitch: 'Eb4', step: 19, duration: 1 },
          { pitch: 'F4', step: 20, duration: 4 },
          { pitch: 'D4', step: 24, duration: 4 },
          { pitch: 'Eb4', step: 28, duration: 4 },
        ],
      },
      {
        channel: 'triangle',
        volume: 0.22,
        notes: [
          { pitch: 'Eb2', step: 0, duration: 4 },
          { pitch: 'Bb2', step: 4, duration: 4 },
          { pitch: 'Eb3', step: 8, duration: 4 },
          { pitch: 'G2', step: 12, duration: 4 },
          { pitch: 'Ab2', step: 16, duration: 4 },
          { pitch: 'Bb2', step: 20, duration: 4 },
          { pitch: 'Bb2', step: 24, duration: 4 },
          { pitch: 'Eb2', step: 28, duration: 4 },
        ],
      },
    ],
  },

  // Tantegel Castle (Chateau Ladutorm)
  castle: {
    tempo: 96,
    length: 32,
    voices: [
      {
        channel: 'square',
        volume: 0.17,
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
        ],
      },
      {
        channel: 'square',
        volume: 0.11,
        notes: [
          { pitch: 'E3', step: 0, duration: 4 },
          { pitch: 'C4', step: 4, duration: 4 },
          { pitch: 'C4', step: 8, duration: 2 },
          { pitch: 'D4', step: 10, duration: 2 },
          { pitch: 'E4', step: 12, duration: 4 },
          { pitch: 'F4', step: 16, duration: 4 },
          { pitch: 'E4', step: 20, duration: 4 },
          { pitch: 'D4', step: 24, duration: 4 },
          { pitch: 'C4', step: 28, duration: 4 },
        ],
      },
      {
        channel: 'triangle',
        volume: 0.22,
        notes: [
          { pitch: 'C3', step: 0, duration: 4 },
          { pitch: 'E3', step: 4, duration: 4 },
          { pitch: 'G3', step: 8, duration: 4 },
          { pitch: 'C3', step: 12, duration: 4 },
          { pitch: 'F3', step: 16, duration: 4 },
          { pitch: 'A3', step: 20, duration: 4 },
          { pitch: 'G3', step: 24, duration: 4 },
          { pitch: 'C3', step: 28, duration: 4 },
        ],
      },
    ],
  },

  // Town Theme (People)
  town: {
    tempo: 108,
    length: 32,
    voices: [
      {
        channel: 'square',
        volume: 0.16,
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
        ],
      },
      {
        channel: 'triangle',
        volume: 0.21,
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
        ],
      },
    ],
  },

  // Unknown World (Overworld)
  overworld: {
    tempo: 112,
    length: 32,
    voices: [
      {
        channel: 'square',
        volume: 0.17,
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
        ],
      },
      {
        channel: 'square',
        volume: 0.10,
        notes: [
          { pitch: 'B3', step: 0, duration: 2 },
          { pitch: 'D4', step: 2, duration: 2 },
          { pitch: 'F#4', step: 4, duration: 2 },
          { pitch: 'G4', step: 6, duration: 4 },
          { pitch: 'G4', step: 10, duration: 2 },
          { pitch: 'F#4', step: 12, duration: 2 },
          { pitch: 'E4', step: 14, duration: 2 },
          { pitch: 'C4', step: 16, duration: 4 },
          { pitch: 'E4', step: 20, duration: 4 },
          { pitch: 'B3', step: 24, duration: 4 },
          { pitch: 'F#4', step: 28, duration: 4 },
        ],
      },
      {
        channel: 'triangle',
        volume: 0.22,
        notes: [
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
          { pitch: 'D3', step: 24, duration: 4 },
          { pitch: 'D2', step: 28, duration: 4 },
        ],
      },
    ],
  },

  // Dungeon Theme (Moody Descending Cavern)
  cave: {
    tempo: 84,
    length: 32,
    voices: [
      {
        channel: 'square',
        volume: 0.14,
        notes: [
          { pitch: 'D3', step: 0, duration: 4 },
          { pitch: 'F3', step: 4, duration: 4 },
          { pitch: 'Ab3', step: 8, duration: 4 },
          { pitch: 'G3', step: 12, duration: 4 },
          { pitch: 'D3', step: 16, duration: 4 },
          { pitch: 'Eb3', step: 20, duration: 4 },
          { pitch: 'Db3', step: 24, duration: 4 },
          { pitch: 'C3', step: 28, duration: 4 },
        ],
      },
      {
        channel: 'triangle',
        volume: 0.22,
        notes: [
          { pitch: 'D2', step: 0, duration: 8 },
          { pitch: 'Ab2', step: 8, duration: 8 },
          { pitch: 'D2', step: 16, duration: 8 },
          { pitch: 'C2', step: 24, duration: 8 },
        ],
      },
    ],
  },

  // Grueling Fight (Battle Theme)
  battle: {
    tempo: 148,
    length: 32,
    voices: [
      {
        channel: 'square',
        volume: 0.18,
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
        ],
      },
      {
        channel: 'triangle',
        volume: 0.23,
        notes: [
          { pitch: 'D2', step: 0, duration: 1 },
          { pitch: 'D2', step: 1, duration: 1 },
          { pitch: 'D3', step: 2, duration: 1 },
          { pitch: 'D2', step: 3, duration: 1 },
          { pitch: 'D2', step: 4, duration: 1 },
          { pitch: 'D2', step: 5, duration: 1 },
          { pitch: 'F2', step: 6, duration: 1 },
          { pitch: 'G2', step: 7, duration: 1 },
          { pitch: 'D2', step: 8, duration: 2 },
          { pitch: 'D3', step: 10, duration: 2 },
          { pitch: 'C3', step: 12, duration: 2 },
          { pitch: 'A2', step: 14, duration: 2 },
          { pitch: 'Bb2', step: 16, duration: 2 },
          { pitch: 'C3', step: 18, duration: 2 },
          { pitch: 'D2', step: 20, duration: 4 },
          { pitch: 'F2', step: 24, duration: 2 },
          { pitch: 'G2', step: 26, duration: 2 },
          { pitch: 'A2', step: 28, duration: 4 },
        ],
      },
    ],
  },

  // Dragonlord Boss Theme
  dragonlord: {
    tempo: 156,
    length: 32,
    voices: [
      {
        channel: 'square',
        volume: 0.19,
        notes: [
          { pitch: 'E4', step: 0, duration: 2 },
          { pitch: 'G4', step: 2, duration: 2 },
          { pitch: 'Bb4', step: 4, duration: 2 },
          { pitch: 'A4', step: 6, duration: 2 },
          { pitch: 'G4', step: 8, duration: 2 },
          { pitch: 'F#4', step: 10, duration: 2 },
          { pitch: 'E4', step: 12, duration: 4 },
          { pitch: 'Eb4', step: 16, duration: 2 },
          { pitch: 'F#4', step: 18, duration: 2 },
          { pitch: 'A4', step: 20, duration: 2 },
          { pitch: 'C5', step: 22, duration: 2 },
          { pitch: 'B4', step: 24, duration: 4 },
          { pitch: 'E5', step: 28, duration: 4 },
        ],
      },
      {
        channel: 'triangle',
        volume: 0.24,
        notes: [
          { pitch: 'E2', step: 0, duration: 2 },
          { pitch: 'E3', step: 2, duration: 2 },
          { pitch: 'E2', step: 4, duration: 2 },
          { pitch: 'E3', step: 6, duration: 2 },
          { pitch: 'D2', step: 8, duration: 2 },
          { pitch: 'D3', step: 10, duration: 2 },
          { pitch: 'C2', step: 12, duration: 2 },
          { pitch: 'C3', step: 14, duration: 2 },
          { pitch: 'B2', step: 16, duration: 4 },
          { pitch: 'A2', step: 20, duration: 4 },
          { pitch: 'B2', step: 24, duration: 8 },
        ],
      },
    ],
  },

  // Victory / Finale Theme
  victory: {
    tempo: 108,
    length: 32,
    voices: [
      {
        channel: 'square',
        volume: 0.18,
        notes: [
          { pitch: 'C4', step: 0, duration: 2 },
          { pitch: 'E4', step: 2, duration: 2 },
          { pitch: 'G4', step: 4, duration: 4 },
          { pitch: 'C5', step: 8, duration: 4 },
          { pitch: 'B4', step: 12, duration: 2 },
          { pitch: 'A4', step: 14, duration: 2 },
          { pitch: 'G4', step: 16, duration: 4 },
          { pitch: 'F4', step: 20, duration: 2 },
          { pitch: 'E4', step: 22, duration: 2 },
          { pitch: 'D4', step: 24, duration: 4 },
          { pitch: 'C4', step: 28, duration: 4 },
        ],
      },
      {
        channel: 'triangle',
        volume: 0.22,
        notes: [
          { pitch: 'C3', step: 0, duration: 4 },
          { pitch: 'G2', step: 4, duration: 4 },
          { pitch: 'E3', step: 8, duration: 4 },
          { pitch: 'F3', step: 12, duration: 4 },
          { pitch: 'G3', step: 16, duration: 4 },
          { pitch: 'C3', step: 20, duration: 4 },
          { pitch: 'G2', step: 24, duration: 4 },
          { pitch: 'C3', step: 28, duration: 4 },
        ],
      },
    ],
  },
};

export const musicManager = new MusicManager();
