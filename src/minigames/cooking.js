// Campfire Resting & Herb Cooking / Crafting System
import { soundEngine } from '../audio/synth.js';

export class CampfireSystem {
  constructor(game) {
    this.game = game;
  }

  rest(targetTimeFraction) {
    const player = this.game.player;
    // Fully restore HP & MP
    player.stats.hp = player.stats.maxHp;
    player.stats.mp = player.stats.maxMp;

    // Fast-forward sky to selected time of day
    if (this.game.sky) {
      this.game.sky.setTime(targetTimeFraction);
    }

    soundEngine.playSFX('heal_spell');
    if (this.game.ui) {
      this.game.ui.showToast('Rested at the campfire. HP and MP are fully restored!');
      this.game.ui.updateHUD();
    }
  }

  brewElixir() {
    const player = this.game.player;
    if (player.inventory.herbs < 2) {
      return { success: false, message: 'Thou needst at least 2 Medicinal Herbs to brew an Elixir of Alefgard!' };
    }

    player.inventory.herbs -= 2;
    // Brew potent Elixir (instantly restores 60 HP and 15 MP)
    player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + 60);
    player.stats.mp = Math.min(player.stats.maxMp, player.stats.mp + 15);

    soundEngine.playSFX('chest_open');
    return {
      success: true,
      message: 'Brewed a steaming Elixir of Alefgard! Restored 60 HP and 15 MP!'
    };
  }
}
