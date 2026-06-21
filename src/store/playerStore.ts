import { create } from 'zustand';
import type {
  PlayerCharacter, PlayerStats, InventoryItem, Equipment,
  CharacterAppearance, RegionId, Achievement, Gender, StartingOutfit
} from '@/types';
import { xpForLevel, clamp } from '@/lib/utils';
import { ACHIEVEMENTS } from '@/data/achievements';

interface CreateCharacterParams {
  nickname: string;
  gender: Gender;
  appearance: CharacterAppearance;
  startingOutfit: StartingOutfit;
}

interface PlayerStore {
  character:   PlayerCharacter | null;
  isLoading:   boolean;

  hydrate:        () => void;
  createCharacter: (params: CreateCharacterParams) => void;
  setCharacter:   (c: PlayerCharacter) => void;
  clearCharacter: () => void;
  setLoading:     (v: boolean) => void;

  gainXP:       (amount: number) => PlayerCharacter | null;
  gainGold:     (amount: number) => void;
  loseGold:     (amount: number) => boolean;
  takeDamage:   (amount: number) => boolean;
  heal:         (amount: number) => void;
  useMp:        (amount: number) => boolean;
  restoreMp:    (amount: number) => void;

  addItem:      (itemId: string, qty?: number) => void;
  removeItem:   (itemId: string, qty?: number) => boolean;
  equipItem:    (itemId: string, slot?: keyof Equipment) => void;
  unequipSlot:  (slot: keyof Equipment) => void;

  moveTo:       (x: number, y: number) => void;
  travelTo:     (region: RegionId) => void;

  updateAppearance: (a: Partial<CharacterAppearance>) => void;
  checkAchievements: () => Achievement[];

  incrementLoginStreak: () => void;
  updateLastLogin:      () => void;
}

const DEFAULT_STATS: PlayerStats = {
  hp: 100, maxHp: 100,
  mp: 50,  maxMp: 50,
  strength: 10, agility: 10, wisdom: 10, charm: 10,
  level: 1, xp: 0, xpToNext: 100, gold: 50,
};

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  character: null,
  isLoading: false,

  hydrate: () => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('seplag_character');
      if (raw) {
        const c = JSON.parse(raw) as PlayerCharacter;
        if (c?.id) set({ character: c });
      }
    } catch { /* ignore malformed data */ }
  },

  createCharacter: ({ nickname, gender, appearance, startingOutfit }) => {
    const character: PlayerCharacter = {
      id: `player_${Date.now()}`,
      userId: 'guest',
      nickname,
      gender,
      startingOutfit,
      appearance,
      stats: { ...DEFAULT_STATS },
      hskLevel: 1,
      region: 'bambu-village',
      position: { x: 400, y: 300 },
      inventory: [],
      equipment: {},
      questProgress: {},
      achievements: [],
      loginStreak: 1,
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    set({ character });
    if (typeof window !== 'undefined') {
      localStorage.setItem('seplag_character', JSON.stringify(character));
    }
  },

  setCharacter:   (c) => set({ character: c }),
  clearCharacter: () => set({ character: null }),
  setLoading:     (v) => set({ isLoading: v }),

  gainXP: (amount) => {
    const { character } = get();
    if (!character) return null;
    let { xp, xpToNext, level } = character.stats;
    xp += amount;
    let leveledUp = false;
    while (xp >= xpToNext) {
      xp -= xpToNext;
      level += 1;
      xpToNext = xpForLevel(level + 1);
      leveledUp = true;
    }
    const updated = {
      ...character,
      stats: {
        ...character.stats,
        xp, xpToNext, level,
        maxHp:  leveledUp ? character.stats.maxHp + 10 : character.stats.maxHp,
        maxMp:  leveledUp ? character.stats.maxMp + 5  : character.stats.maxMp,
        hp:     leveledUp ? character.stats.maxHp + 10 : character.stats.hp,
      },
    };
    set({ character: updated });
    return updated;
  },

  gainGold: (amount) => {
    const { character } = get();
    if (!character) return;
    set({ character: { ...character, stats: { ...character.stats, gold: character.stats.gold + amount } } });
  },

  loseGold: (amount) => {
    const { character } = get();
    if (!character || character.stats.gold < amount) return false;
    set({ character: { ...character, stats: { ...character.stats, gold: character.stats.gold - amount } } });
    return true;
  },

  takeDamage: (amount) => {
    const { character } = get();
    if (!character) return false;
    const hp = clamp(character.stats.hp - amount, 0, character.stats.maxHp);
    set({ character: { ...character, stats: { ...character.stats, hp } } });
    return hp === 0;
  },

  heal: (amount) => {
    const { character } = get();
    if (!character) return;
    const hp = clamp(character.stats.hp + amount, 0, character.stats.maxHp);
    set({ character: { ...character, stats: { ...character.stats, hp } } });
  },

  useMp: (amount) => {
    const { character } = get();
    if (!character || character.stats.mp < amount) return false;
    const mp = character.stats.mp - amount;
    set({ character: { ...character, stats: { ...character.stats, mp } } });
    return true;
  },

  restoreMp: (amount) => {
    const { character } = get();
    if (!character) return;
    const mp = clamp(character.stats.mp + amount, 0, character.stats.maxMp);
    set({ character: { ...character, stats: { ...character.stats, mp } } });
  },

  addItem: (itemId, qty = 1) => {
    const { character } = get();
    if (!character) return;
    const inv = [...character.inventory];
    const existing = inv.find(i => i.itemId === itemId);
    if (existing) {
      existing.quantity += qty;
    } else {
      inv.push({ id: `${itemId}_${Date.now()}`, itemId, quantity: qty });
    }
    set({ character: { ...character, inventory: inv } });
  },

  removeItem: (itemId, qty = 1) => {
    const { character } = get();
    if (!character) return false;
    const inv = [...character.inventory];
    const idx = inv.findIndex(i => i.itemId === itemId);
    if (idx === -1 || inv[idx].quantity < qty) return false;
    inv[idx].quantity -= qty;
    if (inv[idx].quantity === 0) inv.splice(idx, 1);
    set({ character: { ...character, inventory: inv } });
    return true;
  },

  equipItem: (itemId, slot = 'weapon') => {
    const { character } = get();
    if (!character) return;
    set({ character: { ...character, equipment: { ...character.equipment, [slot]: itemId } } });
  },

  unequipSlot: (slot) => {
    const { character } = get();
    if (!character) return;
    const eq = { ...character.equipment };
    delete eq[slot];
    set({ character: { ...character, equipment: eq } });
  },

  moveTo: (x, y) => {
    const { character } = get();
    if (!character) return;
    set({ character: { ...character, position: { x, y } } });
  },

  travelTo: (region) => {
    const { character } = get();
    if (!character) return;
    set({ character: { ...character, region, position: { x: 400, y: 300 } } });
  },

  updateAppearance: (a) => {
    const { character } = get();
    if (!character) return;
    set({ character: { ...character, appearance: { ...character.appearance, ...a } } });
  },

  checkAchievements: () => {
    const { character } = get();
    if (!character) return [];
    const unlocked: Achievement[] = [];
    for (const ach of ACHIEVEMENTS) {
      if (character.achievements.includes(ach.id)) continue;
      const { type, value } = ach.condition;
      let earned = false;
      if (type === 'level'       && character.stats.level >= Number(value)) earned = true;
      if (type === 'gold'        && character.stats.gold  >= Number(value)) earned = true;
      if (type === 'login-streak' && character.loginStreak >= Number(value)) earned = true;
      if (earned) {
        character.achievements.push(ach.id);
        unlocked.push(ach);
      }
    }
    if (unlocked.length) set({ character: { ...character } });
    return unlocked;
  },

  incrementLoginStreak: () => {
    const { character } = get();
    if (!character) return;
    const last = new Date(character.lastLogin);
    const now  = new Date();
    const diff  = Math.floor((now.getTime() - last.getTime()) / 86_400_000);
    const streak = diff === 1 ? character.loginStreak + 1 : diff === 0 ? character.loginStreak : 1;
    set({ character: { ...character, loginStreak: streak, lastLogin: now.toISOString() } });
  },

  updateLastLogin: () => {
    const { character } = get();
    if (!character) return;
    set({ character: { ...character, lastLogin: new Date().toISOString() } });
  },
}));
