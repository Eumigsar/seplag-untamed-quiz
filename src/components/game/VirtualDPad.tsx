'use client';
import { useRef, useCallback, useEffect, useState } from 'react';

const DEAD_ZONE = 8;   // px — movement threshold before registering input
const RADIUS    = 44;  // px — max nub travel distance from center

function dispatchInput(x: number, y: number) {
  window.dispatchEvent(new CustomEvent('phaser-virtual-input', { detail: { x, y } }));
}

export default function VirtualDPad() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [nubPos, setNubPos] = useState({ x: 0, y: 0 });
  const baseRef   = useRef<HTMLDivElement>(null);
  const activeRef = useRef<number | null>(null); // touch identifier

  useEffect(() => {
    setIsTouchDevice(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  const getCenter = () => {
    const el = baseRef.current;
    if (!el) return { cx: 0, cy: 0 };
    const r = el.getBoundingClientRect();
    return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const t = e.changedTouches[0];
    activeRef.current = t.identifier;
    const { cx, cy } = getCenter();
    const dx = t.clientX - cx;
    const dy = t.clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist < DEAD_ZONE) { setNubPos({ x: 0, y: 0 }); return; }
    const clamped = Math.min(dist, RADIUS);
    const nx = (dx / dist) * clamped;
    const ny = (dy / dist) * clamped;
    setNubPos({ x: nx, y: ny });
    dispatchInput(dx / Math.max(dist, 1), dy / Math.max(dist, 1));
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const t = Array.from(e.changedTouches).find(tt => tt.identifier === activeRef.current);
    if (!t) return;
    const { cx, cy } = getCenter();
    const dx = t.clientX - cx;
    const dy = t.clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist < DEAD_ZONE) {
      setNubPos({ x: 0, y: 0 });
      dispatchInput(0, 0);
      return;
    }
    const clamped = Math.min(dist, RADIUS);
    const nx = (dx / dist) * clamped;
    const ny = (dy / dist) * clamped;
    setNubPos({ x: nx, y: ny });
    dispatchInput(dx / Math.max(dist, 1), dy / Math.max(dist, 1));
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const released = Array.from(e.changedTouches).some(t => t.identifier === activeRef.current);
    if (released) {
      activeRef.current = null;
      setNubPos({ x: 0, y: 0 });
      dispatchInput(0, 0);
    }
  }, []);

  if (!isTouchDevice) return null;

  return (
    <div
      className="fixed z-40 select-none"
      style={{ bottom: 'max(96px, env(safe-area-inset-bottom, 0px) + 96px)', left: 20 }}
    >
      {/* Outer ring */}
      <div
        ref={baseRef}
        className="relative rounded-full border-2 border-gold-600/50 bg-ink-900/60 backdrop-blur-sm"
        style={{ width: 100, height: 100 }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        {/* Cardinal indicators */}
        <span className="absolute top-1.5 left-1/2 -translate-x-1/2 text-[10px] text-gold-400/60">↑</span>
        <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[10px] text-gold-400/60">↓</span>
        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[10px] text-gold-400/60">←</span>
        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-gold-400/60">→</span>

        {/* Nub */}
        <div
          className="absolute rounded-full bg-gold-500/80 border border-gold-300/60 shadow-lg"
          style={{
            width: 36, height: 36,
            top:  '50%', left: '50%',
            transform: `translate(calc(-50% + ${nubPos.x}px), calc(-50% + ${nubPos.y}px))`,
            transition: nubPos.x === 0 && nubPos.y === 0 ? 'transform 0.15s ease-out' : 'none',
          }}
        />
      </div>
    </div>
  );
}
