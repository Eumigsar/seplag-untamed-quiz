'use client';
import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import { usePlayerStore } from '@/store/playerStore';
import { useVocabularyStore } from '@/store/vocabularyStore';
import { NPCS } from '@/data/npcs';
import HUD from '@/components/game/HUD';
import SifuDialog from '@/components/game/SifuDialog';
import VocabularyPanel from '@/components/game/VocabularyPanel';
import QuestLog from '@/components/game/QuestLog';
import Inventory from '@/components/game/Inventory';
import AchievementsPanel from '@/components/game/AchievementsPanel';
import CalendarWidget from '@/components/game/CalendarWidget';
import MapPanel from '@/components/game/MapPanel';

// Phaser must be loaded client-side only (no SSR)
const GameCanvas = dynamic(() => import('@/components/game/GameCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-ink-950">
      <div className="text-center">
        <div className="font-chinese text-6xl text-gold-300 animate-spin-slow mb-4">龍</div>
        <p className="text-jade-300 text-sm">加载中... Carregando...</p>
      </div>
    </div>
  ),
});

export default function GamePage() {
  const router = useRouter();
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    activePanel, setActivePanel,
    activeDialogue, closeDialogue, openDialogue,
    tickTime, generateWeather,
  } = useGameStore();

  const { character, gainXP } = usePlayerStore();
  const { markSeen, learnWord } = useVocabularyStore();

  // Redirect if no character
  useEffect(() => {
    if (!character) {
      router.replace('/create-character');
    }
  }, [character]);

  // Game clock — tick every 10 real seconds = 1 in-game minute
  useEffect(() => {
    generateWeather();
    tickRef.current = setInterval(() => {
      tickTime();
    }, 10_000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, []);

  // Handle sifu panel by opening sifu's dialogue
  useEffect(() => {
    if (activePanel === 'sifu') {
      const sifu = NPCS.find(n => n.id === 'sifu-long-yun');
      if (sifu) {
        openDialogue(sifu);
        setActivePanel('none');
      }
    }
  }, [activePanel]);

  if (!character) return null;

  const handleWordLearned = (wordId: string) => {
    markSeen(wordId);
    learnWord(wordId);
    gainXP(5);
  };

  const handleQuestGiven = (questId: string) => {
    const c = usePlayerStore.getState().character;
    if (c) {
      c.questProgress[questId] = 'active';
    }
    useGameStore.getState().showNotification({
      title: '新任务！',
      message: `Missão aceita!`,
    });
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-ink-950 relative">
      {/* Phaser game canvas — full screen */}
      <div className="absolute inset-0">
        <GameCanvas />
      </div>

      {/* React HUD layer — always visible */}
      <HUD />

      {/* Dialogue overlay */}
      <AnimatePresence>
        {activeDialogue && (
          <SifuDialog
            key={activeDialogue.id}
            npc={activeDialogue}
            onClose={closeDialogue}
            onQuestGiven={handleQuestGiven}
            onWordLearned={handleWordLearned}
            autoPlayAudio={true}
          />
        )}
      </AnimatePresence>

      {/* Side panels */}
      <AnimatePresence>
        {activePanel === 'vocabulary' && <VocabularyPanel />}
        {activePanel === 'quest-log' && <QuestLog />}
        {activePanel === 'inventory' && <Inventory />}
        {activePanel === 'achievements' && <AchievementsPanel />}
        {activePanel === 'map' && <MapPanel />}
        {activePanel === 'calendar' && <CalendarWidget />}
      </AnimatePresence>
    </div>
  );
}
