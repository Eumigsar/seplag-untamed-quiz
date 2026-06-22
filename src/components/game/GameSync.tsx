'use client';

import { useEffect } from 'react';
import { Bus, EV } from '@/game/EventBus';
import { usePlayer } from '@/store/player';
import { supabase, configured } from '@/lib/supabase';

export default function GameSync() {
  const { character, move } = usePlayer();

  useEffect(() => {
    Bus.on(EV.MOVED, (pos: { x: number; y: number }) => move(pos.x, pos.y));

    const save = setInterval(async () => {
      if (character && configured) {
        await supabase.from('characters')
          .update({ position_x: character.position_x, position_y: character.position_y, xp: character.xp })
          .eq('id', character.id);
      }
    }, 15000);

    return () => { Bus.off(EV.MOVED); clearInterval(save); };
  }, [character, move]);

  useEffect(() => {
    if (character?.name) Bus.emit('set-name', character.name);
  }, [character?.name]);

  return null;
}
