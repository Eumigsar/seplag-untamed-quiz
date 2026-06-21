'use client';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { formatChineseDateFull, getDayOfWeekChinese, getWeatherEmoji } from '@/lib/utils';
import { WEATHER_DATA } from '@/data/weather';

const CHINESE_MONTHS = [
  '正月','二月','三月','四月','五月','六月',
  '七月','八月','九月','十月','十一月','十二月',
];

const SEASONS = [
  { hanzi: '冬', pinyin: 'dōng', label: 'Inverno', months: [12, 1, 2] },
  { hanzi: '春', pinyin: 'chūn', label: 'Primavera', months: [3, 4, 5] },
  { hanzi: '夏', pinyin: 'xià', label: 'Verão', months: [6, 7, 8] },
  { hanzi: '秋', pinyin: 'qiū', label: 'Outono', months: [9, 10, 11] },
];

const FESTIVALS = [
  { month: 1, day: 1, hanzi: '元旦', pinyin: 'Yuándàn', label: 'Ano Novo' },
  { month: 1, day: 15, hanzi: '元宵节', pinyin: 'Yuánxiāo Jié', label: 'Lanterna' },
  { month: 4, day: 5, hanzi: '清明节', pinyin: 'Qīngmíng Jié', label: 'Qingming' },
  { month: 5, day: 5, hanzi: '端午节', pinyin: 'Duānwǔ Jié', label: 'Barco-Dragão' },
  { month: 7, day: 7, hanzi: '七夕节', pinyin: 'Qīxī Jié', label: 'Dia dos Namorados' },
  { month: 8, day: 15, hanzi: '中秋节', pinyin: 'Zhōngqiū Jié', label: 'Lua Cheia' },
  { month: 9, day: 9, hanzi: '重阳节', pinyin: 'Chóngyáng Jié', label: 'Chongyang' },
  { month: 12, day: 25, hanzi: '冬至', pinyin: 'Dōngzhì', label: 'Solstício Inverno' },
];

export default function CalendarWidget() {
  const { setActivePanel, chineseDate, weather } = useGameStore();
  const weatherInfo = WEATHER_DATA[weather];
  const dayInfo = getDayOfWeekChinese(chineseDate.dayOfWeek);

  const currentSeason = SEASONS.find(s => s.months.includes(chineseDate.month)) ?? SEASONS[0];
  const festival = FESTIVALS.find(f => f.month === chineseDate.month && f.day === chineseDate.day);

  const hour = chineseDate.hour;
  const timeOfDay =
    hour >= 5 && hour < 12 ? { hanzi: '早晨', pinyin: 'zǎochen', label: 'Manhã' } :
    hour >= 12 && hour < 18 ? { hanzi: '下午', pinyin: 'xiàwǔ', label: 'Tarde' } :
    hour >= 18 && hour < 21 ? { hanzi: '傍晚', pinyin: 'bàngwǎn', label: 'Entardecer' } :
    { hanzi: '夜晚', pinyin: 'yèwǎn', label: 'Noite' };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: 20 }}
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 w-80
                 bg-ink-900/98 border border-gold-700/40 rounded-xl shadow-2xl backdrop-blur-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gold-700/30">
        <h2 className="font-chinese text-gold-300 text-lg">历法 · Calendário</h2>
        <button onClick={() => setActivePanel('none')} className="text-gray-400 hover:text-white text-xl">✕</button>
      </div>

      <div className="p-4 space-y-4">
        {/* Date display */}
        <div className="text-center">
          <div className="font-chinese text-4xl text-gold-300">
            {chineseDate.year}
          </div>
          <div className="font-chinese text-xl text-parchment-200 mt-1">
            {CHINESE_MONTHS[chineseDate.month - 1]} {['初','一','二','三','四','五','六','七','八','九'][Math.floor(chineseDate.day/10)]}
            {['○','一','二','三','四','五','六','七','八','九'][chineseDate.day % 10]}日
          </div>
          <div className="text-xs text-jade-300 mt-1">
            {chineseDate.year}年 {chineseDate.month}月 {chineseDate.day}日
          </div>
        </div>

        {/* Time */}
        <div className="flex items-center justify-center gap-4 bg-ink-800/60 rounded-lg p-3">
          <div className="text-center">
            <div className="font-chinese text-2xl text-gold-200">
              {chineseDate.hour.toString().padStart(2,'0')}:{chineseDate.minute.toString().padStart(2,'0')}
            </div>
            <div className="text-xs text-gray-400">Horário</div>
          </div>
          <div className="w-px h-8 bg-gold-700/30" />
          <div className="text-center">
            <div className="font-chinese text-lg text-parchment-200">{timeOfDay.hanzi}</div>
            <div className="text-xs text-jade-300">{timeOfDay.pinyin}</div>
            <div className="text-[10px] text-gray-500">{timeOfDay.label}</div>
          </div>
        </div>

        {/* Day of week & Season */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-ink-800/60 rounded-lg p-3 text-center">
            <div className="font-chinese text-lg text-parchment-200">{dayInfo.hanzi}</div>
            <div className="text-xs text-jade-300">{dayInfo.pinyin}</div>
            <div className="text-[10px] text-gray-500">{dayInfo.portuguese}</div>
          </div>
          <div className="bg-ink-800/60 rounded-lg p-3 text-center">
            <div className="font-chinese text-2xl text-gold-300">{currentSeason.hanzi}</div>
            <div className="text-xs text-jade-300">{currentSeason.pinyin}</div>
            <div className="text-[10px] text-gray-500">{currentSeason.label}</div>
          </div>
        </div>

        {/* Weather */}
        <div className="bg-ink-800/60 rounded-lg p-3 flex items-center gap-3">
          <span className="text-2xl">{getWeatherEmoji(weather)}</span>
          <div>
            <div className="font-chinese text-parchment-200">{weatherInfo?.hanzi}</div>
            <div className="text-xs text-jade-300">{weatherInfo?.pinyin}</div>
            <div className="text-xs text-gray-500">{weatherInfo?.description}</div>
          </div>
        </div>

        {/* Festival */}
        {festival && (
          <div className="bg-crimson-900/40 border border-crimson-700/40 rounded-lg p-3 text-center">
            <div className="text-xs text-crimson-300 mb-1">🎊 Festival Hoje</div>
            <div className="font-chinese text-lg text-gold-300">{festival.hanzi}</div>
            <div className="text-xs text-jade-300">{festival.pinyin}</div>
            <div className="text-[10px] text-gray-400">{festival.label}</div>
          </div>
        )}

        {/* Vocabulary hint */}
        <div className="text-center text-xs text-gray-600">
          <span className="font-chinese">今天</span> jīntiān · hoje
        </div>
      </div>
    </motion.div>
  );
}
