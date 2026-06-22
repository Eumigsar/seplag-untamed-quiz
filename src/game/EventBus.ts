import * as Phaser from 'phaser';

export const EventBus = new Phaser.Events.EventEmitter();

export const GAME_EVENTS = {
  PHASER_READY: 'phaser-ready',
  PLAYER_MOVED: 'player-moved',
  INTERACT_NPC: 'interact-npc',
  QUEST_UPDATE: 'quest-update',
  LEARNING_TRIGGER: 'learning-trigger',
  SAVE_GAME: 'save-game',
} as const;
