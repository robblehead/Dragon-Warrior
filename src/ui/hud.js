// Dragon Warrior 3D: Retro-Modern Cel-Shaded HUD, Dialogue System, Modals & Menus
import * as THREE from 'three';
import { soundEngine } from '../audio/synth.js';

export class GameUI {
  constructor(game) {
    this.game = game;
    this.typewriterTimer = null;
    this.currentDialogueQueue = [];
    this.dialogueCallback = null;

    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    this.container = document.getElementById('ui-container');
  }

  bindEvents() {
    // Audio toggle
    const audioBtn = document.getElementById('btn-audio-toggle');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        const isMuted = soundEngine.toggleMute();
        audioBtn.textContent = isMuted ? '🔇 Audio: OFF' : '🔊 Audio: ON';
      });
    }

    // Dialogue box click to advance
    const dialogueBox = document.getElementById('dialogue-box');
    if (dialogueBox) {
      dialogueBox.addEventListener('click', () => {
        this.advanceDialogue();
      });
    }

    // Keyboard support for dialogue & menu
    window.addEventListener('keydown', (e) => {
      if (e.key === 'e' || e.key === 'E' || e.key === 'Enter' || e.key === ' ') {
        if (this.isDialogueActive()) {
          this.advanceDialogue();
        }
      }
      if (e.key === 'Tab' || e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        this.toggleInventoryModal();
      }
    });
  }

  updateHUD() {
    const p = this.game.player;
    if (!p) return;

    // Health & Mana
    const hpEl = document.getElementById('hud-hp-val');
    const hpBar = document.getElementById('hud-hp-bar');
    if (hpEl && hpBar) {
      hpEl.textContent = `${p.stats.hp} / ${p.stats.maxHp}`;
      const hpPct = Math.max(0, Math.min(100, (p.stats.hp / p.stats.maxHp) * 100));
      hpBar.style.width = `${hpPct}%`;
      hpBar.style.backgroundColor = hpPct < 25 ? '#ef4444' : (hpPct < 50 ? '#f59e0b' : '#22c55e');
    }

    const mpEl = document.getElementById('hud-mp-val');
    const mpBar = document.getElementById('hud-mp-bar');
    if (mpEl && mpBar) {
      mpEl.textContent = `${p.stats.mp} / ${p.stats.maxMp}`;
      const mpPct = p.stats.maxMp > 0 ? (p.stats.mp / p.stats.maxMp) * 100 : 0;
      mpBar.style.width = `${mpPct}%`;
    }

    // Level, Gold, EXP
    const lvlEl = document.getElementById('hud-level');
    if (lvlEl) lvlEl.textContent = `LV ${p.stats.level}`;

    const goldEl = document.getElementById('hud-gold');
    if (goldEl) goldEl.textContent = `${p.stats.gold} G`;

    const expEl = document.getElementById('hud-exp');
    if (expEl) expEl.textContent = `EXP: ${p.stats.exp} / ${p.stats.nextExp}`;

    // Weapon & Armor
    const gearEl = document.getElementById('hud-gear');
    if (gearEl) gearEl.textContent = `${p.stats.weapon} | ${p.stats.armor}`;

    // Compass update (Rotate toward north or Gwaelin's Love target)
    const compassNeedle = document.getElementById('compass-needle');
    if (compassNeedle && this.game.camera) {
      const dir = new THREE.Vector3();
      this.game.camera.getWorldDirection(dir);
      const angle = Math.atan2(dir.x, dir.z);
      compassNeedle.style.transform = `rotate(${-angle}rad)`;
    }

    // Day/Night time indicator
    const timeIcon = document.getElementById('hud-time-icon');
    if (timeIcon && this.game.sky) {
      const t = this.game.sky.timeOfDay;
      if (t >= 0.22 && t < 0.28) timeIcon.textContent = '🌅 Dawn';
      else if (t >= 0.28 && t < 0.70) timeIcon.textContent = '☀️ Day';
      else if (t >= 0.70 && t < 0.78) timeIcon.textContent = '🌇 Sunset';
      else timeIcon.textContent = '🌙 Night';
    }
  }

  // --- Dialogue System ---
  showDialogue(speaker, lines, callback = null) {
    this.currentDialogueQueue = [...lines];
    this.dialogueCallback = callback;

    const box = document.getElementById('dialogue-box');
    const speakerEl = document.getElementById('dialogue-speaker');
    if (box && speakerEl) {
      box.classList.remove('hidden');
      speakerEl.textContent = speaker;
      this.displayNextDialogueLine();
    }
  }

  displayNextDialogueLine() {
    if (this.currentDialogueQueue.length === 0) {
      this.hideDialogue();
      if (this.dialogueCallback) {
        this.dialogueCallback();
        this.dialogueCallback = null;
      }
      return;
    }

    const line = this.currentDialogueQueue.shift();
    const textEl = document.getElementById('dialogue-text');
    if (!textEl) return;

    if (this.typewriterTimer) clearInterval(this.typewriterTimer);
    textEl.textContent = '';

    let charIdx = 0;
    this.typewriterTimer = setInterval(() => {
      if (charIdx < line.length) {
        textEl.textContent += line[charIdx];
        if (charIdx % 3 === 0) soundEngine.playSFX('text_beep');
        charIdx++;
      } else {
        clearInterval(this.typewriterTimer);
        this.typewriterTimer = null;
      }
    }, 24);
  }

  advanceDialogue() {
    if (this.typewriterTimer) {
      // If still typing, complete current line instantly
      clearInterval(this.typewriterTimer);
      this.typewriterTimer = null;
      const textEl = document.getElementById('dialogue-text');
      // Already filled or advance
    }
    soundEngine.playSFX('menu_select');
    this.displayNextDialogueLine();
  }

  hideDialogue() {
    const box = document.getElementById('dialogue-box');
    if (box) box.classList.add('hidden');
    if (this.typewriterTimer) clearInterval(this.typewriterTimer);
  }

  isDialogueActive() {
    const box = document.getElementById('dialogue-box');
    return box && !box.classList.contains('hidden');
  }

  // --- Interaction Prompt Floating Widget ---
  showInteractionPrompt(text) {
    const prompt = document.getElementById('interaction-prompt');
    if (prompt) {
      prompt.classList.remove('hidden');
      prompt.innerHTML = `<span class="key-badge">E</span> ${text}`;
    }
  }

  hideInteractionPrompt() {
    const prompt = document.getElementById('interaction-prompt');
    if (prompt) prompt.classList.add('hidden');
  }

  // --- Toast Notifications ---
  showToast(message) {
    const toast = document.getElementById('toast-notification');
    if (toast) {
      toast.textContent = message;
      toast.classList.remove('hidden');
      toast.classList.add('show');

      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.classList.add('hidden'), 400);
      }, 3500);
    }
  }

  // --- Combat UI ---
  showCombatUI(monster) {
    const cUI = document.getElementById('combat-overlay');
    if (cUI) {
      cUI.classList.remove('hidden');
      document.getElementById('combat-enemy-name').textContent = monster.name;
      this.updateCombatEnemyHP(monster);
      document.getElementById('combat-log-content').innerHTML = '';
      this.closeCombatSubmenus();
      this.renderCombatSpellList();
      this.renderCombatItemList();
    }
  }

  hideCombatUI() {
    const cUI = document.getElementById('combat-overlay');
    if (cUI) cUI.classList.add('hidden');
    this.closeCombatSubmenus();
  }

  updateCombatEnemyHP(monster) {
    if (!monster) return;
    const hpText = document.getElementById('combat-enemy-hp');
    if (hpText) {
      const cur = Math.max(0, monster.currentHp);
      hpText.textContent = `HP: ${cur} / ${monster.maxHp}`;
    }
    const hpBar = document.getElementById('combat-enemy-hp-bar');
    if (hpBar) {
      const pct = Math.max(0, Math.min(100, (monster.currentHp / monster.maxHp) * 100));
      hpBar.style.width = `${pct}%`;
      if (pct < 30) {
        hpBar.classList.add('danger');
      } else {
        hpBar.classList.remove('danger');
      }
    }
  }

  showMonsterDamagePopup(dmg, isCritical) {
    const container = document.getElementById('combat-monster-container');
    if (!container) return;
    const popup = document.createElement('div');
    popup.className = `damage-popup ${isCritical ? 'crit' : ''}`;
    popup.textContent = `-${dmg}`;
    popup.style.left = `${45 + (Math.random() - 0.5) * 25}%`;
    popup.style.top = `${25 + (Math.random() - 0.5) * 15}%`;
    container.appendChild(popup);
    setTimeout(() => popup.remove(), 1100);
  }

  showPlayerDamagePopup(text, isHeal) {
    const hud = document.querySelector('.hero-badge');
    if (!hud) return;
    const popup = document.createElement('div');
    popup.className = `damage-popup ${isHeal ? 'heal' : ''}`;
    popup.textContent = text;
    popup.style.left = '45px';
    popup.style.top = '12px';
    hud.appendChild(popup);
    setTimeout(() => popup.remove(), 1100);
  }

  toggleCombatSpellMenu() {
    if (!this.game.combat.inCombat || !this.game.combat.isPlayerTurn) return;
    const spellMenu = document.getElementById('combat-spell-menu');
    const itemMenu = document.getElementById('combat-item-menu');
    if (!spellMenu) return;

    if (itemMenu) itemMenu.classList.add('hidden');

    if (spellMenu.classList.contains('hidden')) {
      this.renderCombatSpellList();
      spellMenu.classList.remove('hidden');
      soundEngine.playSFX('menu_select');
    } else {
      spellMenu.classList.add('hidden');
      soundEngine.playSFX('menu_move');
    }
  }

  toggleCombatItemMenu() {
    if (!this.game.combat.inCombat || !this.game.combat.isPlayerTurn) return;
    const spellMenu = document.getElementById('combat-spell-menu');
    const itemMenu = document.getElementById('combat-item-menu');
    if (!itemMenu) return;

    if (spellMenu) spellMenu.classList.add('hidden');

    if (itemMenu.classList.contains('hidden')) {
      this.renderCombatItemList();
      itemMenu.classList.remove('hidden');
      soundEngine.playSFX('menu_select');
    } else {
      itemMenu.classList.add('hidden');
      soundEngine.playSFX('menu_move');
    }
  }

  closeCombatSubmenus() {
    const spellMenu = document.getElementById('combat-spell-menu');
    const itemMenu = document.getElementById('combat-item-menu');
    let closed = false;
    if (spellMenu && !spellMenu.classList.contains('hidden')) {
      spellMenu.classList.add('hidden');
      closed = true;
    }
    if (itemMenu && !itemMenu.classList.contains('hidden')) {
      itemMenu.classList.add('hidden');
      closed = true;
    }
    return closed;
  }

  addCombatLog(text) {
    const log = document.getElementById('combat-log-content');
    if (log) {
      const p = document.createElement('div');
      p.className = 'combat-log-entry';
      p.textContent = `▶ ${text}`;
      log.appendChild(p);
      log.scrollTop = log.scrollHeight;
    }
  }

  triggerMonsterHitEffect(isCritical) {
    const container = document.getElementById('combat-monster-container');
    if (container) {
      container.classList.add(isCritical ? 'crit-flash' : 'hit-flash');
      setTimeout(() => {
        container.classList.remove('crit-flash', 'hit-flash');
      }, 400);
    }
  }

  triggerPlayerDamageFlash() {
    const flash = document.getElementById('damage-screen-flash');
    if (flash) {
      flash.classList.remove('hidden');
      flash.classList.add('flash-active');
      setTimeout(() => {
        flash.classList.remove('flash-active');
        flash.classList.add('hidden');
      }, 300);
    }
  }

  renderCombatSpellList() {
    const list = document.getElementById('combat-spell-menu');
    if (!list) return;
    list.innerHTML = '';
    const p = this.game.player;

    const spellCosts = {
      HEAL: 3,
      HURT: 2,
      SLEEP: 2,
      RADIANT: 3,
      STOPSPELL: 2,
      HEALMORE: 8,
      HURTMORE: 5
    };

    if (p.spells.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'menu-empty';
      emptyMsg.textContent = 'No spells learned yet!';
      list.appendChild(emptyMsg);
    } else {
      p.spells.forEach(spell => {
        const cost = spellCosts[spell] || 0;
        const canAfford = p.stats.mp >= cost;
        const btn = document.createElement('button');
        btn.className = 'dw-menu-btn';
        btn.textContent = `${spell} (${cost} MP)`;
        if (!canAfford) {
          btn.style.opacity = '0.5';
          btn.style.cursor = 'not-allowed';
          btn.onclick = () => {
            soundEngine.playSFX('menu_move');
            this.showToast(`Requires ${cost} MP! (Thou hast ${p.stats.mp})`);
          };
        } else {
          btn.onclick = () => {
            this.closeCombatSubmenus();
            this.game.combat.executeSpell(spell);
          };
        }
        list.appendChild(btn);
      });
    }

    // Always provide a Back button
    const backBtn = document.createElement('button');
    backBtn.className = 'dw-menu-btn';
    backBtn.style.color = '#f87171';
    backBtn.textContent = '◀ Back';
    backBtn.onclick = () => {
      soundEngine.playSFX('menu_move');
      this.closeCombatSubmenus();
    };
    list.appendChild(backBtn);
  }

  renderCombatItemList() {
    const list = document.getElementById('combat-item-menu');
    if (!list) return;
    list.innerHTML = '';
    const p = this.game.player;
    let hasItems = false;

    if (p.inventory.herbs > 0) {
      hasItems = true;
      const btn = document.createElement('button');
      btn.className = 'dw-menu-btn';
      btn.textContent = `Medicinal Herb (x${p.inventory.herbs})`;
      btn.onclick = () => {
        this.closeCombatSubmenus();
        this.game.combat.executeItem('herb');
      };
      list.appendChild(btn);
    }

    if (p.inventory.fairyFlute) {
      hasItems = true;
      const btn = document.createElement('button');
      btn.className = 'dw-menu-btn';
      btn.textContent = 'Fairy Flute';
      btn.onclick = () => {
        this.closeCombatSubmenus();
        this.game.combat.executeItem('flute');
      };
      list.appendChild(btn);
    }

    if (p.inventory.torches > 0) {
      hasItems = true;
      const btn = document.createElement('button');
      btn.className = 'dw-menu-btn';
      btn.textContent = `Throw Torch (x${p.inventory.torches})`;
      btn.onclick = () => {
        this.closeCombatSubmenus();
        this.game.combat.executeItem('torch');
      };
      list.appendChild(btn);
    }

    if (!hasItems) {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'menu-empty';
      emptyMsg.textContent = 'No usable items in bag!';
      list.appendChild(emptyMsg);
    }

    // Always provide a Back button
    const backBtn = document.createElement('button');
    backBtn.className = 'dw-menu-btn';
    backBtn.style.color = '#f87171';
    backBtn.textContent = '◀ Back';
    backBtn.onclick = () => {
      soundEngine.playSFX('menu_move');
      this.closeCombatSubmenus();
    };
    list.appendChild(backBtn);
  }

  // --- Modals (Shop, Inn, Mini-games, Inventory) ---
  showShopModal(shopType) {
    const modal = document.getElementById('shop-modal');
    const title = document.getElementById('shop-title');
    const list = document.getElementById('shop-items-list');
    if (!modal || !list) return;

    modal.classList.remove('hidden');
    list.innerHTML = '';

    const p = this.game.player;

    if (shopType === 'weapon') {
      title.textContent = 'Garrick’s Armory & Weapons';
      const wares = [
        { id: 'Club', name: 'Oak Club', price: 60, type: 'weapon', atk: 4 },
        { id: 'Copper Sword', name: 'Copper Sword', price: 180, type: 'weapon', atk: 10 },
        { id: 'Broad Sword', name: 'Broad Sword', price: 560, type: 'weapon', atk: 20 },
        { id: 'Half Plate', name: 'Half Plate Armor', price: 300, type: 'armor', def: 12 },
        { id: 'Silver Shield', name: 'Silver Shield', price: 800, type: 'shield', def: 16 }
      ];

      wares.forEach(item => {
        const row = document.createElement('div');
        row.className = 'shop-row';
        row.innerHTML = `
          <div class="shop-item-name">${item.name} (${item.atk ? '+' + item.atk + ' ATK' : '+' + item.def + ' DEF'})</div>
          <div class="shop-item-price">${item.price} G</div>
        `;
        const buyBtn = document.createElement('button');
        buyBtn.className = 'dw-btn-small';
        buyBtn.textContent = 'Buy';
        buyBtn.onclick = () => {
          if (p.stats.gold >= item.price) {
            p.stats.gold -= item.price;
            soundEngine.playSFX('chest_open');
            if (item.type === 'weapon') {
              p.stats.weapon = item.id;
              p.stats.attack = 4 + item.atk;
            } else if (item.type === 'armor') {
              p.stats.armor = item.id;
              p.stats.defense = 4 + item.def;
            }
            this.updateHUD();
            this.showToast(`Purchased and equipped ${item.name}!`);
          } else {
            soundEngine.playSFX('menu_move');
            this.showToast("Thou dost not have enough gold coins!");
          }
        };
        row.appendChild(buyBtn);
        list.appendChild(row);
      });
    } else {
      title.textContent = 'Fiona’s Alchemical Dispensary';
      const wares = [
        { id: 'herb', name: 'Medicinal Herb (restores 30 HP)', price: 24 },
        { id: 'torch', name: 'Spruce Torch (lights dark caves)', price: 8 },
        { id: 'key', name: 'Magic Key (unlocks royal doors)', price: 45 }
      ];

      wares.forEach(item => {
        const row = document.createElement('div');
        row.className = 'shop-row';
        row.innerHTML = `
          <div class="shop-item-name">${item.name}</div>
          <div class="shop-item-price">${item.price} G</div>
        `;
        const buyBtn = document.createElement('button');
        buyBtn.className = 'dw-btn-small';
        buyBtn.textContent = 'Buy';
        buyBtn.onclick = () => {
          if (p.stats.gold >= item.price) {
            p.stats.gold -= item.price;
            soundEngine.playSFX('chest_open');
            if (item.id === 'herb') p.inventory.herbs++;
            if (item.id === 'torch') {
              p.inventory.torches++;
              p.setTorchEquipped(true);
            }
            if (item.id === 'key') p.inventory.magicKeys++;
            this.updateHUD();
            this.showToast(`Purchased ${item.name}!`);
          } else {
            soundEngine.playSFX('menu_move');
            this.showToast("Thou dost not have enough gold coins!");
          }
        };
        row.appendChild(buyBtn);
        list.appendChild(row);
      });
    }
  }

  closeShopModal() {
    const modal = document.getElementById('shop-modal');
    if (modal) modal.classList.add('hidden');
    soundEngine.playSFX('menu_move');
  }

  showInnModal() {
    const modal = document.getElementById('inn-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
  }

  closeInnModal() {
    const modal = document.getElementById('inn-modal');
    if (modal) modal.classList.add('hidden');
    soundEngine.playSFX('menu_move');
  }

  confirmRestInn() {
    const p = this.game.player;
    if (p.stats.gold < 6) {
      soundEngine.playSFX('menu_move');
      this.showToast("Resting at the Inn requires 6 Gold Coins!");
      return;
    }
    p.stats.gold -= 6;
    p.stats.hp = p.stats.maxHp;
    p.stats.mp = p.stats.maxMp;
    this.closeInnModal();
    soundEngine.playSFX('heal_spell');
    if (this.game.sky) {
      this.game.sky.setTime(0.32); // Morning sun
    }
    this.updateHUD();
    this.showToast("Rested comfortably at the Inn! HP and MP are fully restored. Morning arrives!");
  }

  // --- Campfire Modal ---
  showCampfireModal() {
    const modal = document.getElementById('campfire-modal');
    if (modal) modal.classList.remove('hidden');
  }

  closeCampfireModal() {
    const modal = document.getElementById('campfire-modal');
    if (modal) modal.classList.add('hidden');
    soundEngine.playSFX('menu_move');
  }

  // --- Fairy Flute Modal ---
  showFluteModal() {
    const modal = document.getElementById('flute-modal');
    if (modal) modal.classList.remove('hidden');
  }

  closeFluteModal() {
    const modal = document.getElementById('flute-modal');
    if (modal) modal.classList.add('hidden');
    soundEngine.playSFX('menu_move');
  }

  // --- Lucky Lotto Modal ---
  showLottoModal() {
    const modal = document.getElementById('lotto-modal');
    if (modal) modal.classList.remove('hidden');
  }

  closeLottoModal() {
    const modal = document.getElementById('lotto-modal');
    if (modal) modal.classList.add('hidden');
    soundEngine.playSFX('menu_move');
  }

  // --- Slime Archery Modal ---
  showArcheryModal(archeryGame) {
    const modal = document.getElementById('archery-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    this.updateArcheryTimer(archeryGame.timeLeft, archeryGame.score);
  }

  updateArcheryTimer(timeLeft, score) {
    const tEl = document.getElementById('archery-timer');
    const sEl = document.getElementById('archery-score');
    if (tEl) tEl.textContent = `Time: ${timeLeft}s`;
    if (sEl) sEl.textContent = `Score: ${score}`;
  }

  triggerTargetHitAnim(index) {
    const targetEl = document.getElementById(`archery-target-${index}`);
    if (targetEl) {
      targetEl.classList.add('target-hit');
      setTimeout(() => targetEl.classList.remove('target-hit'), 300);
    }
  }

  showArcheryResult(score, goldWon) {
    const resultBox = document.getElementById('archery-result');
    if (resultBox) {
      resultBox.innerHTML = `
        <h3>Training Complete!</h3>
        <p>Final Score: <strong>${score}</strong></p>
        <p>Prize Awarded: <strong>+${goldWon} Gold Coins</strong>!</p>
        <button class="dw-btn" onclick="window.gameInstance.ui.closeArcheryModal()">Collect & Return</button>
      `;
      resultBox.classList.remove('hidden');
    }
  }

  closeArcheryModal() {
    const modal = document.getElementById('archery-modal');
    if (modal) modal.classList.add('hidden');
    const resultBox = document.getElementById('archery-result');
    if (resultBox) resultBox.classList.add('hidden');
    this.updateHUD();
  }

  // --- Inventory & Lore Modal ---
  toggleInventoryModal() {
    const modal = document.getElementById('inventory-modal');
    if (!modal) return;
    if (modal.classList.contains('hidden')) {
      this.renderInventory();
      modal.classList.remove('hidden');
      soundEngine.playSFX('menu_select');
    } else {
      modal.classList.add('hidden');
      soundEngine.playSFX('menu_move');
    }
  }

  renderInventory() {
    const p = this.game.player;
    const statsBox = document.getElementById('inv-stats');
    const itemsBox = document.getElementById('inv-items');
    const relicsBox = document.getElementById('inv-relics');

    if (statsBox) {
      statsBox.innerHTML = `
        <div><strong>Hero:</strong> ${p.stats.name} (LV ${p.stats.level})</div>
        <div><strong>HP:</strong> ${p.stats.hp} / ${p.stats.maxHp}</div>
        <div><strong>MP:</strong> ${p.stats.mp} / ${p.stats.maxMp}</div>
        <div><strong>Attack:</strong> ${p.stats.attack}</div>
        <div><strong>Defense:</strong> ${p.stats.defense}</div>
        <div><strong>Agility:</strong> ${p.stats.agility}</div>
        <div><strong>Gold:</strong> ${p.stats.gold} G</div>
        <div><strong>Weapon:</strong> ${p.stats.weapon}</div>
        <div><strong>Armor:</strong> ${p.stats.armor}</div>
      `;
    }

    if (itemsBox) {
      itemsBox.innerHTML = `
        <div class="inv-badge">Medicinal Herbs: ${p.inventory.herbs}</div>
        <div class="inv-badge">Torches: ${p.inventory.torches}</div>
        <div class="inv-badge">Magic Keys: ${p.inventory.magicKeys}</div>
      `;
    }

    if (relicsBox) {
      relicsBox.innerHTML = `
        <div class="relic-item ${p.inventory.sunstone ? 'found' : 'missing'}">☀️ Sunstone: ${p.inventory.sunstone ? 'Acquired' : 'Locked in Tantegel'}</div>
        <div class="relic-item ${p.inventory.staffOfRain ? 'found' : 'missing'}">🌧️ Staff of Rain: ${p.inventory.staffOfRain ? 'Acquired' : 'At Rain Shrine'}</div>
        <div class="relic-item ${p.inventory.rainbowDrop ? 'found' : 'missing'}">🌈 Rainbow Drop: ${p.inventory.rainbowDrop ? 'Forged' : 'Not yet combined'}</div>
        <div class="relic-item ${p.inventory.fairyFlute ? 'found' : 'missing'}">🎵 Fairy Flute: ${p.inventory.fairyFlute ? 'Unearthed' : 'Buried at Kol Spring'}</div>
        <div class="relic-item ${p.inventory.gwaelinLove ? 'found' : 'missing'}">💖 Gwaelin's Love: ${p.inventory.gwaelinLove ? 'Blessed' : 'Rescue Princess Gwaelin'}</div>
      `;
    }
  }

  closeAllModals() {
    const modalIds = [
      'shop-modal',
      'inn-modal',
      'campfire-modal',
      'lotto-modal',
      'flute-modal',
      'archery-modal',
      'inv-modal'
    ];
    let closed = false;
    modalIds.forEach(id => {
      const el = document.getElementById(id);
      if (el && !el.classList.contains('hidden')) {
        el.classList.add('hidden');
        closed = true;
      }
    });
    if (closed) soundEngine.playSFX('menu_move');
    return closed;
  }
}
