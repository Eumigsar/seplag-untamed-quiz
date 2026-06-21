'use client';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { getDayOfWeekChinese, getWeatherEmoji } from '@/lib/utils';
import { WEATHER_DATA } from '@/data/weather';

const CHINESE_MONTHS = [
  '正月','二月','三月','四月','五月','六月',
  '七月','八月','九月','十月','十一月','十二月',
];

const SEASONS = [
  { hanzi: '冬', pinyin: 'dōng', label: 'Inverno',   months: [12, 1, 2] },
  { hanzi: '春', pinyin: 'chūn', label: 'Primavera', months: [3, 4, 5] },
  { hanzi: '夏', pinyin: 'xià',  label: 'Verão',     months: [6, 7, 8] },
  { hanzi: '秋', pinyin: 'qiū',  label: 'Outono',    months: [9, 10, 11] },
];

const FESTIVALS = [
  { month: 1,  day: 1,  hanzi: '元旦',   pinyin: 'Yuándàn',        label: 'Ano Novo' },
  { month: 1,  day: 15, hanzi: '元宵节', pinyin: 'Yuánxiāo Jié',   label: 'Lanterna' },
  { month: 4,  day: 5,  hanzi: '清明节', pinyin: 'Qīngmíng Jié',   label: 'Qingming' },
  { month: 5,  day: 5,  hanzi: '端午节', pinyin: 'Duānwǔ Jié',     label: 'Barco-Dragão' },
  { month: 7,  day: 7,  hanzi: '七夕节', pinyin: 'Qīxī Jié',       label: 'Dia dos Namorados' },
  { month: 8,  day: 15, hanzi: '中秋节', pinyin: 'Zhōngqiū Jié',   label: 'Lua Cheia' },
  { month: 9,  day: 9,  hanzi: '重阳节', pinyin: 'Chóngyáng Jié',  label: 'Chongyang' },
  { month: 12, day: 25, hanzi: '冬至',   pinyin: 'Dōngzhì',        label: 'Solstício Inverno' },
];

const TENS  = ['初','一','二','三','四','五','六','七','八','九'];
const UNITS = ['○','一','二','三','四','五','六','七','八','九'];

export default function CalendarWidget() {
  const { setActivePanel, chineseDate, weather } = useGameStore();
  const weatherInfo     = WEATHER_DATA[weather];
  const dayInfo         = getDayOfWeekChinese(chineseDate.dayOfWeek);
  const currentSeason   = SEASONS.find(s => s.months.includes(chineseDate.month)) ?? SEASONS[0];
  const festival        = FESTIVALS.find(f => f.month === chineseDate.month && f.day === chineseDate.day);

  const hour = chineseDate.hour;
  const timeOfDay =
    hour >= 5  && hour < 12 ? { hanzi: '早晨', pinyin: 'zǎochen', label: 'Manhã' } :
    hour >= 12 && hour < 18 ? { hanzi: '下午', pinyin: 'xiàwǔ',   label: 'Tarde' } :
    hour >= 18 && hour < 21 ? { hanzi: '傍晚', pinyin: 'bàngwǎn', label: 'Entardecer' } :
    { hanzi: '夜晚', pinyin: 'yèwǎn', label: 'Noite' };

  return (
    <motion.div
      initial={{ scale: 0.94, opacity: 0, y: 16 }}
      animate={{ scale: 1,    opacity: 1, y: 0 }}
      exit={{ scale: 0.94,    opacity: 0, y: 16 }}
      transition={{ type: 'spring', damping: 22, stiffness: 260 }}
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 w-80 gi-panel"
    >
      <div className="gi-corner-tr" /><div className="gi-corner-bl" />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(201,168,108,0.18)]">
        <h2 className="font-chinese text-gi-geo text-lg">历法 · Calendário</h2>
        <button onClick={() => setActivePanel('none')} className="text-gi-text-dim hover:text-gi-text text-lg transition-colors">✕</button>
      </div>

      <div className="p-4 space-y-3">
        {/* Date */}
        <div className="text-center">
          <div className="font-chinese text-4xl text-gi-geo text-shadow-gold">{chineseDate.year}</div>
          <div className="font-chinese text-xl text-gi-text mt-1">
            {CHINESE_MONTHS[chineseDate.month - 1]}&nbsp;
            {TENS[Math.floor(chineseDate.day / 10)]}{UNITS[chineseDate.day % 10]}日
          </div>
          <div className="text-xs text-gi-anemo mt-1">
            {chineseDate.year}年 {chineseDate.month}月 {chineseDate.day}日
          </div>
        </div>

        {/* Time */}
        <div className="flex items-center justify-center gap-4 gi-panel-inner p-3">
          <div className="text-center">
            <div className="font-chinese text-2xl text-gi-geo-light">
              {chineseDate.hour.toString().padStart(2,'0')}:{chineseDate.minute.toString().padStart(2,'0')}
            </div>
            <div className="text-[10px] text-gi-text-dim">Horário</div>
          </div>
          <div className="w-px h-8 bg-[rgba(201,168,108,0.2)]" />
          <div className="text-center">
            <div className="font-chinese text-lg text-gi-text">{timeOfDay.hanzi}</div>
            <div className="text-xs text-gi-anemo">{timeOfDay.pinyin}</div>
            <div className="text-[10px] text-gi-text-dim">{timeOfDay.label}</div>
          </div>
        </div>

        {/* Day & Season */}
        <div className="grid grid-cols-2 gap-2">
          <div className="gi-panel-inner p-3 text-center">
            <div className="font-chinese text-lg text-gi-text">{dayInfo.hanzi}</div>
            <div className="text-xs text-gi-anemo">{dayInfo.pinyin}</div>
            <div className="text-[10px] text-gi-text-dim">{dayInfo.portuguese}</div>
          </div>
          <div className="gi-panel-inner p-3 text-center">
            <div className="font-chinese text-2xl text-gi-geo">{currentSeason.hanzi}</div>
            <div className="text-xs text-gi-anemo">{currentSeason.pinyin}</div>
            <div className="text-[10px] text-gi-text-dim">{currentSeason.label}</div>
          </div>
        </div>

        {/* Weather */}
        <div className="gi-panel-inner p-3 flex items-center gap-3">
          <span className="text-2xl">{getWeatherEmoji(weather)}</span>
          <div>
            <div className="font-chinese text-gi-text">{weatherInfo?.hanzi}</div>
            <div className="text-xs text-gi-anemo">{weatherInfo?.pinyin}</div>
            <div className="text-xs text-gi-text-dim">{weatherInfo?.description}</div>
          </div>
        </div>

        {/* Festival */}
        {festival && (
          <div className="gi-panel border-[rgba(240,64,80,0.4)] bg-[rgba(176,32,48,0.15)] p-3 text-center">
            <div className="gi-corner-tr" /><div className="gi-corner-bl" />
            <div className="text-xs text-crimson-300 mb-1">🎊 Festival Hoje</div>
            <div className="font-chinese text-lg text-gi-geo">{festival.hanzi}</div>
            <div className="text-xs text-gi-anemo">{festival.pinyin}</div>
            <div className="text-[10px] text-gi-text-dim">{festival.label}</div>
          </div>
        )}

        <div className="gi-divider" />
        <div className="text-center text-xs text-gi-text-dim">
          <span className="font-chinese text-gi-geo">今天</span>&nbsp;jīntiān · hoje
        </div>
      </div>
    </motion.div>
  );
}
