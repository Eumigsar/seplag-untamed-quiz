import { Scene, GameObjects, Physics } from 'phaser';
import { Bus, EV } from '../EventBus';

// ── World ────────────────────────────────────────────────────────────────────
const TILE = 48;
const COLS = Math.ceil(800 / TILE) + 2;
const ROWS = Math.ceil(600 / TILE) + 2;
const WALK_SPEED = 160;
const RUN_SPEED  = 290;
const FW = 48, FH = 64; // per frame

// Directions: 0=S(down) 1=SE 2=E(right) 3=NE 4=N(up) 5=NW 6=W(left) 7=SW
const DIR8 = ['down','se','right','ne','up','nw','left','sw'];
const DIR4 = ['s','e','n','w'];
// Map 8 dirs to nearest 4 for action animations
const D4MAP = [0,0,1,1,2,2,3,3]; // down→s, se→s, right→e, ne→e, up→n, nw→n, left→w, sw→w

// ── Helpers ──────────────────────────────────────────────────────────────────

// Returns true for directions that show front of character
const isFront = (d: number) => d === 0 || d === 1 || d === 7;
const isBack  = (d: number) => d === 3 || d === 4 || d === 5;
const isRightP= (d: number) => d === 2;
const isLeftP = (d: number) => d === 6;
// lateral lean for 3/4 views (positive = lean right)
const xLean   = (d: number) => (d===1||d===2||d===3) ? 4 : (d===5||d===6||d===7) ? -4 : 0;

type G = GameObjects.Graphics;

// ── Body drawing primitives ───────────────────────────────────────────────────

function drawBodyFront(g: G, cx: number, oy: number, leg: number, arm: number, bob: number, lean: number, xO: number) {
  const W = xO !== 0 ? 24 : 30;
  const lx = xO !== 0 ? 6 : 8;
  const rx = cx - W / 2 + xO * 0.3;
  // shoes
  g.fillStyle(0x0a0500, 1);
  g.fillRoundedRect(cx - lx - 1 + leg * 0.6 + xO * 0.2, oy + 57 + bob, 11, 6, 2);
  g.fillRoundedRect(cx + lx - 10 - leg * 0.6 + xO * 0.2, oy + 57 + bob, 11, 6, 2);
  // lower legs
  g.fillStyle(0x0d1f4a, 1);
  g.fillRect(cx - lx + leg * 0.5 + xO * 0.2, oy + 44 + bob, 9, 14);
  g.fillRect(cx + lx - 9 - leg * 0.5 + xO * 0.2, oy + 44 + bob, 9, 14);
  // robe body
  g.fillStyle(0x1e4d8c, 1);
  g.fillRect(rx, oy + 26 + bob + lean, W, 20);
  // skirt flares
  g.fillStyle(0x1a4480, 1);
  g.fillTriangle(rx, oy + 44 + bob + lean, rx - 6, oy + 57 + bob, rx + 9, oy + 57 + bob);
  g.fillTriangle(rx + W, oy + 44 + bob + lean, rx + W - 9, oy + 57 + bob, rx + W + 6, oy + 57 + bob);
  // gold trim
  g.lineStyle(2, 0xd4af37, 1);
  g.strokeRect(rx + 1, oy + 26 + bob + lean, W - 2, 19);
  g.lineStyle(1, 0xd4af37, 0.5);
  g.lineBetween(cx + xO * 0.3, oy + 26 + bob + lean, cx + xO * 0.3, oy + 39 + bob + lean);
  // arms
  g.fillStyle(0x1e4d8c, 1);
  g.fillRect(rx - 8, oy + 26 + bob + lean + arm, 9, 18);
  g.fillRect(rx + W - 1, oy + 26 + bob + lean - arm, 9, 18);
  g.fillStyle(0xf0c080, 1);
  g.fillCircle(rx - 4, oy + 45 + bob + lean + arm, 5);
  g.fillCircle(rx + W + 4, oy + 45 + bob + lean - arm, 5);
  // neck
  g.fillStyle(0xf0c080, 1);
  g.fillRect(cx - 5 + xO * 0.3, oy + 22 + bob + lean, 10, 6);
}

function drawHeadFront(g: G, cx: number, oy: number, bob: number, xO: number) {
  const hx = cx + xO * 0.3;
  const eL = xO * 0.2, eR = xO * 0.35;
  g.fillStyle(0xf0c080, 1);
  g.fillCircle(hx - 11, oy + 15 + bob, 3);
  g.fillCircle(hx + 11, oy + 15 + bob, 3);
  g.fillCircle(hx, oy + 14 + bob, 12);
  g.fillStyle(0x1a1a2e, 1);
  g.fillEllipse(hx, oy + 8 + bob, 26, 15);
  g.fillRect(hx - 13, oy + 4 + bob, 26, 8);
  g.fillRect(hx - 3, oy + 1 + bob, 7, 7);
  g.fillCircle(hx + 1, oy + 1 + bob, 4);
  g.fillStyle(0xd4af37, 1);
  g.fillRect(hx, oy - 1 + bob, 2, 9);
  g.fillStyle(0x1a1a1a, 1);
  g.fillEllipse(cx - 5 + eL, oy + 13 + bob, xO > 0 ? 5 : 6, 4);
  g.fillEllipse(cx + 5 + eR, oy + 13 + bob, xO < 0 ? 5 : 6, 4);
  g.fillStyle(0xffffff, 1);
  g.fillCircle(cx - 3 + eL, oy + 12 + bob, 1);
  g.fillCircle(cx + 7 + eR, oy + 12 + bob, 1);
  g.lineStyle(1.5, 0x2a1a0a, 1);
  g.lineBetween(cx - 8 + eL, oy + 9 + bob, cx - 2 + eL, oy + 9 + bob);
  g.lineBetween(cx + 2 + eR, oy + 9 + bob, cx + 8 + eR, oy + 9 + bob);
  g.fillStyle(0xc06040, 1);
  g.fillRect(cx - 4 + xO * 0.2, oy + 20 + bob, 8, 2);
}

function drawBodyProfile(g: G, cx: number, oy: number, fx: number, leg: number, arm: number, bob: number, lean: number) {
  const W = 18;
  const rx = cx - W / 2;
  const frontLegX = cx + fx * leg * 0.8;
  const backLegX  = cx - fx * leg * 0.8;
  // back leg
  g.fillStyle(0x0a0a30, 1);
  g.fillRect(backLegX - 4, oy + 44 + bob, 8, 14);
  g.fillStyle(0x060210, 1);
  g.fillRoundedRect(backLegX - 5, oy + 57 + bob, 10, 6, 2);
  // robe
  g.fillStyle(0x163a70, 1);
  g.fillRect(rx, oy + 26 + bob + lean, W, 20);
  g.fillStyle(0x1e4d8c, 1);
  g.fillRect(rx + 2, oy + 27 + bob + lean, W - 4, 18);
  g.lineStyle(2, 0xd4af37, 0.8);
  g.strokeRect(rx + 1, oy + 26 + bob + lean, W - 2, 19);
  // facing edge
  g.fillStyle(0x2255a0, 1);
  g.fillRect(fx > 0 ? rx + W - 4 : rx, oy + 26 + bob + lean, 4, 20);
  // front leg
  g.fillStyle(0x0d1f4a, 1);
  g.fillRect(frontLegX - 4, oy + 44 + bob, 8, 14);
  g.fillStyle(0x0a0500, 1);
  g.fillRoundedRect(frontLegX - 6, oy + 57 + bob, 12, 6, 2);
  // back arm
  g.fillStyle(0x163a70, 1);
  const baX = fx > 0 ? cx - 10 : cx + 3;
  g.fillRect(baX, oy + 26 + bob + lean + arm, 7, 17);
  g.fillStyle(0xe0b070, 1);
  g.fillCircle(baX + 3, oy + 44 + bob + lean + arm, 4);
  // front arm
  g.fillStyle(0x1e4d8c, 1);
  const faX = fx > 0 ? cx + 8 : cx - 15;
  g.fillRect(faX, oy + 26 + bob + lean - arm, 8, 17);
  g.fillStyle(0xf0c080, 1);
  g.fillCircle(faX + 4, oy + 44 + bob + lean - arm, 5);
  // neck
  g.fillStyle(0xf0c080, 1);
  g.fillRect(fx > 0 ? cx - 3 : cx - 7, oy + 22 + bob + lean, 8, 6);
}

function drawHeadProfile(g: G, cx: number, oy: number, fx: number, bob: number) {
  const hx = cx + fx * 2;
  g.fillStyle(0xf0c080, 1);
  g.fillCircle(hx - fx * 10, oy + 14 + bob, 3);
  g.fillCircle(hx, oy + 13 + bob, 12);
  g.fillStyle(0x1a1a2e, 1);
  g.fillCircle(hx, oy + 10 + bob, 12);
  g.fillRect(hx - 11, oy + 5 + bob, 20, 8);
  const kx = hx - fx * 3 - (fx < 0 ? 9 : 0);
  g.fillRect(kx, oy + 2 + bob, 9, 6);
  g.fillCircle(hx - fx * 11, oy + 5 + bob, 5);
  g.fillStyle(0xd4af37, 1);
  g.fillRect(hx - fx * 9, oy + 1 + bob, 2, 10);
  g.fillStyle(0x1a1a1a, 1);
  g.fillEllipse(hx + fx * 6, oy + 12 + bob, 5, 4);
  g.fillStyle(0xffffff, 1);
  g.fillCircle(hx + fx * 7, oy + 11 + bob, 1);
  g.lineStyle(1.5, 0x2a1a0a, 1);
  g.lineBetween(hx + fx * 3, oy + 8 + bob, hx + fx * 9, oy + 8 + bob);
  g.fillStyle(0xd49060, 1);
  g.fillRect(hx + fx * 10, oy + 16 + bob, fx * 4, 2);
  g.fillStyle(0xc06040, 1);
  g.fillRect(hx + fx * 7, oy + 20 + bob, fx * 5, 2);
}

function drawBodyBack(g: G, cx: number, oy: number, leg: number, arm: number, bob: number, lean: number, xO: number) {
  const W = xO !== 0 ? 22 : 28;
  const lx = xO !== 0 ? 5 : 8;
  const rx = cx - W / 2 + xO * 0.2;
  g.fillStyle(0x0a0500, 1);
  g.fillRoundedRect(cx - lx - 1 + leg * 0.6 + xO * 0.2, oy + 57 + bob, 10, 6, 2);
  g.fillRoundedRect(cx + lx - 9 - leg * 0.6 + xO * 0.2, oy + 57 + bob, 10, 6, 2);
  g.fillStyle(0x0d1f4a, 1);
  g.fillRect(cx - lx + leg * 0.5 + xO * 0.2, oy + 44 + bob, 9, 14);
  g.fillRect(cx + lx - 8 - leg * 0.5 + xO * 0.2, oy + 44 + bob, 9, 14);
  g.fillStyle(0x163a70, 1);
  g.fillRect(rx, oy + 26 + bob + lean, W, 20);
  g.fillStyle(0x1d4a88, 1);
  g.fillRect(rx + 2, oy + 27 + bob + lean, W - 4, 18);
  g.lineStyle(1, 0x0c2450, 1);
  g.lineBetween(cx + xO * 0.2, oy + 27 + bob + lean, cx + xO * 0.2, oy + 44 + bob + lean);
  g.lineStyle(2, 0xd4af37, 0.9);
  g.strokeRect(rx + 1, oy + 26 + bob + lean, W - 2, 19);
  g.fillStyle(0x163a70, 1);
  g.fillTriangle(rx, oy + 44 + bob + lean, rx - 5, oy + 57 + bob, rx + 9, oy + 57 + bob);
  g.fillTriangle(rx + W, oy + 44 + bob + lean, rx + W - 9, oy + 57 + bob, rx + W + 5, oy + 57 + bob);
  g.fillStyle(0x163a70, 1);
  g.fillRect(rx - 7, oy + 26 + bob + lean - arm, 9, 18);
  g.fillRect(rx + W - 2, oy + 26 + bob + lean + arm, 9, 18);
  g.fillStyle(0xf0c080, 1);
  g.fillCircle(rx - 3, oy + 45 + bob + lean - arm, 5);
  g.fillCircle(rx + W + 4, oy + 45 + bob + lean + arm, 5);
  g.fillStyle(0xf0c080, 1);
  g.fillRect(cx - 5 + xO * 0.2, oy + 22 + bob + lean, 10, 6);
}

function drawHeadBack(g: G, cx: number, oy: number, bob: number, xO: number) {
  const hx = cx + xO * 0.2;
  g.fillStyle(0xf0c080, 1);
  g.fillRect(hx - 4, oy + 22 + bob, 8, 5);
  g.fillCircle(hx, oy + 13 + bob, 12);
  g.fillStyle(0x1a1a2e, 1);
  g.fillCircle(hx, oy + 12 + bob, 13);
  g.fillRect(hx - 13, oy + 6 + bob, 26, 10);
  g.fillStyle(0x252540, 1);
  g.fillCircle(hx, oy + 5 + bob, 7);
  g.fillRect(hx - 3, oy + 1 + bob, 7, 6);
  g.fillStyle(0xd4af37, 1);
  g.fillRect(hx - 7, oy + 5 + bob, 14, 2);
  g.fillRect(hx, oy - 1 + bob, 2, 7);
}

// Draw a sword (blade + guard + handle)
function drawSword(g: G, x: number, y: number, angleDeg: number, scale = 1) {
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad), sin = Math.sin(rad);
  const bl = 26 * scale; // blade length
  const bw = 2 * scale;  // blade width
  // blade (silver)
  g.fillStyle(0xd8e8f0, 1);
  for (let i = 0; i < bl; i++) {
    const t = i / bl;
    const w = bw * (1 - t * 0.5);
    g.fillRect(x + cos * i - w / 2, y + sin * i - w / 2, w + 1, w + 1);
  }
  // blade edge shine
  g.lineStyle(1, 0xffffff, 0.6);
  g.lineBetween(x + cos * 2, y + sin * 2, x + cos * (bl - 2), y + sin * (bl - 2));
  // guard (gold)
  g.fillStyle(0xd4af37, 1);
  const gx = x + cos * 5, gy = y + sin * 5;
  g.fillRect(gx - sin * 5 - 1, gy + cos * 5 - 1, sin * 10 + 2, cos * 10 + 2);
  // handle (dark)
  g.fillStyle(0x3a1a08, 1);
  for (let i = -5; i < 5; i++) {
    g.fillRect(x + cos * i - 1, y + sin * i - 1, 3, 3);
  }
  g.fillStyle(0xd4af37, 1);
  for (let i = -5; i < 5; i += 3) {
    g.fillRect(x + cos * i - 1, y + sin * i - 1, 2, 2);
  }
  // pommel
  g.fillStyle(0xd4af37, 1);
  g.fillCircle(x + cos * -5, y + sin * -5, 3 * scale);
}

// ── Main movement frame drawer ────────────────────────────────────────────────

function drawMoveFrame(g: G, ox: number, oy: number, dir: number, fr: number, anim: 'walk'|'run'|'idle') {
  const cx = ox + FW / 2;
  const totalFr = anim === 'idle' ? 6 : 8;
  const t = (fr / totalFr) * Math.PI * 2;

  const legScale = anim === 'walk' ? 6 : anim === 'run' ? 11 : 0;
  const armScale = anim === 'walk' ? 4 : anim === 'run' ? 7  : 0;
  const bobScale = anim === 'walk' ? 1.5 : anim === 'run' ? 3 : 0;
  const lean     = anim === 'run' ? 3 : 0;

  const leg = Math.sin(t) * legScale;
  const arm = -Math.sin(t) * armScale;
  const bob = anim === 'idle'
    ? Math.sin(t * 0.5) * 1.5        // breathing
    : -Math.abs(Math.sin(t * 0.5)) * bobScale;

  const xO = xLean(dir);

  // shadow
  g.fillStyle(0x000000, 0.18);
  g.fillEllipse(cx, oy + FH - 2, 26, 6);

  if (isRightP(dir)) {
    drawBodyProfile(g, cx, oy, 1, leg, arm, bob, lean);
    drawHeadProfile(g, cx, oy, 1, bob - lean * 0.3);
  } else if (isLeftP(dir)) {
    drawBodyProfile(g, cx, oy, -1, leg, arm, bob, lean);
    drawHeadProfile(g, cx, oy, -1, bob - lean * 0.3);
  } else if (isBack(dir)) {
    drawBodyBack(g, cx, oy, leg, arm, bob, lean, xO);
    drawHeadBack(g, cx, oy, bob - lean * 0.3, xO);
  } else {
    drawBodyFront(g, cx, oy, leg, arm, bob, lean, xO);
    drawHeadFront(g, cx, oy, bob - lean * 0.3, xO);
  }
}

// ── Attack frame (4 cardinal directions, 6 frames) ───────────────────────────

function drawAttackFrame(g: G, ox: number, oy: number, dir4: number, fr: number) {
  // dir4: 0=s, 1=e, 2=n, 3=w
  const cx = ox + FW / 2;
  const fx = dir4 === 1 ? 1 : dir4 === 3 ? -1 : 0; // horizontal facing
  const faceDown = dir4 === 0;
  const faceUp   = dir4 === 2;

  // Attack phases
  const phase = fr / 5; // 0..1 over 6 frames
  const windUp   = Math.max(0, 1 - phase * 3);       // 0-0.33: rise
  const strike   = Math.max(0, Math.min(1, (phase - 0.33) * 4)); // 0.33-0.58: swing
  const recover  = Math.max(0, (phase - 0.66) * 3);  // 0.66-1: settle

  const bob = -windUp * 3 + recover * 2;
  const lean = strike * 4 - recover * 2;

  // Shadow
  g.fillStyle(0x000000, 0.2);
  g.fillEllipse(cx, oy + FH - 2, 26, 6);

  // Sword angle
  const swordAngle = faceDown
    ? -90 + windUp * 90 - strike * 160 + recover * 110
    : faceUp
    ? 90 - windUp * 90 + strike * 160 - recover * 110
    : fx > 0
    ? 0 + windUp * 90 - strike * 160 + recover * 100
    : 180 - windUp * 90 + strike * 160 - recover * 100;

  const swordTipX = faceDown
    ? cx + Math.cos((swordAngle * Math.PI) / 180) * 24
    : cx + Math.cos((swordAngle * Math.PI) / 180) * 24;
  const swordTipY = faceDown
    ? oy + 26 + bob + Math.sin((swordAngle * Math.PI) / 180) * 24
    : oy + 26 + bob + Math.sin((swordAngle * Math.PI) / 180) * 24;

  // Draw sword behind body on wind-up, in front during strike
  if (fr < 3) {
    drawSword(g, cx + (faceDown ? 8 : faceUp ? -8 : fx * 8), oy + 28 + bob, swordAngle);
  }

  // Body
  if (faceDown || (!faceUp && fx === 0)) {
    drawBodyFront(g, cx, oy, 0, strike * 5 - recover * 3, bob, lean, faceDown ? 3 : -3);
    drawHeadFront(g, cx, oy, bob, faceDown ? 3 : -3);
  } else if (faceUp) {
    drawBodyBack(g, cx, oy, 0, 0, bob, lean, 0);
    drawHeadBack(g, cx, oy, bob, 0);
  } else {
    drawBodyProfile(g, cx, oy, fx, 0, 0, bob, lean);
    drawHeadProfile(g, cx, oy, fx, bob);
  }

  // Draw sword in front during strike
  if (fr >= 3) {
    drawSword(g, cx + (faceDown ? 8 : faceUp ? -8 : fx * 10), oy + 26 + bob, swordAngle);
  }

  // Strike slash effect on frame 3-4
  if (fr >= 3 && fr <= 4) {
    g.lineStyle(2, 0xffffff, 0.5 - (fr - 3) * 0.4);
    const sa = (swordAngle + 15) * Math.PI / 180;
    const ea = (swordAngle - 15) * Math.PI / 180;
    for (let i = 0; i < 3; i++) {
      const a = sa + (ea - sa) * (i / 2);
      const r = 18 + i * 3;
      g.lineBetween(cx, oy + 30 + bob, cx + Math.cos(a) * r, oy + 30 + bob + Math.sin(a) * r);
    }
  }
}

// ── Sword draw frame (4 dirs, 4 frames) ───────────────────────────────────────

function drawSwordDrawFrame(g: G, ox: number, oy: number, dir4: number, fr: number) {
  const cx = ox + FW / 2;
  const fx = dir4 === 1 ? 1 : dir4 === 3 ? -1 : 0;
  const faceDown = dir4 === 0;
  const faceUp   = dir4 === 2;

  // Progress 0..1 over 4 frames
  const p = fr / 3;
  const bob = 0;
  const xO  = faceDown ? 3 : faceUp ? -3 : 0;

  // shadow
  g.fillStyle(0x000000, 0.18);
  g.fillEllipse(cx, oy + FH - 2, 26, 6);

  if (faceDown) {
    drawBodyFront(g, cx, oy, 0, 0, bob, 0, xO);
    drawHeadFront(g, cx, oy, bob, xO);
  } else if (faceUp) {
    drawBodyBack(g, cx, oy, 0, 0, bob, 0, xO);
    drawHeadBack(g, cx, oy, bob, xO);
  } else {
    drawBodyProfile(g, cx, oy, fx, 0, 0, bob, 0);
    drawHeadProfile(g, cx, oy, fx, bob);
  }

  // Draw sword being drawn: starts at hip (0) → held at angle (1)
  if (fr >= 1) {
    const hipX = cx + (faceDown ? 12 : faceUp ? -12 : fx * 12);
    const hipY = oy + 42;
    const drawAng = faceDown
      ? -90 + p * 50      // tilts up
      : faceUp
      ? 90 - p * 50
      : fx * (90 - p * 50);
    drawSword(g, hipX, hipY, drawAng, p * 0.9 + 0.1);
  }

  // Gleam on frame 2-3
  if (fr >= 2) {
    g.fillStyle(0xffffff, 0.6 - (fr - 2) * 0.5);
    const gx = cx + (faceDown ? 10 : faceUp ? -10 : fx * 10);
    g.fillCircle(gx, oy + 30, 4);
  }
}

// ── Meditation frame (8 frames) ───────────────────────────────────────────────

function drawMeditationFrame(g: G, ox: number, oy: number, fr: number) {
  const cx = ox + FW / 2;
  const t = (fr / 8) * Math.PI * 2;
  const pulse = Math.sin(t) * 0.5 + 0.5; // 0..1
  const lev   = Math.sin(t) * 1.5;        // slight levitation
  const bob   = -lev;

  // Outer aura rings
  g.fillStyle(0x00a8ff, 0.06 + pulse * 0.08);
  g.fillCircle(cx, oy + 46 + bob, 26 + pulse * 8);
  g.fillStyle(0x00a8ff, 0.12 + pulse * 0.1);
  g.fillCircle(cx, oy + 46 + bob, 18 + pulse * 5);

  // shadow
  g.fillStyle(0x000000, 0.15 - pulse * 0.05);
  g.fillEllipse(cx, oy + FH - 1 + lev * 0.5, 22 - pulse * 4, 5);

  // Seated body — cross-legged
  // Feet/legs folded
  g.fillStyle(0x0a0500, 1);
  g.fillEllipse(cx - 10, oy + 52 + bob, 14, 8);
  g.fillEllipse(cx + 10, oy + 52 + bob, 14, 8);
  g.fillStyle(0x0d1f4a, 1);
  g.fillEllipse(cx - 6, oy + 48 + bob, 20, 10);
  g.fillEllipse(cx + 6, oy + 48 + bob, 20, 10);
  // Robe lap
  g.fillStyle(0x1e4d8c, 1);
  g.fillEllipse(cx, oy + 44 + bob, 36, 16);
  g.lineStyle(2, 0xd4af37, 0.8);
  g.strokeEllipse(cx, oy + 44 + bob, 35, 15);
  // Torso
  g.fillStyle(0x1e4d8c, 1);
  g.fillRect(cx - 12, oy + 28 + bob, 24, 18);
  g.lineStyle(2, 0xd4af37, 1);
  g.strokeRect(cx - 11, oy + 28 + bob, 22, 17);
  // Arms resting on knees, palms up
  g.fillStyle(0x1e4d8c, 1);
  g.fillRect(cx - 20, oy + 34 + bob, 10, 12);
  g.fillRect(cx + 10, oy + 34 + bob, 10, 12);
  // Hands with qi orbs
  g.fillStyle(0xf0c080, 1);
  g.fillCircle(cx - 16, oy + 46 + bob, 5);
  g.fillCircle(cx + 16, oy + 46 + bob, 5);
  // Qi orbs on palms
  g.fillStyle(0x00d4ff, 0.6 + pulse * 0.3);
  g.fillCircle(cx - 16, oy + 44 + bob, 4 + pulse * 2);
  g.fillCircle(cx + 16, oy + 44 + bob, 4 + pulse * 2);
  g.fillStyle(0xaaffff, 0.9);
  g.fillCircle(cx - 16, oy + 44 + bob, 2);
  g.fillCircle(cx + 16, oy + 44 + bob, 2);
  // Neck + head
  g.fillStyle(0xf0c080, 1);
  g.fillRect(cx - 5, oy + 24 + bob, 10, 6);
  g.fillCircle(cx, oy + 16 + bob, 12);
  g.fillCircle(cx - 11, oy + 17 + bob, 3);
  g.fillCircle(cx + 11, oy + 17 + bob, 3);
  // Hair
  g.fillStyle(0x1a1a2e, 1);
  g.fillEllipse(cx, oy + 10 + bob, 26, 15);
  g.fillRect(cx - 13, oy + 6 + bob, 26, 8);
  g.fillRect(cx - 3, oy + 3 + bob, 7, 7);
  g.fillCircle(cx + 1, oy + 3 + bob, 4);
  g.fillStyle(0xd4af37, 1);
  g.fillRect(cx, oy + 1 + bob, 2, 8);
  // Eyes closed in meditation
  g.lineStyle(1.5, 0x1a1a1a, 1);
  g.lineBetween(cx - 8, oy + 15 + bob, cx - 3, oy + 16 + bob);
  g.lineBetween(cx + 3, oy + 15 + bob, cx + 8, oy + 16 + bob);
  // Serene mouth
  g.lineStyle(1, 0xc06040, 0.7);
  g.lineBetween(cx - 3, oy + 21 + bob, cx + 3, oy + 21 + bob);
  // Floating particles during pulse
  const np = 6;
  for (let i = 0; i < np; i++) {
    const a = (i / np) * Math.PI * 2 + t;
    const r = 20 + pulse * 6;
    const px = cx + Math.cos(a) * r;
    const py = oy + 40 + bob + Math.sin(a) * r * 0.5;
    g.fillStyle(0x00ccff, 0.4 + pulse * 0.4);
    g.fillCircle(px, py, 2 + pulse * 1);
  }
}

// ── Qi Cultivation frame (8 frames) ──────────────────────────────────────────

function drawQiFrame(g: G, ox: number, oy: number, fr: number) {
  const cx = ox + FW / 2;
  const t = (fr / 8) * Math.PI * 2;
  const pulse = Math.sin(t) * 0.5 + 0.5;
  const rise  = Math.sin(t * 0.5) * 2;
  const bob   = -rise;
  const armRaise = pulse * 12; // arms rise

  // Outer vortex aura
  g.fillStyle(0xd4af37, 0.04 + pulse * 0.06);
  g.fillCircle(cx, oy + 36, 38 + pulse * 10);
  g.fillStyle(0x00a86b, 0.06 + pulse * 0.08);
  g.fillCircle(cx, oy + 36, 26 + pulse * 6);

  // shadow
  g.fillStyle(0x000000, 0.16);
  g.fillEllipse(cx, oy + FH - 2, 26, 6);

  // Standing body — arms raised
  // Shoes
  g.fillStyle(0x0a0500, 1);
  g.fillRoundedRect(cx - 10, oy + 57 + bob, 11, 6, 2);
  g.fillRoundedRect(cx - 1, oy + 57 + bob, 11, 6, 2);
  g.fillStyle(0x0d1f4a, 1);
  g.fillRect(cx - 9, oy + 44 + bob, 9, 14);
  g.fillRect(cx, oy + 44 + bob, 9, 14);
  // Robe
  g.fillStyle(0x1e4d8c, 1);
  g.fillRect(cx - 15, oy + 26 + bob, 30, 20);
  g.fillStyle(0x1a4480, 1);
  g.fillTriangle(cx - 15, oy + 44 + bob, cx - 21, oy + 57 + bob, cx - 7, oy + 57 + bob);
  g.fillTriangle(cx + 15, oy + 44 + bob, cx + 7, oy + 57 + bob, cx + 21, oy + 57 + bob);
  g.lineStyle(2, 0xd4af37, 1);
  g.strokeRect(cx - 14, oy + 26 + bob, 28, 19);
  g.lineStyle(1, 0xd4af37, 0.5);
  g.lineBetween(cx, oy + 26 + bob, cx, oy + 38 + bob);
  // Arms raised with energy
  g.fillStyle(0x1e4d8c, 1);
  g.fillRect(cx - 24, oy + 26 + bob - armRaise, 9, 18);
  g.fillRect(cx + 15, oy + 26 + bob - armRaise, 9, 18);
  // Hands with qi balls
  g.fillStyle(0xf0c080, 1);
  g.fillCircle(cx - 20, oy + 26 + bob - armRaise - 5, 6);
  g.fillCircle(cx + 20, oy + 26 + bob - armRaise - 5, 6);
  // Qi energy balls
  const qSize = 6 + pulse * 5;
  g.fillStyle(0xd4af37, 0.5 + pulse * 0.4);
  g.fillCircle(cx - 20, oy + 26 + bob - armRaise - 5, qSize);
  g.fillStyle(0x00a86b, 0.5 + pulse * 0.4);
  g.fillCircle(cx + 20, oy + 26 + bob - armRaise - 5, qSize);
  g.fillStyle(0xffffff, 0.8);
  g.fillCircle(cx - 20, oy + 26 + bob - armRaise - 5, 3);
  g.fillCircle(cx + 20, oy + 26 + bob - armRaise - 5, 3);
  // Neck + head
  g.fillStyle(0xf0c080, 1);
  g.fillRect(cx - 5, oy + 22 + bob, 10, 6);
  g.fillCircle(cx, oy + 14 + bob, 12);
  g.fillCircle(cx - 11, oy + 15 + bob, 3);
  g.fillCircle(cx + 11, oy + 15 + bob, 3);
  g.fillStyle(0x1a1a2e, 1);
  g.fillEllipse(cx, oy + 8 + bob, 26, 15);
  g.fillRect(cx - 13, oy + 4 + bob, 26, 8);
  g.fillRect(cx - 3, oy + 1 + bob, 7, 7);
  g.fillCircle(cx + 1, oy + 1 + bob, 4);
  g.fillStyle(0xd4af37, 1);
  g.fillRect(cx, oy - 1 + bob, 2, 9);
  g.fillStyle(0x1a1a1a, 1);
  g.fillEllipse(cx - 5, oy + 13 + bob, 6, 4);
  g.fillEllipse(cx + 5, oy + 13 + bob, 6, 4);
  // Determined expression
  g.lineStyle(1.5, 0x2a1a0a, 1);
  g.lineBetween(cx - 8, oy + 8 + bob, cx - 2, oy + 9 + bob);
  g.lineBetween(cx + 2, oy + 8 + bob, cx + 8, oy + 9 + bob);
  // Floating qi particles
  const np = 8;
  for (let i = 0; i < np; i++) {
    const a = (i / np) * Math.PI * 2 + t * (i % 2 === 0 ? 1 : -1);
    const r = 22 + pulse * 8;
    const px = cx + Math.cos(a) * r;
    const py = oy + 28 + bob + Math.sin(a) * r * 0.4;
    const col = i % 2 === 0 ? 0xd4af37 : 0x00a86b;
    g.fillStyle(col, 0.5 + pulse * 0.4);
    g.fillCircle(px, py, 2 + pulse * 1.5);
  }
}

// ── Spritesheet builders ──────────────────────────────────────────────────────

// player_move: 384 × 1536 (8cols × 24rows)
// rows 0-7:  walk dirs   (8 frames)
// rows 8-15: run dirs    (6 frames, cols 0-5)
// rows16-23: idle dirs   (6 frames, cols 0-5)
function buildMoveSheet(scene: Scene) {
  const g = scene.make.graphics({ x: 0, y: 0 }, false);

  // Walk (8 dirs × 8 frames)
  for (let d = 0; d < 8; d++) {
    for (let f = 0; f < 8; f++) {
      drawMoveFrame(g, f * FW, d * FH, d, f, 'walk');
    }
  }
  // Run (8 dirs × 6 frames, row offset = 8)
  for (let d = 0; d < 8; d++) {
    for (let f = 0; f < 6; f++) {
      drawMoveFrame(g, f * FW, (8 + d) * FH, d, f, 'run');
    }
  }
  // Idle (8 dirs × 6 frames, row offset = 16)
  for (let d = 0; d < 8; d++) {
    for (let f = 0; f < 6; f++) {
      drawMoveFrame(g, f * FW, (16 + d) * FH, d, f, 'idle');
    }
  }

  g.generateTexture('player_move', 8 * FW, 24 * FH);
  g.destroy();

  const tex = scene.textures.get('player_move');
  for (let d = 0; d < 8; d++) {
    const dn = DIR8[d];
    for (let f = 0; f < 8; f++) tex.add(`walk_${dn}_${f}`, 0, f*FW, d*FH, FW, FH);
    for (let f = 0; f < 6; f++) tex.add(`run_${dn}_${f}`,  0, f*FW, (8+d)*FH, FW, FH);
    for (let f = 0; f < 6; f++) tex.add(`idle_${dn}_${f}`, 0, f*FW, (16+d)*FH, FW, FH);
  }
}

// player_action: 384 × 640 (8cols × 10rows)
// rows 0-3:  attack 4dirs × 6frames
// rows 4-7:  sdraw  4dirs × 4frames
// row  8:    meditate × 8frames
// row  9:    qi       × 8frames
function buildActionSheet(scene: Scene) {
  const g = scene.make.graphics({ x: 0, y: 0 }, false);

  // Attack (4 dirs × 6 frames)
  for (let d = 0; d < 4; d++) {
    for (let f = 0; f < 6; f++) {
      drawAttackFrame(g, f * FW, d * FH, d, f);
    }
  }
  // Sword draw (4 dirs × 4 frames, row offset = 4)
  for (let d = 0; d < 4; d++) {
    for (let f = 0; f < 4; f++) {
      drawSwordDrawFrame(g, f * FW, (4 + d) * FH, d, f);
    }
  }
  // Meditation (row 8)
  for (let f = 0; f < 8; f++) drawMeditationFrame(g, f * FW, 8 * FH, f);
  // Qi cultivation (row 9)
  for (let f = 0; f < 8; f++) drawQiFrame(g, f * FW, 9 * FH, f);

  g.generateTexture('player_action', 8 * FW, 10 * FH);
  g.destroy();

  const tex = scene.textures.get('player_action');
  for (let d = 0; d < 4; d++) {
    const dn = DIR4[d];
    for (let f = 0; f < 6; f++) tex.add(`attack_${dn}_${f}`, 0, f*FW, d*FH, FW, FH);
    for (let f = 0; f < 4; f++) tex.add(`sdraw_${dn}_${f}`,  0, f*FW, (4+d)*FH, FW, FH);
  }
  for (let f = 0; f < 8; f++) {
    tex.add(`meditate_${f}`, 0, f*FW, 8*FH, FW, FH);
    tex.add(`qi_${f}`,       0, f*FW, 9*FH, FW, FH);
  }
}

// ── World texture builders ────────────────────────────────────────────────────

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

function buildSifu(scene: Scene) {
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  const W = 80, H = 96, cx = 36;
  g.fillStyle(0x000000, 0.28);
  g.fillEllipse(cx, H - 5, 50, 11);
  g.fillStyle(0x4a2800, 1);
  g.fillRect(62, 0, 6, H - 10);
  g.fillStyle(0x6b4218, 1);
  g.fillRect(63, 0, 2, H - 10);
  [14, 28, 42, 56, 70].forEach(y => { g.fillStyle(0xd4af37, 0.7); g.fillRect(61, y, 8, 2); });
  g.fillStyle(0x00ccff, 0.12); g.fillCircle(65, 8, 16);
  g.fillStyle(0x00ccff, 0.25); g.fillCircle(65, 8, 11);
  g.fillStyle(0x44ddff, 1);    g.fillCircle(65, 8, 7);
  g.fillStyle(0xaaffff, 1);    g.fillCircle(63, 6, 3);
  g.fillStyle(0x6b4f0f, 1);
  g.fillTriangle(cx - 28, H - 8, cx + 26, H - 8, cx, 24);
  g.fillStyle(0x8b6914, 1);
  g.fillTriangle(cx - 20, H - 8, cx + 18, H - 8, cx, 28);
  g.fillStyle(0xd4af37, 1);
  g.fillRect(cx - 2, 28, 4, H - 36);
  g.fillRect(cx - 14, 52, 28, 5);
  g.lineStyle(2, 0xd4af37, 0.9);
  g.lineBetween(cx - 28, H - 8, cx, 24);
  g.lineBetween(cx + 26, H - 8, cx, 24);
  g.fillStyle(0x6b4f0f, 1); g.fillRect(cx - 30, 30, 11, 30);
  g.fillStyle(0xf5e8c0, 1); g.fillRect(cx - 38, 24, 14, 26);
  g.fillStyle(0x8b6914, 1); g.fillRect(cx - 38, 24, 14, 3); g.fillRect(cx - 38, 47, 14, 3);
  g.lineStyle(1, 0xc8a820, 0.6);
  [30,35,40,45].forEach(y => g.lineBetween(cx - 36, y, cx - 26, y));
  g.fillStyle(0xe8b080, 1); g.fillCircle(cx - 24, 56, 6);
  g.fillStyle(0x6b4f0f, 1); g.fillRect(cx + 18, 28, 11, 32);
  g.fillStyle(0xe8b080, 1); g.fillCircle(cx + 23, 62, 6);
  g.fillStyle(0xf0ebe0, 1); g.fillTriangle(cx - 8, 24, cx + 8, 24, cx, 44);
  g.fillStyle(0xe8b080, 1); g.fillRect(cx - 6, 18, 12, 8);
  g.fillCircle(cx, 12, 13);
  g.fillCircle(cx - 12, 13, 4); g.fillCircle(cx + 12, 13, 4);
  g.fillCircle(cx - 13, 17, 3); g.fillCircle(cx + 13, 17, 3);
  g.fillStyle(0xf0f0e8, 1); g.fillTriangle(cx - 9, 22, cx + 9, 22, cx, 44);
  g.lineStyle(1, 0xc0c0b8, 0.5);
  g.lineBetween(cx - 6, 24, cx - 9, 40); g.lineBetween(cx, 24, cx - 2, 44); g.lineBetween(cx + 6, 24, cx + 5, 40);
  g.fillStyle(0xe0e0d8, 1); g.fillEllipse(cx - 5, 20, 11, 4); g.fillEllipse(cx + 5, 20, 11, 4);
  g.fillStyle(0xf0f0e8, 1); g.fillEllipse(cx, 4, 28, 14); g.fillRect(cx - 14, 0, 28, 8);
  g.fillStyle(0xe8e8de, 1); g.fillCircle(cx, -2, 8);
  g.fillStyle(0xd4af37, 1); g.fillRect(cx - 14, 2, 28, 3);
  g.fillStyle(0x00a86b, 1); g.fillCircle(cx, 3, 3);
  g.fillStyle(0xe8e8e0, 1); g.fillEllipse(cx - 5, 6, 13, 4); g.fillEllipse(cx + 5, 6, 13, 4);
  g.fillStyle(0x1a1a1a, 1); g.fillEllipse(cx - 5, 10, 7, 4); g.fillEllipse(cx + 5, 10, 7, 4);
  g.fillStyle(0x3a1800, 1); g.fillEllipse(cx - 5, 10, 4, 3); g.fillEllipse(cx + 5, 10, 4, 3);
  g.fillStyle(0xd09060, 1); g.fillCircle(cx, 16, 3);
  g.generateTexture('sifu', W, H);
  g.destroy();
}

function buildLantern(scene: Scene) {
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(0xffaa00, 0.15); g.fillCircle(16, 20, 24);
  g.fillStyle(0xcc2200, 1); g.fillRoundedRect(8, 8, 16, 24, 4);
  g.fillStyle(0xd4af37, 1); g.fillRect(6, 8, 20, 3); g.fillRect(6, 29, 20, 3);
  g.fillStyle(0xffdd44, 0.7); g.fillRoundedRect(11, 11, 10, 18, 2);
  g.fillStyle(0xd4af37, 1);
  g.fillRect(14, 32, 4, 2); g.fillRect(13, 34, 2, 8); g.fillRect(17, 34, 2, 6); g.fillRect(15, 2, 2, 7);
  g.generateTexture('lantern', 32, 48);
  g.destroy();
}

function buildParticle(scene: Scene) {
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(0xd4af37, 1); g.fillCircle(4, 4, 4);
  g.generateTexture('particle', 8, 8);
  g.destroy();
}

// ── Game Scene ────────────────────────────────────────────────────────────────

type AnimState = 'idle'|'walk'|'run'|'sword_draw'|'attack'|'meditation'|'qi';

export class Game extends Scene {
  private player!: Physics.Arcade.Sprite;
  private sifu!: Physics.Arcade.Image;
  private walls!: Physics.Arcade.StaticGroup;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string,Phaser.Input.Keyboard.Key>;
  private shiftKey!: Phaser.Input.Keyboard.Key;
  private attackKey!: Phaser.Input.Keyboard.Key;
  private meditateKey!: Phaser.Input.Keyboard.Key;
  private qiKey!: Phaser.Input.Keyboard.Key;
  private joyDir = { x: 0, y: 0 };
  private interacting = false;
  private nameText!: GameObjects.Text;
  private animState: AnimState = 'idle';
  private lastDir8 = 0; // last 8-dir index
  private prevAttackKey = false;
  private prevMedKey  = false;
  private prevQiKey   = false;

  constructor() { super('Game'); }

  preload() {
    buildFloor(this);
    buildWall(this);
    buildMoveSheet(this);
    buildActionSheet(this);
    buildSifu(this);
    buildLantern(this);
    buildParticle(this);
  }

  create() {
    const worldW = COLS * TILE, worldH = ROWS * TILE;
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
      .forEach(([c, r]) => addWall(c!, r!));

    [[2.5,2.5],[COLS-2.5,2.5],[2.5,ROWS-2.5],[COLS-2.5,ROWS-2.5]].forEach(([c, r]) => {
      const l = this.add.image(c! * TILE, r! * TILE, 'lantern').setDepth(5);
      this.tweens.add({ targets: l, y: l.y - 4, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.add.circle(c! * TILE, r! * TILE + 10, 28, 0xffaa00, 0.07).setDepth(4);
    });

    // Player
    const sx = Math.floor(COLS / 2) * TILE, sy = Math.floor(ROWS / 2) * TILE + TILE;
    this.player = this.physics.add.sprite(sx, sy, 'player_move', 'idle_down_0').setDepth(10);
    this.player.setCollideWorldBounds(true);
    this.player.setBodySize(22, 28);
    this.player.setOffset(13, 32);

    // Register animations
    this.registerAnims();

    this.player.play('idle_down');

    this.nameText = this.add.text(sx, sy - 42, '', {
      fontFamily: 'Arial', fontSize: '11px', color: '#D4AF37',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5, 1).setDepth(20);

    // Sifu
    const sifuX = (COLS - 5) * TILE, sifuY = 5 * TILE;
    this.sifu = this.physics.add.image(sifuX, sifuY, 'sifu').setDepth(9).setImmovable(true);
    this.sifu.setBodySize(40, 68).setOffset(16, 16);
    this.tweens.add({ targets: this.sifu, y: this.sifu.y - 5, duration: 2400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.add.text(sifuX, sifuY - 68, '師父 李', {
      fontFamily: 'Arial', fontSize: '14px', color: '#D4AF37', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(20);
    const arrow = this.add.text(sifuX, sifuY - 84, '▼', {
      fontFamily: 'Arial', fontSize: '16px', color: '#00A86B',
    }).setOrigin(0.5).setDepth(20);
    this.tweens.add({ targets: arrow, y: arrow.y + 6, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    this.add.particles(0, 0, 'particle', {
      x: { min: TILE, max: (COLS - 1) * TILE },
      y: { min: TILE, max: (ROWS - 1) * TILE },
      speedY: { min: -20, max: -5 }, speedX: { min: -5, max: 5 },
      scale: { start: 0.4, end: 0 }, alpha: { start: 0.6, end: 0 },
      lifespan: 3000, frequency: 200,
      tint: [0xd4af37, 0x00a86b, 0xffffff],
    }).setDepth(3);

    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.sifu, this.walls);
    this.physics.add.overlap(this.player, this.sifu, this.onSifuOverlap, undefined, this);

    this.cameras.main.setBounds(0, 0, worldW, worldH);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.6);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd    = this.input.keyboard!.addKeys({ up: 'W', down: 'S', left: 'A', right: 'D' }) as typeof this.wasd;
    this.shiftKey   = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.attackKey  = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.meditateKey= this.input.keyboard!.addKey('M');
    this.qiKey      = this.input.keyboard!.addKey('Q');

    // Anim complete listener for sequencing
    this.player.on('animationcomplete', (anim: Phaser.Animations.Animation) => {
      if (anim.key.startsWith('sdraw_')) {
        this.animState = 'attack';
      } else if (anim.key.startsWith('attack_')) {
        this.animState = 'idle';
      }
    });

    Bus.on('input-joy', (d: { x: number; y: number }) => { this.joyDir = d; });
    Bus.on(EV.CLOSE, () => { this.time.delayedCall(800, () => { this.interacting = false; }); });
    Bus.on('set-name', (name: string) => { this.nameText.setText(name); });
    Bus.emit(EV.READY, this);
  }

  private registerAnims() {
    // Walk — 8 dirs × 8 frames
    DIR8.forEach(d => {
      this.anims.create({
        key: `walk_${d}`,
        frames: Array.from({length: 8}, (_, f) => ({ key: 'player_move', frame: `walk_${d}_${f}` })),
        frameRate: 10, repeat: -1,
      });
    });
    // Run — 8 dirs × 6 frames
    DIR8.forEach(d => {
      this.anims.create({
        key: `run_${d}`,
        frames: Array.from({length: 6}, (_, f) => ({ key: 'player_move', frame: `run_${d}_${f}` })),
        frameRate: 14, repeat: -1,
      });
    });
    // Idle — 8 dirs × 6 frames
    DIR8.forEach(d => {
      this.anims.create({
        key: `idle_${d}`,
        frames: Array.from({length: 6}, (_, f) => ({ key: 'player_move', frame: `idle_${d}_${f}` })),
        frameRate: 6, repeat: -1,
      });
    });
    // Attack — 4 card dirs, diagonals → nearest cardinal
    DIR4.forEach((d4, i) => {
      this.anims.create({
        key: `attack_${d4}`,
        frames: Array.from({length: 6}, (_, f) => ({ key: 'player_action', frame: `attack_${d4}_${f}` })),
        frameRate: 14, repeat: 0,
      });
    });
    // Sword draw — 4 card dirs
    DIR4.forEach(d4 => {
      this.anims.create({
        key: `sdraw_${d4}`,
        frames: Array.from({length: 4}, (_, f) => ({ key: 'player_action', frame: `sdraw_${d4}_${f}` })),
        frameRate: 10, repeat: 0,
      });
    });
    // Meditation
    this.anims.create({
      key: 'meditate',
      frames: Array.from({length: 8}, (_, f) => ({ key: 'player_action', frame: `meditate_${f}` })),
      frameRate: 8, repeat: -1,
    });
    // Qi
    this.anims.create({
      key: 'qi',
      frames: Array.from({length: 8}, (_, f) => ({ key: 'player_action', frame: `qi_${f}` })),
      frameRate: 8, repeat: -1,
    });
  }

  private getDir8(vx: number, vy: number): number {
    if (vx === 0 && vy === 0) return this.lastDir8;
    const angle = Math.atan2(vy, vx); // -π to π
    // Convert to 8 sectors: 0=S 1=SE 2=E 3=NE 4=N 5=NW 6=W 7=SW
    // atan2: E=0, N=-π/2, S=π/2, W=±π
    // Map: S=0,SE=1,E=2,NE=3,N=4,NW=5,W=6,SW=7
    const sectorMap = [2,3,4,5,6,7,0,1,2]; // index by (angle+π)/π*4 rounded
    const idx = Math.round((angle + Math.PI) / Math.PI * 4) % 8;
    // idx 0=W,1=SW,2=S,3=SE,4=E,5=NE,6=N,7=NW → remap
    const remap = [6,7,0,1,2,3,4,5];
    return remap[idx];
  }

  update() {
    if (!this.player) return;

    let vx = 0, vy = 0;
    if (this.cursors.left.isDown  || this.wasd.left.isDown)  vx = -1;
    if (this.cursors.right.isDown || this.wasd.right.isDown) vx = +1;
    if (this.cursors.up.isDown    || this.wasd.up.isDown)    vy = -1;
    if (this.cursors.down.isDown  || this.wasd.down.isDown)  vy = +1;
    if (vx === 0 && vy === 0) { vx = this.joyDir.x; vy = this.joyDir.y; }

    const moving = vx !== 0 || vy !== 0;
    const running = moving && this.shiftKey.isDown;
    const spd = running ? RUN_SPEED : WALK_SPEED;

    // Normalize diagonal
    if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }

    // Determine 8-dir
    if (moving) this.lastDir8 = this.getDir8(vx, vy);
    const dir  = this.lastDir8;
    const dir4 = DIR4[D4MAP[dir]];
    const dirName = DIR8[dir];

    // Attack trigger (rising edge on space)
    const atkNow = this.attackKey.isDown;
    const atkJustPressed = atkNow && !this.prevAttackKey;
    this.prevAttackKey = atkNow;

    // Meditation toggle (M)
    const medNow = this.meditateKey.isDown;
    const medToggle = medNow && !this.prevMedKey;
    this.prevMedKey = medNow;

    // Qi toggle (Q)
    const qiNow = this.qiKey.isDown;
    const qiToggle = qiNow && !this.prevQiKey;
    this.prevQiKey = qiNow;

    // State transitions
    if (this.animState === 'meditation') {
      if (medToggle || moving) {
        this.animState = 'idle';
      }
    } else if (this.animState === 'qi') {
      if (qiToggle || moving) {
        this.animState = 'idle';
      }
    } else if (this.animState === 'sword_draw' || this.animState === 'attack') {
      // let animation complete naturally
    } else {
      if (atkJustPressed) {
        this.animState = 'sword_draw';
      } else if (medToggle && !moving) {
        this.animState = 'meditation';
      } else if (qiToggle && !moving) {
        this.animState = 'qi';
      } else if (moving) {
        this.animState = running ? 'run' : 'walk';
      } else {
        this.animState = 'idle';
      }
    }

    // Apply velocity (lock position during meditation/qi)
    if (this.animState === 'meditation' || this.animState === 'qi' ||
        this.animState === 'sword_draw'  || this.animState === 'attack') {
      this.player.setVelocity(0, 0);
    } else {
      this.player.setVelocity(vx * spd, vy * spd);
    }

    // Play correct animation
    switch (this.animState) {
      case 'walk':      this.player.play(`walk_${dirName}`, true); break;
      case 'run':       this.player.play(`run_${dirName}`,  true); break;
      case 'idle':      this.player.play(`idle_${dirName}`, true); break;
      case 'meditation':this.player.play('meditate',        true); break;
      case 'qi':        this.player.play('qi',              true); break;
      case 'sword_draw':this.player.play(`sdraw_${dir4}`,  true); break;
      case 'attack':    this.player.play(`attack_${dir4}`, true); break;
    }

    this.nameText.setPosition(this.player.x, this.player.y - 42);

    if (moving && this.time.now % 2000 < 20) {
      Bus.emit(EV.MOVED, { x: this.player.x, y: this.player.y });
    }
  }

  private onSifuOverlap() {
    if (this.interacting) return;
    this.interacting = true;
    Bus.emit(EV.INTERACT, { npc: 'Sifu Li' });
  }
}
