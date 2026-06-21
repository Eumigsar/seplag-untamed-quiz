'use client';
import { useGameStore } from '@/store/gameStore';
import { usePlayerStore } from '@/store/playerStore';
import { useVocabularyStore } from '@/store/vocabularyStore';
import ProgressBar from '@/components/ui/ProgressBar';
import { formatGold, getWeatherEmoji, getDayOfWeekChinese, formatChineseDateFull } from '@/lib/utils';
import type { ActivePanel } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { WEATHER_DATA } from '@/data/weather';

export default function HUD() {
  const { activePanel, setActivePanel, weather, chineseDate, notification, clearNotification } = useGameStore();
  const { character } = usePlayerStore();
  const { totalLearned, totalMastered } = useVocabularyStore();

  if (!character) return null;

  const { stats } = character;
  const dayInfo = getDayOfWeekChinese(chineseDate.dayOfWeek);
  const weatherInfo = WEATHER_DATA[weather];

  const togglePanel = (panel: ActivePanel) => {
    setActivePanel(activePanel === panel ? 'none' : panel);
  };

  const panelBtn = (label: string, icon: string, panel: ActivePanel) => (
    <button
      onClick={() => togglePanel(panel)}
      className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded text-xs transition-all
        ${activePanel === panel
          ? 'bg-gold-600/80 text-white border border-gold-400'
          : 'bg-ink-800/90 text-gray-300 border border-gold-800/40 hover:border-gold-600/60 hover:text-white'}`}
    >
      <span className="text-base">{icon}</span>
      <span>{label}</span>
    </button>
  );

  return (
    <>
      {/* Top-left: Character stats */}
      <div className="fixed top-3 left-3 z-40 w-52 bg-ink-900/90 border border-gold-700/40 rounded-lg p-3 shadow-xl backdrop-blur-sm">
        {/* Name & Level */}
        <div className="flex items-center justify-between mb-2">
          <span className="font-chinese text-gold-300 font-bold text-sm truncate">{character.nickname}</span>
          <span className="text-xs bg-gold-700/60 text-gold-200 px-2 py-0.5 rounded-full">Lv.{stats.level}</span>
        </div>

        {/* HP */}
        <div className="mb-1">
          <ProgressBar value={stats.hp} max={stats.maxHp} color="jade" label={`❤️ ${stats.hp}/${stats.maxHp}`} size="sm" />
        </div>
        {/* MP */}
        <div className="mb-1">
          <ProgressBar value={stats.mp} max={stats.maxMp} color="blue" label={`💙 ${stats.mp}/${stats.maxMp}`} size="sm" />
        </div>
        {/* XP */}
        <div className="mb-2">
          <ProgressBar value={stats.xp} max={stats.xpToNext} color="gold" label={`✨ ${stats.xp}/${stats.xpToNext}`} size="sm" />
        </div>

        {/* Gold & vocab */}
        <div className="flex justify-between text-xs text-gray-400">
          <span>💰 {formatGold(stats.gold)}</span>
          <span>📖 {totalLearned} 词</span>
        </div>
      </div>

      {/* Top-right: Time, weather, date */}
      <div className="fixed top-3 right-3 z-40 bg-ink-900/90 border border-gold-700/40 rounded-lg p-3 shadow-xl backdrop-blur-sm text-right">
        <div className="text-gold-300 font-chinese text-sm">
          {getWeatherEmoji(weather)} {weatherInfo?.hanzi ?? ''}
        </div>
        <div className="text-xs text-jade-300">{weatherInfo?.pinyin}</div>
        <div className="text-xs text-gray-400 mt-1">
          {`${chineseDate.hour.toString().padStart(2,'0')}:${chineseDate.minute.toString().padStart(2,'0')}`}
        </div>
        <div className="text-xs text-parchment-300 font-chinese">{dayInfo.hanzi}</div>
        <div className="text-[10px] text-gray-500">{dayInfo.pinyin}</div>
      </div>

      {/* Bottom action bar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
        <div className="flex gap-1.5 bg-ink-900/95 border border-gold-700/40 rounded-xl p-2 shadow-2xl backdrop-blur-sm">
          {panelBtn('师父', '🧙', 'sifu')}
          {panelBtn('任务', '📋', 'quest-log')}
          {panelBtn('词汇', '📖', 'vocabulary')}
          {panelBtn('背包', '🎒', 'inventory')}
          {panelBtn('地图', '🗺️', 'map')}
          {panelBtn('成就', '🏆', 'achievements')}
          {panelBtn('历法', '📅', 'calendar')}
        </div>
      </div>

      {/* Vocabulary mastered indicator */}
      {totalMastered > 0 && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-40 bg-jade-900/90 border border-jade-500/40 rounded-full px-4 py-1 text-xs text-jade-300">
          ✓ {totalMastered} 词已掌握 · palavras dominadas
        </div>
      )}

      {/* Notification toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -40, x: '-50%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="fixed top-20 left-1/2 z-50 bg-ink-900/95 border border-gold-500/60 rounded-lg p-3 shadow-2xl min-w-[200px] max-w-sm"
            onClick={clearNotification}
          >
            <div className="font-bold text-sm text-gold-300">{notification.title}</div>
            {notification.hanzi && (
              <div className="font-chinese text-xl text-parchment-200 mt-0.5">{notification.hanzi}</div>
            )}
            {notification.pinyin && (
              <div className="text-xs text-jade-300">{notification.pinyin}</div>
            )}
            <div className="text-xs text-gray-400 mt-1">{notification.message}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
