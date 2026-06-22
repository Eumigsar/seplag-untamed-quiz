export interface Character {
  id: string;
  user_id: string;
  name: string;
  avatar_data: {
    skin: string;
    hair: string;
    outfit: string;
    eyes: string;
    mascot: string;
  };
  level: number;
  xp: number;
  qi: number;
  position_x: number;
  position_y: number;
  region_id: string;
}

export interface HanziData {
  hanzi: string;
  pinyin: string;
  translation: string;
  example: string;
}

export interface AppState {
  isLoading: boolean;
  session: unknown | null;
  character: Character | null;
}
