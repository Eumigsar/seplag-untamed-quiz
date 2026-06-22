'use client';

import { useRef } from 'react';
import { PhaserGame, IRefPhaser } from '@/game/PhaserGame';
import HUD from '@/components/game/HUD';
import Dialog from '@/components/game/Dialog';
import VirtualDPad from '@/components/game/VirtualDPad';

export default function GameContainer() {
  const phaserRef = useRef<IRefPhaser>(null);
  return (
    <div className="relative w-full h-screen overflow-hidden bg-ink">
      <PhaserGame ref={phaserRef} />
      <div className="absolute inset-0 pointer-events-none">
        <HUD />
        <Dialog />
        <VirtualDPad />
      </div>
    </div>
  );
}
