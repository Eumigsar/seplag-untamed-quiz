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
  const [wordFlash, setWordFlash] = useState(false);

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
    }, 25);
    if (autoPlayAudio) speakNormal(text);
    return () => clearInterval(timer);
  }, [node, lineIdx, autoPlayAudio]);

  useEffect(() => {
    if (current?.vocabularyIds?.length) {
      current.vocabularyIds.forEach(id => onWordLearned?.(id));
      setWordFlash(true);
      setTimeout(() => setWordFlash(false), 1200);
    }
  }, [node, lineIdx]);

  const advance = () => {
    if (typing) { setDisplayText(current.hanzi); setTyping(false); return; }
    if (current?.next && !current.choices) {
      handleNext(current.next);
    } else if (!current?.choices) {
      if (lineIdx < lines.length - 1) setLineIdx(i => i + 1);
      else onClose();
    }
  };

  const handleNext = (nextNode: string | null | undefined) => {
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

  const learnedWords = (current.vocabularyIds ?? []).map(id => getVocabById(id)).filter(Boolean);
  const isSifu = npc.role === 'sifu';

  const npcEmoji =
    npc.role === 'sifu'     ? '🧙' :
    npc.role === 'merchant' ? '🛍️' :
    npc.role === 'farmer'   ? '🌾' :
    npc.role === 'monk'     ? '🧘' :
    npc.role === 'child'    ? '👧' :
    npc.role === 'scholar'  ? '📜' : '👤';

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
          className="absolute inset-0 bg-black/50 pointer-events-auto"
          onClick={advance}
        />

        {/* Dialog panel */}
        <motion.div
          className="relative w-full max-w-2xl mx-3 pointer-events-auto"
          style={{ marginBottom: 'max(1rem, env(safe-area-inset-bottom, 0px) + 0.5rem)' }}
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
        >
          {/* Portrait — square Genshin-style, positioned above panel */}
          <div className="absolute -top-14 left-4 z-10">
            <div className={`gi-portrait-inner w-[72px] h-[72px] rounded text-4xl shadow-xl ${isSifu ? 'gi-portrait-gold' : 'gi-portrait-teal'}`}>
              {npcEmoji}
            </div>
            {/* Corner accent on portrait */}
            {isSifu && (
              <span className="absolute -bottom-1 -right-1 text-[10px] text-gi-geo">✦</span>
            )}
          </div>

          {/* Main panel */}
          <div className={`gi-panel p-4 ${isSifu ? '' : 'gi-panel-teal'}`}>
            <div className="gi-corner-tr" /><div className="gi-corner-bl" />

            {/* Speaker name row */}
            <div className="ml-20 mb-3 flex items-baseline gap-2">
              <span className={`font-chinese font-bold text-sm ${isSifu ? 'text-gi-geo' : 'text-gi-anemo'}`}>
                {npc.name.hanzi}
              </span>
              <span className="text-xs text-gi-text-dim">{npc.name.portuguese}</span>
            </div>

            {/* Divider below name */}
            <div className={`gi-divider mb-3 ${isSifu ? '' : 'gi-divider-teal'}`} />

            {/* Chinese text */}
            <div className="font-chinese text-xl text-gi-text mb-1 min-h-[3.2rem] leading-relaxed">
              {displayText}
              {typing && <span className="animate-gi-breath text-gi-geo ml-0.5">|</span>}
            </div>

            {/* Pinyin */}
            <div className="text-sm text-gi-anemo font-mono mb-1">{current.pinyin}</div>

            {/* Translation */}
            <div className="text-sm text-gi-text-dim italic mb-3">{current.translation}</div>

            {/* Word-learned flash */}
            {learnedWords.length > 0 && (
              <motion.div
                animate={wordFlash ? { scale: [1, 1.02, 1] } : {}}
                transition={{ duration: 0.45 }}
                className={`gi-panel-inner flex flex-wrap gap-1 mb-3 p-2 transition-all ${
                  wordFlash ? 'border-jade-500/60 shadow-gi-teal' : ''
                }`}
              >
                {wordFlash && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full text-[11px] text-gi-anemo font-bold mb-1"
                  >
                    ✦ +{learnedWords.length * 5} XP · Novas palavras aprendidas!
                  </motion.div>
                )}
                {learnedWords.map(w => w && (
                  <span key={w.id} className="text-xs bg-jade-900/50 border border-jade-700/40 rounded px-2 py-0.5">
                    <span className="font-chinese text-gi-geo">{w.hanzi}</span>
                    <span className="text-gi-anemo ml-1">{w.pinyin}</span>
                    <span className="text-gi-text-dim ml-1">— {w.translation}</span>
                  </span>
                ))}
              </motion.div>
            )}

            {/* Choices */}
            {!typing && current.choices && (
              <div className="space-y-1.5 mt-2">
                {current.choices.map((choice, i) => (
                  <button
                    key={i}
                    onClick={() => handleChoice(choice)}
                    className="gi-btn w-full text-left px-3 py-2 group"
                  >
                    <span className="font-chinese text-gi-geo group-hover:text-gi-geo-light">
                      {choice.hanzi}
                    </span>
                    <span className="text-xs text-gi-anemo ml-2">{choice.pinyin}</span>
                    <span className="text-xs text-gi-text-dim ml-2">— {choice.translation}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Continue / listen buttons */}
            {!typing && !current.choices && (
              <div className="flex justify-between items-center mt-3 gap-2">
                <button
                  onClick={() => speakNormal(current.hanzi)}
                  className="gi-btn gi-btn-teal flex items-center gap-1.5 px-3 py-1.5 text-xs"
                >
                  🔊 Ouvir
                </button>
                <motion.button
                  onClick={advance}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  animate={{ opacity: [0.85, 1, 0.85] }}
                  transition={{ repeat: Infinity, duration: 1.8 }}
                  className="gi-btn gi-btn-primary flex-1 py-1.5 text-sm text-center"
                >
                  Continuar ▶
                </motion.button>
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gi-text-dim hover:text-gi-text text-lg leading-none transition-colors"
          >
            ✕
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
