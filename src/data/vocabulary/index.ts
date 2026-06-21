import type { VocabWord } from '@/types';
import { HSK1 } from './hsk1';
import { HSK2 } from './hsk2';
import { HSK3 } from './hsk3';
import { HSK4 } from './hsk4';

export { HSK1, HSK2, HSK3, HSK4 };

export const ALL_VOCAB: VocabWord[] = [...HSK1, ...HSK2, ...HSK3, ...HSK4];

export const VOCAB_BY_HSK: Record<number, VocabWord[]> = {
  1: HSK1,
  2: HSK2,
  3: HSK3,
  4: HSK4,
};

export function getVocabById(id: string): VocabWord | undefined {
  return ALL_VOCAB.find(w => w.id === id);
}

export function getVocabByCategory(category: string): VocabWord[] {
  return ALL_VOCAB.filter(w => w.category === category);
}

export function getVocabByHSK(hsk: number): VocabWord[] {
  return ALL_VOCAB.filter(w => w.hsk === hsk);
}

export function getVocabUpToHSK(hskMax: number): VocabWord[] {
  return ALL_VOCAB.filter(w => w.hsk <= hskMax);
}

export const VOCAB_STATS = {
  total:  ALL_VOCAB.length,
  hsk1:   HSK1.length,
  hsk2:   HSK2.length,
  hsk3:   HSK3.length,
  hsk4:   HSK4.length,
};
