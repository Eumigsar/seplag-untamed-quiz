import { Scene, GameObjects, Physics } from 'phaser';
import { Bus, EV } from '../EventBus';

const W = 800, H = 600;
const TILE = 48;
const COLS = Math.ceil(W / TILE) + 2;
const ROWS = Math.ceil(H / TILE) + 2;
const SPEED = 180;

function buildFloor(scene: Scene) {
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const dark = (r + c) % 2 === 0;
      g.fillStyle(dark ? 0x12172a : 0x161c30, 1);
      g.fillRect(c * TILE, r * TILE, TILE, TILE);
      g.lineStyle(1, 0x1e2540, 0.6);
      g.strokeRect(c * TILE, r * TILE, TILE, TILE);
    }
  }
  g.generateTexture('floor', COLS * TILE, ROWS * TILE);
  g.destroy();
}

function buildWall(scene: Scene) {
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(0x1a0a00, 1);
  g.fillRect(0, 0, TILE, TILE);
  g.fillStyle(0x2d1200, 1);
  g.fillRect(2, 2, TILE - 4, 10);
  g.fillRect(2, 16, TILE - 4, 10);
  g.fillRect(2, 30, TILE - 4, 10);
  g.lineStyle(1, 0x0a0500, 1);
  g.strokeRect(0, 0, TILE, TILE);
  g.generateTexture('wall', TILE, TILE);
  g.destroy();
}

function buildPlayer(scene: Scene) {
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(0x000000, 0.25);
  g.fillEllipse(24, 58, 36, 10);
  g.fillStyle(0x2a5caa, 1);
  g.fillTriangle(8, 56, 40, 56, 28, 28);
  g.fillTriangle(16, 56, 48, 56, 28, 28);
  g.fillStyle(0xd4af37, 1);
  g.fillRect(18, 35, 20, 4);
  g.fillStyle(0xf0c080, 1);
  g.fillRect(22, 22, 12, 8);
  g.fillStyle(0xf0c080, 1);
  g.fillCircle(28, 16, 13);
  g.fillStyle(0x1a1a1a, 1);
  g.fillRect(15, 4, 26, 10);
  g.fillCircle(15, 10, 5);
  g.fillCircle(41, 10, 5);
  g.fillStyle(0x1a1a1a, 1);
  g.fillCircle(23, 15, 2.5);
  g.fillCircle(33, 15, 2.5);
  g.fillStyle(0xc06040, 1);
  g.fillRect(24, 20, 8, 2);
  g.fillStyle(0x2a5caa, 1);
  g.fillRect(6, 28, 10, 20);
  g.fillRect(40, 28, 10, 20);
  g.fillStyle(0xf0c080, 1);
  g.fillRect(7, 44, 8, 6);
  g.fillRect(41, 44, 8, 6);
  g.generateTexture('player', 56, 64);
  g.destroy();
}

function buildSifu(scene: Scene) {
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(0x000000, 0.3);
  g.fillEllipse(32, 74, 44, 12);
  g.fillStyle(0x8b6914, 1);
  g.fillTriangle(6, 72, 58, 72, 36, 24);
  g.fillTriangle(14, 72, 66, 72, 36, 24);
  g.fillStyle(0xd4af37, 1);
  g.fillRect(30, 24, 6, 48);
  g.fillRect(28, 44, 10, 4);
  g.fillStyle(0x6b4f0f, 1);
  g.fillRect(8, 24, 10, 40);
  g.fillRect(46, 24, 10, 40);
  g.fillStyle(0xe8b080, 1);
  g.fillRect(29, 18, 10, 8);
  g.fillStyle(0xe8b080, 1);
  g.fillCircle(34, 12, 14);
  g.fillStyle(0xf5f0e8, 1);
  g.fillTriangle(24, 18, 44, 18, 34, 38);
  g.fillStyle(0xf0ebe0, 1);
  g.fillRect(26, 16, 16, 4);
  g.fillStyle(0x4a1a00, 1);
  g.fillTriangle(20, 4, 48, 4, 34, -12);
  g.fillRect(18, 2, 32, 5);
  g.fillStyle(0xd4af37, 1);
  g.fillRect(18, 2, 32, 2);
  g.fillStyle(0x1a1a1a, 1);
  g.fillRect(26, 10, 6, 2);
  g.fillRect(36, 10, 6, 2);
  g.fillStyle(0x4a2800, 1);
  g.fillRect(62, -4, 5, 78);
  g.fillStyle(0xd4af37, 1);
  g.fillCircle(64, -4, 7);
  g.fillStyle(0xd4af37, 0.6);
  g.fillCircle(64, -4, 11);
  g.generateTexture('sifu', 80, 80);
  g.destroy();
}

function buildLantern(scene: Scene) {
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(0xffaa00, 0.15);
  g.fillCircle(16, 20, 24);
  g.fillStyle(0xcc2200, 1);
  g.fillRoundedRect(8, 8, 16, 24, 4);
  g.fillStyle(0xd4af37, 1);
  g.fillRect(6, 8, 20, 3);
  g.fillRect(6, 29, 20, 3);
  g.fillStyle(0xffdd44, 0.7);
  g.fillRoundedRect(11, 11, 10, 18, 2);
  g.fillStyle(0xd4af37, 1);
  g.fillRect(14, 32, 4, 2);
  g.fillRect(13, 34, 2, 8);
  g.fillRect(17, 34, 2, 6);
  g.fillRect(15, 2, 2, 7);
  g.generateTexture('lantern', 32, 48);
  g.destroy();
}

function buildParticle(scene: Scene) {
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(0xd4af37, 1);
  g.fillCircle(4, 4, 4);
  g.generateTexture('particle', 8, 8);
  g.destroy();
}

export class Game extends Scene {
  private player!: Physics.Arcade.Image;
  private sifu!: Physics.Arcade.Image;
  private walls!: Physics.Arcade.StaticGroup;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { up: Phaser.Input.Keyboard.Key; down: Phaser.Input.Keyboard.Key; left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key };
  private joyDir = { x: 0, y: 0 };
  private interacting = false;
  private nameText!: GameObjects.Text;

  constructor() { super('Game'); }

  preload() {
    buildFloor(this);
    buildWall(this);
    buildPlayer(this);
    buildSifu(this);
    buildLantern(this);
    buildParticle(this);
  }

  create() {
    const worldW = COLS * TILE;
    const worldH = ROWS * TILE;
    this.physics.world.setBounds(TILE, TILE, worldW - TILE * 2, worldH - TILE * 2);

    this.add.tileSprite(0, 0, worldW, worldH, 'floor').setOrigin(0, 0);

    this.walls = this.physics.add.staticGroup();
    const addWall = (x: number, y: number) => {
      this.walls.create(x * TILE + TILE / 2, y * TILE + TILE / 2, 'wall')
        .setDisplaySize(TILE, TILE).refreshBody();
    };
    for (let c = 0; c < COLS; c++) { addWall(c, 0); addWall(c, ROWS - 1); }
    for (let r = 1; r < ROWS - 1; r++) { addWall(0, r); addWall(COLS - 1, r); }

    [[3,3],[3,4],[4,3],[COLS-4,3],[COLS-4,4],[COLS-5,3],
     [3,ROWS-4],[3,ROWS-5],[4,ROWS-4],[COLS-4,ROWS-4],[COLS-4,ROWS-5],[COLS-5,ROWS-4]]
      .forEach(([c,r]) => addWall(c!, r!));

    [[2.5, 2.5],[COLS-2.5, 2.5],[2.5, ROWS-2.5],[COLS-2.5, ROWS-2.5]].forEach(([c, r]) => {
      const lantern = this.add.image(c! * TILE, r! * TILE, 'lantern').setDepth(5);
      this.tweens.add({ targets: lantern, y: lantern.y - 4, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.add.circle(c! * TILE, r! * TILE + 10, 28, 0xffaa00, 0.08).setDepth(4);
    });

    const startX = Math.floor(COLS / 2) * TILE;
    const startY = Math.floor(ROWS / 2) * TILE + TILE;
    this.player = this.physics.add.image(startX, startY, 'player').setDepth(10);
    this.player.setCollideWorldBounds(true);
    this.player.setBodySize(28, 40);
    this.player.setOffset(14, 24);

    this.nameText = this.add.text(startX, startY - 38, '', {
      fontFamily: 'Arial',
      fontSize: '11px',
      color: '#D4AF37',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5, 1).setDepth(20);

    const sifuX = (COLS - 5) * TILE;
    const sifuY = 4 * TILE;
    this.sifu = this.physics.add.image(sifuX, sifuY, 'sifu').setDepth(9).setImmovable(true);
    this.sifu.setBodySize(40, 60).setOffset(20, 20);
    this.add.text(sifuX, sifuY - 52, 'Sifu Li', {
      fontFamily: 'Arial', fontSize: '12px', color: '#D4AF37',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(20);
    const arrow = this.add.text(sifuX, sifuY - 68, '▼', {
      fontFamily: 'Arial', fontSize: '16px', color: '#00A86B',
    }).setOrigin(0.5).setDepth(20);
    this.tweens.add({ targets: arrow, y: arrow.y + 6, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    this.add.particles(0, 0, 'particle', {
      x: { min: TILE, max: (COLS - 1) * TILE },
      y: { min: TILE, max: (ROWS - 1) * TILE },
      speedY: { min: -20, max: -5 },
      speedX: { min: -5, max: 5 },
      scale: { start: 0.4, end: 0 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 3000,
      frequency: 200,
      tint: [0xd4af37, 0x00a86b, 0xffffff],
    }).setDepth(3);

    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.sifu, this.walls);
    this.physics.add.overlap(this.player, this.sifu, this.onSifuOverlap, undefined, this);

    this.cameras.main.setBounds(0, 0, worldW, worldH);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.6);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys({ up: 'W', down: 'S', left: 'A', right: 'D' }) as typeof this.wasd;

    Bus.on('input-joy', (d: { x: number; y: number }) => { this.joyDir = d; });
    Bus.on(EV.CLOSE, () => {
      this.time.delayedCall(800, () => { this.interacting = false; });
    });
    Bus.on('set-name', (name: string) => {
      this.nameText.setText(name);
    });

    Bus.emit(EV.READY, this);
  }

  update() {
    if (!this.player) return;

    let vx = 0, vy = 0;
    if (this.cursors.left.isDown  || this.wasd.left.isDown)  vx = -SPEED;
    if (this.cursors.right.isDown || this.wasd.right.isDown) vx =  SPEED;
    if (this.cursors.up.isDown    || this.wasd.up.isDown)    vy = -SPEED;
    if (this.cursors.down.isDown  || this.wasd.down.isDown)  vy =  SPEED;
    if (vx === 0 && vy === 0) { vx = this.joyDir.x * SPEED; vy = this.joyDir.y * SPEED; }

    this.player.setVelocity(vx, vy);
    if (vx !== 0) this.player.setFlipX(vx < 0);

    this.nameText.setPosition(this.player.x, this.player.y - 38);

    if ((vx !== 0 || vy !== 0) && this.time.now % 2000 < 20) {
      Bus.emit(EV.MOVED, { x: this.player.x, y: this.player.y });
    }
  }

  private onSifuOverlap() {
    if (this.interacting) return;
    this.interacting = true;
    Bus.emit(EV.INTERACT, { npc: 'Sifu Li' });
  }
}
