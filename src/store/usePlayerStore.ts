import { create } from 'zustand';
import type { Character } from '@/types/game';

interface PlayerState {
  character: Character | null;
  learnedHanzi: string[];
  setCharacter: (char: Character | null) => void;
  updatePosition: (x: number, y: number) => void;
  addXP: (amount: number) => void;
  addHanzi: (hanzi: string) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  character: null,
  learnedHanzi: [],
  setCharacter: (character) => set({ character }),
  updatePosition: (x, y) => set((state) => ({
    character: state.character ? { ...state.character, position_x: x, position_y: y } : null,
  })),
  addXP: (amount) => set((state) => ({
    character: state.character ? { ...state.character, xp: state.character.xp + amount } : null,
  })),
  addHanzi: (hanzi) => set((state) => ({
    learnedHanzi: state.learnedHanzi.includes(hanzi)
      ? state.learnedHanzi
      : [...state.learnedHanzi, hanzi],
  })),
}));
