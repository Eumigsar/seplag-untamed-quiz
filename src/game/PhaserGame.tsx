'use client';

import { forwardRef, useLayoutEffect, useRef } from 'react';
import { startGame } from './main';

export interface GameRef { game: Phaser.Game | null }

export const PhaserGame = forwardRef<GameRef>(function PhaserGame(_, ref) {
  const gameRef = useRef<Phaser.Game | null>(null);

  useLayoutEffect(() => {
    if (gameRef.current) return;
    gameRef.current = startGame('game-root');
    if (ref && typeof ref !== 'function') ref.current = { game: gameRef.current };
    return () => { gameRef.current?.destroy(true); gameRef.current = null; };
  }, [ref]);

  return <div id="game-root" className="w-full h-full" />;
});
