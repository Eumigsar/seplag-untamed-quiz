'use client';
import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { usePlayerStore } from '@/store/playerStore';
import { useVocabularyStore } from '@/store/vocabularyStore';
import { formatGold, getWeatherEmoji, getDayOfWeekChinese } from '@/lib/utils';
import type { ActivePanel } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { WEATHER_DATA } from '@/data/weather';
import { QUESTS } from '@/data/quests';

export default function HUD() {
  const { activePanel, setActivePanel, weather, chineseDate, notification, clearNotification, showNotification } = useGameStore();
  const { character } = usePlayerStore();
  const { totalLearned, totalMastered } = useVocabularyStore();
  const [sessionMins, setSessionMins] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setSessionMins(m => {
        const next = m + 1;
        if (next === 25 || next === 50) {
          showNotification({
            type: 'info',
            title: '⏰ Hora de descansar!',
            message: `Você treinou por ${next} min. Faça uma pausa de 5 minutos — seu cérebro agradece!`,
            duration: 12000,
          });
        }
        return next;
      });
    }, 60_000);
    return () => clearInterval(t);
  }, [showNotification]);

  if (!character) return null;

  const { stats } = character;
  const dayInfo = getDayOfWeekChinese(chineseDate.dayOfWeek);
  const weatherInfo = WEATHER_DATA[weather];

  const activeQuestCount = Object.values(character.questProgress).filter(s => s === 'active').length;

  const focusQuest = QUESTS.find(q => character.questProgress[q.id] === 'active');
  const focusObj = focusQuest?.objectives.find(o => o.current < o.quantity);
  const suggestQuest = !focusQuest
    ? QUESTS.find(q => {
        if (q.hskRequired > character.hskLevel) return false;
        return (character.questProgress[q.id] ?? 'not-started') === 'not-started';
      })
    : null;

  const togglePanel = (panel: ActivePanel) => setActivePanel(activePanel === panel ? 'none' : panel);

  const hpPct  = Math.min(100, (stats.hp / stats.maxHp) * 100);
  const mpPct  = Math.min(100, (stats.mp / stats.maxMp) * 100);
  const xpPct  = Math.min(100, (stats.xp / stats.xpToNext) * 100);

  return (
    <>
      {/* ── Top-left: Character stats ── */}
      <div
        className="fixed left-3 z-40 gi-panel w-40 sm:w-52 p-2.5 sm:p-3"
        style={{ top: 'max(0.75rem, env(safe-area-inset-top, 0px))' }}
      >
        <div className="gi-corner-tr" /><div className="gi-corner-bl" />

        {/* Name & Level */}
        <div className="flex items-center justify-between mb-2.5">
          <span className="font-chinese text-gi-geo font-bold text-sm truncate">{character.nickname}</span>
          <span className="text-[10px] bg-gold-800/60 text-gi-geo-light border border-gold-600/40 px-1.5 py-0.5 rounded">
            Lv.{stats.level}
          </span>
        </div>

        {/* HP bar */}
        <div className="mb-1.5">
          <div className="flex justify-between text-[10px] mb-0.5">
            <span className="text-crimson-300">HP</span>
            <span className="text-gi-text-dim">{stats.hp}/{stats.maxHp}</span>
          </div>
          <div className="gi-bar gi-bar-sm">
            <div className="gi-bar-fill gi-bar-hp" style={{ width: `${hpPct}%` }} />
          </div>
        </div>

        {/* MP bar */}
        <div className="mb-1.5">
          <div className="flex justify-between text-[10px] mb-0.5">
            <span className="text-blue-400">MP</span>
            <span className="text-gi-text-dim">{stats.mp}/{stats.maxMp}</span>
          </div>
          <div className="gi-bar gi-bar-sm">
            <div className="gi-bar-fill gi-bar-mp" style={{ width: `${mpPct}%` }} />
          </div>
        </div>

        {/* XP bar */}
        <div className="mb-2.5">
          <div className="flex justify-between text-[10px] mb-0.5">
            <span className="text-gi-geo">EXP</span>
            <span className="text-gi-text-dim">{stats.xp}/{stats.xpToNext}</span>
          </div>
          <div className="gi-bar gi-bar-sm">
            <div className="gi-bar-fill gi-bar-xp" style={{ width: `${xpPct}%` }} />
          </div>
        </div>

        <div className="gi-divider mb-2" />

        {/* Gold & vocab */}
        <div className="flex justify-between text-[10px]">
          <span className="text-gi-geo">◆ {formatGold(stats.gold)}</span>
          <span className="text-gi-anemo">📖 {totalLearned} 词</span>
        </div>
      </div>

      {/* ── Top-right: Time & weather ── */}
      <div
        className="fixed right-3 z-40 gi-panel p-2.5 sm:p-3 text-right min-w-[80px]"
        style={{ top: 'max(0.75rem, env(safe-area-inset-top, 0px))' }}
      >
        <div className="gi-corner-tr" /><div className="gi-corner-bl" />
        <div className="font-chinese text-gi-geo text-sm leading-tight">
          {getWeatherEmoji(weather)} {weatherInfo?.hanzi ?? ''}
        </div>
        <div className="text-[10px] text-gi-anemo">{weatherInfo?.pinyin}</div>
        <div className="gi-divider my-1.5" />
        <div className="text-xs text-gi-text font-mono">
          {`${chineseDate.hour.toString().padStart(2,'0')}:${chineseDate.minute.toString().padStart(2,'0')}`}
        </div>
        <div className="text-[11px] font-chinese text-gi-geo-light">{dayInfo.hanzi}</div>
        <div className="text-[10px] text-gi-text-dim">{dayInfo.pinyin}</div>
      </div>

      {/* ── Top-center: Focus widget (next objective / quest suggestion) ── */}
      <AnimatePresence>
        {(focusObj || suggestQuest) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-3 left-1/2 -translate-x-1/2 z-40 w-[220px] sm:w-[280px]"
            style={{ top: 'max(0.75rem, env(safe-area-inset-top, 0px))' }}
          >
            <div className={`gi-panel px-3 py-2 ${focusObj ? '' : 'gi-panel-teal'}`}>
              <div className="gi-corner-tr" /><div className="gi-corner-bl" />
              {focusObj ? (
                <>
                  <div className="text-[10px] text-gi-geo font-bold uppercase tracking-wider mb-0.5">
                    🎯 Próximo Passo
                  </div>
                  <div className="text-xs text-gi-text truncate">{focusObj.description}</div>
                  {focusObj.quantity > 1 && (
                    <div className="mt-1.5">
                      <div className="gi-bar gi-bar-sm">
                        <div
                          className="gi-bar-fill gi-bar-obj"
                          style={{ width: `${Math.min(100, (focusObj.current / focusObj.quantity) * 100)}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-gi-geo-light mt-0.5">
                        {focusObj.current}/{focusObj.quantity}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="text-[10px] text-gi-anemo font-bold uppercase tracking-wider mb-0.5">
                    💡 Sugestão
                  </div>
                  <div className="text-xs text-gi-text truncate">{suggestQuest!.title.portuguese}</div>
                  <div className="text-[10px] text-gi-text-dim mt-0.5">📋 Abra Missões para começar</div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Vocabulary mastered flash ── */}
      <AnimatePresence>
        {totalMastered > 0 && (
          <motion.div
            key={totalMastered}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-40 gi-panel gi-panel-teal px-4 py-1.5 flex items-center gap-2"
          >
            <div className="gi-corner-tr" /><div className="gi-corner-bl" />
            <span className="text-gi-anemo text-xs font-bold">✓</span>
            <span className="text-gi-text text-xs">
              {totalMastered} 词已掌握 · palavras dominadas
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Notification toast ── */}
      <AnimatePresence>
        {notification && (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -40, x: '-50%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="fixed top-24 left-1/2 z-50 gi-panel px-4 py-3 min-w-[200px] max-w-sm cursor-pointer"
            onClick={clearNotification}
          >
            <div className="gi-corner-tr" /><div className="gi-corner-bl" />
            <div className="font-bold text-sm text-gi-geo">{notification.title}</div>
            {notification.hanzi && (
              <div className="font-chinese text-xl text-gi-text mt-0.5">{notification.hanzi}</div>
            )}
            {notification.pinyin && (
              <div className="text-xs text-gi-anemo font-mono">{notification.pinyin}</div>
            )}
            <div className="text-xs text-gi-text-dim mt-1">{notification.message}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom action bar ── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 flex justify-end sm:justify-center"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="gi-panel flex gap-1 sm:gap-1.5 px-2 py-1.5 mr-3 sm:mr-0 rounded-md">
          <div className="gi-corner-tr" /><div className="gi-corner-bl" />

          {([
            { label: '师父', icon: '🧙', panel: 'sifu' as ActivePanel, badge: undefined as number | undefined },
            { label: '任务', icon: '📋', panel: 'quest-log' as ActivePanel, badge: activeQuestCount as number | undefined },
            { label: '词汇', icon: '📖', panel: 'vocabulary' as ActivePanel, badge: undefined as number | undefined },
            { label: '背包', icon: '🎒', panel: 'inventory' as ActivePanel, badge: undefined as number | undefined },
            { label: '地图', icon: '🗺️', panel: 'map' as ActivePanel, badge: undefined as number | undefined },
            { label: '成就', icon: '🏆', panel: 'achievements' as ActivePanel, badge: undefined as number | undefined },
            { label: '历法', icon: '📅', panel: 'calendar' as ActivePanel, badge: undefined as number | undefined },
          ]).map(({ label, icon, panel, badge }) => (
            <button
              key={panel}
              onClick={() => togglePanel(panel)}
              className={`gi-skill-btn relative ${activePanel === panel ? 'active' : ''}`}
            >
              {badge !== undefined && badge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-crimson-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none z-10">
                  {badge > 9 ? '!' : badge}
                </span>
              )}
              <span className="text-base leading-none">{icon}</span>
              <span className={`text-[10px] leading-none ${activePanel === panel ? 'text-gi-geo-light' : 'text-gi-text-dim'}`}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Session timer */}
      {sessionMins > 0 && (
        <div className="fixed bottom-0 left-3 z-40 text-[10px] text-gi-text-dim pb-2">
          ⏱ {sessionMins} min
        </div>
      )}
    </>
  );
}
