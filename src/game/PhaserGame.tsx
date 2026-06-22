'use client';

import { forwardRef, useLayoutEffect, useRef } from 'react';
import type Phaser from 'phaser';
import { StartGame } from './main';

export interface IRefPhaser {
  game: Phaser.Game | null;
  scene: Phaser.Scene | null;
}

export const PhaserGame = forwardRef<IRefPhaser>(function PhaserGame(_, ref) {
  const gameRef = useRef<Phaser.Game | null>(null);

  useLayoutEffect(() => {
    if (gameRef.current === null) {
      gameRef.current = StartGame('game-container');

      if (typeof ref === 'function') {
        ref({ game: gameRef.current, scene: null });
      } else if (ref) {
        ref.current = { game: gameRef.current, scene: null };
      }
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [ref]);

  return <div id="game-container" className="w-full h-full" />;
});
