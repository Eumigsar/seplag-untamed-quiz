import { create } from 'zustand';
import type {
  GameState, GamePhase, ActivePanel, RegionId,
  WeatherType, ChineseDate, Notification, VocabWord, NPC
} from '@/types';
import { getChineseDate, weightedRandom } from '@/lib/utils';

interface GameStore extends GameState {
  setPhase:          (phase: GamePhase) => void;
  setActivePanel:    (panel: ActivePanel) => void;
  setCurrentRegion:  (region: RegionId) => void;
  setWeather:        (type: WeatherType) => void;
  generateWeather:   () => void;
  setChineseDate:    (date: ChineseDate) => void;
  tickTime:          () => void;
  openDialogue:      (npc: NPC, node?: string) => void;
  closeDialogue:     () => void;
  startCombat:       (enemyId: string) => void;
  endCombat:         () => void;
  showNotification:  (n: Omit<Notification, 'id'>) => void;
  clearNotification: () => void;
  showVocab:         (word: VocabWord) => void;
  hideVocab:         () => void;
  setGuestMode:      (v: boolean) => void;
}

const weatherWeights: Array<{ value: WeatherType; weight: number }> = [
  { value: 'sunny',  weight: 30 },
  { value: 'rainy',  weight: 20 },
  { value: 'foggy',  weight: 15 },
  { value: 'spring', weight: 10 },
  { value: 'autumn', weight: 10 },
  { value: 'windy',  weight: 7  },
  { value: 'cold',   weight: 4  },
  { value: 'stormy', weight: 3  },
  { value: 'snowy',  weight: 1  },
];

export const useGameStore = create<GameStore>((set, get) => ({
  phase:               'loading',
  activePanel:         'none',
  currentRegion:       'bambu-village',
  weather:             'sunny',
  chineseDate:         getChineseDate(),
  activeDialogue:      null,
  activeDialogueNode:  'start',
  activeCombatEnemyId: null,
  notification:        null,
  showVocabCard:       null,
  guestMode:           false,

  setPhase:         (phase)  => set({ phase }),
  setActivePanel:   (panel)  => set({ activePanel: panel }),
  setCurrentRegion: (region) => set({ currentRegion: region }),
  setWeather:       (type)   => set({ weather: type }),
  setGuestMode:     (v)      => set({ guestMode: v }),

  generateWeather: () => {
    const type = weightedRandom(weatherWeights);
    set({ weather: type });
  },

  setChineseDate: (date) => set({ chineseDate: date }),

  tickTime: () => {
    const now = getChineseDate();
    set({ chineseDate: now });
  },

  openDialogue: (npc, node = 'start') => set({
    phase:              'dialogue',
    activeDialogue:     npc,
    activeDialogueNode: node,
    activePanel:        'none',
  }),

  closeDialogue: () => set({
    phase:              'playing',
    activeDialogue:     null,
    activeDialogueNode: 'start',
  }),

  startCombat: (enemyId) => set({
    phase:               'combat',
    activeCombatEnemyId: enemyId,
    activePanel:         'none',
  }),

  endCombat: () => set({
    phase:               'playing',
    activeCombatEnemyId: null,
  }),

  showNotification: (n) => {
    const id = `notif_${Date.now()}`;
    set({ notification: { ...n, id } });
    const duration = n.duration ?? 3500;
    setTimeout(() => {
      if (get().notification?.id === id) set({ notification: null });
    }, duration);
  },

  clearNotification: () => set({ notification: null }),

  showVocab: (word) => set({ showVocabCard: word }),
  hideVocab: () => set({ showVocabCard: null }),
}));
