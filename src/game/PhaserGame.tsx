'use client';

import { forwardRef, useLayoutEffect, useRef } from 'react';
import { StartGame } from './main';

export interface IRefPhaser { game: Phaser.Game | null }

export const PhaserGame = forwardRef<IRefPhaser>(function PhaserGame(_, ref) {
  const gameRef = useRef<Phaser.Game | null>(null);

  useLayoutEffect(() => {
    if (gameRef.current) return;
    gameRef.current = StartGame('game-root');
    if (ref && typeof ref !== 'function') ref.current = { game: gameRef.current };
    return () => { gameRef.current?.destroy(true); gameRef.current = null; };
  }, [ref]);

  return <div id="game-root" className="w-full h-full" />;
});
