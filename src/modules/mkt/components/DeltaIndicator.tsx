import React from 'react';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DeltaIndicatorProps {
  value: number;
  percent: number;
  isGoodWhenIncrease: boolean | null; // null if neutral (like total UID)
  compareLabel?: string;
}

export function DeltaIndicator({
  value,
  percent,
  isGoodWhenIncrease,
  compareLabel = 'so với hôm qua',
}: DeltaIndicatorProps) {
  const isIncrease = value > 0;
  const isDecrease = value < 0;
  const isNeutral = value === 0;

  let colorClass = 'text-[#72849a]'; // default neutral
  let Icon = Minus;

  if (isIncrease) {
    Icon = TrendingUp;
    if (isGoodWhenIncrease === true) colorClass = 'text-[#2dc56a]';
    else if (isGoodWhenIncrease === false) colorClass = 'text-[#ff6b72]';
    else colorClass = 'text-[#3e79f7]'; // neutral growth like total
  } else if (isDecrease) {
    Icon = TrendingDown;
    if (isGoodWhenIncrease === true) colorClass = 'text-[#ff6b72]';
    else if (isGoodWhenIncrease === false) colorClass = 'text-[#2dc56a]';
    else colorClass = 'text-[#3e79f7]';
  }

  const prefix = isIncrease ? '+' : isDecrease ? '' : ''; // negative value brings its own sign

  return (
    <div className={cn('flex items-center text-sm mt-1')}>
      <div className={cn('flex items-center font-medium mr-1.5', colorClass)}>
        <Icon className="w-4 h-4 mr-0.5" />
        <span>
          {prefix}
          {value} ({Math.abs(percent)}%)
        </span>
      </div>
      <span className="text-[#90a4ae] text-xs font-normal">{compareLabel}</span>
    </div>
  );
}
