import { create } from 'zustand';

export interface Character {
  id: string;
  user_id: string;
  name: string;
  avatar: { skin: string; hair: string };
  level: number;
  xp: number;
  qi: number;
  position_x: number;
  position_y: number;
}

interface PlayerStore {
  character: Character | null;
  learned: string[];
  setCharacter: (c: Character | null) => void;
  addXP: (amount: number) => void;
  learn: (hanzi: string) => void;
  move: (x: number, y: number) => void;
}

export const usePlayer = create<PlayerStore>((set) => ({
  character: null,
  learned: [],
  setCharacter: (character) => set({ character }),
  addXP: (amount) =>
    set((s) => ({
      character: s.character ? { ...s.character, xp: s.character.xp + amount } : null,
    })),
  learn: (hanzi) =>
    set((s) => ({
      learned: s.learned.includes(hanzi) ? s.learned : [...s.learned, hanzi],
    })),
  move: (x, y) =>
    set((s) => ({
      character: s.character ? { ...s.character, position_x: x, position_y: y } : null,
    })),
}));
