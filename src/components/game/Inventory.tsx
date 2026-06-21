'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { usePlayerStore } from '@/store/playerStore';
import type { InventoryItem } from '@/types';
import { cn } from '@/lib/utils';

const ITEM_ICONS: Record<string, string> = {
  'training-robe': '👘',
  'rice-bundle':   '🌾',
  'tea-leaf':      '🍃',
  'health-potion': '🧪',
  'bamboo-staff':  '🪄',
  'jade-pendant':  '💚',
  'silk-cloth':    '🎀',
  'scroll':        '📜',
};

const SLOT_LABELS: Record<string, string> = {
  head:      '帽子 Cabeça',
  chest:     '上衣 Torso',
  legs:      '裤子 Pernas',
  feet:      '鞋子 Pés',
  hands:     '手套 Mãos',
  weapon:    '武器 Arma',
  offhand:   '副手 Escudo',
  accessory: '配件 Acessório',
};

export default function Inventory() {
  const { setActivePanel } = useGameStore();
  const { character, equipItem } = usePlayerStore();
  const [selected, setSelected] = useState<InventoryItem | null>(null);
  const [tab, setTab] = useState<'items' | 'equipment'>('items');

  if (!character) return null;

  const { inventory, equipment, stats } = character;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 24, stiffness: 260 }}
      className="fixed right-0 top-0 bottom-0 w-full sm:w-80 z-40 flex flex-col
                 bg-[rgba(9,13,34,0.97)] border-l border-[rgba(201,168,108,0.25)] shadow-2xl backdrop-blur-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(201,168,108,0.18)]">
        <div>
          <h2 className="font-chinese text-gi-geo text-lg text-shadow-gold">背包</h2>
          <p className="text-[11px] text-gi-text-dim">{inventory.length} itens · ◆ {stats.gold} moedas</p>
        </div>
        <button onClick={() => setActivePanel('none')} className="text-gi-text-dim hover:text-gi-text text-lg transition-colors">✕</button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[rgba(201,168,108,0.12)]">
        {(['items', 'equipment'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-2 text-xs transition-colors',
              tab === t
                ? 'text-gi-geo border-b-2 border-gi-geo'
                : 'text-gi-text-dim hover:text-gi-text',
            )}
          >
            {t === 'items' ? '🎒 Itens' : '⚔️ Equipamento'}
          </button>
        ))}
      </div>

      {tab === 'equipment' ? (
        <div className="flex-1 p-3 overflow-y-auto space-y-1.5">
          {(Object.keys(SLOT_LABELS) as Array<keyof typeof SLOT_LABELS>).map(slot => {
            const itemId = (equipment as Record<string, string | undefined>)[slot];
            return (
              <div key={slot} className="flex items-center gap-3 gi-panel-inner p-2">
                <div className="w-10 h-10 bg-[rgba(5,8,20,0.8)] rounded border border-[rgba(201,168,108,0.2)] flex items-center justify-center text-xl">
                  {itemId ? (ITEM_ICONS[itemId] ?? '🎽') : '○'}
                </div>
                <div className="flex-1">
                  <div className="text-[10px] text-gi-text-dim">{SLOT_LABELS[slot]}</div>
                  {itemId ? (
                    <div className="text-sm text-gi-geo">{itemId}</div>
                  ) : (
                    <div className="text-sm text-[#445]">— Vazio —</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-3">
            {inventory.length === 0 ? (
              <div className="text-center mt-12">
                <div className="text-4xl mb-3 opacity-30">🎒</div>
                <p className="text-gi-text-dim text-sm">Mochila vazia</p>
                <p className="text-[11px] text-[#445] mt-1">Fale com o Mercador Wei para comprar itens</p>
              </div>
            ) : (
              <div className="grid grid-cols-5 gap-1.5">
                {inventory.map((item, i) => (
                  <button
                    key={`${item.itemId}-${i}`}
                    onClick={() => setSelected(selected?.itemId === item.itemId ? null : item)}
                    className={cn(
                      'aspect-square rounded border p-1 flex flex-col items-center justify-center transition-all',
                      selected?.itemId === item.itemId
                        ? 'border-[rgba(201,168,108,0.8)] bg-[rgba(201,168,108,0.12)]'
                        : 'border-[rgba(201,168,108,0.15)] bg-[rgba(5,8,20,0.6)] hover:border-[rgba(201,168,108,0.4)]',
                    )}
                    title={item.itemId}
                  >
                    <span className="text-xl">{ITEM_ICONS[item.itemId] ?? '📦'}</span>
                    {item.quantity > 1 && (
                      <span className="text-[9px] text-gi-geo">{item.quantity}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {selected && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="border-t border-[rgba(201,168,108,0.2)] p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{ITEM_ICONS[selected.itemId] ?? '📦'}</span>
                <div>
                  <div className="text-sm font-medium text-gi-geo">{selected.itemId}</div>
                  <div className="text-xs text-gi-text-dim">Quantidade: {selected.quantity}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { equipItem(selected.itemId, 'weapon'); setSelected(null); }}
                  className="gi-btn gi-btn-primary flex-1 py-1.5 text-xs"
                >
                  Equipar
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="gi-btn px-3 py-1.5 text-xs"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
