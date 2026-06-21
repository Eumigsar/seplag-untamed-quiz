import Phaser from 'phaser';
import { COLORS, TILE_SIZE } from '../config';

type HeadStyle = 'short' | 'bun' | 'topknot' | 'headband' | 'scholar-hat' | 'helmet' | 'white-hair' | 'bald';

export default class PreloadScene extends Phaser.Scene {
  private bar!: Phaser.GameObjects.Rectangle;
  private barBg!: Phaser.GameObjects.Rectangle;
  private text!: Phaser.GameObjects.Text;
  private loadBarW = 400;

  constructor() { super({ key: 'PreloadScene' }); }

  preload() {
    this.createLoadingUI();
    this.createGameTextures();
    this.setupLoadEvents();
  }

  private createLoadingUI() {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;
    this.loadBarW = Math.min(360, this.scale.width - 60);

    this.add.rectangle(cx, cy, this.scale.width, this.scale.height, 0x1a1a2e);

    this.add.text(cx, cy - 100, '龙玉传说', {
      fontSize: '48px', color: '#f59e0b',
      fontFamily: 'serif', stroke: '#78350f', strokeThickness: 3,
    }).setOrigin(0.5);

    this.add.text(cx, cy - 50, 'A Lenda do Dragão de Jade', {
      fontSize: '18px', color: '#d4a657', fontFamily: 'serif',
    }).setOrigin(0.5);

    this.barBg = this.add.rectangle(cx, cy + 20, this.loadBarW, 16, 0x2d2d4e);
    this.bar   = this.add.rectangle(cx - this.loadBarW / 2 + 2, cy + 20, 2, 12, COLORS.ui_gold);
    this.bar.setOrigin(0, 0.5);

    this.text = this.add.text(cx, cy + 50, '加载中... Carregando...', {
      fontSize: '14px', color: '#a0a0c0', fontFamily: 'sans-serif',
    }).setOrigin(0.5);
  }

  private createGameTextures() {
    this.createAllPlayerSprites();

    // NPC sprites
    this.createNPCSprite('npc-sifu',     COLORS.building);
    this.createNPCSprite('npc-merchant', 0x8B6914);
    this.createNPCSprite('npc-farmer',   0x4a5568);
    this.createNPCSprite('npc-monk',     0xb7791f);
    this.createNPCSprite('npc-child',    0xe91e8c);
    this.createNPCSprite('npc-scholar',  0x2563eb);
    this.createNPCSprite('npc-guard',    0x1e3a5f);

    // Tile textures
    this.createTile('tile-grass',    COLORS.grass,    0x3d6b48);
    this.createTile('tile-path',     COLORS.path,     0xb8905e);
    this.createTile('tile-water',    COLORS.water,    0x3a7bc8);
    this.createTile('tile-mountain', COLORS.mountain, 0x7a6345);
    this.createTile('tile-bamboo',   0x2d5a27,        0x3d7a3c);
    this.createTile('tile-building', COLORS.building, 0x7a3b0e);
    this.createTile('tile-sand',     COLORS.sand,     0xd4c090);
    this.createTile('tile-imperial', 0x9a7840,        0x8a6830);
    this.createTile('tile-stone',    0x6b7280,        0x4b5563);

    // Objects
    this.createBambooSprite();
    this.createTreeSprite();
    this.createBuildingSprite('building-house',   0x8b4513, 0xc0392b);
    this.createBuildingSprite('building-temple',  0x9a1020, 0xfbbf24);
    this.createBuildingSprite('building-market',  0xb45309, 0xf59e0b);
    this.createChestSprite();
    this.createPortalSprite();

    // Enemy sprites
    this.createEnemySprite('enemy-bandit',       0x4a1942);
    this.createEnemySprite('enemy-monk',          0x1a1a2e);
    this.createEnemySprite('enemy-guard',         0x1e3a5f);
    this.createEnemySprite('enemy-dragon-spirit', 0x065f46);
    this.createEnemySprite('enemy-dummy',         0x8B4513);

    this.createHPBarTextures();
  }

  // ─── Player sprites ─────────────────────────────────────────────────────────

  private createAllPlayerSprites() {
    const SKIN_M = 0xf5deb3;
    const SKIN_F = 0xfde8c8;
    const HAIR   = 0x1a0a00;

    // Default (no outfit chosen)
    this.drawPlayer('player-m', SKIN_M, 0x4a90d9, 0x93c5fd, 0x78350f, HAIR,      'short');
    this.drawPlayer('player-f', SKIN_F, 0xe91e8c, 0xfbb6e1, 0x78350f, HAIR,      'bun');

    for (const g of ['m', 'f'] as const) {
      const sk = g === 'm' ? SKIN_M : SKIN_F;
      this.drawPlayer(`player-${g}-shaolin-monk`,
        sk, 0xf97316,                   0xfbbf24, 0x92400e, undefined, 'bald');
      this.drawPlayer(`player-${g}-silk-merchant`,
        sk, g === 'f' ? 0xd946ef : 0xa855f7, 0xf3e8ff, 0xfbbf24, HAIR, 'topknot');
      this.drawPlayer(`player-${g}-wandering-warrior`,
        sk, 0x64748b,                   0x94a3b8, 0x78350f, HAIR,      'headband');
      this.drawPlayer(`player-${g}-jade-scholar`,
        sk, g === 'f' ? 0x4ade80 : 0x22c55e, 0xbbf7d0, 0x166534, HAIR, 'scholar-hat');
      this.drawPlayer(`player-${g}-imperial-guard`,
        sk, g === 'f' ? 0xf87171 : 0xef4444, 0xfbbf24, 0xfbbf24, undefined, 'helmet');
      this.drawPlayer(`player-${g}-taoist-hermit`,
        sk, g === 'f' ? 0xf1f5f9 : 0xe2e8f0, 0x64748b, 0x1e293b, 0xe5e7eb, 'white-hair');
    }
  }

  /*
   * Sprite layout (16 × 32):
   *   y 0-3  : head accessories (hat/helmet/bun above head)
   *   y 4-11 : head (8×8 square)
   *   y 8-9  : eyes
   *   y 12-15: neck gap (empty)
   *   y 16-27: body + arms
   *   y 24-25: belt
   *   y 28-31: feet
   */
  private drawPlayer(
    key:    string,
    skin:   number,
    body:   number,
    accent: number,
    belt:   number,
    hair:   number | undefined,
    head:   HeadStyle,
  ) {
    const gfx = this.make.graphics({ x: 0, y: 0, add: false } as any);

    // — Feet —
    gfx.fillStyle(0x2d2d2d);
    gfx.fillRect(2, 28, 4, 4);
    gfx.fillRect(10, 28, 4, 4);

    // — Body —
    gfx.fillStyle(body);
    gfx.fillRect(3, 16, 10, 12);

    // — Arms —
    gfx.fillStyle(body);
    gfx.fillRect(0, 17, 3, 8);
    gfx.fillRect(13, 17, 3, 8);

    // Wandering-warrior arm guards (darker lower arm)
    if (head === 'headband') {
      gfx.fillStyle(accent);
      gfx.fillRect(0, 21, 3, 4);
      gfx.fillRect(13, 21, 3, 4);
    }

    // — Collar accent (top of body) —
    gfx.fillStyle(accent);
    gfx.fillRect(4, 16, 8, 1);

    // — Belt —
    gfx.fillStyle(belt);
    gfx.fillRect(3, 24, 10, 2);

    // Imperial guard gold side trims on body
    if (head === 'helmet') {
      gfx.fillStyle(accent);
      gfx.fillRect(3, 16, 1, 12);
      gfx.fillRect(12, 16, 1, 12);
    }

    // Jade scholar scroll motif (center vertical line)
    if (head === 'scholar-hat') {
      gfx.fillStyle(accent);
      gfx.fillRect(7, 18, 2, 5);
    }

    // — Head base (skin) —
    gfx.fillStyle(skin);
    gfx.fillRect(4, 4, 8, 8);

    // — Head style (drawn on top of skin) —
    switch (head) {
      case 'bald':
        // Extend skin upward — no hair
        gfx.fillStyle(skin);
        gfx.fillRect(4, 2, 8, 2);
        // Gold monk collar strip at neck
        gfx.fillStyle(accent);
        gfx.fillRect(5, 12, 6, 2);
        break;

      case 'bun':
        gfx.fillStyle(hair ?? 0x1a0a00);
        gfx.fillRect(4, 3, 8, 2);   // base hair
        gfx.fillRect(6, 0, 4, 4);   // topknot bun
        break;

      case 'topknot':
        // Silk-merchant: bun with a decorative pin (accent pixel)
        gfx.fillStyle(hair ?? 0x1a0a00);
        gfx.fillRect(4, 3, 8, 2);
        gfx.fillRect(7, 0, 2, 4);   // thin topknot
        gfx.fillStyle(accent);
        gfx.fillRect(7, 0, 2, 1);   // gold hair pin
        // Merchant collar detail (wide collar)
        gfx.fillStyle(accent);
        gfx.fillRect(3, 14, 10, 2);
        break;

      case 'headband':
        gfx.fillStyle(hair ?? 0x1a0a00);
        gfx.fillRect(3, 3, 10, 4);  // hair
        gfx.fillStyle(0xfbbf24);    // yellow/gold headband
        gfx.fillRect(3, 5, 10, 1);  // headband stripe
        break;

      case 'scholar-hat':
        gfx.fillStyle(hair ?? 0x1a0a00);
        gfx.fillRect(4, 4, 8, 1);   // hair peeking below hat
        gfx.fillStyle(0x1e293b);    // dark hat brim
        gfx.fillRect(2, 2, 12, 2);  // brim (wider than head)
        gfx.fillStyle(0x374151);    // slightly lighter hat crown
        gfx.fillRect(4, 0, 8, 4);   // crown
        break;

      case 'helmet':
        gfx.fillStyle(0x1f2937);    // dark metal
        gfx.fillRect(4, 2, 8, 4);   // helmet top
        gfx.fillStyle(body);        // coloured cheek guards
        gfx.fillRect(3, 4, 2, 6);   // left guard
        gfx.fillRect(11, 4, 2, 6);  // right guard
        gfx.fillStyle(accent);      // gold crest on helmet
        gfx.fillRect(7, 2, 2, 1);
        break;

      case 'white-hair':
        gfx.fillStyle(hair ?? 0xe5e7eb);
        gfx.fillRect(3, 3, 10, 2);  // hair top
        gfx.fillRect(3, 4, 2, 9);   // left flowing hair (beside head)
        gfx.fillRect(11, 4, 2, 9);  // right flowing hair
        // Taoist yin-yang dot motif on body
        gfx.fillStyle(0x1e293b);
        gfx.fillRect(7, 19, 2, 2);  // small dark circle suggestion
        break;

      default: // 'short'
        gfx.fillStyle(hair ?? 0x1a0a00);
        gfx.fillRect(3, 3, 10, 3);
        break;
    }

    // — Eyes (always last so they're visible) —
    gfx.fillStyle(0x1a1a1a);
    gfx.fillRect(6, 8, 2, 2);
    gfx.fillRect(10, 8, 2, 2);

    gfx.generateTexture(key, 16, 32);
    gfx.destroy();
  }

  // ─── NPC ────────────────────────────────────────────────────────────────────

  private createNPCSprite(key: string, color: number) {
    const gfx = this.make.graphics({ x: 0, y: 0, add: false } as any);
    gfx.fillStyle(0x333333);
    gfx.fillRect(3, 28, 3, 4);
    gfx.fillRect(10, 28, 3, 4);
    gfx.fillStyle(color);
    gfx.fillRect(4, 16, 8, 12);
    gfx.fillStyle(0xf5deb3);
    gfx.fillRect(5, 5, 6, 8);
    gfx.fillStyle(0x111111);
    gfx.fillRect(5, 3, 6, 3);
    gfx.fillRect(6, 9, 1, 1);
    gfx.fillRect(9, 9, 1, 1);
    gfx.fillStyle(0x422006);
    gfx.fillRect(4, 24, 8, 2);
    gfx.generateTexture(key, 16, 32);
    gfx.destroy();
  }

  // ─── Tiles ──────────────────────────────────────────────────────────────────

  private createTile(key: string, base: number, shadow: number) {
    const gfx = this.make.graphics({ x: 0, y: 0, add: false } as any);
    const s = TILE_SIZE;
    gfx.fillStyle(base);
    gfx.fillRect(0, 0, s, s);
    gfx.fillStyle(shadow, 0.3);
    gfx.fillRect(0, s - 2, s, 2);
    gfx.fillRect(s - 2, 0, 2, s);
    gfx.generateTexture(key, s, s);
    gfx.destroy();
  }

  // ─── Objects ────────────────────────────────────────────────────────────────

  private createBambooSprite() {
    const gfx = this.make.graphics({ x: 0, y: 0, add: false } as any);
    gfx.fillStyle(0x4a7c59);
    gfx.fillRect(6, 0, 4, 48);
    gfx.fillStyle(0x3d6b48);
    gfx.fillRect(5, 10, 6, 3);
    gfx.fillRect(5, 22, 6, 3);
    gfx.fillRect(5, 34, 6, 3);
    gfx.fillStyle(0x86efac);
    gfx.fillRect(10, 8, 8, 3);
    gfx.fillRect(2, 20, 8, 3);
    gfx.fillRect(10, 32, 8, 3);
    gfx.generateTexture('bamboo', 20, 48);
    gfx.destroy();
  }

  private createTreeSprite() {
    const gfx = this.make.graphics({ x: 0, y: 0, add: false } as any);
    gfx.fillStyle(0x92400e);
    gfx.fillRect(11, 28, 6, 16);
    gfx.fillStyle(0x166534);
    gfx.fillRect(4, 16, 20, 14);
    gfx.fillStyle(0x15803d);
    gfx.fillRect(7, 8, 14, 12);
    gfx.fillStyle(0x16a34a);
    gfx.fillRect(10, 0, 8, 12);
    gfx.generateTexture('tree', 28, 44);
    gfx.destroy();
  }

  private createBuildingSprite(key: string, wallColor: number, roofColor: number) {
    const gfx = this.make.graphics({ x: 0, y: 0, add: false } as any);
    gfx.fillStyle(wallColor);
    gfx.fillRect(4, 20, 56, 36);
    gfx.fillStyle(roofColor);
    gfx.fillRect(0, 8, 64, 16);
    gfx.fillRect(6, 0, 52, 12);
    gfx.fillStyle(0x422006);
    gfx.fillRect(22, 36, 20, 20);
    gfx.fillStyle(0xfef3c7, 0.7);
    gfx.fillRect(8, 24, 12, 10);
    gfx.fillRect(44, 24, 12, 10);
    gfx.fillStyle(0xf59e0b);
    gfx.fillRect(0, 7, 64, 3);
    gfx.generateTexture(key, 64, 56);
    gfx.destroy();
  }

  private createChestSprite() {
    const gfx = this.make.graphics({ x: 0, y: 0, add: false } as any);
    gfx.fillStyle(0x92400e);
    gfx.fillRect(0, 6, 24, 18);
    gfx.fillStyle(0x78350f);
    gfx.fillRect(0, 0, 24, 8);
    gfx.fillStyle(0xf59e0b);
    gfx.fillRect(9, 12, 6, 6);
    gfx.fillRect(0, 6, 24, 2);
    gfx.generateTexture('chest', 24, 24);
    gfx.destroy();
  }

  private createPortalSprite() {
    const gfx = this.make.graphics({ x: 0, y: 0, add: false } as any);
    gfx.fillStyle(0x22c55e, 0.4);
    gfx.fillCircle(24, 24, 20);
    gfx.fillStyle(0x4ade80, 0.7);
    gfx.fillCircle(24, 24, 14);
    gfx.fillStyle(0x86efac);
    gfx.fillCircle(24, 24, 8);
    gfx.generateTexture('portal', 48, 48);
    gfx.destroy();
  }

  private createEnemySprite(key: string, color: number) {
    const gfx = this.make.graphics({ x: 0, y: 0, add: false } as any);
    gfx.fillStyle(color);
    gfx.fillRect(4, 14, 8, 12);
    gfx.fillStyle(color - 0x101010);
    gfx.fillRect(4, 4, 8, 8);
    gfx.fillStyle(0xff0000);
    gfx.fillRect(6, 8, 2, 2);
    gfx.fillRect(10, 8, 2, 2);
    gfx.fillStyle(color);
    gfx.fillRect(1, 15, 3, 7);
    gfx.fillRect(12, 15, 3, 7);
    gfx.fillRect(4, 26, 3, 5);
    gfx.fillRect(9, 26, 3, 5);
    gfx.generateTexture(key, 16, 32);
    gfx.destroy();
  }

  private createHPBarTextures() {
    const gfx = this.make.graphics({ x: 0, y: 0, add: false } as any);
    gfx.fillStyle(0x166534);
    gfx.fillRect(0, 0, 100, 10);
    gfx.generateTexture('hp-bar', 100, 10);
    gfx.clear();
    gfx.fillStyle(0x1e40af);
    gfx.fillRect(0, 0, 100, 10);
    gfx.generateTexture('mp-bar', 100, 10);
    gfx.clear();
    gfx.fillStyle(0x78350f);
    gfx.fillRect(0, 0, 100, 10);
    gfx.generateTexture('bar-bg', 100, 10);
    gfx.destroy();
  }

  // ─── Load events ────────────────────────────────────────────────────────────

  private setupLoadEvents() {
    this.load.on('progress', (p: number) => {
      this.bar.width = (this.loadBarW - 4) * p;
      this.text.setText(`加载中... ${Math.floor(p * 100)}%`);
    });
    this.load.on('complete', () => {
      this.text.setText('准备好了！ Pronto!');
    });
  }

  create() {
    this.time.delayedCall(500, () => {
      this.scene.start('WorldScene');
    });
  }
}
