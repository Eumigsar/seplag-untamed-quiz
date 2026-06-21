import type { NPC } from '@/types';

export const NPCS: NPC[] = [
  // ─── Sifu Lóng Yún (Master) ───────────────────────────────────────────────
  {
    id: 'sifu-long-yun',
    name: { hanzi: '龙云大师', pinyin: 'Lóng Yún Dàshī', portuguese: 'Mestre Lóng Yún' },
    role: 'sifu',
    region: 'bambu-village',
    position: { x: 300, y: 250 },
    description: 'O Mestre Lóng Yún é um veterano de 60 anos de Choy Lay Fut. Seus olhos revelam décadas de sabedoria e humor refinado.',
    personality: 'Sábio, paciente, levemente irônico. Usa histórias e provérbios para ensinar.',
    portrait: 'sifu',
    spriteColor: '#8B4513',
    routine: [
      { hour: 5,  location: 'bambu-village:training-ground', action: '晨练 (chén liàn) - Treino matinal' },
      { hour: 8,  location: 'bambu-village:teahouse',        action: '喝茶 (hē chá) - Beber chá' },
      { hour: 12, location: 'bambu-village:pavilion',        action: '打坐 (dǎ zuò) - Meditação' },
      { hour: 15, location: 'bambu-village:training-ground', action: '教学 (jiāoxué) - Ensinar' },
      { hour: 20, location: 'bambu-village:pavilion',        action: '观星 (guān xīng) - Observar as estrelas' },
    ],
    dialogueTree: {
      start: [
        {
          speaker: '龙云大师',
          hanzi: '哦？又来了一位有缘人。',
          pinyin: 'Ó? Yòu lái le yī wèi yǒuyuánrén.',
          translation: 'Oh? Chegou mais uma pessoa com destino especial.',
          vocabularyIds: ['h2_083'],
          next: 'greeting_response',
        },
        {
          speaker: '龙云大师',
          hanzi: '我叫龙云，是这里的武术师父。你叫什么名字？',
          pinyin: 'Wǒ jiào Lóng Yún, shì zhèlǐ de wǔshù shīfu. Nǐ jiào shénme míngzi?',
          translation: 'Meu nome é Lóng Yún, sou o mestre de artes marciais deste lugar. Qual é o seu nome?',
          vocabularyIds: ['h1_021', 'h1_135'],
          choices: [
            {
              hanzi: '我来学功夫！',
              pinyin: 'Wǒ lái xué gōngfu!',
              translation: 'Vim aprender kung fu!',
              next: 'start_training',
            },
            {
              hanzi: '我想了解中国文化。',
              pinyin: 'Wǒ xiǎng liǎojiě Zhōngguó wénhuà.',
              translation: 'Quero aprender sobre a cultura chinesa.',
              next: 'culture_path',
            },
          ],
        },
      ],
      start_training: [
        {
          speaker: '龙云大师',
          hanzi: '好！学功夫需要耐心和坚持。',
          pinyin: 'Hǎo! Xué gōngfu xūyào nàixīn hé jiānchí.',
          translation: 'Ótimo! Aprender kung fu requer paciência e persistência.',
          vocabularyIds: ['h3_006', 'h2_103'],
          next: 'first_lesson',
        },
        {
          speaker: '龙云大师',
          hanzi: '先从基本功开始。记住：练功夫，练的是心，不是手。',
          pinyin: 'Xiān cóng jīběngōng kāishǐ. Jì zhù: liàn gōngfu, liàn de shì xīn, bù shì shǒu.',
          translation: 'Começamos pelos fundamentos. Lembre-se: treinar kung fu é treinar a mente, não as mãos.',
          vocabularyIds: ['h3_036', 'h3_088'],
          next: undefined,
          effect: { type: 'give-quest', value: 'q001' },
        },
      ],
      culture_path: [
        {
          speaker: '龙云大师',
          hanzi: '中国文化博大精深。学语言是了解文化的最好方式。',
          pinyin: 'Zhōngguó wénhuà bódà jīngshēn. Xué yǔyán shì liǎojiě wénhuà de zuì hǎo fāngshì.',
          translation: 'A cultura chinesa é vasta e profunda. Aprender a língua é a melhor forma de compreendê-la.',
          vocabularyIds: ['h4_096', 'h3_001'],
          next: undefined,
          effect: { type: 'give-quest', value: 'q002' },
        },
      ],
      daily_wisdom: [
        {
          speaker: '龙云大师',
          hanzi: '今日一学：天行健，君子以自强不息。',
          pinyin: 'Jīnrì yī xué: Tiān xíng jiàn, jūnzǐ yǐ zìqiáng bùxī.',
          translation: 'Lição de hoje: O céu está em constante movimento; o homem nobre não para de se aperfeiçoar.',
          vocabularyIds: ['h4_023', 'h3_020'],
          next: undefined,
        },
      ],
    },
    questIds: ['q001', 'q002', 'q010'],
    teachesVocabulary: ['h3_036', 'h3_006', 'h3_088', 'h3_031', 'h3_035', 'h4_096'],
  },

  // ─── Merchant Wei (Silk Market) ───────────────────────────────────────────
  {
    id: 'merchant-wei',
    name: { hanzi: '魏商人', pinyin: 'Wèi Shāngrén', portuguese: 'Mercador Wei' },
    role: 'merchant',
    region: 'silk-market',
    position: { x: 200, y: 300 },
    description: 'O Mercador Wei vende as mais finas sedas e roupas tradicionais. Conhece todas as medidas de comprimento e tecidos.',
    personality: 'Entusiasmado, negociador hábil, apaixonado por tecidos.',
    portrait: 'merchant',
    spriteColor: '#8B6914',
    routine: [
      { hour: 7,  location: 'silk-market:main-stall', action: '开店 (kāi diàn) - Abrir loja' },
      { hour: 12, location: 'silk-market:teahouse',   action: '吃午饭 (chī wǔfàn) - Almoçar' },
      { hour: 19, location: 'silk-market:main-stall', action: '关店 (guān diàn) - Fechar loja' },
    ],
    dialogueTree: {
      start: [
        {
          speaker: '魏商人',
          hanzi: '欢迎光临！我们这里有最好的丝绸！',
          pinyin: 'Huānyíng guānglín! Wǒmen zhèlǐ yǒu zuì hǎo de sīchóu!',
          translation: 'Bem-vindo! Temos as melhores sedas aqui!',
          vocabularyIds: ['h3_112'],
          next: 'shop_menu',
        },
        {
          speaker: '魏商人',
          hanzi: '你想买什么？帽子？裤子？还是一件漂亮的汉服？',
          pinyin: 'Nǐ xiǎng mǎi shénme? Màozi? Kùzi? Háishi yī jiàn piàoliang de Hànfú?',
          translation: 'O que você quer comprar? Chapéu? Calça? Ou um lindo Hanfu?',
          vocabularyIds: ['h2_066', 'h2_067', 'h2_069'],
          choices: [
            { hanzi: '我想看看衣服。', pinyin: 'Wǒ xiǎng kànkan yīfu.', translation: 'Quero ver as roupas.', next: 'show_clothes' },
            { hanzi: '这个多少钱？',   pinyin: 'Zhège duōshao qián?',   translation: 'Quanto custa isso?',   next: 'price_talk' },
          ],
        },
      ],
      show_clothes: [
        {
          speaker: '魏商人',
          hanzi: '看！这是汉服，一件八十块。这是旗袍，两百块。',
          pinyin: 'Kàn! Zhè shì Hànfú, yī jiàn bāshí kuài. Zhè shì qípáo, liǎng bǎi kuài.',
          translation: 'Veja! Este é o Hanfu, uma peça por 80 yuan. Este é o Qipao, 200 yuan.',
          vocabularyIds: ['h2_066', 'h1_120'],
          next: undefined,
        },
      ],
      price_talk: [
        {
          speaker: '魏商人',
          hanzi: '价格公道！而且我可以教你布料的中文名字！',
          pinyin: 'Jiàgé gōngdào! Érqiě wǒ kěyǐ jiāo nǐ bùliào de Zhōngwén míngzi!',
          translation: 'Preço justo! E posso te ensinar os nomes dos tecidos em chinês!',
          vocabularyIds: ['h3_118'],
          next: undefined,
          effect: { type: 'give-quest', value: 'q020' },
        },
      ],
    },
    questIds: ['q020', 'q021'],
    shopItems: ['hanfu', 'qipao', 'tangzhuang', 'shaolin-robe', 'conical-hat'],
    teachesVocabulary: ['h2_066', 'h2_067', 'h2_068', 'h2_069', 'h3_112', 'h3_118'],
  },

  // ─── Farmer Liu (Bambu Village) ────────────────────────────────────────────
  {
    id: 'farmer-liu',
    name: { hanzi: '刘农夫', pinyin: 'Liú Nóngfū', portuguese: 'Fazendeiro Liu' },
    role: 'farmer',
    region: 'bambu-village',
    position: { x: 500, y: 350 },
    description: 'O Fazendeiro Liu cultiva arroz e bambú há 40 anos. Sabe tudo sobre o ciclo das estações.',
    personality: 'Simples, direto, generoso. Ama contar piadas sobre o clima.',
    portrait: 'farmer',
    spriteColor: '#4a5568',
    routine: [
      { hour: 5,  location: 'bambu-village:rice-field', action: '务农 (wù nóng) - Trabalhar no campo' },
      { hour: 12, location: 'bambu-village:home',       action: '休息 (xiūxi) - Descansar' },
      { hour: 14, location: 'bambu-village:rice-field', action: '浇水 (jiāo shuǐ) - Irrigar' },
      { hour: 18, location: 'bambu-village:home',       action: '吃晚饭 (chī wǎnfàn) - Jantar' },
    ],
    dialogueTree: {
      start: [
        {
          speaker: '刘农夫',
          hanzi: '你好！今天天气不错，适合干活！',
          pinyin: 'Nǐ hǎo! Jīntiān tiānqì bùcuò, shìhé gànhuó!',
          translation: 'Olá! O tempo está bom hoje, ótimo para trabalhar!',
          vocabularyIds: ['h1_064', 'h1_167'],
          next: 'farm_talk',
        },
      ],
      farm_talk: [
        {
          speaker: '刘农夫',
          hanzi: '我种水稻已经四十年了。稻米，米饭，你分得清吗？',
          pinyin: 'Wǒ zhòng shuǐdào yǐjīng sìshí nián le. Dàomǐ, mǐfàn, nǐ fēn de qīng ma?',
          translation: 'Planto arroz há quarenta anos. Arroz cru e arroz cozido — você sabe a diferença?',
          vocabularyIds: ['h1_138'],
          choices: [
            { hanzi: '我知道！', pinyin: 'Wǒ zhīdào!', translation: 'Eu sei!', next: 'knows' },
            { hanzi: '请告诉我。', pinyin: 'Qǐng gàosu wǒ.', translation: 'Por favor, me diga.', next: 'teach_rice' },
          ],
        },
      ],
      teach_rice: [
        {
          speaker: '刘农夫',
          hanzi: '稻米 (dào mǐ) 是生的，米饭 (mǐfàn) 是煮熟的！很简单！',
          pinyin: 'Dàomǐ shì shēng de, mǐfàn shì zhǔ shú de! Hěn jiǎndān!',
          translation: '稻米 (dào mǐ) é o arroz cru, 米饭 (mǐfàn) é o arroz cozido! Muito simples!',
          vocabularyIds: ['h1_138'],
          next: undefined,
        },
      ],
      knows: [
        {
          speaker: '刘农夫',
          hanzi: '好！你很聪明！',
          pinyin: 'Hǎo! Nǐ hěn cōngming!',
          translation: 'Ótimo! Você é muito inteligente!',
          vocabularyIds: ['h3_094'],
          next: undefined,
        },
      ],
    },
    questIds: ['q005', 'q006'],
    teachesVocabulary: ['h1_138', 'h1_064', 'h1_167'],
  },

  // ─── Monk Kongxin (Golden Cloud Monastery) ────────────────────────────────
  {
    id: 'monk-kongxin',
    name: { hanzi: '空心和尚', pinyin: 'Kōngxīn Héshang', portuguese: 'Monge Kongxin' },
    role: 'monk',
    region: 'golden-cloud-monastery',
    position: { x: 250, y: 200 },
    description: 'O Monge Kongxin pratica meditação Chan há 30 anos. Fala pouco, mas cada palavra é profunda.',
    personality: 'Sereno, contemplativo, levemente misterioso. Faz perguntas em vez de responder.',
    portrait: 'monk',
    spriteColor: '#b7791f',
    routine: [
      { hour: 4,  location: 'golden-cloud-monastery:meditation-hall', action: '早课 (zǎo kè) - Rezas matinais' },
      { hour: 9,  location: 'golden-cloud-monastery:courtyard',       action: '练武 (liàn wǔ) - Praticar artes marciais' },
      { hour: 12, location: 'golden-cloud-monastery:kitchen',         action: '斋饭 (zhāifàn) - Refeição vegetariana' },
      { hour: 15, location: 'golden-cloud-monastery:garden',          action: '禅修 (chán xiū) - Meditação Zen' },
    ],
    dialogueTree: {
      start: [
        {
          speaker: '空心和尚',
          hanzi: '施主，你来这里寻找什么？',
          pinyin: 'Shīzhǔ, nǐ lái zhèlǐ xúnzhǎo shénme?',
          translation: 'Peregrino, o que você veio buscar aqui?',
          vocabularyIds: ['h3_033', 'h3_021'],
          choices: [
            { hanzi: '我来学武功。',  pinyin: 'Wǒ lái xué wǔgōng.',  translation: 'Vim aprender artes marciais.', next: 'martial_path' },
            { hanzi: '我来寻找平静。', pinyin: 'Wǒ lái xúnzhǎo píngjìng.', translation: 'Vim buscar a paz interior.', next: 'zen_path' },
          ],
        },
      ],
      zen_path: [
        {
          speaker: '空心和尚',
          hanzi: '平静在心中，不在外面。坐下来，跟我一起冥想。',
          pinyin: 'Píngjìng zài xīn zhōng, bù zài wàimiàn. Zuò xiàlái, gēn wǒ yīqǐ míngxiǎng.',
          translation: 'A paz está dentro, não fora. Sente-se, vamos meditar juntos.',
          vocabularyIds: ['h3_061', 'h3_033'],
          next: undefined,
          effect: { type: 'give-quest', value: 'q030' },
        },
      ],
      martial_path: [
        {
          speaker: '空心和尚',
          hanzi: '少林功夫以武入禅。先学心，再学拳。',
          pinyin: 'Shàolín gōngfu yǐ wǔ rù chán. Xiān xué xīn, zài xué quán.',
          translation: 'O kung fu Shaolin usa as artes marciais para entrar no Zen. Primeiro aprenda a mente, depois o soco.',
          vocabularyIds: ['h3_033', 'h3_124'],
          next: undefined,
          effect: { type: 'give-quest', value: 'q031' },
        },
      ],
    },
    questIds: ['q030', 'q031'],
    teachesVocabulary: ['h3_033', 'h3_021', 'h3_061', 'h3_031', 'h4_025', 'h4_026'],
  },

  // ─── Little Mei (Child) ────────────────────────────────────────────────────
  {
    id: 'child-mei',
    name: { hanzi: '小梅', pinyin: 'Xiǎo Méi', portuguese: 'Pequena Mei' },
    role: 'child',
    region: 'bambu-village',
    position: { x: 450, y: 200 },
    description: 'Pequena Mei tem 8 anos e é incrivelmente curiosa. Ela ensina brincando.',
    personality: 'Alegre, curiosa, enérgica. Gosta de ensinar números e cores para os viajantes.',
    portrait: 'child',
    spriteColor: '#e91e8c',
    routine: [
      { hour: 7,  location: 'bambu-village:school',    action: '上学 (shàngxué) - Ir à escola' },
      { hour: 15, location: 'bambu-village:playground', action: '玩耍 (wánshuǎ) - Brincar' },
      { hour: 18, location: 'bambu-village:home',       action: '做作业 (zuò zuòyè) - Fazer lição de casa' },
    ],
    dialogueTree: {
      start: [
        {
          speaker: '小梅',
          hanzi: '你好！你会数数吗？我来教你！',
          pinyin: 'Nǐ hǎo! Nǐ huì shǔshù ma? Wǒ lái jiāo nǐ!',
          translation: 'Olá! Você sabe contar? Vou te ensinar!',
          vocabularyIds: ['h1_046', 'h1_047', 'h1_048'],
          next: 'number_game',
        },
      ],
      number_game: [
        {
          speaker: '小梅',
          hanzi: '一、二、三、四、五！跟我说！',
          pinyin: 'Yī, èr, sān, sì, wǔ! Gēn wǒ shuō!',
          translation: 'Um, dois, três, quatro, cinco! Repita comigo!',
          vocabularyIds: ['h1_047', 'h1_048', 'h1_049', 'h1_050', 'h1_051'],
          next: undefined,
          effect: { type: 'teach-word', value: 'h1_047' },
        },
      ],
    },
    questIds: ['q007'],
    teachesVocabulary: ['h1_046', 'h1_047', 'h1_048', 'h1_049', 'h1_050', 'h1_051', 'h1_052'],
  },

  // ─── Scholar Zhang (Jade Imperial City) ──────────────────────────────────
  {
    id: 'scholar-zhang',
    name: { hanzi: '张学士', pinyin: 'Zhāng Xuéshì', portuguese: 'Estudioso Zhang' },
    role: 'scholar',
    region: 'jade-imperial-city',
    position: { x: 350, y: 280 },
    description: 'O Estudioso Zhang passou pelo exame imperial (科举) e conhece toda a história da China.',
    personality: 'Formal, erudito, impressionado com quem conhece história. Cita clássicos confucionistas.',
    portrait: 'scholar',
    spriteColor: '#2563eb',
    routine: [
      { hour: 6,  location: 'jade-imperial-city:library',      action: '读书 (dúshū) - Estudar' },
      { hour: 10, location: 'jade-imperial-city:court',        action: '上朝 (shàng cháo) - Na corte' },
      { hour: 15, location: 'jade-imperial-city:library',      action: '写文章 (xiě wénzhāng) - Escrever' },
      { hour: 20, location: 'jade-imperial-city:teahouse',     action: '饮茶论道 (yǐn chá lùn dào) - Tomar chá e debater o Tao' },
    ],
    dialogueTree: {
      start: [
        {
          speaker: '张学士',
          hanzi: '子曰：学而时习之，不亦说乎？',
          pinyin: 'Zǐ yuē: Xué ér shí xí zhī, bù yì yuè hū?',
          translation: 'O Mestre disse: "Não é agradável aprender e praticar constantemente?"',
          vocabularyIds: ['h4_006', 'h4_009'],
          next: 'confucius_talk',
        },
      ],
      confucius_talk: [
        {
          speaker: '张学士',
          hanzi: '这是孔子的话。儒家思想是中国文化的根基。',
          pinyin: 'Zhè shì Kǒngzǐ de huà. Rújiā sīxiǎng shì Zhōngguó wénhuà de gēnjī.',
          translation: 'Estas são as palavras de Confúcio. O confucionismo é a fundação da cultura chinesa.',
          vocabularyIds: ['h4_006', 'h4_010'],
          next: undefined,
          effect: { type: 'give-quest', value: 'q040' },
        },
      ],
    },
    questIds: ['q040', 'q041', 'q042'],
    teachesVocabulary: ['h4_006', 'h4_007', 'h4_008', 'h4_009', 'h4_010', 'h4_005'],
  },
];

export function getNPCById(id: string): NPC | undefined {
  return NPCS.find(n => n.id === id);
}

export function getNPCsByRegion(regionId: string): NPC[] {
  return NPCS.filter(n => n.region === regionId);
}
