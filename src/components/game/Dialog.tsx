'use client';

import { useEffect, useState } from 'react';
import { Bus, EV } from '@/game/EventBus';
import { HANZI, type HanziCard } from '@/utils/hanzi';
import { usePlayer } from '@/store/player';
import { supabase, configured } from '@/lib/supabase';

export default function Dialog() {
  const [open, setOpen] = useState(false);
  const [learned, setLearned] = useState<Set<string>>(new Set());
  const [flipped, setFlipped] = useState<string | null>(null);
  const { character, learn, addXP } = usePlayer();

  useEffect(() => {
    Bus.on(EV.INTERACT, () => setOpen(true));
    return () => { Bus.off(EV.INTERACT); };
  }, []);

  const learnHanzi = async (h: HanziCard) => {
    if (learned.has(h.hanzi)) return;
    setLearned(prev => new Set(prev).add(h.hanzi));
    learn(h.hanzi);
    addXP(25);
    if (character && configured) {
      await supabase.from('learning_progress').insert({
        character_id: character.id, hanzi: h.hanzi, mastery_level: 1,
      });
    }
  };

  const close = () => {
    setOpen(false);
    Bus.emit(EV.CLOSE);
  };

  if (!open) return null;

  const done = learned.size;
  const total = HANZI.length;

  return (
    <div className="fixed inset-0 flex items-end justify-center p-4 bg-ink/50 backdrop-blur-sm z-50 animate-fade-in">
      <div className="w-full max-w-3xl card border-gold/30 p-6 shadow-[0_0_60px_#D4AF3730] animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-gold/50 bg-gold/10 flex items-center justify-center">
              <span className="text-gold font-chinese text-lg">師</span>
            </div>
            <div>
              <p className="text-gold font-semibold text-sm">Sifu Li</p>
              <p className="text-paper/40 text-xs">Mestre da Academia</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-paper/40">Hanzi aprendidos</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-24 h-1 bg-ink rounded-full overflow-hidden">
                  <div className="h-full bg-jade transition-all duration-500" style={{ width: `${(done / total) * 100}%` }} />
                </div>
                <span className="text-jade text-xs font-bold">{done}/{total}</span>
              </div>
            </div>
            <button onClick={close} className="text-paper/30 hover:text-paper/70 transition-colors text-xl leading-none">✕</button>
          </div>
        </div>

        {/* NPC text */}
        <p className="text-paper/70 text-sm leading-relaxed mb-5 border-l-2 border-gold/30 pl-4 italic">
          &quot;Os caracteres são a alma da língua. Cada traço carrega séculos de história.
          Toque em cada símbolo abaixo para absorver sua essência, jovem aluno.&quot;
        </p>

        {/* Hanzi grid */}
        <div className="grid grid-cols-5 gap-3 mb-5">
          {HANZI.map(h => {
            const isLearned = learned.has(h.hanzi);
            const isFlipped = flipped === h.hanzi;
            return (
              <button
                key={h.hanzi}
                onClick={() => { learnHanzi(h); setFlipped(isFlipped ? null : h.hanzi); }}
                className={`hanzi-btn relative transition-all duration-200 ${isLearned ? 'border-jade bg-jade/10' : ''}`}
              >
                {isLearned && (
                  <div className="absolute top-1 right-1 w-3 h-3 bg-jade rounded-full flex items-center justify-center">
                    <span className="text-ink text-[8px] font-bold">✓</span>
                  </div>
                )}
                <span className={`text-3xl font-chinese transition-colors ${isLearned ? 'text-jade' : 'text-paper'}`}>{h.hanzi}</span>
                {isFlipped ? (
                  <span className="text-[10px] text-gold text-center leading-tight">{h.meaning}</span>
                ) : (
                  <span className="text-[10px] text-paper/40">{h.pinyin}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Mnemonic for flipped card */}
        {flipped && (
          <div className="mb-4 p-3 bg-gold/5 border border-gold/15 rounded-lg text-xs text-paper/60 italic animate-fade-in">
            {HANZI.find(h => h.hanzi === flipped)?.mnemonic}
          </div>
        )}

        <button
          onClick={close}
          className={`w-full py-3 rounded-lg font-semibold transition-all ${done >= 5 ? 'btn-gold' : 'btn-ghost opacity-60'}`}
        >
          {done === 0 ? 'Toque nos caracteres para aprender' : done < 5 ? `Continue — aprenda mais ${5 - done}` : `Excelente! ${done} Hanzi dominados — Continuar`}
        </button>
      </div>
    </div>
  );
}
