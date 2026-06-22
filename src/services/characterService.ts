import { supabase } from '@/lib/supabaseClient';
import type { Character } from '@/types/game';

export const characterService = {
  async saveProgress(character: Character) {
    const { data, error } = await supabase
      .from('characters')
      .update({
        position_x: character.position_x,
        position_y: character.position_y,
        xp: character.xp,
        level: character.level,
        qi: character.qi,
        updated_at: new Date().toISOString(),
      })
      .eq('id', character.id);

    return { data, error };
  },

  async addLearnedHanzi(characterId: string, hanzi: string) {
    const { error } = await supabase
      .from('learning_progress')
      .insert({ character_id: characterId, hanzi, mastery_level: 1 });

    return { error };
  },
};
