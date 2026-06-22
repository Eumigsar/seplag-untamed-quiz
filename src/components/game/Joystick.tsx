'use client';

import { useEffect, useRef, useState } from 'react';
import { Bus } from '@/game/EventBus';

export default function Joystick() {
  const [mobile, setMobile] = useState(false);
  const [active, setActive] = useState(false);
  const base = useRef<HTMLDivElement>(null);
  const thumb = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobile('ontouchstart' in window);
  }, []);

  if (!mobile) return null;

  const onMove = (e: React.TouchEvent) => {
    if (!active || !base.current || !thumb.current) return;
    const t = e.touches[0];
    const r = base.current.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const dx = t.clientX - cx, dy = t.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const max = r.width / 2;
    const angle = Math.atan2(dy, dx);
    const clamped = Math.min(dist, max);
    thumb.current.style.transform = `translate(${Math.cos(angle) * clamped}px, ${Math.sin(angle) * clamped}px)`;
    Bus.emit('input-joy', { x: Math.cos(angle) * (clamped / max), y: Math.sin(angle) * (clamped / max) });
  };

  const onEnd = () => {
    setActive(false);
    if (thumb.current) thumb.current.style.transform = 'translate(0,0)';
    Bus.emit('input-joy', { x: 0, y: 0 });
  };

  return (
    <div className="fixed bottom-16 left-10 pointer-events-auto"
      ref={base}
      onTouchStart={() => setActive(true)}
      onTouchMove={onMove}
      onTouchEnd={onEnd}
    >
      <div className="w-28 h-28 rounded-full bg-gold/10 border-2 border-gold/30 flex items-center justify-center touch-none">
        <div ref={thumb} className="w-12 h-12 rounded-full bg-gold/50 border border-gold shadow-[0_0_12px_#D4AF37] transition-[box-shadow]" />
      </div>
    </div>
  );
}
