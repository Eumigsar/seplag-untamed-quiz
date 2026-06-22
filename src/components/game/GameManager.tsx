'use client';

import { useEffect } from 'react';
import { EventBus, GAME_EVENTS } from '@/game/EventBus';
import { usePlayerStore } from '@/store/usePlayerStore';
import { characterService } from '@/services/characterService';
import { isSupabaseConfigured } from '@/lib/supabaseClient';

export default function GameManager() {
  const { character, updatePosition } = usePlayerStore();

  useEffect(() => {
    const onMoved = (pos: { x: number; y: number }) => updatePosition(pos.x, pos.y);
    EventBus.on(GAME_EVENTS.PLAYER_MOVED, onMoved);

    // Autosave every 10s when there's a logged-in character.
    const saveInterval = setInterval(async () => {
      if (character && isSupabaseConfigured) {
        await characterService.saveProgress(character);
      }
    }, 10000);

    return () => {
      EventBus.off(GAME_EVENTS.PLAYER_MOVED, onMoved);
      clearInterval(saveInterval);
    };
  }, [character, updatePosition]);

  return null;
}
