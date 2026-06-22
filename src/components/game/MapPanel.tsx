'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { usePlayerStore } from '@/store/playerStore';
import { REGIONS } from '@/data/maps/regions';
import type { Region, RegionId } from '@/types';

const REGION_EMOJI: Record<string, string> = {
  'bambu-village':              '🎋',
  'silk-market':                '🏮',
  'lantern-valley':             '🏔️',
  'golden-cloud-monastery':     '⛩️',
  'celestial-dragon-mountains': '🐉',
  'jade-imperial-city':         '🏯',
};

const REGION_THEME_COLORS: Record<string, { glow: string; accent: string; bg: string }> = {
  'bambu-village':              { glow: 'rgba(134,239,172,0.35)', accent: '#86efac', bg: 'rgba(45,90,39,0.25)' },
  'silk-market':                { glow: 'rgba(252,211,77,0.35)',  accent: '#fcd34d', bg: 'rgba(180,83,9,0.25)' },
  'lantern-valley':             { glow: 'rgba(245,158,11,0.35)', accent: '#f59e0b', bg: 'rgba(124,58,237,0.25)' },
  'golden-cloud-monastery':     { glow: 'rgba(251,191,36,0.35)', accent: '#fbbf24', bg: 'rgba(180,83,9,0.25)' },
  'celestial-dragon-mountains': { glow: 'rgba(96,165,250,0.35)', accent: '#60a5fa', bg: 'rgba(30,58,95,0.25)' },
  'jade-imperial-city':        { glow: 'rgba(52,211,153,0.35)', accent: '#34d399', bg: 'rgba(6,95,70,0.25)' },
};

const HSK_COLORS: Record<number, string> = {
  1: '#86efac',
  2: '#fbbf24',
  3: '#f87171',
  4: '#c084fc',
};

interface RegionNodeProps {
  region: Region;
  isUnlocked: boolean;
  isCurrent: boolean;
  isSelected: boolean;
  onClick: () => void;
}

function RegionNode({ region, isUnlocked, isCurrent, isSelected, onClick }: RegionNodeProps) {
  const { x, y } = region.mapPosition;
  const theme = REGION_THEME_COLORS[region.id] ?? { glow: 'rgba(201,168,108,0.35)', accent: '#c9a86c', bg: 'rgba(9,13,34,0.6)' };

  return (
    <g onClick={onClick} style={{ cursor: isUnlocked ? 'pointer' : 'not-allowed' }}>
      {/* Selection / current glow ring */}
      {(isCurrent || isSelected) && (
        <circle cx={x} cy={y} r={isSelected ? 34 : 30}
          fill="none"
          stroke={isSelected ? theme.accent : 'rgba(201,168,108,0.6)'}
          strokeWidth={isSelected ? 2 : 1.5}
          opacity={0.8}
        >
          <animate attributeName="r" values={`${isSelected ? 32 : 28};${isSelected ? 36 : 32};${isSelected ? 32 : 28}`} dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Ambient glow */}
      {isUnlocked && (
        <circle cx={x} cy={y} r="28" fill={theme.glow} opacity={isSelected ? 0.7 : 0.3} />
      )}

      {/* Main circle */}
      <circle
        cx={x} cy={y} r="22"
        fill={isSelected ? theme.bg : isCurrent ? 'rgba(201,168,108,0.12)' : isUnlocked ? 'rgba(14,18,48,0.9)' : 'rgba(5,8,20,0.9)'}
        stroke={isSelected ? theme.accent : isCurrent ? 'rgba(201,168,108,0.85)' : isUnlocked ? theme.accent : 'rgba(30,37,88,0.6)'}
        strokeWidth={isSelected ? 2.5 : isCurrent ? 2 : 1.5}
        opacity={isUnlocked ? 1 : 0.45}
      />

      {/* Emoji */}
      <text x={x} y={y + 7} textAnchor="middle" fontSize="17" opacity={isUnlocked ? 1 : 0.2}>
        {REGION_EMOJI[region.id] ?? '📍'}
      </text>

      {/* Lock */}
      {!isUnlocked && (
        <text x={x + 17} y={y - 13} fontSize="11" opacity="0.7">🔒</text>
      )}

      {/* Name */}
      <text x={x} y={y + 38} textAnchor="middle" fontSize="11" fontFamily="serif"
        fill={isSelected ? theme.accent : isCurrent ? '#c9a86c' : isUnlocked ? '#e0c07a' : '#2d3a6a'}
        fontWeight={isSelected ? 'bold' : 'normal'}
      >
        {region.name.hanzi}
      </text>
      <text x={x} y={y + 50} textAnchor="middle" fontSize="9"
        fill={isUnlocked ? '#98aad0' : '#1e2558'}
      >
        HSK{region.hskRequired}
      </text>
    </g>
  );
}

export default function MapPanel() {
  const { setActivePanel, currentRegion, setCurrentRegion, showNotification } = useGameStore();
  const { character, travelTo } = usePlayerStore();
  const [selected, setSelected] = useState<RegionId | null>(null);
  const [traveling, setTraveling] = useState(false);

  if (!character) return null;

  const hskLevel = character.hskLevel;
  const selectedRegion = selected ? REGIONS.find(r => r.id === selected) : null;
  const selectedTheme = selected ? (REGION_THEME_COLORS[selected] ?? { accent: '#c9a86c', bg: 'rgba(9,13,34,0.6)', glow: '' }) : null;

  const canTravel = selectedRegion
    ? selectedRegion.hskRequired <= hskLevel && selected !== currentRegion
    : false;

  const handleTravel = () => {
    if (!selected || !canTravel || traveling) return;
    setTraveling(true);

    travelTo(selected);
    setCurrentRegion(selected);
    showNotification({
      title: '传送中 · Teleportando',
      hanzi: selectedRegion?.name.hanzi ?? '',
      pinyin: selectedRegion?.name.pinyin ?? '',
      message: selectedRegion?.name.portuguese ?? '',
      duration: 3000,
    });

    setTimeout(() => {
      setActivePanel('none');
      setTraveling(false);
    }, 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: 'spring', damping: 24, stiffness: 260 }}
      className="fixed inset-3 md:inset-10 z-40 flex gap-0 overflow-hidden"
      style={{ borderRadius: 4 }}
    >
      {/* ── Left: SVG map ── */}
      <div className="gi-panel flex-1 flex flex-col min-w-0">
        <div className="gi-corner-tr" /><div className="gi-corner-bl" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(201,168,108,0.18)] shrink-0">
          <div>
            <h2 className="font-chinese text-gi-geo text-xl text-shadow-gold">地图</h2>
            <p className="text-[11px] text-gi-text-dim">Mapa do Mundo · clique numa região</p>
          </div>
          <button onClick={() => setActivePanel('none')} className="text-gi-text-dim hover:text-gi-text text-lg transition-colors">✕</button>
        </div>

        {/* Map SVG */}
        <div className="flex-1 relative overflow-hidden p-3">
          <svg viewBox="0 0 900 600" className="w-full h-full">
            {/* Background */}
            <rect width="900" height="600" fill="#050810" />
            <rect width="900" height="600" fill="url(#mapgrid)" opacity="0.2" />
            <defs>
              <pattern id="mapgrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e2558" strokeWidth="0.5" />
              </pattern>
            </defs>

            {/* Continent silhouette */}
            <ellipse cx="450" cy="320" rx="380" ry="260" fill="rgba(14,18,48,0.4)" />

            {/* Connection lines */}
            {REGIONS.map(region =>
              region.connections.map(connId => {
                const conn = REGIONS.find(r => r.id === connId);
                if (!conn) return null;
                const unlocked = region.hskRequired <= hskLevel && conn.hskRequired <= hskLevel;
                const isHighlighted = selected === region.id || selected === connId;
                return (
                  <line key={`${region.id}-${connId}`}
                    x1={region.mapPosition.x} y1={region.mapPosition.y}
                    x2={conn.mapPosition.x}   y2={conn.mapPosition.y}
                    stroke={isHighlighted && unlocked ? 'rgba(201,168,108,0.7)' : unlocked ? 'rgba(201,168,108,0.28)' : 'rgba(30,37,88,0.5)'}
                    strokeWidth={isHighlighted ? 2 : 1}
                    strokeDasharray={unlocked ? 'none' : '5,4'}
                  />
                );
              })
            )}

            {/* Region nodes */}
            {REGIONS.map(region => (
              <RegionNode
                key={region.id}
                region={region}
                isUnlocked={region.hskRequired <= hskLevel}
                isCurrent={region.id === currentRegion}
                isSelected={region.id === selected}
                onClick={() => setSelected(region.id === selected ? null : region.id as RegionId)}
              />
            ))}
          </svg>
        </div>

        {/* HSK legend */}
        <div className="px-4 pb-3 flex gap-3 shrink-0">
          {[1,2,3,4].map(h => (
            <div key={h} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: HSK_COLORS[h] }} />
              <span className="text-[10px] text-gi-text-dim">HSK{h}</span>
            </div>
          ))}
          <div className="ml-auto flex items-center gap-1.5">
            <span className="text-[10px] text-gi-text-dim">Nível atual:</span>
            <span className="text-[10px] font-bold" style={{ color: HSK_COLORS[hskLevel] }}>HSK{hskLevel}</span>
          </div>
        </div>
      </div>

      {/* ── Right: Region detail panel ── */}
      <AnimatePresence>
        {selectedRegion && selectedTheme ? (
          <motion.div
            key={selected}
            initial={{ x: 20, opacity: 0, width: 0 }}
            animate={{ x: 0, opacity: 1, width: 260 }}
            exit={{ x: 20, opacity: 0, width: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="gi-panel flex flex-col ml-2 overflow-hidden shrink-0"
            style={{ borderLeftColor: selectedTheme.accent + '55' }}
          >
            <div className="gi-corner-tr" /><div className="gi-corner-bl" />

            {/* Region header */}
            <div className="px-4 pt-4 pb-3 border-b border-[rgba(201,168,108,0.15)]">
              <div className="text-4xl mb-2">{REGION_EMOJI[selected!]}</div>
              <div className="font-chinese text-xl mb-0.5" style={{ color: selectedTheme.accent }}>
                {selectedRegion.name.hanzi}
              </div>
              <div className="text-xs text-gi-anemo">{selectedRegion.name.pinyin}</div>
              <div className="text-xs text-gi-text-dim mt-0.5">{selectedRegion.name.portuguese}</div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {/* Status badge */}
              <div className="flex gap-2">
                {selected === currentRegion && (
                  <span className="text-[10px] border border-[rgba(201,168,108,0.5)] text-gi-geo px-2 py-0.5 rounded">
                    ◆ Localização Atual
                  </span>
                )}
                <span
                  className="text-[10px] border px-2 py-0.5 rounded"
                  style={{
                    borderColor: selectedTheme.accent + '66',
                    color: HSK_COLORS[selectedRegion.hskRequired] ?? '#98aad0',
                  }}
                >
                  HSK{selectedRegion.hskRequired}
                </span>
                {selectedRegion.hskRequired > hskLevel && (
                  <span className="text-[10px] border border-crimson-500/40 text-crimson-400 px-2 py-0.5 rounded">
                    🔒 Bloqueado
                  </span>
                )}
              </div>

              {/* Description */}
              <div>
                <div className="gi-divider mb-2" />
                <p className="text-xs text-gi-text leading-relaxed">{selectedRegion.description}</p>
              </div>

              {/* NPCs */}
              {selectedRegion.npcIds.length > 0 && (
                <div>
                  <div className="text-[10px] text-gi-text-dim uppercase tracking-wider mb-1">NPCs</div>
                  <div className="space-y-1">
                    {selectedRegion.npcIds.map(id => (
                      <div key={id} className="gi-panel-inner text-xs px-2 py-1.5 text-gi-text flex items-center gap-2">
                        <span className="text-sm">👤</span>
                        <span className="capitalize">{id.replace(/-/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quests */}
              {selectedRegion.questIds.length > 0 && (
                <div>
                  <div className="text-[10px] text-gi-text-dim uppercase tracking-wider mb-1">
                    Missões disponíveis
                  </div>
                  <div className="text-xs text-gi-geo">
                    {selectedRegion.questIds.length} missão(ões)
                  </div>
                </div>
              )}

              {/* Connections */}
              <div>
                <div className="text-[10px] text-gi-text-dim uppercase tracking-wider mb-1">Conecta com</div>
                <div className="flex flex-wrap gap-1">
                  {selectedRegion.connections.map(connId => {
                    const conn = REGIONS.find(r => r.id === connId);
                    if (!conn) return null;
                    const connTheme = REGION_THEME_COLORS[connId];
                    return (
                      <button
                        key={connId}
                        onClick={() => setSelected(connId as RegionId)}
                        className="text-[10px] border px-2 py-0.5 rounded transition-colors hover:opacity-80"
                        style={{ borderColor: (connTheme?.accent ?? '#c9a86c') + '55', color: connTheme?.accent ?? '#c9a86c' }}
                      >
                        {conn.name.hanzi}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Travel button */}
            <div className="px-4 pb-4 pt-2 shrink-0">
              <div className="gi-divider mb-3" />
              {selected === currentRegion ? (
                <div className="gi-panel-inner text-center py-2 text-xs text-gi-anemo">
                  ✓ Você está aqui
                </div>
              ) : selectedRegion.hskRequired > hskLevel ? (
                <div className="gi-panel-inner text-center py-2 text-xs text-crimson-400">
                  🔒 Requer HSK{selectedRegion.hskRequired}
                </div>
              ) : (
                <motion.button
                  onClick={handleTravel}
                  disabled={traveling}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="gi-btn gi-btn-primary w-full py-2.5 text-sm disabled:opacity-50"
                >
                  {traveling ? '传送中...' : `传送 · Teleportar`}
                </motion.button>
              )}
            </div>
          </motion.div>
        ) : (
          /* No selection hint */
          <motion.div
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-52 flex items-center justify-center shrink-0 ml-2"
          >
            <div className="text-center text-gi-text-dim text-xs px-4">
              <div className="text-3xl mb-3 opacity-30">🗺️</div>
              Clique numa região para ver detalhes e viajar
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
