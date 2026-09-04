// Interactive Fairy Flute Musical Instrument
import { soundEngine } from '../audio/synth.js';

export class FairyFluteInstrument {
  constructor(game) {
    this.game = game;
    this.playedNotes = [];
    this.secretMelody = ['E5', 'G5', 'A5', 'E5'];

    this.noteFrequencies = {
      C5: 523.25,
      D5: 587.33,
      E5: 659.25,
      G5: 783.99,
      A5: 880.00
    };
  }

  playNote(noteName) {
    const freq = this.noteFrequencies[noteName];
    if (freq) {
      soundEngine.playFluteTone(freq);
      this.playedNotes.push(noteName);
      if (this.playedNotes.length > 4) {
        this.playedNotes.shift();
      }

      // Check if matches secret melody
      if (this.checkSecretMelody()) {
        setTimeout(() => {
          soundEngine.playSFX('heal_spell');
          this.game.player.stats.hp = Math.min(this.game.player.stats.maxHp, this.game.player.stats.hp + 12);
          if (this.game.ui) {
            this.game.ui.showToast('♪ The ancient Fairy Song echoes through Alefgard! Restored 12 HP! ♪');
            this.game.ui.updateHUD();
          }
        }, 400);
      }
    }
  }

  checkSecretMelody() {
    if (this.playedNotes.length < 4) return false;
    for (let i = 0; i < 4; i++) {
      if (this.playedNotes[i] !== this.secretMelody[i]) return false;
    }
    return true;
  }
}
