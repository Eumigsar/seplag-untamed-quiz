'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { usePlayerStore } from '@/store/playerStore';
import { QUESTS } from '@/data/quests';
import type { QuestStatus } from '@/types';
import { cn } from '@/lib/utils';

const STATUS_LABELS: Record<QuestStatus, { label: string; color: string }> = {
  'not-started': { label: 'Disponível',  color: 'text-gray-400' },
  'active':      { label: 'Em Progresso', color: 'text-gold-300' },
  'completed':   { label: 'Concluída',    color: 'text-jade-300' },
  'failed':      { label: 'Falhada',      color: 'text-red-400' },
};

const TYPE_EMOJI: Record<string, string> = {
  main:    '⚔️',
  side:    '📜',
  daily:   '🌅',
  event:   '🏮',
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
      const prereqDone = q.prerequisiteQuestIds.every(
        pid => character.questProgress[pid] === 'completed'
      );
      if (!prereqDone) return false;
    }
    return true;
  });

  const filtered = filter === 'all' ? quests : quests.filter(q => q.status === filter);

  const counts = {
    all: quests.length,
    active: quests.filter(q => q.status === 'active').length,
    completed: quests.filter(q => q.status === 'completed').length,
  };

  return (
    <motion.div
      initial={{ x: '-100%' }}
      animate={{ x: 0 }}
      exit={{ x: '-100%' }}
      className="fixed left-0 top-0 bottom-0 w-80 bg-ink-900/98 border-r border-gold-700/40 z-40
                 flex flex-col shadow-2xl backdrop-blur-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gold-700/30">
        <div>
          <h2 className="font-chinese text-gold-300 text-lg">任务日志</h2>
          <p className="text-xs text-gray-400">
            {counts.active} ativas · {counts.completed} concluídas
          </p>
        </div>
        <button onClick={() => setActivePanel('none')} className="text-gray-400 hover:text-white text-xl">✕</button>
      </div>

      {/* Filter tabs */}
      <div className="flex border-b border-gold-700/20 text-xs">
        {(['all', 'active', 'not-started', 'completed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'flex-1 py-2 transition-colors',
              filter === f ? 'text-gold-300 border-b-2 border-gold-500' : 'text-gray-400 hover:text-gray-200'
            )}
          >
            {f === 'all' ? `Todas` :
             f === 'active' ? `Ativas` :
             f === 'not-started' ? 'Disponíveis' :
             `Concluídas`}
          </button>
        ))}
      </div>

      {/* Quest list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-500 text-sm mt-8">Nenhuma missão disponível</p>
        ) : (
          filtered.map(q => {
            const statusInfo = STATUS_LABELS[q.status];
            const xpReward = q.rewards.find(r => r.type === 'xp')?.value ?? 0;
            const goldReward = q.rewards.find(r => r.type === 'gold')?.value ?? 0;

            return (
              <button
                key={q.id}
                onClick={() => setSelected(q.id === selected ? null : q.id)}
                className={cn(
                  'w-full text-left p-3 border-b border-gold-700/10 transition-all',
                  selected === q.id
                    ? 'bg-ink-700/80 border-l-2 border-l-gold-500'
                    : 'hover:bg-ink-800/60'
                )}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg mt-0.5">{TYPE_EMOJI[q.type] ?? '📋'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-chinese text-sm text-parchment-200 truncate">{q.title.hanzi}</div>
                    <div className="text-xs text-gray-400">{q.title.portuguese}</div>
                    <div className={cn('text-[10px] mt-0.5', statusInfo.color)}>{statusInfo.label}</div>
                  </div>
                  <span className="text-[10px] bg-ink-700 text-gray-400 px-1.5 rounded">HSK{q.hskRequired}</span>
                </div>

                {selected === q.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2 pt-2 border-t border-gold-700/20"
                  >
                    <p className="text-xs text-gray-300 mb-2">{q.description}</p>
                    <div className="space-y-2 mb-2">
                      {q.objectives.map((obj) => {
                        const done = obj.current >= obj.quantity;
                        return (
                          <div key={obj.id} className={`text-xs ${done ? 'opacity-50' : ''}`}>
                            <div className="flex items-center gap-1">
                              <span className="text-gold-400">
                                {done ? '✅' : obj.type === 'learn' ? '📖' : obj.type === 'talk' ? '💬' : obj.type === 'collect' ? '🎒' : '◯'}
                              </span>
                              <span className={done ? 'line-through text-gray-500' : 'text-gray-300'}>{obj.description}</span>
                            </div>
                            {obj.quantity > 1 && (
                              <div className="mt-1 ml-5">
                                <div className="h-1 bg-ink-700 rounded-full overflow-hidden">
                                  <div
                                    className={`h-1 rounded-full ${done ? 'bg-jade-500' : 'bg-gold-500'}`}
                                    style={{ width: `${Math.min(100, (obj.current / obj.quantity) * 100)}%` }}
                                  />
                                </div>
                                <span className="text-[10px] text-gray-500">{obj.current}/{obj.quantity}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="pt-2 border-t border-gold-700/20">
                      <p className="text-[10px] text-gold-400 mb-1">Recompensas:</p>
                      <div className="flex gap-3 text-xs text-gray-300">
                        {Number(xpReward) > 0 && <span>✨ {String(xpReward)} XP</span>}
                        {Number(goldReward) > 0 && <span>💰 {String(goldReward)}</span>}
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
