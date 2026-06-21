// ─── Vocabulary ────────────────────────────────────────────────────────────

export interface VocabWord {
  id: string;
  hanzi: string;
  pinyin: string;
  translation: string;
  hsk: 1 | 2 | 3 | 4;
  category: VocabCategory;
  classifier?: string;
  classifierPinyin?: string;
  example?: { hanzi: string; pinyin: string; translation: string };
  tags?: string[];
}

export type VocabCategory =
  | 'greetings' | 'pronouns' | 'numbers' | 'time' | 'family'
  | 'food' | 'drink' | 'animals' | 'colors' | 'directions'
  | 'verbs' | 'adjectives' | 'particles' | 'question-words'
  | 'transport' | 'places' | 'school' | 'work' | 'health'
  | 'shopping' | 'weather' | 'nature' | 'body' | 'clothing'
  | 'house' | 'emotions' | 'culture' | 'martial-arts'
  | 'philosophy' | 'history' | 'technology' | 'travel' | 'misc';

export interface VocabProgress {
  wordId: string;
  learned: boolean;
  mastered: boolean;
  practiceCount: number;
  lastPracticed: string;
  correctStreak: number;
}

// ─── Player & Character ────────────────────────────────────────────────────

export type Gender = 'male' | 'female' | 'other';
export type HairStyle = 'topknot' | 'flowing' | 'braided' | 'short' | 'shaved';
export type SkinTone = 'light' | 'medium-light' | 'medium' | 'medium-dark' | 'dark';
export type StartingOutfit = 'student' | 'martial' | 'merchant' | 'monk';

export interface CharacterAppearance {
  skinTone: SkinTone;
  hairStyle: HairStyle;
  hairColor: string;
  eyeColor: string;
}

export interface PlayerStats {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  strength: number;
  agility: number;
  wisdom: number;
  charm: number;
  level: number;
  xp: number;
  xpToNext: number;
  gold: number;
}

export interface PlayerCharacter {
  id: string;
  userId: string;
  nickname: string;
  gender: Gender;
  startingOutfit: StartingOutfit;
  appearance: CharacterAppearance;
  stats: PlayerStats;
  hskLevel: 1 | 2 | 3 | 4;
  region: RegionId;
  position: { x: number; y: number };
  inventory: InventoryItem[];
  equipment: Equipment;
  questProgress: Record<string, QuestStatus>;
  achievements: string[];
  loginStreak: number;
  lastLogin: string;
  createdAt: string;
}

// ─── Inventory & Equipment ─────────────────────────────────────────────────

export interface InventoryItem {
  id: string;
  itemId: string;
  quantity: number;
  equipped?: boolean;
}

export interface Equipment {
  head?: string;
  chest?: string;
  legs?: string;
  feet?: string;
  hands?: string;
  weapon?: string;
  offhand?: string;
  accessory?: string;
}

export interface ClothingItem {
  id: string;
  hanzi: string;
  pinyin: string;
  translation: string;
  classifier: string;
  classifierPinyin: string;
  slot: keyof Equipment;
  hsk: 1 | 2 | 3 | 4;
  dynasty?: string;
  description: string;
  stats?: Partial<PlayerStats>;
  price: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
}

// ─── NPCs ──────────────────────────────────────────────────────────────────

export type NPCRole =
  | 'merchant' | 'farmer' | 'monk' | 'master'
  | 'child' | 'artisan' | 'traveler' | 'guard'
  | 'scholar' | 'innkeeper' | 'healer' | 'sifu';

export interface DialogLine {
  speaker: string;
  hanzi: string;
  pinyin: string;
  translation: string;
  vocabularyIds?: string[];
  choices?: DialogChoice[];
  next?: string;
  effect?: DialogEffect;
}

export interface DialogChoice {
  hanzi: string;
  pinyin: string;
  translation: string;
  next: string;
  effect?: DialogEffect;
}

export interface DialogEffect {
  type: 'give-quest' | 'give-item' | 'give-xp' | 'unlock-shop' | 'teach-word';
  value: string | number;
}

export interface RoutineEntry {
  hour: number;
  location: string;
  action: string;
}

export interface NPC {
  id: string;
  name: { hanzi: string; pinyin: string; portuguese: string };
  role: NPCRole;
  region: RegionId;
  position: { x: number; y: number };
  description: string;
  personality: string;
  portrait: string;
  spriteColor: string;
  routine: RoutineEntry[];
  dialogueTree: Record<string, DialogLine[]>;
  questIds: string[];
  shopItems?: string[];
  teachesVocabulary: string[];
}

// ─── Quests ────────────────────────────────────────────────────────────────

export type QuestType = 'main' | 'side' | 'event' | 'daily';
export type QuestStatus = 'not-started' | 'active' | 'completed' | 'failed';

export interface QuestObjective {
  id: string;
  type: 'talk' | 'collect' | 'defeat' | 'reach' | 'learn' | 'craft';
  target: string;
  quantity: number;
  current: number;
  description: string;
}

export interface QuestReward {
  type: 'xp' | 'gold' | 'item' | 'vocabulary' | 'unlock-region';
  value: number | string;
  description: string;
}

export interface Quest {
  id: string;
  title: { hanzi: string; pinyin: string; portuguese: string };
  description: string;
  type: QuestType;
  hskRequired: 1 | 2 | 3 | 4;
  giverNpcId: string;
  region: RegionId;
  objectives: QuestObjective[];
  rewards: QuestReward[];
  vocabularyIds: string[];
  status: QuestStatus;
  prerequisiteQuestIds?: string[];
  // Helpers derived from rewards for UI convenience
  xpReward?: number;
  goldReward?: number;
}

// ─── World & Regions ───────────────────────────────────────────────────────

export type RegionId =
  | 'bambu-village'
  | 'silk-market'
  | 'lantern-valley'
  | 'golden-cloud-monastery'
  | 'celestial-dragon-mountains'
  | 'jade-imperial-city';

export interface Region {
  id: RegionId;
  name: { hanzi: string; pinyin: string; portuguese: string };
  description: string;
  hskRequired: 1 | 2 | 3 | 4;
  theme: string;
  bgColor: string;
  accentColor: string;
  mapPosition: { x: number; y: number };
  connections: RegionId[];
  npcIds: string[];
  questIds: string[];
  unlocked: boolean;
}

// ─── Weather ───────────────────────────────────────────────────────────────

export type WeatherType =
  | 'sunny' | 'rainy' | 'foggy' | 'stormy'
  | 'snowy' | 'cold' | 'spring' | 'autumn' | 'windy';

export interface Weather {
  type: WeatherType;
  hanzi: string;
  pinyin: string;
  translation: string;
  description: string;
  vocabularyIds: string[];
  effects: {
    npcMood?: string;
    specialQuests?: boolean;
    movementSpeed?: number;
    moodColor?: string;
  };
}

// ─── Calendar ──────────────────────────────────────────────────────────────

export interface ChineseDate {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  dayOfWeek: number;
  lunarMonth?: string;
  lunarDay?: string;
  festival?: string;
}

// ─── Combat ────────────────────────────────────────────────────────────────

export type CombatStyle = 'choy-lay-fut' | 'shaolin' | 'tai-chi' | 'wing-chun';

export interface CombatMove {
  id: string;
  hanzi: string;
  pinyin: string;
  translation: string;
  type: 'strike' | 'kick' | 'block' | 'dodge' | 'form' | 'special';
  damage?: { min: number; max: number };
  mpCost?: number;
  cooldown?: number;
  vocabularyId: string;
  description: string;
  animation: string;
  unlocksAtHsk: 1 | 2 | 3 | 4;
  style: CombatStyle;
}

export interface Enemy {
  id: string;
  name: { hanzi: string; pinyin: string; portuguese: string };
  description: string;
  hp: number;
  maxHp: number;
  strength: number;
  agility: number;
  moves: string[];
  region: RegionId;
  drops: Array<{ itemId: string; chance: number }>;
  xpReward: number;
  goldReward: number;
  spriteColor: string;
  vocabularyTeaches?: string[];
}

// ─── Game State ────────────────────────────────────────────────────────────

export type GamePhase = 'loading' | 'menu' | 'create-character' | 'playing' | 'combat' | 'dialogue' | 'shop' | 'inventory';
export type ActivePanel = 'none' | 'quest-log' | 'vocabulary' | 'inventory' | 'map' | 'achievements' | 'sifu' | 'calendar';

export interface GameState {
  phase: GamePhase;
  activePanel: ActivePanel;
  currentRegion: RegionId;
  weather: WeatherType;
  chineseDate: ChineseDate;
  activeDialogue: NPC | null;
  activeDialogueNode: string;
  activeCombatEnemyId: string | null;
  notification: Notification | null;
  showVocabCard: VocabWord | null;
  guestMode: boolean;
}

export interface Notification {
  id: string;
  type?: 'success' | 'info' | 'warning' | 'achievement' | 'vocabulary';
  title: string;
  message: string;
  hanzi?: string;
  pinyin?: string;
  duration?: number;
}

// ─── Achievement ───────────────────────────────────────────────────────────

export interface Achievement {
  id: string;
  hanzi: string;
  pinyin: string;
  title: string;
  description: string;
  icon: string;
  condition: { type: string; value: number | string };
  xpReward: number;
  rarity: 'bronze' | 'silver' | 'gold' | 'jade';
}

// ─── Supabase DB types ─────────────────────────────────────────────────────

export interface DbProfile {
  id: string;
  email: string;
  character_data: PlayerCharacter | null;
  vocab_progress: VocabProgress[];
  quest_progress: Record<string, QuestStatus>;
  settings: UserSettings;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  accessibility: {
    dyslexiaMode: boolean;
    largeFont: boolean;
    highContrast: boolean;
    screenReader: boolean;
  };
  audio: {
    sfxVolume: number;
    musicVolume: number;
    voiceVolume: number;
    autoPlayPronunciation: boolean;
  };
  language: {
    showPinyin: boolean;
    showTranslation: boolean;
    uiLanguage: 'pt-BR' | 'en';
  };
}
