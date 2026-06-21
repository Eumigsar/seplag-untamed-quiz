'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Props {
  value: number;
  max: number;
  color?: 'jade' | 'blue' | 'gold' | 'red';
  label?: string;
  showNumbers?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const COLOR_MAP = {
  jade: { track: 'bg-jade-900', fill: 'bg-jade-500',  text: 'text-jade-300' },
  blue: { track: 'bg-blue-900', fill: 'bg-blue-500',  text: 'text-blue-300' },
  gold: { track: 'bg-gold-900', fill: 'bg-gold-500',  text: 'text-gold-300' },
  red:  { track: 'bg-red-900',  fill: 'bg-red-500',   text: 'text-red-300'  },
};

const SIZE_MAP = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export default function ProgressBar({
  value, max, color = 'jade', label, showNumbers = false, className, size = 'md',
}: Props) {
  const pct = Math.min(100, Math.max(0, (value / Math.max(max, 1)) * 100));
  const { track, fill, text } = COLOR_MAP[color];

  return (
    <div className={cn('w-full', className)}>
      {(label || showNumbers) && (
        <div className={cn('flex justify-between items-center mb-0.5', text)}>
          {label && <span className="text-xs font-medium">{label}</span>}
          {showNumbers && (
            <span className="text-xs tabular-nums">{value}/{max}</span>
          )}
        </div>
      )}
      <div className={cn('w-full rounded-full overflow-hidden', track, SIZE_MAP[size])}>
        <motion.div
          className={cn('h-full rounded-full', fill)}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
