'use client';

import dynamic from 'next/dynamic';
import HUD from '@/components/game/HUD';
import Dialog from '@/components/game/Dialog';
import Joystick from '@/components/game/Joystick';
import GameSync from '@/components/game/GameSync';

const PhaserGame = dynamic(() => import('@/game/PhaserGame').then(m => m.PhaserGame), { ssr: false });

export default function GameContainer() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-ink">
      <GameSync />
      <PhaserGame />
      <HUD />
      <Dialog />
      <Joystick />
    </div>
  );
}
