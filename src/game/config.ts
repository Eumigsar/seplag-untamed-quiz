import type { Types } from 'phaser';

export const TILE_SIZE    = 32;
export const MAP_WIDTH    = 80;
export const MAP_HEIGHT   = 60;
export const WORLD_WIDTH  = MAP_WIDTH  * TILE_SIZE;
export const WORLD_HEIGHT = MAP_HEIGHT * TILE_SIZE;

export const GAME_WIDTH  = 800;
export const GAME_HEIGHT = 600;

export const PLAYER_SPEED = 160;
export const NPC_SPEED    = 50;

export const COLORS = {
  grass:    0x4a7c59,
  path:     0xc9a96e,
  water:    0x4a90d9,
  mountain: 0x8b7355,
  forest:   0x2d5a27,
  building: 0x8b4513,
  temple:   0xc0392b,
  sand:     0xe8d5a3,
  bamboo:   0x86efac,
  silk:     0xf59e0b,
  jade:     0x22c55e,
  imperial: 0xc9a86c,
  ui_dark:  0x1a1a2e,
  ui_light: 0xfdf6e3,
  ui_gold:  0xf59e0b,
  ui_red:   0xe11d48,
  hp_bar:   0x22c55e,
  mp_bar:   0x3b82f6,
  xp_bar:   0xf59e0b,
};

export const DEPTHS = {
  floor:     0,
  objects:   10,
  npcs:      20,
  player:    30,
  particles: 40,
  ui:        100,
};

export const getPhaserConfig = (parent: string): Types.Core.GameConfig => ({
  type:   Phaser.AUTO,
  parent,
  width:  GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade:  { debug: false, gravity: { x: 0, y: 0 } },
  },
  render: {
    antialias:       false,
    pixelArt:        true,
    roundPixels:     true,
    transparent:     false,
    clearBeforeRender: true,
  },
  scale: {
    mode:       Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
});
