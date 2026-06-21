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
      transition={{ type: 'spring', damping: 24, stiffness: 260 }}
      className="fixed right-0 top-0 bottom-0 w-full sm:w-80 z-40 flex flex-col gi-panel-slide-right
                 bg-[rgba(9,13,34,0.97)] border-l border-[rgba(201,168,108,0.25)] shadow-2xl backdrop-blur-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(201,168,108,0.18)]">
        <div>
          <h2 className="font-chinese text-gi-geo text-lg text-shadow-gold">词汇库</h2>
          <p className="text-[11px] text-gi-text-dim">
            {totalLearned} aprendidas · {totalMastered} dominadas
          </p>
        </div>
        <button onClick={() => setActivePanel('none')} className="text-gi-text-dim hover:text-gi-text text-lg transition-colors">✕</button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[rgba(201,168,108,0.12)]">
        {(['browse', 'learned', 'review'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-2 text-xs transition-colors',
              tab === t
                ? 'text-gi-geo border-b-2 border-gi-geo'
                : 'text-gi-text-dim hover:text-gi-text',
            )}
          >
            {t === 'browse' ? '📚 Explorar' : t === 'learned' ? '✓ Aprendidas' : '🔄 Revisar'}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="px-3 py-2 border-b border-[rgba(201,168,108,0.12)] space-y-2">
        <input
          type="text"
          placeholder="Buscar hanzi, pinyin ou tradução..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-[rgba(5,8,20,0.7)] border border-[rgba(201,168,108,0.2)] rounded px-3 py-1.5 text-sm
                     text-gi-text placeholder-[#445060] focus:outline-none focus:border-[rgba(201,168,108,0.55)]
                     transition-colors"
        />
        <div className="flex gap-1">
          {[1,2,3,4].map(h => (
            <button
              key={h}
              onClick={() => setSelectedHsk(h)}
              disabled={h > hskMax}
              className={cn(
                'flex-1 text-xs py-1 rounded transition-colors border',
                selectedHsk === h
                  ? 'bg-[rgba(201,168,108,0.18)] border-[rgba(201,168,108,0.7)] text-gi-geo-light'
                  : h > hskMax
                    ? 'border-[rgba(255,255,255,0.05)] text-[#334] cursor-not-allowed'
                    : 'border-[rgba(201,168,108,0.15)] text-gi-text-dim hover:border-[rgba(201,168,108,0.4)] hover:text-gi-text',
              )}
            >
              HSK{h}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
          <button
            onClick={() => setSelectedCat('all')}
            className={cn(
              'text-[10px] px-2 py-0.5 rounded border transition-colors',
              selectedCat === 'all'
                ? 'bg-[rgba(116,212,168,0.18)] border-[rgba(116,212,168,0.5)] text-gi-anemo'
                : 'border-[rgba(255,255,255,0.06)] text-gi-text-dim hover:text-gi-text',
            )}
          >
            Todos
          </button>
          {CATEGORIES.map(c => (
            <button
              key={c.key}
              onClick={() => setSelectedCat(c.key)}
              className={cn(
                'text-[10px] px-2 py-0.5 rounded border transition-colors',
                selectedCat === c.key
                  ? 'bg-[rgba(116,212,168,0.18)] border-[rgba(116,212,168,0.5)] text-gi-anemo'
                  : 'border-[rgba(255,255,255,0.06)] text-gi-text-dim hover:text-gi-text',
              )}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Word list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {filteredWords.length === 0 ? (
          <p className="text-center text-gi-text-dim text-sm mt-8">Nenhuma palavra encontrada</p>
        ) : (
          filteredWords.map(w => {
            const prog = progress.get(w.id);
            return (
              <button
                key={w.id}
                onClick={() => setSelectedWord(w)}
                className="w-full text-left gi-panel-inner hover:border-[rgba(201,168,108,0.35)] p-2
                           transition-all flex items-center gap-2"
              >
                <span className="font-chinese text-2xl text-gi-geo w-10 shrink-0">{w.hanzi}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gi-anemo">{w.pinyin}</div>
                  <div className="text-xs text-gi-text-dim truncate">{w.translation}</div>
                </div>
                {prog?.mastered ? (
                  <span className="text-gi-anemo text-xs">✓✓</span>
                ) : prog?.learned ? (
                  <span className="text-blue-400 text-xs">✓</span>
                ) : (
                  <span className="text-[#334] text-xs">○</span>
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
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
            className="absolute inset-x-0 bottom-0 bg-[rgba(9,13,34,0.98)] border-t border-[rgba(201,168,108,0.3)] p-4 shadow-2xl"
          >
            <VocabularyCard word={selectedWord} />
            <button
              onClick={() => setSelectedWord(null)}
              className="w-full mt-2 py-1 text-xs text-gi-text-dim hover:text-gi-text transition-colors"
            >
              ✕ Fechar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
