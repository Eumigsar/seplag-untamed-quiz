import Phaser from 'phaser';
import {
  TILE_SIZE, GAME_WIDTH, GAME_HEIGHT, PLAYER_SPEED,
  COLORS, DEPTHS, WORLD_WIDTH, WORLD_HEIGHT
} from '../config';
import type { RegionId } from '@/types';
import { NPCS } from '@/data/npcs';
import { REGIONS } from '@/data/maps/regions';

interface TileMap {
  tiles: number[][];
  objects: Array<{ type: string; x: number; y: number; data?: Record<string, unknown> }>;
}

const TILE = {
  GRASS: 0, PATH: 1, WATER: 2, MOUNTAIN: 3,
  BAMBOO: 4, BUILDING: 5, SAND: 6, IMPERIAL: 7, STONE: 8,
};

const TILE_TEXTURES = [
  'tile-grass', 'tile-path', 'tile-water', 'tile-mountain',
  'tile-bamboo', 'tile-building', 'tile-sand', 'tile-imperial', 'tile-stone',
];

type ArcadeSprite = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

export default class WorldScene extends Phaser.Scene {
  private player!:       ArcadeSprite;
  private cursors!:      Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!:         Record<string, Phaser.Input.Keyboard.Key>;
  private npcSprites:    Map<string, ArcadeSprite>     = new Map();
  private tileLayer!:    Phaser.GameObjects.Group;
  private objLayer!:     Phaser.GameObjects.Group;
  private collidables!:  Phaser.Physics.Arcade.StaticGroup;
  private interactKey!:  Phaser.Input.Keyboard.Key;
  private interactIndicator?: Phaser.GameObjects.Text;
  private currentRegion: RegionId = 'bambu-village';
  private onNPCInteract?: (npcId: string) => void;
  private onRegionChange?: (region: RegionId) => void;
  private onNotify?: (msg: string, ch: string, py: string) => void;
  private weatherOverlay?: Phaser.GameObjects.Rectangle;
  private weatherParticles: Phaser.GameObjects.Text[] = [];
  private playerLabel?: Phaser.GameObjects.Text;
  private tileMap?: TileMap;
  private playerName = 'Player';
  private playerGender: 'male' | 'female' = 'male';
  private playerOutfit = '';

  // Mobile joystick
  private isMobile = false;
  private touchJoy = { dx: 0, dy: 0, active: false, pid: -1 };
  private joyGraphics?: Phaser.GameObjects.Graphics;
  private readonly JOY_R = 52;
  private readonly NUB_R = 22;
  private nearestNPCId: string | null = null;
  private initCallbacks?: {
    onNPCInteract?: (npcId: string) => void;
    onRegionChange?: (region: RegionId) => void;
    onNotify?: (title: string, msg: string) => void;
  };

  constructor(callbacks?: {
    onNPCInteract?: (npcId: string) => void;
    onRegionChange?: (region: RegionId) => void;
    onNotify?: (title: string, msg: string) => void;
  }) {
    super({ key: 'WorldScene' });
    if (callbacks) this.initCallbacks = callbacks;
  }

  init(data: { region?: RegionId; playerName?: string; playerGender?: string }) {
    if (data.region)       this.currentRegion = data.region;
    if (data.playerName)   this.playerName    = data.playerName;
    if (data.playerGender) this.playerGender  = data.playerGender as 'male' | 'female';
    // Fall back to localStorage so the player's nickname shows in-world
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('seplag_character');
        if (saved) {
          const char = JSON.parse(saved) as { nickname?: string; gender?: string; startingOutfit?: string };
          if (char.nickname && this.playerName === 'Player') this.playerName = char.nickname;
          if (char.gender === 'female') this.playerGender = 'female';
          if (char.startingOutfit) this.playerOutfit = char.startingOutfit;
        }
      } catch { /* ignore */ }
    }
    // Apply constructor callbacks if not yet applied
    if (this.initCallbacks) {
      this.onNPCInteract  = this.initCallbacks.onNPCInteract;
      this.onRegionChange = this.initCallbacks.onRegionChange;
      this.onNotify       = this.initCallbacks.onNotify as typeof this.onNotify;
    }
  }

  create() {
    this.isMobile = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
    this.buildMap();
    this.createPlayer();
    this.createNPCs();
    this.setupCamera();
    this.setupInput();
    this.createWeatherOverlay();
    this.addRegionLabel();
    this.events.on('shutdown', this.cleanup, this);
  }

  // ─── Map Building ──────────────────────────────────────────────────────────

  private buildMap() {
    this.tileLayer  = this.add.group();
    this.objLayer   = this.add.group();
    this.collidables = this.physics.add.staticGroup();

    const region = REGIONS.find(r => r.id === this.currentRegion);
    this.tileMap = this.generateRegionMap(this.currentRegion);

    const { tiles, objects } = this.tileMap;
    const rows = tiles.length;
    const cols = tiles[0]?.length ?? 0;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const t = tiles[row][col];
        const tx = TILE_TEXTURES[t] ?? 'tile-grass';
        const sprite = this.add.image(
          col * TILE_SIZE + TILE_SIZE / 2,
          row * TILE_SIZE + TILE_SIZE / 2,
          tx,
        ).setDepth(DEPTHS.floor);
        if (t === TILE.WATER || t === TILE.MOUNTAIN) {
          const blocker = this.collidables.create(
            col * TILE_SIZE + TILE_SIZE / 2,
            row * TILE_SIZE + TILE_SIZE / 2,
            tx,
          ) as Phaser.Physics.Arcade.Image;
          blocker.setVisible(false);
          blocker.refreshBody();
        }
        this.tileLayer.add(sprite);
      }
    }

    for (const obj of objects) {
      this.placeObject(obj);
    }

    this.physics.world.setBounds(0, 0, cols * TILE_SIZE, rows * TILE_SIZE);
  }

  private generateRegionMap(regionId: RegionId): TileMap {
    const W = 50, H = 40;
    const tiles: number[][] = [];
    const objects: TileMap['objects'] = [];

    for (let r = 0; r < H; r++) {
      tiles[r] = [];
      for (let c = 0; c < W; c++) {
        tiles[r][c] = TILE.GRASS;
      }
    }

    switch (regionId) {
      case 'bambu-village': {
        // Bamboo border
        for (let r = 0; r < H; r++) {
          for (let c = 0; c < W; c++) {
            if (r < 3 || r >= H - 3 || c < 3 || c >= W - 3) tiles[r][c] = TILE.BAMBOO;
          }
        }
        // Main path
        for (let c = 5; c < W - 5; c++) tiles[20][c] = TILE.PATH;
        for (let r = 5; r < H - 5; r++) tiles[r][25] = TILE.PATH;
        // Water pond
        for (let r = 8; r < 14; r++) for (let c = 8; c < 14; c++) tiles[r][c] = TILE.WATER;
        // Buildings
        objects.push({ type: 'building-house',   x: 10, y: 5 });
        objects.push({ type: 'building-house',   x: 18, y: 5 });
        objects.push({ type: 'building-temple',  x: 30, y: 5 });
        objects.push({ type: 'building-market',  x: 38, y: 5 });
        // Bamboo grove objects
        for (let i = 0; i < 12; i++) {
          objects.push({ type: 'bamboo', x: 4 + i * 3, y: H - 5 });
        }
        // Trees
        objects.push({ type: 'tree', x: 6,  y: 16 });
        objects.push({ type: 'tree', x: 15, y: 25 });
        objects.push({ type: 'tree', x: 40, y: 30 });
        // Portal to Silk Market
        objects.push({ type: 'portal', x: W - 4, y: 20, data: { destination: 'silk-market', label: '百绸市场\nBǎi Chóu Shìchǎng\nMercado das Cem Sedas' } });
        // Portal to Lantern Valley
        objects.push({ type: 'portal', x: 25, y: 3, data: { destination: 'lantern-valley', label: '灯笼谷\nDēnglong Gǔ\nVale das Lanternas', locked: true } });
        break;
      }
      case 'silk-market': {
        for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
          tiles[r][c] = (r === 0 || r === H-1 || c === 0 || c === W-1) ? TILE.STONE : TILE.SAND;
        }
        // Market stalls
        for (let c = 5; c < W - 5; c += 7) tiles[15][c] = TILE.BUILDING;
        for (let c = 5; c < W - 5; c++)    tiles[20][c] = TILE.PATH;
        for (let r = 5; r < H - 5; r++)    tiles[r][25] = TILE.PATH;
        objects.push({ type: 'building-market', x: 5,  y: 5 });
        objects.push({ type: 'building-market', x: 15, y: 5 });
        objects.push({ type: 'building-market', x: 30, y: 5 });
        objects.push({ type: 'portal', x: 3, y: 20, data: { destination: 'bambu-village', label: '永竹村\nYǒng Zhú Cūn\nVila do Bambu Eterno' } });
        break;
      }
      case 'golden-cloud-monastery': {
        for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
          if (c < 5 || c >= W - 5) tiles[r][c] = TILE.MOUNTAIN;
          else if (r < 5 || r >= H - 5) tiles[r][c] = TILE.STONE;
          else tiles[r][c] = TILE.STONE;
        }
        for (let c = 10; c < 40; c++) tiles[20][c] = TILE.PATH;
        for (let r = 10; r < H - 5; r++) tiles[r][25] = TILE.PATH;
        objects.push({ type: 'building-temple', x: 18, y: 5 });
        objects.push({ type: 'building-temple', x: 28, y: 5 });
        objects.push({ type: 'portal', x: 25, y: H - 4, data: { destination: 'lantern-valley', label: '灯笼谷\nDēnglong Gǔ\nVale das Lanternas' } });
        break;
      }
      default: {
        for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) tiles[r][c] = TILE.GRASS;
        objects.push({ type: 'portal', x: 25, y: 35, data: { destination: 'bambu-village', label: '永竹村\nYǒng Zhú Cūn\nVila do Bambu Eterno' } });
      }
    }
    return { tiles, objects };
  }

  private placeObject(obj: TileMap['objects'][0]) {
    const px = obj.x * TILE_SIZE + TILE_SIZE / 2;
    const py = obj.y * TILE_SIZE + TILE_SIZE / 2;

    if (obj.type === 'portal') {
      const portal = this.add.image(px, py, 'portal')
        .setDepth(DEPTHS.objects)
        .setInteractive();
      const label = obj.data?.label as string ?? '';
      portal.on('pointerover', () => {
        this.add.text(px, py - 40, label, {
          fontSize: '10px', color: '#86efac', backgroundColor: '#0a0a1a',
          padding: { x: 4, y: 2 }, align: 'center',
        }).setDepth(DEPTHS.ui).setOrigin(0.5).setName('portal-label');
      });
      portal.on('pointerout', () => {
        this.children.getByName('portal-label')?.destroy();
      });

      // Tween for portal glow
      this.tweens.add({
        targets: portal,
        alpha: { from: 0.7, to: 1 },
        scaleX: { from: 0.9, to: 1.1 },
        scaleY: { from: 0.9, to: 1.1 },
        duration: 1500,
        yoyo: true,
        repeat: -1,
      });

      // Collision zone
      const blocker = this.collidables.create(px, py, 'tile-grass') as Phaser.Physics.Arcade.Image;
      blocker.setVisible(false);
      blocker.setData('isPortal', true);
      blocker.setData('destination', obj.data?.destination);
      blocker.setData('locked', obj.data?.locked ?? false);
      blocker.refreshBody();
      return;
    }

    const sprite = this.add.image(px, py - TILE_SIZE / 2, obj.type)
      .setDepth(DEPTHS.objects)
      .setOrigin(0.5, 1);
    this.objLayer.add(sprite);

    if (['building-house', 'building-temple', 'building-market'].includes(obj.type)) {
      const blocker = this.collidables.create(px, py - TILE_SIZE, obj.type) as Phaser.Physics.Arcade.Image;
      blocker.setVisible(false);
      blocker.setDisplaySize(64, 56);
      blocker.refreshBody();
    }
  }

  // ─── Player ────────────────────────────────────────────────────────────────

  private playerSpriteKey(): string {
    const g = this.playerGender === 'female' ? 'f' : 'm';
    if (this.playerOutfit) return `player-${g}-${this.playerOutfit}`;
    return `player-${g}`;
  }

  private createPlayer() {
    this.player = this.physics.add.sprite(
      GAME_WIDTH  / 2,
      GAME_HEIGHT / 2,
      this.playerSpriteKey(),
    ).setDepth(DEPTHS.player)
     .setDisplaySize(32, 64);  // SVG loaded at 128×256; display at 32×64
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(18, 20);
    this.player.body.setOffset(7, 42);

    this.playerLabel = this.add.text(0, 0, this.playerName, {
      fontSize: '10px', color: '#ffffff',
      backgroundColor: '#0000007f',
      padding: { x: 2, y: 1 },
    }).setDepth(DEPTHS.ui).setOrigin(0.5, 1);

    this.physics.add.collider(this.player, this.collidables, (_player, obj) => {
      const gameObj = obj as Phaser.Physics.Arcade.Image;
      if (gameObj.getData('isPortal')) {
        const dest = gameObj.getData('destination') as RegionId;
        const locked = gameObj.getData('locked') as boolean;
        if (!locked && dest) this.changeRegion(dest);
        else if (locked) {
          this.onNotify?.('Bloqueado', '未解锁', 'Wèi jiěsuǒ');
        }
      }
    });
  }

  // ─── NPCs ──────────────────────────────────────────────────────────────────

  private createNPCs() {
    const regionNPCs = NPCS.filter(n => n.region === this.currentRegion);
    for (const npc of regionNPCs) {
      const spriteKey = `npc-${npc.portrait}`;
      const px = npc.position.x * (TILE_SIZE / 2);
      const py = npc.position.y * (TILE_SIZE / 2);
      const sprite = this.physics.add.sprite(px, py, spriteKey)
        .setDepth(DEPTHS.npcs)
        .setImmovable(true);
      sprite.body.setSize(12, 16);
      sprite.body.setOffset(2, 14);
      sprite.setData('npcId', npc.id);
      sprite.setData('npcName', npc.name.hanzi + '\n' + npc.name.pinyin);

      // Name label
      this.add.text(px, py - 20, npc.name.hanzi, {
        fontSize: '9px', color: '#fef3c7',
        backgroundColor: '#00000090',
        padding: { x: 3, y: 1 },
      }).setDepth(DEPTHS.ui).setOrigin(0.5);

      // Subtle idle float
      this.tweens.add({
        targets: sprite,
        y: py - 4,
        duration: 1500 + Math.random() * 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      this.npcSprites.set(npc.id, sprite);
      this.physics.add.collider(this.player, sprite);
    }
  }

  // ─── Camera ────────────────────────────────────────────────────────────────

  private setupCamera() {
    const cols = this.tileMap?.tiles[0]?.length ?? 50;
    const rows = this.tileMap?.tiles.length       ?? 40;
    this.cameras.main.setBounds(0, 0, cols * TILE_SIZE, rows * TILE_SIZE);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.5);
  }

  // ─── Input ─────────────────────────────────────────────────────────────────

  private get joyX() { return 80; }
  private get joyY() { return this.scale.height - 90; }

  private setupInput() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.interactKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    if (this.isMobile) {
      this.initMobileJoystick();
    }

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (this.isMobile) {
        const dist = Math.hypot(p.x - this.joyX, p.y - this.joyY);
        if (!this.touchJoy.active && dist < this.JOY_R + 28) {
          this.touchJoy = { dx: 0, dy: 0, active: true, pid: p.id };
          return;
        }
        // Tap on nearest visible NPC (right zone) or tap near indicator
        if (this.nearestNPCId) {
          this.interactWithNPC(this.nearestNPCId);
          return;
        }
      }
      // Desktop: click on NPC sprite
      const { worldX, worldY } = p;
      this.npcSprites.forEach((sprite, npcId) => {
        if (Phaser.Math.Distance.Between(worldX, worldY, sprite.x, sprite.y) < 80) {
          this.interactWithNPC(npcId);
        }
      });
    });

    if (this.isMobile) {
      this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
        if (p.id !== this.touchJoy.pid || !this.touchJoy.active) return;
        const dx = p.x - this.joyX;
        const dy = p.y - this.joyY;
        const dist = Math.hypot(dx, dy);
        if (dist < 6) { this.touchJoy.dx = 0; this.touchJoy.dy = 0; this.renderJoystick(0, 0); return; }
        const nx = dx / dist;
        const ny = dy / dist;
        const clamped = Math.min(dist, this.JOY_R);
        this.touchJoy.dx = nx;
        this.touchJoy.dy = ny;
        this.renderJoystick(nx * clamped / this.JOY_R, ny * clamped / this.JOY_R);
      });

      const stopJoy = (p: Phaser.Input.Pointer) => {
        if (p.id === this.touchJoy.pid) {
          this.touchJoy = { dx: 0, dy: 0, active: false, pid: -1 };
          this.renderJoystick(0, 0);
        }
      };
      this.input.on('pointerup', stopJoy);
      this.input.on('pointercancel', stopJoy);
    }
  }

  private initMobileJoystick() {
    this.joyGraphics = this.add.graphics().setScrollFactor(0).setDepth(DEPTHS.ui + 20);
    this.renderJoystick(0, 0);
  }

  private renderJoystick(ndx: number, ndy: number) {
    if (!this.joyGraphics) return;
    const jx = this.joyX;
    const jy = this.joyY;
    this.joyGraphics.clear();
    // Outer ring
    this.joyGraphics.fillStyle(0x0a0d12, 0.45);
    this.joyGraphics.fillCircle(jx, jy, this.JOY_R);
    this.joyGraphics.lineStyle(2, 0xf59e0b, 0.55);
    this.joyGraphics.strokeCircle(jx, jy, this.JOY_R);
    // Cardinal dots
    [0, 90, 180, 270].forEach(deg => {
      const rad = (deg * Math.PI) / 180;
      this.joyGraphics!.fillStyle(0xf59e0b, 0.35);
      this.joyGraphics!.fillCircle(
        jx + Math.cos(rad) * (this.JOY_R - 10),
        jy + Math.sin(rad) * (this.JOY_R - 10),
        3,
      );
    });
    // Nub
    const nx = jx + ndx * this.JOY_R;
    const ny = jy + ndy * this.JOY_R;
    this.joyGraphics.fillStyle(0xf59e0b, 0.9);
    this.joyGraphics.fillCircle(nx, ny, this.NUB_R);
    this.joyGraphics.lineStyle(1.5, 0xfef3c7, 0.6);
    this.joyGraphics.strokeCircle(nx, ny, this.NUB_R);
  }

  // ─── Weather ───────────────────────────────────────────────────────────────

  private createWeatherOverlay() {
    const w = this.scale.width;
    const h = this.scale.height;
    this.weatherOverlay = this.add.rectangle(
      w / 2, h / 2, w, h, 0x000000, 0,
    ).setDepth(DEPTHS.particles).setScrollFactor(0);
  }

  setWeather(type: string) {
    if (!this.weatherOverlay) return;
    this.weatherParticles.forEach(p => p.destroy());
    this.weatherParticles = [];
    this.weatherOverlay.setAlpha(0);
    switch (type) {
      case 'rainy':
        this.weatherOverlay.setFillStyle(0x1a3a5c, 0.15);
        this.createRainEffect();
        break;
      case 'foggy':
        this.weatherOverlay.setFillStyle(0xd0d0d0, 0.25);
        break;
      case 'stormy':
        this.weatherOverlay.setFillStyle(0x0a0a1a, 0.4);
        this.createRainEffect();
        break;
      case 'snowy':
        this.weatherOverlay.setFillStyle(0xe0f0ff, 0.1);
        this.createSnowEffect();
        break;
      case 'spring':
        this.createPetalEffect();
        break;
    }
  }

  private createRainEffect() {
    const sw = this.scale.width; const sh = this.scale.height;
    for (let i = 0; i < 40; i++) {
      const drop = this.add.text(
        Math.random() * sw, Math.random() * sh,
        '|', { fontSize: '10px', color: '#a0c0ff' },
      ).setDepth(DEPTHS.particles).setScrollFactor(0).setAlpha(0.5);
      this.weatherParticles.push(drop);
      this.tweens.add({
        targets: drop, y: sh + 20,
        duration: 600 + Math.random() * 300,
        onComplete: () => { drop.y = -10; drop.x = Math.random() * sw; },
        repeat: -1,
      });
    }
  }

  private createSnowEffect() {
    const sw = this.scale.width; const sh = this.scale.height;
    for (let i = 0; i < 30; i++) {
      const flake = this.add.text(
        Math.random() * sw, Math.random() * sh,
        '❄', { fontSize: '12px', color: '#e0f0ff' },
      ).setDepth(DEPTHS.particles).setScrollFactor(0).setAlpha(0.7);
      this.weatherParticles.push(flake);
      this.tweens.add({
        targets: flake, y: sh + 20, x: `+=${Math.random() * 60 - 30}`,
        duration: 2000 + Math.random() * 1000,
        onComplete: () => { flake.y = -20; flake.x = Math.random() * sw; },
        repeat: -1,
      });
    }
  }

  private createPetalEffect() {
    const sw = this.scale.width; const sh = this.scale.height;
    const petals = ['🌸', '🌺', '🌼'];
    for (let i = 0; i < 15; i++) {
      const petal = this.add.text(
        Math.random() * sw, -20,
        petals[Math.floor(Math.random() * petals.length)],
        { fontSize: '14px' },
      ).setDepth(DEPTHS.particles).setScrollFactor(0);
      this.weatherParticles.push(petal);
      this.tweens.add({
        targets: petal,
        y: sh + 30, x: `+=${Math.random() * 100 - 50}`,
        duration: 3000 + Math.random() * 2000, delay: Math.random() * 3000,
        onComplete: () => { petal.y = -20; petal.x = Math.random() * sw; },
        repeat: -1,
      });
    }
  }

  // ─── Region Label ──────────────────────────────────────────────────────────

  private addRegionLabel() {
    const region = REGIONS.find(r => r.id === this.currentRegion);
    if (!region) return;
    const label = this.add.text(this.scale.width / 2, 30,
      `${region.name.hanzi}  ${region.name.pinyin}`, {
        fontSize: '14px', color: '#f59e0b',
        backgroundColor: '#00000090',
        padding: { x: 8, y: 4 },
        fontFamily: 'serif',
      }
    ).setOrigin(0.5).setDepth(DEPTHS.ui).setScrollFactor(0);
    this.tweens.add({
      targets: label, alpha: 0,
      duration: 1000, delay: 3000,
    });
  }

  // ─── Interaction ───────────────────────────────────────────────────────────

  private interactWithNPC(npcId: string) {
    const sprite = this.npcSprites.get(npcId);
    if (!sprite) return;
    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, sprite.x, sprite.y);
    const maxDist = this.isMobile ? 120 : 80;
    if (dist > maxDist) {
      this.onNotify?.('Chegue mais perto!', '靠近', 'kào jìn');
      return;
    }
    this.onNPCInteract?.(npcId);
  }

  private changeRegion(dest: RegionId) {
    this.cameras.main.fade(300, 0, 0, 0);
    this.time.delayedCall(350, () => {
      this.currentRegion = dest;
      this.onRegionChange?.(dest);
      this.scene.restart({ region: dest, playerName: this.playerName, playerGender: this.playerGender });
    });
  }

  // Called by GameCanvas when the store's currentRegion changes (e.g. from MapPanel travel)
  updateRegion(regionId: RegionId) {
    if (regionId !== this.currentRegion) {
      this.changeRegion(regionId);
    }
  }

  // ─── Update ────────────────────────────────────────────────────────────────

  update(_time: number, _delta: number) {
    this.handleMovement();
    this.checkNPCProximity();
    this.updatePlayerLabel();
  }

  private handleMovement() {
    const vel = { x: 0, y: 0 };
    const speed = PLAYER_SPEED;

    if (this.cursors.left.isDown  || this.wasd.A.isDown) vel.x = -speed;
    if (this.cursors.right.isDown || this.wasd.D.isDown) vel.x =  speed;
    if (this.cursors.up.isDown    || this.wasd.W.isDown) vel.y = -speed;
    if (this.cursors.down.isDown  || this.wasd.S.isDown) vel.y =  speed;

    // Touch joystick input (mobile)
    if (vel.x === 0 && vel.y === 0 && this.touchJoy.active) {
      vel.x = this.touchJoy.dx * speed;
      vel.y = this.touchJoy.dy * speed;
    }

    if (vel.x !== 0 && vel.y !== 0) {
      vel.x *= 0.707;
      vel.y *= 0.707;
    }

    this.player.setVelocity(vel.x, vel.y);

    // Simple flip
    if (vel.x < 0) this.player.setFlipX(true);
    else if (vel.x > 0) this.player.setFlipX(false);
  }

  private checkNPCProximity() {
    let nearestNPC: string | null = null;
    let nearestDist = 80;
    this.npcSprites.forEach((sprite, npcId) => {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, sprite.x, sprite.y);
      if (d < nearestDist) { nearestDist = d; nearestNPC = npcId; }
    });
    this.nearestNPCId = nearestNPC;
    if (nearestNPC) {
      if (!this.interactIndicator) {
        const hint = this.isMobile ? '👆 对话' : '[E] 对话';
        this.interactIndicator = this.add.text(0, 0, hint, {
          fontSize: '10px', color: '#fef3c7',
          backgroundColor: '#1a1a2e90',
          padding: { x: 4, y: 2 },
        }).setDepth(DEPTHS.ui);
      }
      this.interactIndicator.setPosition(this.player.x - 20, this.player.y - 40);
      if (!this.isMobile && Phaser.Input.Keyboard.JustDown(this.interactKey)) {
        this.interactWithNPC(nearestNPC);
      }
    } else {
      this.interactIndicator?.destroy();
      this.interactIndicator = undefined;
    }
  }

  private updatePlayerLabel() {
    if (this.playerLabel) {
      this.playerLabel.setPosition(this.player.x, this.player.y - 22);
    }
  }

  private cleanup() {
    this.weatherParticles.forEach(p => p.destroy());
    this.joyGraphics?.destroy();
  }
}
