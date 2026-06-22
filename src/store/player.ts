import { create } from 'zustand';
import type { Character } from '@/types';

interface PlayerStore {
  character: Character | null;
  learned: string[];
  setCharacter: (c: Character | null) => void;
  addXP: (n: number) => void;
  learn: (h: string) => void;
  move: (x: number, y: number) => void;
}

export const usePlayer = create<PlayerStore>((set) => ({
  character: null,
  learned: [],
  setCharacter: (character) => set({ character }),
  addXP: (n) => set((s) => ({
    character: s.character ? { ...s.character, xp: s.character.xp + n } : null,
  })),
  learn: (h) => set((s) => ({
    learned: s.learned.includes(h) ? s.learned : [...s.learned, h],
  })),
  move: (x, y) => set((s) => ({
    character: s.character ? { ...s.character, position_x: x, position_y: y } : null,
  })),
}));
