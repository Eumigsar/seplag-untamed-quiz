import * as Phaser from 'phaser';
import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';
import { Academy } from './scenes/Academy';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: typeof window !== 'undefined' ? window.innerWidth : 800,
  height: typeof window !== 'undefined' ? window.innerHeight : 600,
  parent: 'game-container',
  backgroundColor: '#1a1a1a',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [Boot, Preloader, Academy],
};

export const StartGame = (parent: string) => {
  return new Phaser.Game({ ...config, parent });
};
