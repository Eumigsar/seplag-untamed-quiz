import { create } from 'zustand';

interface UIStore {
  questLogOpen: boolean;
  vocabPanelOpen: boolean;
  achPanelOpen: boolean;
  toggleQuestLog: () => void;
  toggleVocabPanel: () => void;
  toggleAchPanel: () => void;
  closeAll: () => void;
}

export const useUI = create<UIStore>((set) => ({
  questLogOpen: false,
  vocabPanelOpen: false,
  achPanelOpen: false,
  toggleQuestLog:  () => set(s => ({ questLogOpen: !s.questLogOpen, vocabPanelOpen: false, achPanelOpen: false })),
  toggleVocabPanel:() => set(s => ({ vocabPanelOpen: !s.vocabPanelOpen, questLogOpen: false, achPanelOpen: false })),
  toggleAchPanel:  () => set(s => ({ achPanelOpen: !s.achPanelOpen, questLogOpen: false, vocabPanelOpen: false })),
  closeAll: () => set({ questLogOpen: false, vocabPanelOpen: false, achPanelOpen: false }),
}));
