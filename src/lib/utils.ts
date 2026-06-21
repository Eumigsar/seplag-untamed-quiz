import type { ChineseDate } from '@/types';

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getAssetPath(path: string): string {
  const base = process.env.NODE_ENV === 'production' ? '/seplag-untamed-quiz' : '';
  return `${base}${path}`;
}

export function getChineseDate(): ChineseDate {
  const now = new Date();
  return {
    year:       now.getFullYear(),
    month:      now.getMonth() + 1,
    day:        now.getDate(),
    hour:       now.getHours(),
    minute:     now.getMinutes(),
    dayOfWeek:  now.getDay(),
  };
}

export function formatChineseDateFull(d: ChineseDate): string {
  const digits = ['零','一','二','三','四','五','六','七','八','九'];
  const tens   = ['','十','二十','三十'];
  function num(n: number): string {
    if (n < 10) return digits[n];
    if (n < 20) return '十' + (n % 10 ? digits[n % 10] : '');
    return tens[Math.floor(n / 10)] + (n % 10 ? digits[n % 10] : '');
  }
  const y = String(d.year).split('').map(c => digits[Number(c)]).join('');
  return `${y}年${num(d.month)}月${num(d.day)}日`;
}

export function formatTimeChineseVerbose(h: number, m: number): string {
  const digits = ['零','一','二','三','四','五','六','七','八','九','十','十一','十二'];
  const period = h < 6 ? '凌晨' : h < 12 ? '上午' : h < 14 ? '中午' : h < 18 ? '下午' : '晚上';
  const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  const minStr = m === 0 ? '整' : m === 30 ? '三十分' : `${digits[Math.floor(m/10)] === '零' ? '' : digits[Math.floor(m/10)]}${digits[m % 10]}分`;
  return `现在${period}${digits[hour12]}点${minStr}`;
}

export function getDayOfWeekChinese(dow: number): { hanzi: string; pinyin: string; portuguese: string } {
  const map = [
    { hanzi: '星期日', pinyin: 'xīngqī rì',  portuguese: 'Domingo'       },
    { hanzi: '星期一', pinyin: 'xīngqī yī',  portuguese: 'Segunda-feira' },
    { hanzi: '星期二', pinyin: 'xīngqī èr',  portuguese: 'Terça-feira'   },
    { hanzi: '星期三', pinyin: 'xīngqī sān', portuguese: 'Quarta-feira'  },
    { hanzi: '星期四', pinyin: 'xīngqī sì',  portuguese: 'Quinta-feira'  },
    { hanzi: '星期五', pinyin: 'xīngqī wǔ',  portuguese: 'Sexta-feira'   },
    { hanzi: '星期六', pinyin: 'xīngqī liù', portuguese: 'Sábado'        },
  ];
  return map[dow] ?? map[0];
}

export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.4, level - 1));
}

export function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function weightedRandom<T>(items: Array<{ value: T; weight: number }>): T {
  const total = items.reduce((sum, i) => sum + i.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item.value;
  }
  return items[items.length - 1].value;
}

export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function formatGold(amount: number): string {
  return `${amount.toLocaleString('pt-BR')} 金`;
}

export function getWeatherEmoji(type: string): string {
  const map: Record<string, string> = {
    sunny: '☀️', rainy: '🌧️', foggy: '🌫️', stormy: '⛈️',
    snowy: '❄️', cold: '🧊', spring: '🌸', autumn: '🍂', windy: '💨',
  };
  return map[type] ?? '☀️';
}

export function getRarityColor(rarity: string): string {
  const map: Record<string, string> = {
    common:    'text-gray-300',
    uncommon:  'text-jade-400',
    rare:      'text-blue-400',
    legendary: 'text-gold-400',
  };
  return map[rarity] ?? 'text-gray-300';
}

export function getToneClass(pinyin: string): string {
  if (pinyin.includes('ā') || pinyin.includes('ē') || pinyin.includes('ī') ||
      pinyin.includes('ō') || pinyin.includes('ū') || pinyin.includes('ǖ')) return 'tone-1';
  if (pinyin.includes('á') || pinyin.includes('é') || pinyin.includes('í') ||
      pinyin.includes('ó') || pinyin.includes('ú') || pinyin.includes('ǘ')) return 'tone-2';
  if (pinyin.includes('ǎ') || pinyin.includes('ě') || pinyin.includes('ǐ') ||
      pinyin.includes('ǒ') || pinyin.includes('ǔ') || pinyin.includes('ǚ')) return 'tone-3';
  if (pinyin.includes('à') || pinyin.includes('è') || pinyin.includes('ì') ||
      pinyin.includes('ò') || pinyin.includes('ù') || pinyin.includes('ǜ')) return 'tone-4';
  return 'tone-neutral';
}

export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
