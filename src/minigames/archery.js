// Brecconary Slime Archery Range Mini-Game
import { soundEngine } from '../audio/synth.js';

export class SlimeArcheryMiniGame {
  constructor(game) {
    this.game = game;
    this.isActive = false;
    this.score = 0;
    this.timeLeft = 25;
    this.timerInterval = null;
    this.targets = [];
  }

  start() {
    this.isActive = true;
    this.score = 0;
    this.timeLeft = 25;
    soundEngine.playSFX('menu_select');

    if (this.game.ui) {
      this.game.ui.showArcheryModal(this);
    }

    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      if (this.game.ui) {
        this.game.ui.updateArcheryTimer(this.timeLeft, this.score);
      }
      if (this.timeLeft <= 0) {
        this.finish();
      }
    }, 1000);
  }

  shootTarget(targetIndex, points) {
    if (!this.isActive) return;
    this.score += points;
    soundEngine.playSFX('sword_attack');

    if (this.game.ui) {
      this.game.ui.updateArcheryTimer(this.timeLeft, this.score);
      this.game.ui.triggerTargetHitAnim(targetIndex);
    }
  }

  finish() {
    this.isActive = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    const goldWon = Math.floor(this.score * 2.5);
    this.game.player.stats.gold += goldWon;
    soundEngine.playSFX('victory');

    if (this.game.ui) {
      this.game.ui.showArcheryResult(this.score, goldWon);
    }
  }
}
