'use client';
import { motion } from 'framer-motion';
import type { VocabWord } from '@/types';
import { speakNormal, speakSlow } from '@/lib/speech';
import { cn } from '@/lib/utils';

interface Props {
  word: VocabWord;
  showPinyin?: boolean;
  showTranslation?: boolean;
  onClick?: () => void;
  className?: string;
  compact?: boolean;
}

const HSK_COLORS: Record<number, string> = {
  1: 'bg-jade-700 text-jade-100',
  2: 'bg-blue-700 text-blue-100',
  3: 'bg-purple-700 text-purple-100',
  4: 'bg-gold-700 text-gold-100',
};

export default function VocabularyCard({
  word, showPinyin = true, showTranslation = true, onClick, className, compact = false,
}: Props) {
  const handleSpeak = (e: React.MouseEvent, slow = false) => {
    e.stopPropagation();
    slow ? speakSlow(word.hanzi) : speakNormal(word.hanzi);
  };

  if (compact) {
    return (
      <motion.div
        onClick={onClick}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        className={cn(
          'bg-ink-800 border border-gold-700/30 rounded p-2 cursor-pointer',
          'hover:border-gold-500/60 transition-colors',
          className,
        )}
      >
        <span className="text-2xl font-chinese text-gold-300 mr-2">{word.hanzi}</span>
        {showPinyin && <span className="text-xs text-jade-300">{word.pinyin}</span>}
        {showTranslation && <span className="text-xs text-gray-400 ml-2">{word.translation}</span>}
      </motion.div>
    );
  }

  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={onClick ? { scale: 1.02 } : undefined}
      className={cn(
        'relative bg-gradient-to-b from-ink-800 to-ink-900',
        'border border-gold-700/40 rounded-lg p-4 shadow-xl',
        onClick && 'cursor-pointer hover:border-gold-500/70 transition-colors',
        className,
      )}
    >
      {/* HSK Badge */}
      <span className={cn(
        'absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded',
        HSK_COLORS[word.hsk] ?? 'bg-gray-700 text-gray-100',
      )}>
        HSK{word.hsk}
      </span>

      {/* Hanzi */}
      <div className="text-5xl font-chinese text-gold-300 text-center mb-2 leading-none">
        {word.hanzi}
      </div>

      {/* Pinyin */}
      {showPinyin && (
        <div className="text-sm text-jade-300 text-center font-mono mb-1">
          {word.pinyin}
        </div>
      )}

      {/* Translation */}
      {showTranslation && (
        <div className="text-xs text-gray-300 text-center mb-3">
          {word.translation}
        </div>
      )}

      {/* Classifier */}
      {word.classifier && (
        <div className="text-xs text-parchment-300 text-center mb-2">
          Classificador: <span className="text-gold-400 font-chinese">{word.classifier}</span>
          <span className="text-gray-400 ml-1">({word.classifierPinyin})</span>
        </div>
      )}

      {/* Example sentence */}
      {word.example && (
        <div className="mt-2 p-2 bg-ink-700/50 rounded border-l-2 border-jade-600">
          <div className="text-sm font-chinese text-parchment-200">{word.example.hanzi}</div>
          <div className="text-xs text-jade-300 mt-0.5">{word.example.pinyin}</div>
          <div className="text-xs text-gray-400 mt-0.5 italic">{word.example.translation}</div>
        </div>
      )}

      {/* Audio buttons */}
      <div className="flex gap-2 justify-center mt-3">
        <button
          onClick={(e) => handleSpeak(e)}
          className="flex items-center gap-1 px-3 py-1 bg-jade-700 hover:bg-jade-600
                     text-white text-xs rounded transition-colors"
          title="Pronunciar em velocidade normal"
        >
          🔊 Normal
        </button>
        <button
          onClick={(e) => handleSpeak(e, true)}
          className="flex items-center gap-1 px-3 py-1 bg-blue-700 hover:bg-blue-600
                     text-white text-xs rounded transition-colors"
          title="Pronunciar devagar"
        >
          🐢 Lento
        </button>
      </div>
    </motion.div>
  );
}
