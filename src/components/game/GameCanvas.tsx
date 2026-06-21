'use client';
import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { usePlayerStore } from '@/store/playerStore';
import { NPCS } from '@/data/npcs';
import type { RegionId } from '@/types';

export default function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<import('phaser').Game | null>(null);

  const { showNotification, setCurrentRegion, openDialogue, currentRegion } = useGameStore();
  const { travelTo } = usePlayerStore();

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;
    if (typeof window === 'undefined') return;

    let game: import('phaser').Game;

    const initPhaser = async () => {
      const Phaser = await import('phaser');
      const { getPhaserConfig } = await import('@/game/config');
      const { default: PreloadScene } = await import('@/game/scenes/PreloadScene');
      const { default: WorldScene } = await import('@/game/scenes/WorldScene');

      const worldScene = new WorldScene({
        onNPCInteract: (npcId: string) => {
          const npc = NPCS.find(n => n.id === npcId);
          if (npc) {
            openDialogue(npc);
          }
        },
        onRegionChange: (regionId: RegionId) => {
          travelTo(regionId);
          setCurrentRegion(regionId);
          showNotification({
            title: '地区变换',
            message: `Viajando para ${regionId.replace(/-/g, ' ')}...`,
          });
        },
        onNotify: (title: string, msg: string) => {
          showNotification({ title, message: msg });
        },
      });

      const phaserConfig = getPhaserConfig('game-canvas');
      phaserConfig.scene = [PreloadScene, worldScene];

      game = new Phaser.Game(phaserConfig);
      gameRef.current = game;
    };

    initPhaser();

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!gameRef.current) return;
    const worldScene = gameRef.current.scene.getScene('WorldScene') as any;
    if (worldScene?.updateRegion) {
      worldScene.updateRegion(currentRegion);
    }
  }, [currentRegion]);

  return (
    <div
      id="game-canvas"
      ref={containerRef}
      className="w-full h-full"
      style={{ background: '#1a1a2e' }}
    />
  );
}
