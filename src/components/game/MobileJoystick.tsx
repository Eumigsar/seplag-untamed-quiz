'use client';

import { useEffect, useRef, useState } from 'react';
import { EventBus } from '@/game/EventBus';

export default function MobileJoystick() {
  const [isMobile, setIsMobile] = useState(false);
  const joystickRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!active || !joystickRef.current || !thumbRef.current) return;
    const touch = e.touches[0];
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const diffX = touch.clientX - centerX;
    const diffY = touch.clientY - centerY;
    const distance = Math.sqrt(diffX * diffX + diffY * diffY);
    const maxRadius = rect.width / 2;
    const angle = Math.atan2(diffY, diffX);
    const clampedDist = Math.min(distance, maxRadius);
    thumbRef.current.style.transform = `translate(${Math.cos(angle) * clampedDist}px, ${Math.sin(angle) * clampedDist}px)`;
    EventBus.emit('input-move', { x: Math.cos(angle) * (clampedDist / maxRadius), y: Math.sin(angle) * (clampedDist / maxRadius) });
  };

  const handleTouchEnd = () => {
    setActive(false);
    if (thumbRef.current) thumbRef.current.style.transform = 'translate(0, 0)';
    EventBus.emit('input-move', { x: 0, y: 0 });
  };

  if (!isMobile) return null;

  return (
    <div className="fixed bottom-12 left-12 w-32 h-32 bg-black/40 border-2 border-jade/30 rounded-full pointer-events-auto flex items-center justify-center touch-none" ref={joystickRef} onTouchStart={() => setActive(true)} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      <div className="w-12 h-12 bg-jade/60 rounded-full shadow-lg" ref={thumbRef} />
    </div>
  );
}
