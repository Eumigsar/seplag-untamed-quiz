'use client';

import { usePlayer } from '@/store/player';
import { useUI } from '@/store/ui';
import { X, CheckCircle, Circle, Scroll } from 'lucide-react';

interface Quest {
  id: string;
  title: string;
  desc: string;
  required: number;
  reward: string;
}

const QUESTS: Quest[] = [
  { id: 'first',    title: 'Primeiro Passo',      desc: 'Aprenda seu primeiro Hanzi com o Sifu Li.',   required: 1,  reward: '20 XP' },
  { id: 'elements', title: 'Os Elementos',         desc: 'Aprenda os caracteres da natureza (5 Hanzi).', required: 5,  reward: '60 XP + Título' },
  { id: 'disciple', title: 'Discípulo do Sifu',    desc: 'Demonstre dedicação aprendendo 8 Hanzi.',      required: 8,  reward: '100 XP' },
  { id: 'master',   title: 'Mestre dos Caracteres', desc: 'Domine todos os 10 Hanzi da academia.',        required: 10, reward: '200 XP + Selo' },
];

export default function QuestLog() {
  const { learned } = usePlayer();
  const { questLogOpen, toggleQuestLog } = useUI();
  if (!questLogOpen) return null;

  const n = learned.length;

  return (
    <div className="absolute top-16 left-3 w-72 pointer-events-auto z-30">
      <div className="card shadow-[0_0_30px_#D4AF3720] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gold/20 bg-gradient-to-r from-gold/10 to-transparent">
          <div className="flex items-center gap-2">
            <Scroll size={16} className="text-gold" />
            <span className="text-gold font-semibold text-sm">Missões</span>
          </div>
          <button onClick={toggleQuestLog} className="text-paper/40 hover:text-paper transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex justify-between text-xs text-paper/40 mb-1">
            <span>Hanzi aprendidos</span>
            <span className="text-gold">{n} / 10</span>
          </div>
          <div className="h-1.5 bg-ink rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-jade to-gold rounded-full transition-all duration-700"
              style={{ width: `${(n / 10) * 100}%` }}
            />
          </div>
        </div>

        {/* Quests */}
        <div className="px-3 pb-3 space-y-2">
          {QUESTS.map(q => {
            const done = n >= q.required;
            const active = !done && n < q.required && (q.required === 1 || n >= QUESTS.find(p => p.required < q.required)?.required! - 1);
            return (
              <div
                key={q.id}
                className={`rounded-lg px-3 py-2.5 border transition-colors ${
                  done
                    ? 'border-jade/30 bg-jade/5'
                    : active
                    ? 'border-gold/30 bg-gold/5'
                    : 'border-paper/10 bg-paper/2 opacity-50'
                }`}
              >
                <div className="flex items-start gap-2">
                  {done
                    ? <CheckCircle size={14} className="text-jade mt-0.5 shrink-0" />
                    : <Circle size={14} className={`mt-0.5 shrink-0 ${active ? 'text-gold' : 'text-paper/30'}`} />
                  }
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold ${done ? 'text-jade' : active ? 'text-gold' : 'text-paper/40'}`}>
                      {q.title}
                    </p>
                    <p className="text-[10px] text-paper/40 mt-0.5 leading-relaxed">{q.desc}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <div className="h-0.5 flex-1 mr-2 bg-ink rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${done ? 'bg-jade' : 'bg-gold/60'}`}
                          style={{ width: `${Math.min((n / q.required) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-paper/30 shrink-0">
                        {Math.min(n, q.required)}/{q.required}
                      </span>
                    </div>
                    {done && (
                      <p className="text-[10px] text-jade/70 mt-1">✦ Recompensa: {q.reward}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
