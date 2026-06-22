'use client';

import { usePlayer } from '@/store/player';
import { useAuth } from '@/store/auth';
import { useUI } from '@/store/ui';
import { LogOut, BookOpen, Sparkles, Scroll, Trophy } from 'lucide-react';

export default function HUD() {
  const { character, learned } = usePlayer();
  const { signOut } = useAuth();
  const { questLogOpen, vocabPanelOpen, achPanelOpen, toggleQuestLog, toggleVocabPanel, toggleAchPanel } = useUI();
  if (!character) return null;

  const xpPct = (character.xp % 100);
  const nextLevel = character.level * 100;

  return (
    <div className="absolute inset-0 pointer-events-none p-3 flex flex-col justify-between">
      {/* Top-left: character card + panel buttons */}
      <div className="flex items-start gap-2 pointer-events-auto">
        <div className="card px-4 py-3 flex items-center gap-3 shadow-[0_0_20px_#D4AF3720]">
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 border border-gold/50 flex items-center justify-center text-gold font-bold text-lg">
              {character.level}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-jade rounded-full border border-ink flex items-center justify-center">
              <Sparkles size={9} className="text-ink" />
            </div>
          </div>
          <div>
            <p className="font-semibold text-gold text-sm leading-none">{character.name}</p>
            <div className="w-28 h-1.5 bg-ink rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-jade to-gold rounded-full transition-all duration-500"
                style={{ width: `${xpPct}%` }}
              />
            </div>
            <p className="text-paper/40 text-[10px] mt-0.5">{character.xp} / {nextLevel} XP</p>
          </div>
        </div>

        {/* Panel toggle buttons */}
        <div className="flex flex-col gap-1.5 mt-1">
          <button
            onClick={toggleQuestLog}
            title="Missões"
            className={`card p-2.5 transition-colors ${questLogOpen ? 'text-gold border-gold/50 bg-gold/10' : 'text-paper/40 hover:text-gold hover:border-gold/30'}`}
          >
            <Scroll size={15} />
          </button>
          <button
            onClick={toggleVocabPanel}
            title="Vocabulário"
            className={`card p-2.5 transition-colors ${vocabPanelOpen ? 'text-jade border-jade/50 bg-jade/10' : 'text-paper/40 hover:text-jade hover:border-jade/30'}`}
          >
            <BookOpen size={15} />
          </button>
          <button
            onClick={toggleAchPanel}
            title="Conquistas"
            className={`card p-2.5 transition-colors ${achPanelOpen ? 'text-gold border-gold/50 bg-gold/10' : 'text-paper/40 hover:text-gold hover:border-gold/30'}`}
          >
            <Trophy size={15} />
          </button>
        </div>
      </div>

      {/* Top-right: hanzi count + signout */}
      <div className="absolute top-3 right-3 flex gap-2 pointer-events-auto">
        <div className="card px-3 py-2 flex items-center gap-1.5 text-jade/80 text-xs">
          <BookOpen size={14} />
          <span>{learned.length} / 10</span>
        </div>
        <button onClick={signOut} className="card p-2.5 text-paper/40 hover:text-crimson hover:border-crimson/40 transition-colors">
          <LogOut size={16} />
        </button>
      </div>

      {/* Bottom: hint */}
      <div className="flex justify-center">
        <div className="card px-4 py-2 text-paper/25 text-xs flex gap-3 pointer-events-none">
          <span>WASD ou ← → ↑ ↓ para mover</span>
          <span className="text-paper/15">•</span>
          <span>Encontre o Sifu Li para aprender</span>
        </div>
      </div>
    </div>
  );
}
