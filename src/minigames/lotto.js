// Brecconary Lucky Lotto & Casino Dice Mini-Game
import { soundEngine } from '../audio/synth.js';

export class LuckyLottoMiniGame {
  constructor(game) {
    this.game = game;
  }

  rollDice(betAmount) {
    const player = this.game.player;
    if (player.stats.gold < betAmount) {
      soundEngine.playSFX('menu_move');
      return { success: false, message: 'Thou dost not have enough gold!' };
    }

    player.stats.gold -= betAmount;
    soundEngine.playSFX('text_beep');

    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const sum = die1 + die2;

    let payout = 0;
    let title = '';

    if (die1 === die2 && die1 === 6) {
      // Double Sixes: Jackpot! (10x)
      payout = betAmount * 10;
      title = 'GRAND JACKPOT! Double Sixes!';
      soundEngine.playSFX('level_up');
    } else if (die1 === die2) {
      // Any other double: (4x)
      payout = betAmount * 4;
      title = `LUCKY DOUBLES! Two ${die1}s!`;
      soundEngine.playSFX('chest_open');
    } else if (sum === 7 || sum === 11) {
      // Natural 7 or 11: (2.5x)
      payout = Math.floor(betAmount * 2.5);
      title = `LUCKY STRIKE! Sum is ${sum}!`;
      soundEngine.playSFX('chest_open');
    } else if (sum >= 8) {
      // High roll: (1.5x)
      payout = Math.floor(betAmount * 1.5);
      title = `HIGH ROLL! Sum is ${sum}.`;
      soundEngine.playSFX('menu_select');
    } else {
      // Loss
      title = `Bad luck! Sum is ${sum}.`;
      soundEngine.playSFX('swamp_damage');
    }

    player.stats.gold += payout;

    return {
      success: true,
      die1,
      die2,
      sum,
      payout,
      title,
      currentGold: player.stats.gold
    };
  }
}
