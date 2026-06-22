import * as Phaser from 'phaser';

export const Bus = new Phaser.Events.EventEmitter();

export const EV = {
  READY:    'ready',
  INTERACT: 'interact',
  MOVED:    'moved',
  CLOSE:    'dialog-close',
} as const;
