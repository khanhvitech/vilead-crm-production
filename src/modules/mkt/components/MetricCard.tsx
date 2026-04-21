import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { DeltaIndicator } from './DeltaIndicator';

export interface MetricCardProps {
  label: string;
  value: number | string;
  icon?: LucideIcon;
  delta?: { value: number; percent: number; isGoodWhenIncrease: boolean | null };
  onClick?: () => void;
  className?: string;
}

export function MetricCard({ label, value, icon: Icon, delta, onClick, className }: MetricCardProps) {
  return (
    <Card
      className={`p-6 bg-white border border-[#e6ebf1] rounded-[10px] ${
        onClick ? 'cursor-pointer hover:shadow-lg transition-all 0.3s' : ''
      } ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-bold text-[#72849a] uppercase tracking-wide">
          {label}
        </h3>
        {Icon && <Icon className="w-5 h-5 text-[#3e79f7]" />}
      </div>
      <div className="mt-4">
        <span className="text-[28px] font-bold text-[#1a3353]">{value}</span>
      </div>
      {delta && (
        <DeltaIndicator
          value={delta.value}
          percent={delta.percent}
          isGoodWhenIncrease={delta.isGoodWhenIncrease}
        />
      )}
    </Card>
  );
}
