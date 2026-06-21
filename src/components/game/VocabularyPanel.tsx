'use client';
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVocabularyStore } from '@/store/vocabularyStore';
import { usePlayerStore } from '@/store/playerStore';
import { useGameStore } from '@/store/gameStore';
import VocabularyCard from '@/components/ui/VocabularyCard';
import { ALL_VOCAB } from '@/data/vocabulary';
import type { VocabCategory } from '@/types';
import { cn } from '@/lib/utils';

const CATEGORIES: { key: VocabCategory; label: string; emoji: string }[] = [
  { key: 'greetings',     label: 'Saudações',    emoji: '👋' },
  { key: 'pronouns',      label: 'Pronomes',     emoji: '🧑' },
  { key: 'numbers',       label: 'Números',      emoji: '🔢' },
  { key: 'time',          label: 'Tempo',        emoji: '⏰' },
  { key: 'family',        label: 'Família',      emoji: '👨‍👩‍👧' },
  { key: 'food',          label: 'Comida',       emoji: '🍜' },
  { key: 'verbs',         label: 'Verbos',       emoji: '⚡' },
  { key: 'adjectives',    label: 'Adjetivos',    emoji: '🎨' },
  { key: 'martial-arts',  label: 'Artes Marciais',emoji: '🥋' },
  { key: 'culture',       label: 'Cultura',      emoji: '🏮' },
  { key: 'philosophy',    label: 'Filosofia',    emoji: '☯️' },
  { key: 'weather',       label: 'Clima',        emoji: '🌤️' },
  { key: 'nature',        label: 'Natureza',     emoji: '🌿' },
  { key: 'clothing',      label: 'Roupas',       emoji: '👘' },
  { key: 'places',        label: 'Lugares',      emoji: '🏯' },
  { key: 'history',       label: 'História',     emoji: '📜' },
];

export default function VocabularyPanel() {
  const { setActivePanel } = useGameStore();
  const { character } = usePlayerStore();
  const { progress, totalLearned, totalMastered } = useVocabularyStore();
  const [tab, setTab] = useState<'browse' | 'learned' | 'review'>('browse');
  const [selectedCat, setSelectedCat] = useState<VocabCategory | 'all'>('all');
  const [selectedHsk, setSelectedHsk] = useState<number>(character?.hskLevel ?? 1);
  const [selectedWord, setSelectedWord] = useState<typeof ALL_VOCAB[0] | null>(null);
  const [search, setSearch] = useState('');

  const hskMax = character?.hskLevel ?? 1;

  // Reset selectedHsk if it exceeds the player's current hskMax
  useEffect(() => {
    if (selectedHsk > hskMax) setSelectedHsk(hskMax);
  }, [hskMax]);

  const filteredWords = useMemo(() => {
    let words = ALL_VOCAB.filter(w => w.hsk <= Math.min(selectedHsk, hskMax));
    if (selectedCat !== 'all') words = words.filter(w => w.category === selectedCat);
    if (search) {
      const s = search.toLowerCase();
      words = words.filter(w =>
        w.hanzi.includes(s) ||
        w.pinyin.toLowerCase().includes(s) ||
        w.translation.toLowerCase().includes(s)
      );
    }
    if (tab === 'learned') words = words.filter(w => progress.has(w.id));
    return words;
  }, [selectedCat, selectedHsk, hskMax, search, tab, progress]);

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
          <h2 className="font-chinese text-gold-300 text-lg">词汇库</h2>
          <p className="text-xs text-gray-400">Vocabulário · {totalLearned} aprendidas · {totalMastered} dominadas</p>
        </div>
        <button onClick={() => setActivePanel('none')} className="text-gray-400 hover:text-white text-xl">✕</button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gold-700/20">
        {(['browse', 'learned', 'review'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-2 text-xs transition-colors',
              tab === t
                ? 'text-gold-300 border-b-2 border-gold-500'
                : 'text-gray-400 hover:text-gray-200',
            )}
          >
            {t === 'browse' ? '📚 Explorar' : t === 'learned' ? '✓ Aprendidas' : '🔄 Revisar'}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="p-3 border-b border-gold-700/20 space-y-2">
        <input
          type="text"
          placeholder="Buscar hanzi, pinyin ou tradução..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-ink-800 border border-gold-700/30 rounded px-3 py-1.5 text-sm text-white
                     placeholder-gray-500 focus:outline-none focus:border-gold-500"
        />
        <div className="flex gap-1">
          {[1,2,3,4].map(h => (
            <button
              key={h}
              onClick={() => setSelectedHsk(h)}
              disabled={h > hskMax}
              className={cn(
                'flex-1 text-xs py-1 rounded transition-colors',
                selectedHsk === h
                  ? 'bg-gold-600 text-white'
                  : h > hskMax
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                    : 'bg-ink-800 text-gray-300 hover:bg-ink-700',
              )}
            >
              HSK{h}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
          <button
            onClick={() => setSelectedCat('all')}
            className={cn('text-[10px] px-2 py-0.5 rounded', selectedCat === 'all' ? 'bg-jade-700 text-white' : 'bg-ink-800 text-gray-400')}
          >
            Todos
          </button>
          {CATEGORIES.map(c => (
            <button
              key={c.key}
              onClick={() => setSelectedCat(c.key)}
              className={cn('text-[10px] px-2 py-0.5 rounded', selectedCat === c.key ? 'bg-jade-700 text-white' : 'bg-ink-800 text-gray-400')}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Word list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {filteredWords.length === 0 ? (
          <p className="text-center text-gray-500 text-sm mt-8">Nenhuma palavra encontrada</p>
        ) : (
          filteredWords.map(w => {
            const prog = progress.get(w.id);
            return (
              <button
                key={w.id}
                onClick={() => setSelectedWord(w)}
                className="w-full text-left bg-ink-800/60 hover:bg-ink-700/80 border border-transparent
                           hover:border-gold-700/30 rounded p-2 transition-all flex items-center gap-2"
              >
                <span className="font-chinese text-2xl text-gold-300 w-10 shrink-0">{w.hanzi}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-jade-300">{w.pinyin}</div>
                  <div className="text-xs text-gray-400 truncate">{w.translation}</div>
                </div>
                {prog?.mastered ? (
                  <span className="text-jade-400 text-xs">✓✓</span>
                ) : prog?.learned ? (
                  <span className="text-blue-400 text-xs">✓</span>
                ) : (
                  <span className="text-gray-600 text-xs">○</span>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Selected word detail */}
      <AnimatePresence>
        {selectedWord && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="absolute inset-x-0 bottom-0 bg-ink-900 border-t border-gold-600/40 p-4 shadow-2xl"
          >
            <VocabularyCard word={selectedWord} />
            <button
              onClick={() => setSelectedWord(null)}
              className="w-full mt-2 py-1 text-xs text-gray-400 hover:text-white"
            >
              ✕ Fechar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
