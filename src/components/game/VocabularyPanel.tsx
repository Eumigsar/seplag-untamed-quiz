'use client';

import { useState } from 'react';
import { usePlayer } from '@/store/player';
import { useUI } from '@/store/ui';
import { HANZI } from '@/utils/hanzi';
import { X, BookOpen } from 'lucide-react';

export default function VocabularyPanel() {
  const { learned } = usePlayer();
  const { vocabPanelOpen, toggleVocabPanel } = useUI();
  const [flipped, setFlipped] = useState<string | null>(null);

  if (!vocabPanelOpen) return null;

  const learnedCards = HANZI.filter(h => learned.includes(h.hanzi));

  return (
    <div className="absolute top-16 left-3 w-80 pointer-events-auto z-30">
      <div className="card shadow-[0_0_30px_#00A86B20] overflow-hidden max-h-[70vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-jade/20 bg-gradient-to-r from-jade/10 to-transparent shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-jade" />
            <span className="text-jade font-semibold text-sm">Vocabulário</span>
            <span className="text-[10px] text-paper/30 bg-jade/10 px-1.5 py-0.5 rounded-full">
              {learnedCards.length}/{HANZI.length}
            </span>
          </div>
          <button onClick={toggleVocabPanel} className="text-paper/40 hover:text-paper transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Cards */}
        <div className="overflow-y-auto flex-1 p-3">
          {learnedCards.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-3 opacity-20">?</p>
              <p className="text-paper/30 text-xs">Encontre o Sifu Li para aprender seu primeiro Hanzi</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {learnedCards.map(card => {
                const isFlipped = flipped === card.hanzi;
                return (
                  <button
                    key={card.hanzi}
                    onClick={() => setFlipped(isFlipped ? null : card.hanzi)}
                    className={`rounded-lg border p-2 text-center transition-all duration-200 ${
                      isFlipped
                        ? 'border-jade/50 bg-jade/10 scale-105'
                        : 'border-gold/20 bg-gold/5 hover:border-gold/40 hover:scale-105'
                    }`}
                  >
                    {isFlipped ? (
                      <div className="space-y-1">
                        <p className="text-jade text-[10px] font-medium">{card.pinyin}</p>
                        <p className="text-paper/70 text-[9px] leading-tight">{card.meaning}</p>
                      </div>
                    ) : (
                      <>
                        <p className="text-gold text-2xl leading-none mb-1">{card.hanzi}</p>
                        <p className="text-paper/30 text-[9px]">{card.pinyin}</p>
                      </>
                    )}
                  </button>
                );
              })}
              {/* Locked placeholders */}
              {HANZI.filter(h => !learned.includes(h.hanzi)).map(card => (
                <div
                  key={card.hanzi}
                  className="rounded-lg border border-paper/5 bg-paper/2 p-2 text-center opacity-25"
                >
                  <p className="text-paper/20 text-2xl leading-none mb-1">?</p>
                  <p className="text-paper/10 text-[9px]">—</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {learnedCards.length > 0 && (
          <p className="text-center text-[10px] text-paper/20 py-2 border-t border-paper/5 shrink-0">
            Toque em um caractere para ver a leitura
          </p>
        )}
      </div>
    </div>
  );
}
