'use client';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { usePlayerStore } from '@/store/playerStore';
import { REGIONS } from '@/data/maps/regions';
import { cn } from '@/lib/utils';

const REGION_EMOJI: Record<string, string> = {
  'bambu-village':              '🎋',
  'silk-market':                '🏮',
  'lantern-valley':             '🏔️',
  'golden-cloud-monastery':     '⛩️',
  'celestial-dragon-mountains': '🐉',
  'jade-imperial-city':         '🏯',
};

export default function MapPanel() {
  const { setActivePanel, currentRegion } = useGameStore();
  const { character } = usePlayerStore();

  if (!character) return null;

  const hskLevel = character.hskLevel;

  return (
    <motion.div
      initial={{ scale: 0.94, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.94, opacity: 0 }}
      transition={{ type: 'spring', damping: 22, stiffness: 260 }}
      className="fixed inset-4 md:inset-16 z-40 gi-panel flex flex-col"
    >
      <div className="gi-corner-tr" /><div className="gi-corner-bl" />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(201,168,108,0.18)]">
        <h2 className="font-chinese text-gi-geo text-xl text-shadow-gold">地图 · Mapa do Mundo</h2>
        <button onClick={() => setActivePanel('none')} className="text-gi-text-dim hover:text-gi-text text-lg transition-colors">✕</button>
      </div>

      {/* Map SVG */}
      <div className="flex-1 relative overflow-hidden p-4">
        <svg viewBox="0 0 900 600" className="w-full h-full">
          <rect width="900" height="600" fill="#050810" rx="4" />
          <rect width="900" height="600" fill="url(#mapgrid)" rx="4" opacity="0.25" />
          <defs>
            <pattern id="mapgrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e2558" strokeWidth="0.5" />
            </pattern>
          </defs>

          {/* Connection lines */}
          {REGIONS.map(region =>
            region.connections.map(connId => {
              const conn = REGIONS.find(r => r.id === connId);
              if (!conn) return null;
              const unlocked = region.hskRequired <= hskLevel && conn.hskRequired <= hskLevel;
              return (
                <line
                  key={`${region.id}-${connId}`}
                  x1={region.mapPosition.x} y1={region.mapPosition.y}
                  x2={conn.mapPosition.x}   y2={conn.mapPosition.y}
                  stroke={unlocked ? 'rgba(201,168,108,0.5)' : 'rgba(30,37,88,0.8)'}
                  strokeWidth="1.5"
                  strokeDasharray={unlocked ? 'none' : '6,4'}
                />
              );
            })
          )}

          {/* Region nodes */}
          {REGIONS.map(region => {
            const isUnlocked = region.hskRequired <= hskLevel;
            const isCurrent  = region.id === currentRegion;
            const { x, y }   = region.mapPosition;

            return (
              <g key={region.id}>
                {isCurrent && (
                  <circle cx={x} cy={y} r="28" fill="rgba(201,168,108,0.15)">
                    <animate attributeName="r"       values="26;32;26" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle
                  cx={x} cy={y} r="22"
                  fill={isCurrent ? 'rgba(201,168,108,0.18)' : isUnlocked ? 'rgba(14,18,48,0.9)' : 'rgba(5,8,20,0.9)'}
                  stroke={isCurrent ? 'rgba(201,168,108,0.9)' : isUnlocked ? 'rgba(116,212,168,0.6)' : 'rgba(30,37,88,0.7)'}
                  strokeWidth={isCurrent ? 2.5 : 1.5}
                />
                <text x={x} y={y + 6} textAnchor="middle" fontSize="16" opacity={isUnlocked ? 1 : 0.25}>
                  {REGION_EMOJI[region.id] ?? '📍'}
                </text>
                {!isUnlocked && (
                  <text x={x + 16} y={y - 12} fontSize="12" opacity="0.6">🔒</text>
                )}
                <text x={x} y={y + 36} textAnchor="middle" fontSize="11"
                  fill={isCurrent ? '#c9a86c' : isUnlocked ? '#e0c07a' : '#2d3a6a'}
                  fontFamily="serif"
                >
                  {region.name.hanzi}
                </text>
                <text x={x} y={y + 48} textAnchor="middle" fontSize="9"
                  fill={isUnlocked ? '#98aad0' : '#1e2558'}
                >
                  HSK{region.hskRequired}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Region legend */}
      <div className="border-t border-[rgba(201,168,108,0.18)] p-4">
        <div className="grid grid-cols-2 gap-2">
          {REGIONS.map(region => {
            const isUnlocked = region.hskRequired <= hskLevel;
            const isCurrent  = region.id === currentRegion;
            return (
              <div
                key={region.id}
                className={cn(
                  'flex items-center gap-2 p-2 rounded border text-xs transition-all',
                  isCurrent
                    ? 'border-[rgba(201,168,108,0.6)] bg-[rgba(201,168,108,0.08)]'
                    : isUnlocked
                      ? 'border-[rgba(116,212,168,0.25)] bg-[rgba(5,8,20,0.5)]'
                      : 'border-[rgba(30,37,88,0.5)] bg-[rgba(5,8,20,0.3)] opacity-40',
                )}
              >
                <span className="text-base">{REGION_EMOJI[region.id]}</span>
                <div className="min-w-0">
                  <div className={cn('font-chinese truncate', isCurrent ? 'text-gi-geo' : 'text-gi-text')}>
                    {region.name.hanzi}
                  </div>
                  <div className="text-gi-text-dim">HSK{region.hskRequired}</div>
                </div>
                {isCurrent && <span className="ml-auto text-gi-geo shrink-0">◆</span>}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
