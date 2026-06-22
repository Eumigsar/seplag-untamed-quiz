'use client';

import { usePlayer } from '@/store/player';
import { useUI } from '@/store/ui';
import { X, Trophy } from 'lucide-react';

interface Achievement {
  id: string;
  icon: string;
  title: string;
  desc: string;
  check: (learned: string[], level: number) => boolean;
  rarity: 'common' | 'rare' | 'epic';
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'enter',
    icon: '🏯',
    title: 'Bem-vindo à Academia',
    desc: 'Entre no mundo da Academia dos Mil Hanzi.',
    check: () => true,
    rarity: 'common',
  },
  {
    id: 'first_hanzi',
    icon: '✍️',
    title: 'Primeiro Traço',
    desc: 'Aprenda seu primeiro caractere chinês.',
    check: (l) => l.length >= 1,
    rarity: 'common',
  },
  {
    id: 'five_hanzi',
    icon: '📖',
    title: 'Estudante Dedicado',
    desc: 'Aprenda 5 caracteres chineses.',
    check: (l) => l.length >= 5,
    rarity: 'rare',
  },
  {
    id: 'ten_hanzi',
    icon: '🏆',
    title: 'Mestre Hanzi',
    desc: 'Domine todos os 10 caracteres da academia.',
    check: (l) => l.length >= 10,
    rarity: 'epic',
  },
  {
    id: 'level2',
    icon: '⬆️',
    title: 'Em Ascensão',
    desc: 'Alcance o nível 2.',
    check: (_, lv) => lv >= 2,
    rarity: 'common',
  },
  {
    id: 'level5',
    icon: '🌟',
    title: 'Discípulo Avançado',
    desc: 'Alcance o nível 5.',
    check: (_, lv) => lv >= 5,
    rarity: 'rare',
  },
  {
    id: 'nature',
    icon: '🌿',
    title: 'Os Cinco Elementos',
    desc: 'Aprenda 山, 水, 火, 木 e 日.',
    check: (l) => ['山','水','火','木','日'].every(h => l.includes(h)),
    rarity: 'rare',
  },
  {
    id: 'people',
    icon: '👤',
    title: 'Conhece o Humano',
    desc: 'Aprenda o caractere 人 (pessoa).',
    check: (l) => l.includes('人'),
    rarity: 'common',
  },
];

const RARITY_STYLE = {
  common: 'border-paper/20 bg-paper/3',
  rare:   'border-gold/30 bg-gold/5',
  epic:   'border-jade/40 bg-jade/8',
};

const RARITY_LABEL = {
  common: { text: 'Comum',   color: 'text-paper/30' },
  rare:   { text: 'Raro',    color: 'text-gold/60'  },
  epic:   { text: 'Épico',   color: 'text-jade'     },
};

export default function AchievementsPanel() {
  const { learned, character } = usePlayer();
  const { achPanelOpen, toggleAchPanel } = useUI();
  if (!achPanelOpen) return null;

  const level = character?.level ?? 1;
  const unlocked = ACHIEVEMENTS.filter(a => a.check(learned, level));
  const locked   = ACHIEVEMENTS.filter(a => !a.check(learned, level));

  return (
    <div className="absolute top-16 right-3 w-72 pointer-events-auto z-30">
      <div className="card shadow-[0_0_30px_#D4AF3720] overflow-hidden max-h-[70vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gold/20 bg-gradient-to-r from-gold/10 to-transparent shrink-0">
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-gold" />
            <span className="text-gold font-semibold text-sm">Conquistas</span>
            <span className="text-[10px] text-paper/30 bg-gold/10 px-1.5 py-0.5 rounded-full">
              {unlocked.length}/{ACHIEVEMENTS.length}
            </span>
          </div>
          <button onClick={toggleAchPanel} className="text-paper/40 hover:text-paper transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-3 space-y-2">
          {/* Unlocked */}
          {unlocked.map(a => (
            <div key={a.id} className={`rounded-lg border px-3 py-2.5 flex items-start gap-3 ${RARITY_STYLE[a.rarity]}`}>
              <span className="text-xl shrink-0">{a.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-paper text-xs font-semibold">{a.title}</p>
                  <span className={`text-[9px] ${RARITY_LABEL[a.rarity].color}`}>
                    {RARITY_LABEL[a.rarity].text}
                  </span>
                </div>
                <p className="text-paper/40 text-[10px] mt-0.5 leading-relaxed">{a.desc}</p>
              </div>
              <span className="text-jade text-sm shrink-0">✓</span>
            </div>
          ))}

          {/* Locked */}
          {locked.length > 0 && (
            <>
              <p className="text-paper/20 text-[10px] uppercase tracking-widest px-1 pt-1">Bloqueadas</p>
              {locked.map(a => (
                <div key={a.id} className="rounded-lg border border-paper/8 bg-paper/2 px-3 py-2.5 flex items-start gap-3 opacity-40">
                  <span className="text-xl shrink-0 grayscale">{a.icon}</span>
                  <div>
                    <p className="text-paper/50 text-xs font-semibold">???</p>
                    <p className="text-paper/25 text-[10px] mt-0.5">{a.desc}</p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
