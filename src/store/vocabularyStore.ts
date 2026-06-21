import { create } from 'zustand';
import type { VocabProgress, VocabWord } from '@/types';
import { ALL_VOCAB } from '@/data/vocabulary';

interface VocabularyStore {
  progress:      Map<string, VocabProgress>;
  reviewQueue:   VocabWord[];
  totalLearned:  number;
  totalMastered: number;

  initProgress:     (saved: VocabProgress[]) => void;
  markSeen:         (wordId: string) => void;
  learnWord:        (wordId: string) => void;
  practiceWord:     (wordId: string, correct: boolean) => void;
  getProgress:      (wordId: string) => VocabProgress | undefined;
  getLearnedIds:    () => string[];
  getMasteredIds:   () => string[];
  buildReviewQueue: (hskMax: 1 | 2 | 3 | 4, limit?: number) => VocabWord[];
  exportProgress:   () => VocabProgress[];
  getWordsByCategory: (category: string, hskMax?: number) => VocabWord[];
  getRandomWords:   (count: number, hskMax?: number) => VocabWord[];
}

const vals = (m: Map<string, VocabProgress>): VocabProgress[] => Array.from(m.values());

export const useVocabularyStore = create<VocabularyStore>((set, get) => ({
  progress:      new Map(),
  reviewQueue:   [],
  totalLearned:  0,
  totalMastered: 0,

  initProgress: (saved) => {
    const map = new Map<string, VocabProgress>();
    for (const p of saved) map.set(p.wordId, p);
    const learned  = vals(map).filter(p => p.learned).length;
    const mastered = vals(map).filter(p => p.mastered).length;
    set({ progress: map, totalLearned: learned, totalMastered: mastered });
  },

  markSeen: (wordId) => {
    const { progress } = get();
    const existing = progress.get(wordId);
    if (existing?.learned) return;
    const updated = new Map(progress);
    updated.set(wordId, {
      wordId,
      learned:       true,
      mastered:      false,
      practiceCount: 1,
      lastPracticed: new Date().toISOString(),
      correctStreak: 0,
    });
    const learned = vals(updated).filter(p => p.learned).length;
    set({ progress: updated, totalLearned: learned });
  },

  learnWord: (wordId) => {
    get().markSeen(wordId);
  },

  practiceWord: (wordId, correct) => {
    const { progress } = get();
    const updated = new Map(progress);
    const existing = updated.get(wordId) ?? {
      wordId,
      learned:       false,
      mastered:      false,
      practiceCount: 0,
      lastPracticed: '',
      correctStreak: 0,
    };
    const streak   = correct ? existing.correctStreak + 1 : 0;
    const mastered = streak >= 5;
    updated.set(wordId, {
      ...existing,
      learned:       true,
      mastered,
      practiceCount: existing.practiceCount + 1,
      lastPracticed: new Date().toISOString(),
      correctStreak: streak,
    });
    const totalLearned  = vals(updated).filter(p => p.learned).length;
    const totalMastered = vals(updated).filter(p => p.mastered).length;
    set({ progress: updated, totalLearned, totalMastered });
  },

  getProgress:    (wordId) => get().progress.get(wordId),
  getLearnedIds:  () => vals(get().progress).filter(p => p.learned).map(p => p.wordId),
  getMasteredIds: () => vals(get().progress).filter(p => p.mastered).map(p => p.wordId),

  buildReviewQueue: (hskMax, limit = 20) => {
    const { progress } = get();
    const candidates  = ALL_VOCAB.filter(w => w.hsk <= hskMax);
    const notMastered = candidates.filter(w => !progress.get(w.id)?.mastered);
    const seen   = notMastered.filter(w => progress.has(w.id));
    const unseen = notMastered.filter(w => !progress.has(w.id));
    const queue  = [...seen, ...unseen].slice(0, limit);
    set({ reviewQueue: queue });
    return queue;
  },

  exportProgress: () => vals(get().progress),

  getWordsByCategory: (category, hskMax = 4) =>
    ALL_VOCAB.filter(w => w.category === category && w.hsk <= hskMax),

  getRandomWords: (count, hskMax = 4) => {
    const pool = ALL_VOCAB.filter(w => w.hsk <= hskMax);
    return [...pool].sort(() => Math.random() - 0.5).slice(0, count);
  },
}));
