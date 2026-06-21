'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { usePlayerStore } from '@/store/playerStore';
import { QUESTS } from '@/data/quests';
import type { QuestStatus } from '@/types';
import { cn } from '@/lib/utils';

const STATUS_LABELS: Record<QuestStatus, { label: string; className: string }> = {
  'not-started': { label: 'Disponível',   className: 'text-gi-text-dim' },
  'active':      { label: 'Em Progresso', className: 'text-gi-geo' },
  'completed':   { label: 'Concluída',    className: 'text-gi-anemo' },
  'failed':      { label: 'Falhada',      className: 'text-crimson-400' },
};

const TYPE_EMOJI: Record<string, string> = {
  main:  '⚔️',
  side:  '📜',
  daily: '🌅',
  event: '🏮',
};

export default function QuestLog() {
  const { setActivePanel } = useGameStore();
  const { character } = usePlayerStore();
  const [filter, setFilter] = useState<QuestStatus | 'all'>('all');
  const [selected, setSelected] = useState<string | null>(null);

  if (!character) return null;

  const quests = QUESTS.map(q => ({
    ...q,
    status: (character.questProgress[q.id] ?? 'not-started') as QuestStatus,
  })).filter(q => {
    if (q.hskRequired > character.hskLevel) return false;
    if (q.prerequisiteQuestIds?.length) {
      return q.prerequisiteQuestIds.every(pid => character.questProgress[pid] === 'completed');
    }
    return true;
  });

  const filtered = filter === 'all' ? quests : quests.filter(q => q.status === filter);
  const counts = {
    active:    quests.filter(q => q.status === 'active').length,
    completed: quests.filter(q => q.status === 'completed').length,
  };

  return (
    <motion.div
      initial={{ x: '-100%' }}
      animate={{ x: 0 }}
      exit={{ x: '-100%' }}
      transition={{ type: 'spring', damping: 24, stiffness: 260 }}
      className="fixed left-0 top-0 bottom-0 w-full sm:w-80 z-40 flex flex-col
                 bg-[rgba(9,13,34,0.97)] border-r border-[rgba(201,168,108,0.25)] shadow-2xl backdrop-blur-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(201,168,108,0.18)]">
        <div>
          <h2 className="font-chinese text-gi-geo text-lg text-shadow-gold">任务日志</h2>
          <p className="text-[11px] text-gi-text-dim">
            {counts.active} ativas · {counts.completed} concluídas
          </p>
        </div>
        <button onClick={() => setActivePanel('none')} className="text-gi-text-dim hover:text-gi-text text-lg transition-colors">✕</button>
      </div>

      {/* Filter tabs */}
      <div className="flex border-b border-[rgba(201,168,108,0.12)] text-xs">
        {(['all', 'active', 'not-started', 'completed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'flex-1 py-2 transition-colors',
              filter === f
                ? 'text-gi-geo border-b-2 border-gi-geo'
                : 'text-gi-text-dim hover:text-gi-text',
            )}
          >
            {f === 'all'         ? 'Todas' :
             f === 'active'      ? 'Ativas' :
             f === 'not-started' ? 'Disponíveis' : 'Concluídas'}
          </button>
        ))}
      </div>

      {/* Quest list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-center text-gi-text-dim text-sm mt-8">Nenhuma missão disponível</p>
        ) : (
          filtered.map(q => {
            const statusInfo = STATUS_LABELS[q.status];
            const xpReward   = q.rewards.find(r => r.type === 'xp')?.value ?? 0;
            const goldReward = q.rewards.find(r => r.type === 'gold')?.value ?? 0;
            const isOpen     = selected === q.id;

            return (
              <button
                key={q.id}
                onClick={() => setSelected(isOpen ? null : q.id)}
                className={cn(
                  'w-full text-left px-3 py-2.5 border-b border-[rgba(201,168,108,0.08)] transition-all',
                  isOpen
                    ? 'bg-[rgba(201,168,108,0.06)] border-l-2 border-l-[rgba(201,168,108,0.7)]'
                    : 'hover:bg-[rgba(201,168,108,0.04)]',
                )}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg mt-0.5">{TYPE_EMOJI[q.type] ?? '📋'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-chinese text-sm text-gi-text truncate">{q.title.hanzi}</div>
                    <div className="text-xs text-gi-text-dim">{q.title.portuguese}</div>
                    <div className={cn('text-[10px] mt-0.5', statusInfo.className)}>{statusInfo.label}</div>
                  </div>
                  <span className="text-[10px] border border-[rgba(201,168,108,0.2)] text-gi-text-dim px-1.5 rounded shrink-0">
                    HSK{q.hskRequired}
                  </span>
                </div>

                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2 pt-2 border-t border-[rgba(201,168,108,0.14)]"
                  >
                    <p className="text-xs text-gi-text-dim mb-2">{q.description}</p>

                    <div className="space-y-2 mb-2">
                      {q.objectives.map(obj => {
                        const done = obj.current >= obj.quantity;
                        const objPct = Math.min(100, (obj.current / obj.quantity) * 100);
                        return (
                          <div key={obj.id} className={done ? 'opacity-50' : ''}>
                            <div className="flex items-center gap-1 text-xs">
                              <span className="text-gi-geo">
                                {done ? '✅' :
                                 obj.type === 'learn'   ? '📖' :
                                 obj.type === 'talk'    ? '💬' :
                                 obj.type === 'collect' ? '🎒' : '◯'}
                              </span>
                              <span className={done ? 'line-through text-gi-text-dim' : 'text-gi-text'}>
                                {obj.description}
                              </span>
                            </div>
                            {obj.quantity > 1 && (
                              <div className="mt-1 ml-4">
                                <div className="gi-bar gi-bar-sm">
                                  <div
                                    className={`gi-bar-fill ${done ? 'gi-bar-xp' : 'gi-bar-obj'}`}
                                    style={{ width: `${objPct}%` }}
                                  />
                                </div>
                                <span className="text-[10px] text-gi-text-dim">{obj.current}/{obj.quantity}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-2 border-t border-[rgba(201,168,108,0.12)]">
                      <p className="text-[10px] text-gi-geo mb-1">Recompensas:</p>
                      <div className="flex gap-3 text-xs text-gi-text-dim">
                        {Number(xpReward)   > 0 && <span>✦ {String(xpReward)} XP</span>}
                        {Number(goldReward) > 0 && <span>◆ {String(goldReward)}</span>}
                        {q.rewards.filter(r => r.type === 'item').length > 0 && <span>🎁 Itens</span>}
                      </div>
                    </div>
                  </motion.div>
                )}
              </button>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
