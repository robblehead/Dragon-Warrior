// Authentic NES Dragon Warrior Windowed UI Controller
import { soundEngine } from '../audio/synth.js';
import { WEAPONS, ARMORS, SHIELDS, SPELL_COSTS } from '../entities/player.js';

export const FIELD_COMMANDS = [
  { id: 'talk',   label: 'TALK' },
  { id: 'spell',  label: 'SPELL' },
  { id: 'status', label: 'STATUS' },
  { id: 'item',   label: 'ITEM' },
  { id: 'stairs', label: 'STAIRS' },
  { id: 'door',   label: 'DOOR' },
  { id: 'search', label: 'SEARCH' },
  { id: 'take',   label: 'TAKE' },
];

export const COMBAT_COMMANDS = [
  { id: 'fight', label: 'FIGHT' },
  { id: 'spell', label: 'SPELL' },
  { id: 'run',   label: 'RUN' },
  { id: 'item',  label: 'ITEM' },
];

export class GameUI {
  constructor(game) {
    this.game = game;

    // UI state machine:
    // 'title' | 'none' | 'command' | 'status' | 'sub_menu' | 'combat_cmd' | 'combat_sub'
    this.mode = 'title';

    this.titleIndex = 0;
    this.titleItems = [];

    this.cmdIndex = 0;
    this.combatCmdIndex = 0;

    this.subIndex = 0;
    this.subTitle = '';
    this.subItems = [];
    this.subReturnMode = 'command';

    // Message queue state
    this.messageQueue = [];
    this.currentLine = '';
    this.charIdx = 0;
    this.typewriterTimer = null;
    this.messageActive = false;
    this.messageCallback = null;

    // Combat log lines
    this.combatLogLines = [];
    this.currentCombatMonster = null;

    this.bindDOMEvents();
  }

  bindDOMEvents() {
    if (typeof document === 'undefined') return;

    const msgWin = document.getElementById('message-window');
    if (msgWin) {
      msgWin.addEventListener('click', () => {
        if (this.messageActive && !this.game.combat.inCombat) {
          this.advanceMessage();
        }
      });
    }

    const audioBtn = document.getElementById('btn-audio-toggle');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        soundEngine.init();
        const muted = soundEngine.toggleMute();
        audioBtn.textContent = muted ? 'AUDIO: OFF' : 'AUDIO: ON';
      });
    }

    const saveBtn = document.getElementById('btn-save-game');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        this.game.saveGame();
      });
    }
  }

  // ==========================================================================
  // TITLE SCREEN
  // ==========================================================================
  showTitleScreen(hasSave) {
    this.mode = 'title';
    this.titleItems = hasSave
      ? [
          { id: 'continue', label: 'CONTINUE A QUEST' },
          { id: 'new',      label: 'BEGIN A NEW QUEST' },
        ]
      : [
          { id: 'new',      label: 'BEGIN A NEW QUEST' },
        ];
    this.titleIndex = 0;
    document.getElementById('title-screen')?.classList.remove('hidden');
    document.getElementById('status-box')?.classList.add('hidden');
    this.renderTitleOptions();
  }

  renderTitleOptions() {
    const container = document.getElementById('title-options');
    if (!container) return;
    container.innerHTML = '';
    this.titleItems.forEach((item, idx) => {
      const row = document.createElement('div');
      row.className = `sub-option-row ${idx === this.titleIndex ? 'selected' : ''}`;
      row.innerHTML = `<div class="sub-option-left"><span class="cursor-glyph">▶</span><span>${item.label}</span></div>`;
      row.onclick = () => {
        this.titleIndex = idx;
        this.confirmTitleSelection();
      };
      container.appendChild(row);
    });
  }

  confirmTitleSelection() {
    const chosen = this.titleItems[this.titleIndex];
    if (!chosen) return;
    soundEngine.init();
    soundEngine.resume();
    soundEngine.playSFX('menu_select');
    document.getElementById('title-screen')?.classList.add('hidden');
    document.getElementById('status-box')?.classList.remove('hidden');
    this.mode = 'none';
    if (chosen.id === 'continue') {
      this.game.loadSavedGame();
    } else {
      this.game.startNewGame();
    }
  }

  // ==========================================================================
  // STATUS BOX (Left HUD) & DETAILED STATUS WINDOW
  // ==========================================================================
  updateStatusWindow() {
    if (typeof document === 'undefined') return;
    const p = this.game.player;
    if (!p) return;

    const setTxt = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(v);
    };

    setTxt('status-name', p.stats.name);
    setTxt('stat-lv', p.stats.level);
    setTxt('stat-hp', p.stats.hp);
    setTxt('stat-mp', p.stats.mp);
    setTxt('stat-g', p.stats.gold);
    setTxt('stat-e', p.stats.exp);

    const isLow = p.stats.hp <= Math.ceil(p.stats.maxHp * 0.25);
    const box = document.getElementById('status-box');
    if (box) {
      box.classList.toggle('low-hp', isLow);
    }

    const loc = document.getElementById('location-label');
    if (loc && this.game.currentMap) {
      loc.textContent = this.game.currentMap.name.toUpperCase();
    }
  }

  openStatusDetail() {
    const p = this.game.player;
    const el = document.getElementById('status-detail-content');
    const win = document.getElementById('status-detail-window');
    if (!el || !win) return;

    const nextExpStr = p.stats.level >= 30 ? 'MAX' : p.stats.nextExp;
    const relics = [];
    if (p.inventory.sunstone) relics.push('SUNSTONE');
    if (p.inventory.staffOfRain) relics.push('STAFF OF RAIN');
    if (p.inventory.erdrickToken) relics.push("ERDRICK'S TOKEN");
    if (p.inventory.rainbowDrop) relics.push('RAINBOW DROP');
    if (p.inventory.silverHarp) relics.push('SILVER HARP');
    if (p.inventory.fairyFlute) relics.push('FAIRY FLUTE');
    if (p.inventory.gwaelinLove) relics.push("GWAELIN'S LOVE");

    el.innerHTML = `
      <div class="stat-row"><span>STRENGTH</span><span>${p.stats.strength}</span></div>
      <div class="stat-row"><span>AGILITY</span><span>${p.stats.agility}</span></div>
      <div class="stat-row"><span>MAX HP</span><span>${p.stats.maxHp}</span></div>
      <div class="stat-row"><span>MAX MP</span><span>${p.stats.maxMp}</span></div>
      <div class="stat-row"><span>ATTACK</span><span>${p.getAttackPower()}</span></div>
      <div class="stat-row"><span>DEFENSE</span><span>${p.getDefensePower()}</span></div>
      <div class="stat-row"><span>NEXT LV</span><span>${nextExpStr}</span></div>
      <div class="detail-divider"></div>
      <div class="stat-row"><span>WEAPON</span><span>${p.stats.weapon}</span></div>
      <div class="stat-row"><span>ARMOR</span><span>${p.stats.armor}</span></div>
      <div class="stat-row"><span>SHIELD</span><span>${p.stats.shield}</span></div>
      <div class="detail-divider"></div>
      <div style="font-size: 9px; color: #bcbcbc;">KEYS:${p.inventory.magicKeys} HERBS:${p.inventory.herbs}</div>
      ${relics.length ? `<div style="font-size: 8px; color: #f8b800; margin-top: 4px;">${relics.join(', ')}</div>` : ''}
    `;

    this.closeAllFieldWindows();
    win.classList.remove('hidden');
    this.mode = 'status';
  }

  // ==========================================================================
  // MAIN 2x4 COMMAND MENU
  // ==========================================================================
  openCommandMenu(defaultCommandId = 'talk') {
    const idx = FIELD_COMMANDS.findIndex(c => c.id === defaultCommandId);
    this.cmdIndex = idx >= 0 ? idx : 0;
    this.closeAllFieldWindows();
    document.getElementById('command-menu')?.classList.remove('hidden');
    this.mode = 'command';
    this.renderCommandMenu();
    soundEngine.playSFX('menu_select');
  }

  renderCommandMenu() {
    const grid = document.getElementById('command-grid');
    if (!grid) return;
    grid.innerHTML = '';
    FIELD_COMMANDS.forEach((cmd, idx) => {
      const btn = document.createElement('div');
      btn.className = `menu-option ${idx === this.cmdIndex ? 'selected' : ''}`;
      btn.innerHTML = `<span class="cursor-glyph">▶</span><span>${cmd.label}</span>`;
      btn.onclick = () => {
        this.cmdIndex = idx;
        this.confirmFieldCommand();
      };
      grid.appendChild(btn);
    });
  }

  confirmFieldCommand() {
    const cmd = FIELD_COMMANDS[this.cmdIndex];
    if (!cmd) return;
    soundEngine.playSFX('menu_select');
    this.game.executeFieldCommand(cmd.id);
  }

  closeAllFieldWindows() {
    document.getElementById('command-menu')?.classList.add('hidden');
    document.getElementById('status-detail-window')?.classList.add('hidden');
    document.getElementById('sub-menu')?.classList.add('hidden');
  }

  closeMenusToField() {
    this.closeAllFieldWindows();
    this.mode = 'none';
  }

  // ==========================================================================
  // GENERIC SUBMENU (Spells, Items, Shops, Choices)
  // ==========================================================================
  openSubMenu(title, items, returnMode = 'command') {
    this.subTitle = title;
    this.subItems = items;
    this.subIndex = 0;
    this.subReturnMode = returnMode;

    if (returnMode === 'command' || returnMode === 'none') {
      document.getElementById('status-detail-window')?.classList.add('hidden');
    }

    const menu = document.getElementById('sub-menu');
    const titleEl = document.getElementById('sub-menu-title');
    if (titleEl) titleEl.textContent = title;
    if (menu) menu.classList.remove('hidden');

    this.mode = this.game.combat.inCombat ? 'combat_sub' : 'sub_menu';
    this.renderSubMenu();
  }

  renderSubMenu() {
    const list = document.getElementById('sub-menu-list');
    if (!list) return;
    list.innerHTML = '';

    if (this.subItems.length === 0) {
      const empty = document.createElement('div');
      empty.style.color = '#7c7c7c';
      empty.textContent = 'NONE';
      list.appendChild(empty);
      return;
    }

    this.subItems.forEach((item, idx) => {
      const row = document.createElement('div');
      row.className = `sub-option-row ${idx === this.subIndex ? 'selected' : ''} ${item.disabled ? 'disabled' : ''}`;
      const rightTxt = item.rightText ? `<span>${item.rightText}</span>` : '';
      row.innerHTML = `
        <div class="sub-option-left">
          <span class="cursor-glyph">▶</span>
          <span>${item.label}</span>
        </div>
        ${rightTxt}
      `;
      row.onclick = () => {
        this.subIndex = idx;
        this.confirmSubMenuSelection();
      };
      list.appendChild(row);
    });
  }

  confirmSubMenuSelection() {
    if (this.subItems.length === 0) {
      this.cancelSubMenu();
      return;
    }
    const item = this.subItems[this.subIndex];
    if (!item) return;
    if (item.disabled) {
      soundEngine.playSFX('bump');
      return;
    }
    soundEngine.playSFX('menu_select');
    if (item.onSelect) {
      item.onSelect();
    }
  }

  cancelSubMenu() {
    soundEngine.playSFX('menu_cursor');
    document.getElementById('sub-menu')?.classList.add('hidden');
    if (this.game.combat.inCombat) {
      this.mode = 'combat_cmd';
      this.renderCombatCommands();
    } else if (this.subReturnMode === 'command') {
      this.mode = 'command';
      document.getElementById('command-menu')?.classList.remove('hidden');
      this.renderCommandMenu();
    } else {
      this.closeMenusToField();
    }
  }

  openChoiceMenu(title, yesLabel, noLabel, onYes, onNo) {
    this.openSubMenu(title, [
      {
        label: yesLabel,
        onSelect: () => {
          document.getElementById('sub-menu')?.classList.add('hidden');
          this.mode = 'none';
          onYes?.();
        },
      },
      {
        label: noLabel,
        onSelect: () => {
          document.getElementById('sub-menu')?.classList.add('hidden');
          this.mode = 'none';
          onNo?.();
        },
      },
    ], 'none');
  }

  openShopMenu(shop) {
    const p = this.game.player;
    const items = shop.items.map(entry => {
      let label = entry.name || entry.id;
      let statsNote = '';
      if (entry.kind === 'weapon') statsNote = `+${WEAPONS[entry.id].atk}A`;
      else if (entry.kind === 'armor') statsNote = `+${ARMORS[entry.id].def}D`;
      else if (entry.kind === 'shield') statsNote = `+${SHIELDS[entry.id].def}D`;

      return {
        label: statsNote ? `${label} (${statsNote})` : label,
        rightText: `${entry.price}G`,
        disabled: p.stats.gold < entry.price,
        onSelect: () => {
          if (p.stats.gold < entry.price) {
            soundEngine.playSFX('bump');
            return;
          }
          if (entry.kind === 'item' && entry.id === 'herb' && p.inventory.herbs >= 6) {
            this.queueMessages(["Thou canst not carry more than 6 Herbs."], () => this.openShopMenu(shop));
            return;
          }
          if (entry.kind === 'item' && entry.id === 'magicKey' && p.inventory.magicKeys >= 6) {
            this.queueMessages(["Thou canst not carry more than 6 Magic Keys."], () => this.openShopMenu(shop));
            return;
          }

          p.stats.gold -= entry.price;
          soundEngine.playSFX('chest_open');

          if (entry.kind === 'weapon') p.stats.weapon = entry.id;
          else if (entry.kind === 'armor') p.stats.armor = entry.id;
          else if (entry.kind === 'shield') p.stats.shield = entry.id;
          else if (entry.kind === 'accessory') p.inventory[entry.id] = true;
          else if (entry.kind === 'item') {
            if (entry.id === 'herb') p.inventory.herbs++;
            else if (entry.id === 'torch') p.inventory.torches++;
            else if (entry.id === 'magicKey') p.inventory.magicKeys++;
            else if (entry.id === 'fairyWater') p.inventory.fairyWater++;
            else if (entry.id === 'wings') p.inventory.wings++;
          }

          this.updateStatusWindow();
          document.getElementById('sub-menu')?.classList.add('hidden');
          this.queueMessages([`Thou hast purchased ${entry.name || entry.id}!`], () => {
            this.openChoiceMenu("ANYTHING ELSE?", "YES", "NO", () => this.openShopMenu(shop), () => {
              this.queueMessages(["Thank thee! Fare thee well!"]);
            });
          });
        },
      };
    });

    items.push({
      label: 'LEAVE',
      onSelect: () => {
        document.getElementById('sub-menu')?.classList.add('hidden');
        this.mode = 'none';
      },
    });

    this.openSubMenu(shop.title, items, 'none');
  }

  // ==========================================================================
  // MESSAGE / DIALOGUE SYSTEM (Typewriter Box)
  // ==========================================================================
  isMessageActive() {
    return this.messageActive;
  }

  queueMessages(lines, onComplete = null) {
    if (!lines || lines.length === 0) {
      onComplete?.();
      return;
    }
    this.closeAllFieldWindows();
    this.messageQueue = [...lines];
    this.messageCallback = onComplete;
    this.messageActive = true;
    document.getElementById('message-window')?.classList.remove('hidden');
    this.showNextQueuedMessage();
  }

  showNextQueuedMessage() {
    if (this.typewriterTimer) {
      clearInterval(this.typewriterTimer);
      this.typewriterTimer = null;
    }

    if (this.messageQueue.length === 0) {
      this.hideMessageWindow();
      const cb = this.messageCallback;
      this.messageCallback = null;
      if (cb) cb();
      return;
    }

    this.currentLine = this.messageQueue.shift();
    this.charIdx = 0;

    const textEl = document.getElementById('message-text');
    const advEl = document.getElementById('message-advance');
    if (textEl) textEl.textContent = '';
    if (advEl) advEl.classList.add('hidden');

    this.typewriterTimer = setInterval(() => {
      if (this.charIdx < this.currentLine.length) {
        if (textEl) textEl.textContent += this.currentLine[this.charIdx];
        if (this.charIdx % 2 === 0 && this.currentLine[this.charIdx] !== ' ') {
          soundEngine.playSFX('text_beep');
        }
        this.charIdx++;
      } else {
        clearInterval(this.typewriterTimer);
        this.typewriterTimer = null;
        if (advEl) advEl.classList.remove('hidden');
      }
    }, 22);
  }

  advanceMessage() {
    if (!this.messageActive) return;

    if (this.typewriterTimer) {
      // Finish typing line immediately
      clearInterval(this.typewriterTimer);
      this.typewriterTimer = null;
      const textEl = document.getElementById('message-text');
      const advEl = document.getElementById('message-advance');
      if (textEl) textEl.textContent = this.currentLine;
      if (advEl) advEl.classList.remove('hidden');
      return;
    }

    soundEngine.playSFX('menu_cursor');
    this.showNextQueuedMessage();
  }

  hideMessageWindow() {
    this.messageActive = false;
    if (this.typewriterTimer) {
      clearInterval(this.typewriterTimer);
      this.typewriterTimer = null;
    }
    document.getElementById('message-window')?.classList.add('hidden');
    document.getElementById('message-advance')?.classList.add('hidden');
    if (!this.game.combat.inCombat && this.mode !== 'sub_menu') {
      this.mode = 'none';
    }
  }

  // ==========================================================================
  // FIRST-PERSON COMBAT UI
  // ==========================================================================
  showCombat(monster) {
    this.closeAllFieldWindows();
    this.hideMessageWindow();

    this.currentCombatMonster = monster;
    this.combatLogLines = [];
    this.combatCmdIndex = 0;
    this.mode = 'combat_cmd';

    document.getElementById('combat-overlay')?.classList.remove('hidden');
    document.getElementById('message-window')?.classList.remove('hidden');
    document.getElementById('message-advance')?.classList.add('hidden');

    this.updateCombatMonster(monster);
    this.renderCombatCommands();
  }

  updateCombatMonster(monster) {
    this.currentCombatMonster = monster;
    const nameEl = document.getElementById('combat-monster-name');
    if (nameEl) nameEl.textContent = monster.name.toUpperCase();
    this.game.renderer?.renderCombatMonster(monster.type);
  }

  hideCombat() {
    this.currentCombatMonster = null;
    document.getElementById('combat-overlay')?.classList.add('hidden');
    document.getElementById('sub-menu')?.classList.add('hidden');
    document.getElementById('message-window')?.classList.add('hidden');
    this.mode = 'none';
  }

  addCombatLog(line) {
    this.combatLogLines.push(line);
    if (this.combatLogLines.length > 3) {
      this.combatLogLines = this.combatLogLines.slice(-3);
    }
    const textEl = document.getElementById('message-text');
    if (textEl) {
      textEl.textContent = this.combatLogLines.join('\n');
    }
  }

  renderCombatCommands() {
    const grid = document.getElementById('combat-cmd-grid');
    if (!grid) return;
    grid.innerHTML = '';
    COMBAT_COMMANDS.forEach((cmd, idx) => {
      const btn = document.createElement('div');
      btn.className = `menu-option ${idx === this.combatCmdIndex ? 'selected' : ''}`;
      btn.innerHTML = `<span class="cursor-glyph">▶</span><span>${cmd.label}</span>`;
      btn.onclick = () => {
        this.combatCmdIndex = idx;
        this.confirmCombatCommand();
      };
      grid.appendChild(btn);
    });
  }

  confirmCombatCommand() {
    if (this.game.combat.turnLocked || !this.game.combat.isPlayerTurn) return;
    const cmd = COMBAT_COMMANDS[this.combatCmdIndex];
    if (!cmd) return;
    soundEngine.playSFX('menu_select');

    if (cmd.id === 'fight') {
      this.game.combat.executeAttack();
    } else if (cmd.id === 'run') {
      this.game.combat.executeRun();
    } else if (cmd.id === 'spell') {
      this.openCombatSpellMenu();
    } else if (cmd.id === 'item') {
      this.openCombatItemMenu();
    }
  }

  openCombatSpellMenu() {
    const p = this.game.player;
    const combatSpells = ['HEAL', 'HURT', 'SLEEP', 'STOPSPELL', 'HEALMORE', 'HURTMORE'];
    const learned = p.spells.filter(s => combatSpells.includes(s));

    const items = learned.map(spell => {
      const cost = SPELL_COSTS[spell] || 0;
      return {
        label: spell,
        rightText: `${cost}`,
        disabled: p.stats.mp < cost,
        onSelect: () => {
          document.getElementById('sub-menu')?.classList.add('hidden');
          this.mode = 'combat_cmd';
          this.game.combat.executeSpell(spell);
        },
      };
    });

    this.openSubMenu('SPELL', items, 'combat_cmd');
  }

  openCombatItemMenu() {
    const p = this.game.player;
    const items = [];
    if (p.inventory.herbs > 0) {
      items.push({
        label: 'HERB',
        rightText: `x${p.inventory.herbs}`,
        onSelect: () => {
          document.getElementById('sub-menu')?.classList.add('hidden');
          this.mode = 'combat_cmd';
          this.game.combat.executeItem('herb');
        },
      });
    }
    if (p.inventory.fairyFlute) {
      items.push({
        label: 'FAIRY FLUTE',
        onSelect: () => {
          document.getElementById('sub-menu')?.classList.add('hidden');
          this.mode = 'combat_cmd';
          this.game.combat.executeItem('fairyFlute');
        },
      });
    }
    this.openSubMenu('ITEM', items, 'combat_cmd');
  }

  // ==========================================================================
  // KEYBOARD NAVIGATION ROUTER
  // ==========================================================================
  handleKeyDown(code) {
    const isUp = code === 'ArrowUp' || code === 'KeyW';
    const isDown = code === 'ArrowDown' || code === 'KeyS';
    const isLeft = code === 'ArrowLeft' || code === 'KeyA';
    const isRight = code === 'ArrowRight' || code === 'KeyD';
    const isConfirm = code === 'Enter' || code === 'Space' || code === 'KeyZ' || code === 'KeyE';
    const isCancel = code === 'Escape' || code === 'KeyX' || code === 'Backspace';

    // 1. Title screen
    if (this.mode === 'title') {
      if (isUp || isDown) {
        this.titleIndex = (this.titleIndex + 1) % this.titleItems.length;
        soundEngine.init();
        soundEngine.playSFX('menu_cursor');
        this.renderTitleOptions();
      } else if (isConfirm) {
        this.confirmTitleSelection();
      }
      return true;
    }

    // 2. Dialogue / Message window active (outside combat)
    if (this.messageActive && !this.game.combat.inCombat) {
      if (isConfirm || isCancel) {
        this.advanceMessage();
      }
      return true;
    }

    // 3. Combat submenus & commands
    if (this.game.combat.inCombat) {
      if (this.game.combat.turnLocked || !this.game.combat.isPlayerTurn) return true;

      if (this.mode === 'combat_sub') {
        if (isUp && this.subItems.length > 0) {
          this.subIndex = (this.subIndex - 1 + this.subItems.length) % this.subItems.length;
          soundEngine.playSFX('menu_cursor');
          this.renderSubMenu();
        } else if (isDown && this.subItems.length > 0) {
          this.subIndex = (this.subIndex + 1) % this.subItems.length;
          soundEngine.playSFX('menu_cursor');
          this.renderSubMenu();
        } else if (isConfirm) {
          this.confirmSubMenuSelection();
        } else if (isCancel) {
          this.cancelSubMenu();
        }
        return true;
      }

      if (this.mode === 'combat_cmd') {
        if (isLeft || isRight) {
          this.combatCmdIndex ^= 1;
          soundEngine.playSFX('menu_cursor');
          this.renderCombatCommands();
        } else if (isUp || isDown) {
          this.combatCmdIndex = (this.combatCmdIndex + 2) % 4;
          soundEngine.playSFX('menu_cursor');
          this.renderCombatCommands();
        } else if (isConfirm) {
          this.confirmCombatCommand();
        }
        return true;
      }
      return true;
    }

    // 4. Status Detail Window
    if (this.mode === 'status') {
      if (isConfirm || isCancel) {
        soundEngine.playSFX('menu_cursor');
        document.getElementById('status-detail-window')?.classList.add('hidden');
        this.mode = 'command';
        document.getElementById('command-menu')?.classList.remove('hidden');
        this.renderCommandMenu();
      }
      return true;
    }

    // 5. Submenu (Field Spell / Item / Shop / Yes-No)
    if (this.mode === 'sub_menu') {
      if (isUp && this.subItems.length > 0) {
        this.subIndex = (this.subIndex - 1 + this.subItems.length) % this.subItems.length;
        soundEngine.playSFX('menu_cursor');
        this.renderSubMenu();
      } else if (isDown && this.subItems.length > 0) {
        this.subIndex = (this.subIndex + 1) % this.subItems.length;
        soundEngine.playSFX('menu_cursor');
        this.renderSubMenu();
      } else if (isConfirm) {
        this.confirmSubMenuSelection();
      } else if (isCancel) {
        this.cancelSubMenu();
      }
      return true;
    }

    // 6. Main 2x4 Command Menu
    if (this.mode === 'command') {
      if (isLeft || isRight) {
        this.cmdIndex ^= 1;
        soundEngine.playSFX('menu_cursor');
        this.renderCommandMenu();
      } else if (isUp) {
        this.cmdIndex = (this.cmdIndex - 2 + 8) % 8;
        soundEngine.playSFX('menu_cursor');
        this.renderCommandMenu();
      } else if (isDown) {
        this.cmdIndex = (this.cmdIndex + 2) % 8;
        soundEngine.playSFX('menu_cursor');
        this.renderCommandMenu();
      } else if (isConfirm) {
        this.confirmFieldCommand();
      } else if (isCancel) {
        soundEngine.playSFX('menu_cursor');
        this.closeMenusToField();
      }
      return true;
    }

    // 7. Exploring field: Confirm opens COMMAND menu (smart-highlighting context command on E)
    if (this.mode === 'none' && isConfirm) {
      const smartId = code === 'KeyE' ? this.game.getContextualCommandId() : 'talk';
      this.openCommandMenu(smartId);
      return true;
    }

    return false;
  }
}
