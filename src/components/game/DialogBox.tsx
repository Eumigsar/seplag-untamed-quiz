'use client';

import { useState, useEffect } from 'react';
import { EventBus, GAME_EVENTS } from '@/game/EventBus';
import { INITIAL_HANZI } from '@/utils/learning-content';
import { usePlayerStore } from '@/store/usePlayerStore';
import { characterService } from '@/services/characterService';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import type { HanziData } from '@/types/game';

interface ActiveDialog {
  title: string;
  text: string;
  questId?: string;
}

export default function DialogBox() {
  const [activeDialog, setActiveDialog] = useState<ActiveDialog | null>(null);
  const { character, addXP, addHanzi } = usePlayerStore();
  const [learnedCount, setLearnedCount] = useState(0);

  useEffect(() => {
    const handleInteract = (data: { name: string; questId?: string }) => {
      setActiveDialog({
        title: data.name,
        text: 'Bem-vindo, estrangeiro. Este mundo é construído por símbolos. Sinta a energia do pincel. Toque em cada elemento para aprender seu Hanzi fundamental.',
        questId: data.questId,
      });
    };

    EventBus.on(GAME_EVENTS.INTERACT_NPC, handleInteract);
    return () => {
      EventBus.off(GAME_EVENTS.INTERACT_NPC, handleInteract);
    };
  }, []);

  const handleLearn = async (h: HanziData) => {
    addHanzi(h.hanzi);
    addXP(20);
    setLearnedCount((prev) => prev + 1);
    if (character && isSupabaseConfigured) {
      await characterService.addLearnedHanzi(character.id, h.hanzi);
    }
  };

  const closeDialog = () => {
    setActiveDialog(null);
    EventBus.emit('dialog-closed');
  };

  if (!activeDialog) return null;

  return (
    <div className="fixed inset-x-0 bottom-10 flex justify-center items-end px-4 sm:px-0">
      <div className="w-full max-w-2xl bg-black/95 border-2 border-jade/50 rounded-xl p-6 shadow-[0_0_20px_rgba(0,168,107,0.3)] pointer-events-auto">
        <div className="flex justify-between items-center mb-4 border-b border-jade/20 pb-2">
          <h3 className="text-jade font-bold text-lg">{activeDialog.title}</h3>
          <span className="text-xs text-jade/60">Quest: O Primeiro Traço ({learnedCount}/5)</span>
        </div>

        <p className="text-paper/90 text-sm leading-relaxed mb-6">{activeDialog.text}</p>

        <div className="grid grid-cols-5 gap-3 mb-8">
          {INITIAL_HANZI.map((h) => (
            <button
              key={h.hanzi}
              onClick={() => handleLearn(h)}
              className="group relative bg-jade/5 border border-jade/20 p-3 rounded-lg hover:bg-jade/20 hover:border-jade transition-all"
            >
              <span className="text-3xl block mb-1 group-active:scale-90 transition-transform">{h.hanzi}</span>
              <span className="text-[10px] text-paper/40 uppercase block">{h.pinyin}</span>
            </button>
          ))}
        </div>

        <button
          onClick={closeDialog}
          className="w-full py-3 bg-jade/20 hover:bg-jade/40 border border-jade text-jade font-bold rounded-lg transition-colors"
        >
          {learnedCount >= 5 ? 'Quest Completa: Continuar' : 'Entendido, Sifu'}
        </button>
      </div>
    </div>
  );
}
