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

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="fixed right-0 top-0 bottom-0 w-80 bg-ink-900/98 border-l border-gold-700/40 z-40
                 flex flex-col shadow-2xl backdrop-blur-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gold-700/30">
        <div>
          <h2 className="font-chinese text-gold-300 text-lg">成就</h2>
          <p className="text-xs text-gray-400">{done} / {total} conquistadas</p>
        </div>
        <button onClick={() => setActivePanel('none')} className="text-gray-400 hover:text-white text-xl">✕</button>
      </div>

      {/* Progress bar */}
      <div className="px-4 py-2 border-b border-gold-700/20">
        <div className="w-full bg-ink-800 rounded-full h-1.5">
          <div
            className="bg-gold-500 h-1.5 rounded-full transition-all"
            style={{ width: `${(done / total) * 100}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1 text-right">{Math.round((done / total) * 100)}% completo</p>
      </div>

      {/* Achievement list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {ACHIEVEMENTS.map(a => {
          const isUnlocked = unlocked.has(a.id);
          return (
            <div
              key={a.id}
              className={cn(
                'flex items-center gap-3 rounded-lg p-3 border transition-all',
                isUnlocked
                  ? 'bg-gold-900/30 border-gold-600/50'
                  : 'bg-ink-800/40 border-ink-700/50'
              )}
            >
              <span className={cn('text-2xl', !isUnlocked && 'grayscale opacity-40')}>
                {a.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className={cn('text-sm font-medium', isUnlocked ? 'text-gold-200' : 'text-gray-500')}>
                  {a.title}
                </div>
                <div className="text-xs text-gray-500 truncate">{a.description}</div>
                {isUnlocked && (
                  <div className="text-[10px] text-jade-400 mt-0.5">✓ Conquistado</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
