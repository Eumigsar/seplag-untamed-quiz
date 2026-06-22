'use client';

import { useRef } from 'react';
import { PhaserGame, IRefPhaser } from '@/game/PhaserGame';
import HUD from '@/components/game/HUD';
import Dialog from '@/components/game/Dialog';
import Joystick from '@/components/game/Joystick';
import GameSync from '@/components/game/GameSync';

export default function GameContainer() {
  const phaserRef = useRef<IRefPhaser>(null);
  return (
    <div className="relative w-full h-screen overflow-hidden bg-ink">
      <PhaserGame ref={phaserRef} />
      <GameSync />
      <div className="absolute inset-0 pointer-events-none">
        <HUD />
        <Dialog />
        <Joystick />
      </div>
    </div>
  );
}
