'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { NPC, DialogLine, DialogChoice } from '@/types';
import { speakNormal } from '@/lib/speech';
import { getVocabById } from '@/data/vocabulary';

interface Props {
  npc: NPC;
  onClose: () => void;
  onQuestGiven?: (questId: string) => void;
  onWordLearned?: (wordId: string) => void;
  autoPlayAudio?: boolean;
}

export default function SifuDialog({ npc, onClose, onQuestGiven, onWordLearned, autoPlayAudio = true }: Props) {
  const [node, setNode] = useState('start');
  const [lineIdx, setLineIdx] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [typing, setTyping] = useState(false);

  const lines: DialogLine[] = npc.dialogueTree[node] ?? [];
  const current = lines[lineIdx];

  useEffect(() => {
    if (!current) return;
    setTyping(true);
    setDisplayText('');
    let i = 0;
    const text = current.hanzi;
    const timer = setInterval(() => {
      setDisplayText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) { clearInterval(timer); setTyping(false); }
    }, 60);
    if (autoPlayAudio) speakNormal(text);
    return () => clearInterval(timer);
  }, [node, lineIdx, autoPlayAudio]);

  useEffect(() => {
    if (current?.vocabularyIds) {
      current.vocabularyIds.forEach(id => onWordLearned?.(id));
    }
  }, [node, lineIdx]);

  const advance = () => {
    if (typing) { setDisplayText(current.hanzi); setTyping(false); return; }
    if (current?.next && !current.choices) {
      handleNext(current.next);
    } else if (!current?.choices) {
      if (lineIdx < lines.length - 1) {
        setLineIdx(i => i + 1);
      } else {
        onClose();
      }
    }
  };

  const handleNext = (nextNode: string | null) => {
    if (!nextNode) { onClose(); return; }
    if (nextNode === 'next') {
      if (lineIdx < lines.length - 1) setLineIdx(i => i + 1);
      else onClose();
      return;
    }
    setNode(nextNode);
    setLineIdx(0);
  };

  const handleChoice = (choice: DialogChoice) => {
    if (choice.effect) {
      if (choice.effect.type === 'give-quest') onQuestGiven?.(choice.effect.value as string);
      if (choice.effect.type === 'teach-word') onWordLearned?.(choice.effect.value as string);
    }
    handleNext(choice.next);
  };

  if (!current) return null;

  const learnedWords = (current.vocabularyIds ?? [])
    .map(id => getVocabById(id))
    .filter(Boolean);

  const isSifu = npc.role === 'sifu';

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Dim backdrop */}
        <div
          className="absolute inset-0 bg-black/40 pointer-events-auto"
          onClick={advance}
        />

        {/* Dialog box */}
        <motion.div
          className="relative w-full max-w-2xl mb-6 mx-4 pointer-events-auto"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
        >
          {/* Portrait */}
          <div className="absolute -top-16 left-6 z-10">
            <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center text-4xl
              ${isSifu ? 'border-gold-500 bg-gradient-to-b from-parchment-800 to-ink-900' : 'border-jade-500 bg-ink-800'}`}>
              {npc.role === 'sifu' ? '🧙' :
               npc.role === 'merchant' ? '🛍️' :
               npc.role === 'farmer' ? '🌾' :
               npc.role === 'monk' ? '🧘' :
               npc.role === 'child' ? '👧' :
               npc.role === 'scholar' ? '📜' : '👤'}
            </div>
            {isSifu && (
              <div className="absolute -bottom-1 -right-1 text-xs">✨</div>
            )}
          </div>

          {/* Main dialog panel */}
          <div className={`rounded-lg border-2 p-4 shadow-2xl backdrop-blur-sm
            ${isSifu
              ? 'bg-gradient-to-b from-ink-900/95 to-parchment-950/95 border-gold-600/70'
              : 'bg-ink-900/95 border-jade-700/60'}`}
          >
            {/* Speaker name */}
            <div className={`ml-20 mb-2 text-sm font-bold
              ${isSifu ? 'text-gold-300' : 'text-jade-300'}`}>
              {npc.name.hanzi}
              <span className="font-normal text-gray-400 ml-2 text-xs">{npc.name.portuguese}</span>
            </div>

            {/* Chinese text */}
            <div className="font-chinese text-xl text-parchment-100 mb-1 min-h-[3rem] leading-relaxed">
              {displayText}
              {typing && <span className="animate-pulse ml-1 text-gold-400">|</span>}
            </div>

            {/* Pinyin */}
            <div className="text-sm text-jade-300 font-mono mb-1">{current.pinyin}</div>

            {/* Translation */}
            <div className="text-sm text-gray-300 italic mb-3">{current.translation}</div>

            {/* Vocabulary learned indicator */}
            {learnedWords.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {learnedWords.map(w => w && (
                  <span key={w.id} className="text-xs bg-jade-900/60 border border-jade-600/40 rounded px-2 py-0.5">
                    <span className="font-chinese text-gold-300">{w.hanzi}</span>
                    <span className="text-jade-300 ml-1">{w.pinyin}</span>
                    <span className="text-gray-400 ml-1">— {w.translation}</span>
                  </span>
                ))}
              </div>
            )}

            {/* Choices */}
            {!typing && current.choices && (
              <div className="space-y-2 mt-2">
                {current.choices.map((choice, i) => (
                  <button
                    key={i}
                    onClick={() => handleChoice(choice)}
                    className="w-full text-left px-4 py-2 bg-ink-700 hover:bg-ink-600
                               border border-gold-700/30 hover:border-gold-500/60
                               rounded transition-all group"
                  >
                    <span className="font-chinese text-gold-300 group-hover:text-gold-200">
                      {choice.hanzi}
                    </span>
                    <span className="text-xs text-jade-300 ml-2">{choice.pinyin}</span>
                    <span className="text-xs text-gray-400 ml-2">— {choice.translation}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Continue hint */}
            {!typing && !current.choices && (
              <div className="flex justify-between items-center mt-2">
                <button
                  onClick={() => speakNormal(current.hanzi)}
                  className="text-xs text-jade-400 hover:text-jade-300 flex items-center gap-1"
                >
                  🔊 Ouvir novamente
                </button>
                <span className="text-xs text-gray-500 animate-pulse">
                  Clique para continuar ▶
                </span>
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl"
          >
            ✕
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
