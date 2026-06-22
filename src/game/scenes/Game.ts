import { Scene, GameObjects, Physics } from 'phaser';
import { Bus, EV } from '../EventBus';

const TILE = 48;
const COLS = Math.ceil(800 / TILE) + 2;
const ROWS = Math.ceil(600 / TILE) + 2;
const SPEED = 180;
const FW = 48, FH = 64;
const DIRS = ['down', 'up', 'left', 'right'];

// ── Floor ────────────────────────────────────────────────────────────────────
function buildFloor(scene: Scene) {
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      g.fillStyle((r + c) % 2 === 0 ? 0x12172a : 0x161c30, 1);
      g.fillRect(c * TILE, r * TILE, TILE, TILE);
      g.lineStyle(1, 0x1e2540, 0.5);
      g.strokeRect(c * TILE, r * TILE, TILE, TILE);
    }
  }
  g.generateTexture('floor', COLS * TILE, ROWS * TILE);
  g.destroy();
}

// ── Wall ─────────────────────────────────────────────────────────────────────
function buildWall(scene: Scene) {
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(0x1a0a00, 1);
  g.fillRect(0, 0, TILE, TILE);
  g.fillStyle(0x2d1200, 1);
  [2, 16, 30].forEach(y => g.fillRect(2, y, TILE - 4, 10));
  g.lineStyle(1, 0x0a0500, 1);
  g.strokeRect(0, 0, TILE, TILE);
  g.generateTexture('wall', TILE, TILE);
  g.destroy();
}

// ── Player frame (drawn into a shared graphics object) ────────────────────────
function drawFrame(
  g: GameObjects.Graphics,
  ox: number, oy: number,
  dir: number, fr: number
) {
  const cx = ox + FW / 2;
  // step: -1, 0, +1, 0 across frames 0-3 for oscillation
  const step = fr === 1 ? 1 : fr === 3 ? -1 : 0;
  const bob = step !== 0 ? -1 : 0;

  // shadow
  g.fillStyle(0x000000, 0.18);
  g.fillEllipse(cx, oy + FH - 2, 26, 6);

  if (dir === 0) { // ── DOWN (front view) ─────────────────────────────────────
    // shoes
    g.fillStyle(0x0a0500, 1);
    g.fillRoundedRect(cx - 13 + step * 5, oy + 57 + bob, 11, 6, 2);
    g.fillRoundedRect(cx + 2 - step * 5, oy + 57 + bob, 11, 6, 2);
    // lower legs
    g.fillStyle(0x0d1f4a, 1);
    g.fillRect(cx - 12 + step * 4, oy + 44 + bob, 10, 14);
    g.fillRect(cx + 2 - step * 4, oy + 44 + bob, 10, 14);
    // robe body
    g.fillStyle(0x1e4d8c, 1);
    g.fillRect(cx - 16, oy + 26 + bob, 32, 20);
    // robe skirt flares
    g.fillStyle(0x1a4480, 1);
    g.fillTriangle(cx - 16, oy + 44 + bob, cx - 22, oy + 57 + bob, cx - 9, oy + 57 + bob);
    g.fillTriangle(cx + 16, oy + 44 + bob, cx + 9, oy + 57 + bob, cx + 22, oy + 57 + bob);
    // gold trim
    g.lineStyle(2, 0xd4af37, 1);
    g.strokeRect(cx - 15, oy + 26 + bob, 30, 19);
    g.lineStyle(1, 0xd4af37, 0.6);
    g.lineBetween(cx, oy + 26 + bob, cx, oy + 38 + bob);
    // arms
    const aSwing = step * 4;
    g.fillStyle(0x1e4d8c, 1);
    g.fillRect(cx - 24, oy + 26 + bob + aSwing, 9, 18);
    g.fillRect(cx + 15, oy + 26 + bob - aSwing, 9, 18);
    // hands
    g.fillStyle(0xf0c080, 1);
    g.fillCircle(cx - 19, oy + 45 + bob + aSwing, 5);
    g.fillCircle(cx + 20, oy + 45 + bob - aSwing, 5);
    // neck
    g.fillStyle(0xf0c080, 1);
    g.fillRect(cx - 5, oy + 22 + bob, 10, 6);
    // head
    g.fillStyle(0xf0c080, 1);
    g.fillCircle(cx, oy + 14, 12);
    g.fillCircle(cx - 11, oy + 15, 3);
    g.fillCircle(cx + 11, oy + 15, 3);
    // hair cap
    g.fillStyle(0x1a1a2e, 1);
    g.fillEllipse(cx, oy + 8, 26, 15);
    g.fillRect(cx - 13, oy + 4, 26, 8);
    // topknot + gold pin
    g.fillRect(cx - 3, oy + 1, 7, 7);
    g.fillCircle(cx + 1, oy + 1, 4);
    g.fillStyle(0xd4af37, 1);
    g.fillRect(cx, oy - 1, 2, 9);
    // eyes
    g.fillStyle(0x1a1a1a, 1);
    g.fillEllipse(cx - 5, oy + 13, 6, 4);
    g.fillEllipse(cx + 5, oy + 13, 6, 4);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(cx - 3, oy + 12, 1);
    g.fillCircle(cx + 7, oy + 12, 1);
    // brows
    g.lineStyle(1.5, 0x2a1a0a, 1);
    g.lineBetween(cx - 8, oy + 9, cx - 2, oy + 9);
    g.lineBetween(cx + 2, oy + 9, cx + 8, oy + 9);
    // mouth
    g.fillStyle(0xc06040, 1);
    g.fillRect(cx - 4, oy + 20, 8, 2);

  } else if (dir === 1) { // ── UP (back view) ────────────────────────────────
    // shoes
    g.fillStyle(0x0a0500, 1);
    g.fillRoundedRect(cx - 12 + step * 5, oy + 57 + bob, 10, 6, 2);
    g.fillRoundedRect(cx + 2 - step * 5, oy + 57 + bob, 10, 6, 2);
    // legs
    g.fillStyle(0x0d1f4a, 1);
    g.fillRect(cx - 11 + step * 4, oy + 44 + bob, 10, 14);
    g.fillRect(cx + 1 - step * 4, oy + 44 + bob, 10, 14);
    // robe back (slightly darker)
    g.fillStyle(0x163a70, 1);
    g.fillRect(cx - 15, oy + 26 + bob, 30, 20);
    g.fillStyle(0x1d4a88, 1);
    g.fillRect(cx - 12, oy + 27 + bob, 24, 18);
    // back seam
    g.lineStyle(1, 0x0c2450, 1);
    g.lineBetween(cx, oy + 27 + bob, cx, oy + 44 + bob);
    // gold trim
    g.lineStyle(2, 0xd4af37, 0.9);
    g.strokeRect(cx - 14, oy + 26 + bob, 28, 19);
    // skirt
    g.fillStyle(0x163a70, 1);
    g.fillTriangle(cx - 14, oy + 44 + bob, cx - 20, oy + 57 + bob, cx - 7, oy + 57 + bob);
    g.fillTriangle(cx + 14, oy + 44 + bob, cx + 7, oy + 57 + bob, cx + 20, oy + 57 + bob);
    // arms (reversed swing for back view)
    const aSwing = step * 4;
    g.fillStyle(0x163a70, 1);
    g.fillRect(cx - 23, oy + 26 + bob - aSwing, 9, 18);
    g.fillRect(cx + 14, oy + 26 + bob + aSwing, 9, 18);
    g.fillStyle(0xf0c080, 1);
    g.fillCircle(cx - 18, oy + 45 + bob - aSwing, 5);
    g.fillCircle(cx + 19, oy + 45 + bob + aSwing, 5);
    // neck
    g.fillStyle(0xf0c080, 1);
    g.fillRect(cx - 5, oy + 22 + bob, 10, 6);
    // head (back of head)
    g.fillStyle(0xf0c080, 1);
    g.fillCircle(cx, oy + 13, 12);
    // hair (fills most of head)
    g.fillStyle(0x1a1a2e, 1);
    g.fillCircle(cx, oy + 12, 13);
    g.fillRect(cx - 13, oy + 6, 26, 10);
    // topknot bun
    g.fillStyle(0x252540, 1);
    g.fillCircle(cx, oy + 5, 7);
    g.fillRect(cx - 3, oy + 1, 7, 6);
    // gold pin crosswise
    g.fillStyle(0xd4af37, 1);
    g.fillRect(cx - 7, oy + 5, 14, 2);
    g.fillRect(cx, oy - 1, 2, 7);

  } else if (dir === 2) { // ── LEFT (left profile) ───────────────────────────
    const lf = step * 6;
    // back leg
    g.fillStyle(0x0a0a30, 1);
    g.fillRect(cx + 2 - lf, oy + 44 + bob, 8, 14);
    g.fillStyle(0x060210, 1);
    g.fillRoundedRect(cx - lf, oy + 57 + bob, 10, 6, 2);
    // robe
    g.fillStyle(0x163a70, 1);
    g.fillRect(cx - 11, oy + 26 + bob, 20, 20);
    g.fillStyle(0x1e4d8c, 1);
    g.fillRect(cx - 9, oy + 27 + bob, 16, 18);
    g.lineStyle(2, 0xd4af37, 0.8);
    g.strokeRect(cx - 10, oy + 26 + bob, 18, 19);
    // front robe edge
    g.fillStyle(0x2255a0, 1);
    g.fillRect(cx - 11, oy + 26 + bob, 4, 20);
    // front leg
    g.fillStyle(0x0d1f4a, 1);
    g.fillRect(cx - 6 + lf, oy + 44 + bob, 8, 14);
    g.fillStyle(0x0a0500, 1);
    g.fillRoundedRect(cx - 4 + lf, oy + 57 + bob, 12, 6, 2);
    // back arm
    g.fillStyle(0x163a70, 1);
    g.fillRect(cx + 4, oy + 26 + bob + step * 5, 7, 17);
    g.fillStyle(0xe0b070, 1);
    g.fillCircle(cx + 7, oy + 44 + bob + step * 5, 4);
    // front arm
    g.fillStyle(0x1e4d8c, 1);
    g.fillRect(cx - 16, oy + 26 + bob - step * 5, 8, 17);
    g.fillStyle(0xf0c080, 1);
    g.fillCircle(cx - 12, oy + 44 + bob - step * 5, 5);
    // neck
    g.fillStyle(0xf0c080, 1);
    g.fillRect(cx - 8, oy + 22 + bob, 8, 6);
    // head (left profile, center slightly left)
    g.fillStyle(0xf0c080, 1);
    g.fillCircle(cx - 3, oy + 13, 12);
    g.fillCircle(cx + 8, oy + 14, 3); // far ear
    // hair
    g.fillStyle(0x1a1a2e, 1);
    g.fillCircle(cx - 2, oy + 10, 12);
    g.fillRect(cx - 12, oy + 5, 20, 8);
    // topknot right/back
    g.fillRect(cx + 3, oy + 2, 9, 6);
    g.fillCircle(cx + 11, oy + 5, 5);
    g.fillStyle(0xd4af37, 1);
    g.fillRect(cx + 5, oy + 1, 2, 10);
    // eye (left profile)
    g.fillStyle(0x1a1a1a, 1);
    g.fillEllipse(cx - 10, oy + 12, 5, 4);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(cx - 9, oy + 11, 1);
    g.lineStyle(1.5, 0x2a1a0a, 1);
    g.lineBetween(cx - 14, oy + 8, cx - 6, oy + 8);
    g.fillStyle(0xd49060, 1);
    g.fillRect(cx - 15, oy + 16, 4, 2);
    g.fillStyle(0xc06040, 1);
    g.fillRect(cx - 13, oy + 20, 5, 2);

  } else { // ── RIGHT (right profile) ─────────────────────────────────────────
    const lf = step * 6;
    // back leg
    g.fillStyle(0x0a0a30, 1);
    g.fillRect(cx - 10 + lf, oy + 44 + bob, 8, 14);
    g.fillStyle(0x060210, 1);
    g.fillRoundedRect(cx - 10 + lf, oy + 57 + bob, 10, 6, 2);
    // robe
    g.fillStyle(0x163a70, 1);
    g.fillRect(cx - 9, oy + 26 + bob, 20, 20);
    g.fillStyle(0x1e4d8c, 1);
    g.fillRect(cx - 7, oy + 27 + bob, 16, 18);
    g.lineStyle(2, 0xd4af37, 0.8);
    g.strokeRect(cx - 8, oy + 26 + bob, 18, 19);
    // front robe edge
    g.fillStyle(0x2255a0, 1);
    g.fillRect(cx + 7, oy + 26 + bob, 4, 20);
    // front leg
    g.fillStyle(0x0d1f4a, 1);
    g.fillRect(cx - 2 - lf, oy + 44 + bob, 8, 14);
    g.fillStyle(0x0a0500, 1);
    g.fillRoundedRect(cx - 8 - lf, oy + 57 + bob, 12, 6, 2);
    // back arm
    g.fillStyle(0x163a70, 1);
    g.fillRect(cx - 11, oy + 26 + bob + step * 5, 7, 17);
    g.fillStyle(0xe0b070, 1);
    g.fillCircle(cx - 7, oy + 44 + bob + step * 5, 4);
    // front arm
    g.fillStyle(0x1e4d8c, 1);
    g.fillRect(cx + 8, oy + 26 + bob - step * 5, 8, 17);
    g.fillStyle(0xf0c080, 1);
    g.fillCircle(cx + 12, oy + 44 + bob - step * 5, 5);
    // neck
    g.fillStyle(0xf0c080, 1);
    g.fillRect(cx, oy + 22 + bob, 8, 6);
    // head (right profile)
    g.fillStyle(0xf0c080, 1);
    g.fillCircle(cx + 3, oy + 13, 12);
    g.fillCircle(cx - 8, oy + 14, 3); // far ear
    // hair
    g.fillStyle(0x1a1a2e, 1);
    g.fillCircle(cx + 2, oy + 10, 12);
    g.fillRect(cx - 8, oy + 5, 20, 8);
    // topknot left/back
    g.fillRect(cx - 12, oy + 2, 9, 6);
    g.fillCircle(cx - 11, oy + 5, 5);
    g.fillStyle(0xd4af37, 1);
    g.fillRect(cx - 11, oy + 1, 2, 10);
    // eye (right profile)
    g.fillStyle(0x1a1a1a, 1);
    g.fillEllipse(cx + 10, oy + 12, 5, 4);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(cx + 9, oy + 11, 1);
    g.lineStyle(1.5, 0x2a1a0a, 1);
    g.lineBetween(cx + 6, oy + 8, cx + 14, oy + 8);
    g.fillStyle(0xd49060, 1);
    g.fillRect(cx + 11, oy + 16, 4, 2);
    g.fillStyle(0xc06040, 1);
    g.fillRect(cx + 8, oy + 20, 5, 2);
  }
}

// ── Player spritesheet: 4 cols × 4 rows → 192 × 256 ─────────────────────────
function buildPlayerSheet(scene: Scene) {
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  for (let dir = 0; dir < 4; dir++) {
    for (let fr = 0; fr < 4; fr++) {
      drawFrame(g, fr * FW, dir * FH, dir, fr);
    }
  }
  g.generateTexture('player_sheet', 4 * FW, 4 * FH);
  g.destroy();

  const tex = scene.textures.get('player_sheet');
  for (let dir = 0; dir < 4; dir++) {
    for (let fr = 0; fr < 4; fr++) {
      tex.add(`${DIRS[dir]}_${fr}`, 0, fr * FW, dir * FH, FW, FH);
    }
  }
}

// ── Sifu (improved art: 80 × 96) ─────────────────────────────────────────────
function buildSifu(scene: Scene) {
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  const W = 80, H = 96;
  const cx = 36; // character center X (staff lives at x≈64)

  // shadow
  g.fillStyle(0x000000, 0.28);
  g.fillEllipse(cx, H - 5, 50, 11);

  // staff (bamboo, behind character)
  g.fillStyle(0x4a2800, 1);
  g.fillRect(62, 0, 6, H - 10);
  g.fillStyle(0x6b4218, 1);
  g.fillRect(63, 0, 2, H - 10);
  // staff bamboo nodes
  [14, 28, 42, 56, 70].forEach(y => {
    g.fillStyle(0xd4af37, 0.7);
    g.fillRect(61, y, 8, 2);
  });
  // staff orb — glow layers
  g.fillStyle(0x00ccff, 0.12);
  g.fillCircle(65, 8, 16);
  g.fillStyle(0x00ccff, 0.25);
  g.fillCircle(65, 8, 11);
  g.fillStyle(0x44ddff, 1);
  g.fillCircle(65, 8, 7);
  g.fillStyle(0xaaffff, 1);
  g.fillCircle(63, 6, 3);

  // robe (large triangular, earthy gold/tawny-brown)
  g.fillStyle(0x6b4f0f, 1);
  g.fillTriangle(cx - 28, H - 8, cx + 26, H - 8, cx, 24);
  g.fillStyle(0x8b6914, 1);
  g.fillTriangle(cx - 20, H - 8, cx + 18, H - 8, cx, 28);
  // center gold band
  g.fillStyle(0xd4af37, 1);
  g.fillRect(cx - 2, 28, 4, H - 36);
  // gold sash
  g.fillRect(cx - 14, 52, 28, 5);
  // robe outline
  g.lineStyle(2, 0xd4af37, 0.9);
  g.lineBetween(cx - 28, H - 8, cx, 24);
  g.lineBetween(cx + 26, H - 8, cx, 24);

  // left arm + scroll
  g.fillStyle(0x6b4f0f, 1);
  g.fillRect(cx - 30, 30, 11, 30);
  // scroll (parchment)
  g.fillStyle(0xf5e8c0, 1);
  g.fillRect(cx - 38, 24, 14, 26);
  g.fillStyle(0x8b6914, 1);
  g.fillRect(cx - 38, 24, 14, 3);
  g.fillRect(cx - 38, 47, 14, 3);
  g.lineStyle(1, 0xc8a820, 0.6);
  [30, 35, 40, 45].forEach(y => g.lineBetween(cx - 36, y, cx - 26, y));
  // left hand
  g.fillStyle(0xe8b080, 1);
  g.fillCircle(cx - 24, 56, 6);

  // right arm
  g.fillStyle(0x6b4f0f, 1);
  g.fillRect(cx + 18, 28, 11, 32);
  // right hand gripping staff
  g.fillStyle(0xe8b080, 1);
  g.fillCircle(cx + 23, 62, 6);

  // white inner-robe collar
  g.fillStyle(0xf0ebe0, 1);
  g.fillTriangle(cx - 8, 24, cx + 8, 24, cx, 44);
  g.fillStyle(0xe0d8c8, 1);
  g.fillTriangle(cx - 5, 24, cx + 5, 24, cx, 38);

  // neck
  g.fillStyle(0xe8b080, 1);
  g.fillRect(cx - 6, 18, 12, 8);

  // head
  g.fillStyle(0xe8b080, 1);
  g.fillCircle(cx, 12, 13);
  // ears (large lobes = wisdom)
  g.fillCircle(cx - 12, 13, 4);
  g.fillCircle(cx + 12, 13, 4);
  g.fillCircle(cx - 13, 17, 3);
  g.fillCircle(cx + 13, 17, 3);

  // beard (white, full)
  g.fillStyle(0xf0f0e8, 1);
  g.fillTriangle(cx - 9, 22, cx + 9, 22, cx, 44);
  g.fillStyle(0xe0e0d8, 0.7);
  g.lineStyle(1, 0xc0c0b8, 0.5);
  g.lineBetween(cx - 6, 24, cx - 9, 40);
  g.lineBetween(cx, 24, cx - 2, 44);
  g.lineBetween(cx + 6, 24, cx + 5, 40);

  // mustache
  g.fillStyle(0xe0e0d8, 1);
  g.fillEllipse(cx - 5, 20, 11, 4);
  g.fillEllipse(cx + 5, 20, 11, 4);

  // white hair
  g.fillStyle(0xf0f0e8, 1);
  g.fillEllipse(cx, 4, 28, 14);
  g.fillRect(cx - 14, 0, 28, 8);
  // hair bun
  g.fillStyle(0xe8e8de, 1);
  g.fillCircle(cx, -2, 8);
  // gold headband
  g.fillStyle(0xd4af37, 1);
  g.fillRect(cx - 14, 2, 28, 3);
  // jade gem on headband
  g.fillStyle(0x00a86b, 1);
  g.fillCircle(cx, 3, 3);

  // eyebrows (bushy white)
  g.fillStyle(0xe8e8e0, 1);
  g.fillEllipse(cx - 5, 6, 13, 4);
  g.fillEllipse(cx + 5, 6, 13, 4);

  // eyes (wise, slightly narrowed)
  g.fillStyle(0x1a1a1a, 1);
  g.fillEllipse(cx - 5, 10, 7, 4);
  g.fillEllipse(cx + 5, 10, 7, 4);
  g.fillStyle(0x3a1800, 1);
  g.fillEllipse(cx - 5, 10, 4, 3);
  g.fillEllipse(cx + 5, 10, 4, 3);

  // nose
  g.fillStyle(0xd09060, 1);
  g.fillCircle(cx, 16, 3);

  g.generateTexture('sifu', W, H);
  g.destroy();
}

// ── Lantern ───────────────────────────────────────────────────────────────────
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

// ── Particle ──────────────────────────────────────────────────────────────────
function buildParticle(scene: Scene) {
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(0xd4af37, 1);
  g.fillCircle(4, 4, 4);
  g.generateTexture('particle', 8, 8);
  g.destroy();
}

// ── Game Scene ────────────────────────────────────────────────────────────────
export class Game extends Scene {
  private player!: Physics.Arcade.Sprite;
  private sifu!: Physics.Arcade.Image;
  private walls!: Physics.Arcade.StaticGroup;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { up: Phaser.Input.Keyboard.Key; down: Phaser.Input.Keyboard.Key; left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key };
  private joyDir = { x: 0, y: 0 };
  private interacting = false;
  private nameText!: GameObjects.Text;
  private lastDir = 'down';

  constructor() { super('Game'); }

  preload() {
    buildFloor(this);
    buildWall(this);
    buildPlayerSheet(this);
    buildSifu(this);
    buildLantern(this);
    buildParticle(this);
  }

  create() {
    const worldW = COLS * TILE;
    const worldH = ROWS * TILE;
    this.physics.world.setBounds(TILE, TILE, worldW - TILE * 2, worldH - TILE * 2);

    this.add.tileSprite(0, 0, worldW, worldH, 'floor').setOrigin(0, 0);

    // Walls
    this.walls = this.physics.add.staticGroup();
    const addWall = (x: number, y: number) => {
      this.walls.create(x * TILE + TILE / 2, y * TILE + TILE / 2, 'wall')
        .setDisplaySize(TILE, TILE).refreshBody();
    };
    for (let c = 0; c < COLS; c++) { addWall(c, 0); addWall(c, ROWS - 1); }
    for (let r = 1; r < ROWS - 1; r++) { addWall(0, r); addWall(COLS - 1, r); }
    [[3,3],[3,4],[4,3],[COLS-4,3],[COLS-4,4],[COLS-5,3],
     [3,ROWS-4],[3,ROWS-5],[4,ROWS-4],[COLS-4,ROWS-4],[COLS-4,ROWS-5],[COLS-5,ROWS-4]]
      .forEach(([c, r]) => addWall(c!, r!));

    // Lanterns at corners
    [[2.5, 2.5],[COLS-2.5, 2.5],[2.5, ROWS-2.5],[COLS-2.5, ROWS-2.5]].forEach(([c, r]) => {
      const lantern = this.add.image(c! * TILE, r! * TILE, 'lantern').setDepth(5);
      this.tweens.add({ targets: lantern, y: lantern.y - 4, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.add.circle(c! * TILE, r! * TILE + 10, 28, 0xffaa00, 0.07).setDepth(4);
    });

    // Player sprite
    const startX = Math.floor(COLS / 2) * TILE;
    const startY = Math.floor(ROWS / 2) * TILE + TILE;
    this.player = this.physics.add.sprite(startX, startY, 'player_sheet', 'down_0').setDepth(10);
    this.player.setCollideWorldBounds(true);
    this.player.setBodySize(22, 28);
    this.player.setOffset(13, 32);

    // Player animations
    DIRS.forEach(dir => {
      this.anims.create({
        key: `walk_${dir}`,
        frames: [0, 1, 2, 3].map(f => ({ key: 'player_sheet', frame: `${dir}_${f}` })),
        frameRate: 9,
        repeat: -1,
      });
      this.anims.create({
        key: `idle_${dir}`,
        frames: [{ key: 'player_sheet', frame: `${dir}_0` }],
        frameRate: 1,
        repeat: -1,
      });
    });
    this.player.play('idle_down');

    // Name text
    this.nameText = this.add.text(startX, startY - 42, '', {
      fontFamily: 'Arial', fontSize: '11px', color: '#D4AF37',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5, 1).setDepth(20);

    // Sifu NPC
    const sifuX = (COLS - 5) * TILE;
    const sifuY = 5 * TILE;
    this.sifu = this.physics.add.image(sifuX, sifuY, 'sifu').setDepth(9).setImmovable(true);
    this.sifu.setBodySize(40, 68).setOffset(16, 16);
    this.tweens.add({ targets: this.sifu, y: this.sifu.y - 5, duration: 2400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    this.add.text(sifuX, sifuY - 66, '師父 李', {
      fontFamily: 'Arial', fontSize: '14px', color: '#D4AF37',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(20);
    const arrow = this.add.text(sifuX, sifuY - 82, '▼', {
      fontFamily: 'Arial', fontSize: '16px', color: '#00A86B',
    }).setOrigin(0.5).setDepth(20);
    this.tweens.add({ targets: arrow, y: arrow.y + 6, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // Ambient particles
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

    // Physics
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.sifu, this.walls);
    this.physics.add.overlap(this.player, this.sifu, this.onSifuOverlap, undefined, this);

    // Camera
    this.cameras.main.setBounds(0, 0, worldW, worldH);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.6);

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys({ up: 'W', down: 'S', left: 'A', right: 'D' }) as typeof this.wasd;

    Bus.on('input-joy', (d: { x: number; y: number }) => { this.joyDir = d; });
    Bus.on(EV.CLOSE, () => { this.time.delayedCall(800, () => { this.interacting = false; }); });
    Bus.on('set-name', (name: string) => { this.nameText.setText(name); });

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

    // Animation state machine
    if (Math.abs(vx) >= Math.abs(vy) && vx !== 0) {
      if (vx > 0) { this.lastDir = 'right'; this.player.play('walk_right', true); }
      else        { this.lastDir = 'left';  this.player.play('walk_left',  true); }
    } else if (vy !== 0) {
      if (vy > 0) { this.lastDir = 'down'; this.player.play('walk_down', true); }
      else        { this.lastDir = 'up';   this.player.play('walk_up',   true); }
    } else {
      this.player.play(`idle_${this.lastDir}`, true);
    }

    this.nameText.setPosition(this.player.x, this.player.y - 42);

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
