'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { usePlayerStore } from '@/store/playerStore';
import type { InventoryItem } from '@/types';
import { cn } from '@/lib/utils';

const ITEM_ICONS: Record<string, string> = {
  'training-robe': '👘',
  'rice-bundle': '🌾',
  'tea-leaf': '🍃',
  'health-potion': '🧪',
  'bamboo-staff': '🪄',
  'jade-pendant': '💚',
  'silk-cloth': '🎀',
  'scroll': '📜',
};

const SLOT_LABELS: Record<string, string> = {
  head: '帽子 Cabeça',
  chest: '上衣 Torso',
  legs: '裤子 Pernas',
  feet: '鞋子 Pés',
  hands: '手套 Mãos',
  weapon: '武器 Arma',
  offhand: '副手 Escudo',
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
      className="fixed right-0 top-0 bottom-0 w-full sm:w-80 bg-ink-900/98 border-l border-gold-700/40 z-40
                 flex flex-col shadow-2xl backdrop-blur-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gold-700/30">
        <div>
          <h2 className="font-chinese text-gold-300 text-lg">背包</h2>
          <p className="text-xs text-gray-400">{inventory.length} itens · 💰 {stats.gold} moedas</p>
        </div>
        <button onClick={() => setActivePanel('none')} className="text-gray-400 hover:text-white text-xl">✕</button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gold-700/20">
        {(['items', 'equipment'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-2 text-xs transition-colors',
              tab === t ? 'text-gold-300 border-b-2 border-gold-500' : 'text-gray-400 hover:text-gray-200'
            )}
          >
            {t === 'items' ? '🎒 Itens' : '⚔️ Equipamento'}
          </button>
        ))}
      </div>

      {tab === 'equipment' ? (
        <div className="flex-1 p-4 overflow-y-auto space-y-2">
          {(Object.keys(SLOT_LABELS) as Array<keyof typeof SLOT_LABELS>).map(slot => {
            const itemId = (equipment as Record<string, string | undefined>)[slot];
            return (
              <div key={slot} className="flex items-center gap-3 bg-ink-800/60 border border-gold-700/20 rounded p-2">
                <div className="w-10 h-10 bg-ink-700 rounded border border-gold-700/30 flex items-center justify-center text-xl">
                  {itemId ? (ITEM_ICONS[itemId] ?? '🎽') : '○'}
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-400">{SLOT_LABELS[slot]}</div>
                  {itemId ? (
                    <div className="text-sm text-gold-300">{itemId}</div>
                  ) : (
                    <div className="text-sm text-gray-600">— Vazio —</div>
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
                <div className="text-4xl mb-3">🎒</div>
                <p className="text-gray-500 text-sm">Mochila vazia</p>
                <p className="text-gray-600 text-xs mt-1">Fale com o Mercador Wei para comprar itens</p>
              </div>
            ) : (
              <div className="grid grid-cols-5 gap-1.5">
                {inventory.map((item, i) => (
                  <button
                    key={`${item.itemId}-${i}`}
                    onClick={() => setSelected(selected?.itemId === item.itemId ? null : item)}
                    className={cn(
                      'aspect-square bg-ink-800 rounded border p-1 flex flex-col items-center justify-center transition-all',
                      selected?.itemId === item.itemId
                        ? 'border-gold-400 bg-ink-700'
                        : 'border-gold-700/20 hover:border-gold-700/50'
                    )}
                    title={item.itemId}
                  >
                    <span className="text-xl">
                      {ITEM_ICONS[item.itemId] ?? '📦'}
                    </span>
                    {item.quantity > 1 && (
                      <span className="text-[9px] text-gold-300">{item.quantity}</span>
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
              className="border-t border-gold-700/30 p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{ITEM_ICONS[selected.itemId] ?? '📦'}</span>
                <div>
                  <div className="text-sm font-medium text-gold-200">{selected.itemId}</div>
                  <div className="text-xs text-gray-500">Quantidade: {selected.quantity}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { equipItem(selected.itemId, 'weapon'); setSelected(null); }}
                  className="flex-1 py-1 text-xs bg-gold-700 hover:bg-gold-600 text-white rounded transition-colors"
                >
                  Equipar
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="px-3 py-1 text-xs bg-ink-700 hover:bg-ink-600 text-gray-300 rounded transition-colors"
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
