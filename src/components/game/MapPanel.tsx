'use client';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { usePlayerStore } from '@/store/playerStore';
import { REGIONS } from '@/data/maps/regions';
import { cn } from '@/lib/utils';

const REGION_EMOJI: Record<string, string> = {
  'bambu-village': '🎋',
  'silk-market': '🏮',
  'lantern-valley': '🏔️',
  'golden-cloud-monastery': '⛩️',
  'celestial-dragon-mountains': '🐉',
  'jade-imperial-city': '🏯',
};

export default function MapPanel() {
  const { setActivePanel, currentRegion } = useGameStore();
  const { character } = usePlayerStore();

  if (!character) return null;

  const hskLevel = character.hskLevel;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="fixed inset-4 md:inset-16 z-40 bg-ink-900/98 border border-gold-700/40 rounded-xl
                 shadow-2xl backdrop-blur-sm flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gold-700/30">
        <h2 className="font-chinese text-gold-300 text-xl">地图 · Mapa do Mundo</h2>
        <button onClick={() => setActivePanel('none')} className="text-gray-400 hover:text-white text-xl">✕</button>
      </div>

      {/* Map SVG area */}
      <div className="flex-1 relative overflow-hidden p-4">
        <svg viewBox="0 0 900 600" className="w-full h-full">
          {/* Background */}
          <rect width="900" height="600" fill="#0d1117" rx="8" />
          <rect width="900" height="600" fill="url(#mapgrid)" rx="8" opacity="0.3" />
          <defs>
            <pattern id="mapgrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2d3748" strokeWidth="0.5" />
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
                  x1={region.mapPosition.x}
                  y1={region.mapPosition.y}
                  x2={conn.mapPosition.x}
                  y2={conn.mapPosition.y}
                  stroke={unlocked ? '#b8860b' : '#374151'}
                  strokeWidth="2"
                  strokeDasharray={unlocked ? 'none' : '6,4'}
                  opacity="0.6"
                />
              );
            })
          )}

          {/* Region nodes */}
          {REGIONS.map(region => {
            const isUnlocked = region.hskRequired <= hskLevel;
            const isCurrent = region.id === currentRegion;
            const { x, y } = region.mapPosition;

            return (
              <g key={region.id}>
                {/* Glow for current */}
                {isCurrent && (
                  <circle cx={x} cy={y} r="28" fill="#b8860b" opacity="0.2">
                    <animate attributeName="r" values="26;32;26" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.2;0.4;0.2" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Node circle */}
                <circle
                  cx={x}
                  cy={y}
                  r="22"
                  fill={isCurrent ? '#854d0e' : isUnlocked ? '#1c2a1e' : '#111827'}
                  stroke={isCurrent ? '#fbbf24' : isUnlocked ? '#4a7c59' : '#374151'}
                  strokeWidth={isCurrent ? 2.5 : 1.5}
                />

                {/* Emoji */}
                <text x={x} y={y + 6} textAnchor="middle" fontSize="16" opacity={isUnlocked ? 1 : 0.3}>
                  {REGION_EMOJI[region.id] ?? '📍'}
                </text>

                {/* Lock icon */}
                {!isUnlocked && (
                  <text x={x + 16} y={y - 12} fontSize="12" opacity="0.7">🔒</text>
                )}

                {/* Name label */}
                <text
                  x={x}
                  y={y + 36}
                  textAnchor="middle"
                  fontSize="11"
                  fill={isCurrent ? '#fbbf24' : isUnlocked ? '#d4af37' : '#4b5563'}
                  fontFamily="serif"
                >
                  {region.name.hanzi}
                </text>
                <text
                  x={x}
                  y={y + 48}
                  textAnchor="middle"
                  fontSize="9"
                  fill={isUnlocked ? '#6b7280' : '#374151'}
                >
                  HSK{region.hskRequired}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Region list */}
      <div className="border-t border-gold-700/30 p-4">
        <div className="grid grid-cols-2 gap-2">
          {REGIONS.map(region => {
            const isUnlocked = region.hskRequired <= hskLevel;
            const isCurrent = region.id === currentRegion;
            return (
              <div
                key={region.id}
                className={cn(
                  'flex items-center gap-2 p-2 rounded border text-xs',
                  isCurrent ? 'border-gold-500 bg-gold-900/30' :
                  isUnlocked ? 'border-jade-700/40 bg-ink-800/40' :
                  'border-gray-700/30 bg-ink-800/20 opacity-50'
                )}
              >
                <span className="text-base">{REGION_EMOJI[region.id]}</span>
                <div className="min-w-0">
                  <div className={cn('font-chinese truncate', isCurrent ? 'text-gold-300' : 'text-parchment-300')}>
                    {region.name.hanzi}
                  </div>
                  <div className="text-gray-500">HSK{region.hskRequired}</div>
                </div>
                {isCurrent && <span className="ml-auto text-gold-400 shrink-0">◆</span>}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
