'use client';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { usePlayerStore } from '@/store/playerStore';
import { ACHIEVEMENTS } from '@/data/achievements';
import { cn } from '@/lib/utils';

export default function AchievementsPanel() {
  const { setActivePanel } = useGameStore();
  const { character } = usePlayerStore();

  if (!character) return null;

  const unlocked = new Set(character.achievements);
  const total = ACHIEVEMENTS.length;
  const done = ACHIEVEMENTS.filter(a => unlocked.has(a.id)).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 24, stiffness: 260 }}
      className="fixed right-0 top-0 bottom-0 w-full sm:w-80 z-40 flex flex-col
                 bg-[rgba(9,13,34,0.97)] border-l border-[rgba(201,168,108,0.25)] shadow-2xl backdrop-blur-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(201,168,108,0.18)]">
        <div>
          <h2 className="font-chinese text-gi-geo text-lg text-shadow-gold">成就</h2>
          <p className="text-[11px] text-gi-text-dim">{done} / {total} conquistadas</p>
        </div>
        <button onClick={() => setActivePanel('none')} className="text-gi-text-dim hover:text-gi-text text-lg transition-colors">✕</button>
      </div>

      {/* Progress */}
      <div className="px-4 py-2.5 border-b border-[rgba(201,168,108,0.12)]">
        <div className="gi-bar gi-bar-sm">
          <div className="gi-bar-fill gi-bar-xp" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-[10px] text-gi-text-dim mt-1 text-right">{pct}% completo</p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {ACHIEVEMENTS.map(a => {
          const isUnlocked = unlocked.has(a.id);
          return (
            <div
              key={a.id}
              className={cn(
                'flex items-center gap-3 gi-panel-inner p-3 transition-all',
                isUnlocked && 'border-[rgba(201,168,108,0.4)]',
              )}
            >
              <span className={cn('text-2xl', !isUnlocked && 'grayscale opacity-30')}>
                {a.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className={cn('text-sm font-medium', isUnlocked ? 'text-gi-geo' : 'text-[#445]')}>
                  {a.title}
                </div>
                <div className="text-xs text-gi-text-dim truncate">{a.description}</div>
                {isUnlocked && (
                  <div className="text-[10px] text-gi-anemo mt-0.5">✓ Conquistado</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
