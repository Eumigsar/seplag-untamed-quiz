import type { Quest } from '@/types';

export const QUESTS: Quest[] = [
  // ─── MAIN QUESTS ──────────────────────────────────────────────────────────
  {
    id: 'q001',
    title: { hanzi: '初学乍练', pinyin: 'Chū xué zhà liàn', portuguese: 'O Primeiro Treino' },
    description: 'O Mestre Lóng Yún quer avaliar seu potencial. Treine com ele na área de prática.',
    type: 'main',
    hskRequired: 1,
    giverNpcId: 'sifu-long-yun',
    region: 'bambu-village',
    objectives: [
      { id: 'q001_1', type: 'talk',   target: 'sifu-long-yun', quantity: 1, current: 0, description: 'Fale com o Mestre Lóng Yún (龙云大师)' },
      { id: 'q001_2', type: 'learn',  target: 'h1_031',        quantity: 1, current: 0, description: 'Aprenda a palavra 吃 (chī) — Comer' },
      { id: 'q001_3', type: 'learn',  target: 'h2_016',        quantity: 1, current: 0, description: 'Aprenda a palavra 跑 (pǎo) — Correr' },
    ],
    rewards: [
      { type: 'xp',   value: 100, description: '100 pontos de experiência' },
      { type: 'gold', value: 20,  description: '20 金 (jīn)' },
      { type: 'item', value: 'training-robe', description: 'Roupa de treino básica' },
    ],
    vocabularyIds: ['h1_030', 'h1_031', 'h2_016', 'h2_020'],
    status: 'not-started',
  },
  {
    id: 'q002',
    title: { hanzi: '文化之旅', pinyin: 'Wénhuà zhī lǚ', portuguese: 'Jornada Cultural' },
    description: 'Explore a Vila do Bambu Eterno e aprenda sobre a vida cotidiana chinesa.',
    type: 'main',
    hskRequired: 1,
    giverNpcId: 'sifu-long-yun',
    region: 'bambu-village',
    objectives: [
      { id: 'q002_1', type: 'talk',  target: 'farmer-liu', quantity: 1, current: 0, description: 'Fale com o Fazendeiro Liu (刘农夫)' },
      { id: 'q002_2', type: 'talk',  target: 'child-mei',  quantity: 1, current: 0, description: 'Fale com a Pequena Mei (小梅)' },
      { id: 'q002_3', type: 'reach', target: 'bambu-village:teahouse', quantity: 1, current: 0, description: 'Visite a casa de chá (茶馆 chaguǎn)' },
    ],
    rewards: [
      { type: 'xp',        value: 150, description: '150 pontos de experiência' },
      { type: 'gold',      value: 30,  description: '30 金 (jīn)' },
      { type: 'vocabulary', value: 'h1_137', description: 'Aprende: 茶 (chá) — Chá' },
    ],
    vocabularyIds: ['h1_137', 'h1_064', 'h1_133'],
    status: 'not-started',
    prerequisiteQuestIds: ['q001'],
  },
  {
    id: 'q005',
    title: { hanzi: '丰收时节', pinyin: 'Fēngshōu shíjié', portuguese: 'Época da Colheita' },
    description: 'O Fazendeiro Liu precisa de ajuda para identificar o arroz pronto para colher.',
    type: 'side',
    hskRequired: 1,
    giverNpcId: 'farmer-liu',
    region: 'bambu-village',
    objectives: [
      { id: 'q005_1', type: 'learn',  target: 'h1_138', quantity: 1, current: 0, description: 'Aprenda 米饭 (mǐfàn) — Arroz cozido' },
      { id: 'q005_2', type: 'collect', target: 'rice-bundle', quantity: 5, current: 0, description: 'Colete 5 feixes de arroz no campo (稻田 dàotián)' },
    ],
    rewards: [
      { type: 'xp',   value: 80,  description: '80 pontos de experiência' },
      { type: 'gold', value: 25,  description: '25 金 (jīn)' },
      { type: 'item', value: 'rice-bundle', description: 'Feixe de arroz (pode ser vendido)' },
    ],
    vocabularyIds: ['h1_138', 'h1_032', 'h2_043'],
    status: 'not-started',
  },
  {
    id: 'q006',
    title: { hanzi: '四季歌', pinyin: 'Sìjì gē', portuguese: 'Canção das Quatro Estações' },
    description: 'O Fazendeiro Liu quer que você aprenda os nomes das estações para entender o ciclo agrícola.',
    type: 'side',
    hskRequired: 2,
    giverNpcId: 'farmer-liu',
    region: 'bambu-village',
    objectives: [
      { id: 'q006_1', type: 'learn', target: 'h2_056', quantity: 1, current: 0, description: 'Aprenda 春天 (chūntiān) — Primavera' },
      { id: 'q006_2', type: 'learn', target: 'h2_057', quantity: 1, current: 0, description: 'Aprenda 夏天 (xiàtiān) — Verão' },
      { id: 'q006_3', type: 'learn', target: 'h2_058', quantity: 1, current: 0, description: 'Aprenda 秋天 (qiūtiān) — Outono' },
      { id: 'q006_4', type: 'learn', target: 'h2_059', quantity: 1, current: 0, description: 'Aprenda 冬天 (dōngtiān) — Inverno' },
    ],
    rewards: [
      { type: 'xp',        value: 120, description: '120 pontos de experiência' },
      { type: 'vocabulary', value: 'h2_056', description: 'Domina o vocabulário das estações' },
    ],
    vocabularyIds: ['h2_056', 'h2_057', 'h2_058', 'h2_059'],
    status: 'not-started',
    prerequisiteQuestIds: ['q005'],
  },
  {
    id: 'q007',
    title: { hanzi: '数数游戏', pinyin: 'Shǔshù yóuxì', portuguese: 'Jogo de Contar' },
    description: 'A Pequena Mei desafia você a aprender os números em Mandarim.',
    type: 'side',
    hskRequired: 1,
    giverNpcId: 'child-mei',
    region: 'bambu-village',
    objectives: [
      { id: 'q007_1', type: 'learn', target: 'h1_047', quantity: 1, current: 0, description: 'Aprenda 一 (yī) — Um' },
      { id: 'q007_2', type: 'learn', target: 'h1_048', quantity: 1, current: 0, description: 'Aprenda 二 (èr) — Dois' },
      { id: 'q007_3', type: 'learn', target: 'h1_049', quantity: 1, current: 0, description: 'Aprenda 三 (sān) — Três' },
      { id: 'q007_4', type: 'learn', target: 'h1_050', quantity: 1, current: 0, description: 'Aprenda 四 (sì) — Quatro' },
      { id: 'q007_5', type: 'learn', target: 'h1_051', quantity: 1, current: 0, description: 'Aprenda 五 (wǔ) — Cinco' },
      { id: 'q007_6', type: 'learn', target: 'h1_052', quantity: 1, current: 0, description: 'Aprenda 六 (liù) — Seis' },
      { id: 'q007_7', type: 'learn', target: 'h1_053', quantity: 1, current: 0, description: 'Aprenda 七 (qī) — Sete' },
      { id: 'q007_8', type: 'learn', target: 'h1_054', quantity: 1, current: 0, description: 'Aprenda 八 (bā) — Oito' },
      { id: 'q007_9', type: 'learn', target: 'h1_055', quantity: 1, current: 0, description: 'Aprenda 九 (jiǔ) — Nove' },
      { id: 'q007_10', type: 'learn', target: 'h1_056', quantity: 1, current: 0, description: 'Aprenda 十 (shí) — Dez' },
    ],
    rewards: [
      { type: 'xp',   value: 100, description: '100 pontos de experiência' },
      { type: 'gold', value: 15,  description: '15 金 (jīn)' },
      { type: 'item', value: 'lucky-charm', description: 'Amuleto da sorte 吉祥物 (jíxiángwù)' },
    ],
    vocabularyIds: ['h1_047','h1_048','h1_049','h1_050','h1_051','h1_052','h1_053','h1_054','h1_055','h1_056'],
    status: 'not-started',
  },
  {
    id: 'q010',
    title: { hanzi: '第一拳', pinyin: 'Dì yī quán', portuguese: 'O Primeiro Soco' },
    description: 'O Mestre Lóng Yún ensina os movimentos básicos do Choy Lay Fut.',
    type: 'main',
    hskRequired: 2,
    giverNpcId: 'sifu-long-yun',
    region: 'bambu-village',
    objectives: [
      { id: 'q010_1', type: 'learn',  target: 'h3_036', quantity: 1, current: 0, description: 'Aprenda 师父 (shīfu) — Mestre' },
      { id: 'q010_2', type: 'learn',  target: 'h3_037', quantity: 1, current: 0, description: 'Aprenda 弟子 (dìzi) — Discípulo' },
      { id: 'q010_3', type: 'defeat', target: 'training-dummy', quantity: 3, current: 0, description: 'Pratique 3 vezes no boneco de treino' },
    ],
    rewards: [
      { type: 'xp',   value: 200, description: '200 pontos de experiência' },
      { type: 'gold', value: 50,  description: '50 金 (jīn)' },
      { type: 'item', value: 'wooden-sword', description: 'Espada de madeira 木剑 (mùjiàn)' },
    ],
    vocabularyIds: ['h3_036', 'h3_037', 'h2_078', 'h2_079'],
    status: 'not-started',
    prerequisiteQuestIds: ['q002'],
  },
  {
    id: 'q020',
    title: { hanzi: '百绸之路', pinyin: 'Bǎi Chóu Zhī Lù', portuguese: 'O Caminho das Cem Sedas' },
    description: 'O Mercador Wei quer que você aprenda os nomes das roupas tradicionais chinesas.',
    type: 'main',
    hskRequired: 2,
    giverNpcId: 'merchant-wei',
    region: 'silk-market',
    objectives: [
      { id: 'q020_1', type: 'learn', target: 'h2_066', quantity: 1, current: 0, description: 'Aprenda 衣服 (yīfu) — Roupa' },
      { id: 'q020_2', type: 'learn', target: 'h2_067', quantity: 1, current: 0, description: 'Aprenda 裤子 (kùzi) — Calça' },
      { id: 'q020_3', type: 'learn', target: 'h2_068', quantity: 1, current: 0, description: 'Aprenda 鞋子 (xiézi) — Sapato' },
      { id: 'q020_4', type: 'learn', target: 'h2_069', quantity: 1, current: 0, description: 'Aprenda 帽子 (màozi) — Chapéu' },
      { id: 'q020_5', type: 'collect', target: 'silk-samples', quantity: 3, current: 0, description: 'Colete 3 amostras de tecido diferentes' },
    ],
    rewards: [
      { type: 'xp',   value: 180, description: '180 pontos de experiência' },
      { type: 'gold', value: 40,  description: '40 金 (jīn)' },
      { type: 'item', value: 'hanfu', description: 'Hanfu (汉服) — Roupa Tradicional Han' },
    ],
    vocabularyIds: ['h2_066', 'h2_067', 'h2_068', 'h2_069', 'h3_112'],
    status: 'not-started',
  },
  {
    id: 'q030',
    title: { hanzi: '禅定之道', pinyin: 'Chándìng zhī dào', portuguese: 'O Caminho da Meditação' },
    description: 'Aprenda com o Monge Kongxin a arte da meditação Zen Budista.',
    type: 'main',
    hskRequired: 3,
    giverNpcId: 'monk-kongxin',
    region: 'golden-cloud-monastery',
    objectives: [
      { id: 'q030_1', type: 'learn', target: 'h3_033', quantity: 1, current: 0, description: 'Aprenda 禅 (chán) — Zen' },
      { id: 'q030_2', type: 'learn', target: 'h3_031', quantity: 1, current: 0, description: 'Aprenda 气 (qì) — Qi/Energia vital' },
      { id: 'q030_3', type: 'reach', target: 'golden-cloud-monastery:meditation-cave', quantity: 1, current: 0, description: 'Medite na Caverna da Meditação (禅定洞)' },
    ],
    rewards: [
      { type: 'xp',   value: 300, description: '300 pontos de experiência' },
      { type: 'gold', value: 0,   description: 'O monge não aceita ouro' },
      { type: 'item', value: 'zen-scroll', description: 'Pergaminho Zen — aumenta Sabedoria' },
    ],
    vocabularyIds: ['h3_033', 'h3_031', 'h3_021', 'h3_028', 'h3_035'],
    status: 'not-started',
    prerequisiteQuestIds: ['q010'],
  },
  {
    id: 'q040',
    title: { hanzi: '帝国的智慧', pinyin: 'Dìguó de zhìhuì', portuguese: 'Sabedoria do Império' },
    description: 'O Estudioso Zhang revela os segredos da filosofia e política da China imperial.',
    type: 'main',
    hskRequired: 4,
    giverNpcId: 'scholar-zhang',
    region: 'jade-imperial-city',
    objectives: [
      { id: 'q040_1', type: 'learn', target: 'h4_006', quantity: 1, current: 0, description: 'Aprenda 儒家 (Rújiā) — Confucionismo' },
      { id: 'q040_2', type: 'learn', target: 'h4_007', quantity: 1, current: 0, description: 'Aprenda 道家 (Dàojiā) — Taoísmo' },
      { id: 'q040_3', type: 'learn', target: 'h4_008', quantity: 1, current: 0, description: 'Aprenda 佛教 (Fójiào) — Budismo' },
      { id: 'q040_4', type: 'reach', target: 'jade-imperial-city:imperial-library', quantity: 1, current: 0, description: 'Visite a Biblioteca Imperial' },
    ],
    rewards: [
      { type: 'xp',         value: 500, description: '500 pontos de experiência' },
      { type: 'gold',       value: 100, description: '100 金 (jīn)' },
      { type: 'unlock-region', value: 'jade-imperial-city', description: 'Título: 贤者 (Xiánzhě) — Sábio' },
    ],
    vocabularyIds: ['h4_006', 'h4_007', 'h4_008', 'h4_009', 'h4_010'],
    status: 'not-started',
    prerequisiteQuestIds: ['q030'],
  },
];

export function getQuestById(id: string): Quest | undefined {
  return QUESTS.find(q => q.id === id);
}

export function getQuestsByRegion(regionId: string): Quest[] {
  return QUESTS.filter(q => q.region === regionId);
}

export function getAvailableQuests(completedIds: string[], hskLevel: number): Quest[] {
  return QUESTS.filter(q => {
    if (q.hskRequired > hskLevel) return false;
    if (q.prerequisiteQuestIds) {
      for (const preId of q.prerequisiteQuestIds) {
        if (!completedIds.includes(preId)) return false;
      }
    }
    return q.status === 'not-started' || q.status === 'active';
  });
}
