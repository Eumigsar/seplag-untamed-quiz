'use client';

import { useRef } from 'react';
import { PhaserGame, IRefPhaser } from '@/game/PhaserGame';
import HUD from '@/components/game/HUD';
import DialogBox from '@/components/game/DialogBox';
import MobileJoystick from '@/components/game/MobileJoystick';
import GameManager from '@/components/game/GameManager';

export default function GameContainer() {
  const phaserRef = useRef<IRefPhaser>(null);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-ink">
      <GameManager />
      <PhaserGame ref={phaserRef} />
      <div className="absolute inset-0 pointer-events-none">
        <HUD />
        <DialogBox />
        <MobileJoystick />
      </div>
    </div>
  );
}
