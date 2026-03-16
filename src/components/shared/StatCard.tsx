import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: { value: number; label: string };
  accentColor?: string;
}

export default function StatCard({ title, value, subtitle, icon, trend, accentColor }: StatCardProps) {
  return (
    <div className="dashboard-card p-5 flex flex-col gap-2 group hover:border-cyan/30 transition-all duration-300">
      <div className="flex items-center justify-between">
        <span className="text-secondary text-sm font-medium">{title}</span>
        {icon && (
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: accentColor ? `${accentColor}18` : 'rgba(0,212,255,0.1)' }}
          >
            {icon}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-primary tabular-nums tracking-tight">
        {value}
      </div>
      {(subtitle || trend) && (
        <div className="flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={`font-medium ${trend.value >= 0 ? 'text-green-400' : 'text-red-400'}`}
            >
              {trend.value >= 0 ? '+' : ''}
              {trend.value.toFixed(1)}%
            </span>
          )}
          {subtitle && <span className="text-secondary">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
