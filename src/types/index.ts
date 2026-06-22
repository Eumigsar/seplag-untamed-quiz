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

export interface HanziCard {
  hanzi: string;
  pinyin: string;
  meaning: string;
  mnemonic: string;
}
