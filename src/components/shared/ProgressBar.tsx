import { getAchievementColor } from '../../lib/calculations';

interface ProgressBarProps {
  percentage: number;
  height?: number;
  showLabel?: boolean;
}

export default function ProgressBar({ percentage, height = 8, showLabel = true }: ProgressBarProps) {
  const color = getAchievementColor(percentage);
  const clampedWidth = Math.min(percentage, 100);

  return (
    <div className="flex items-center gap-3 w-full">
      <div
        className="flex-1 rounded-full overflow-hidden"
        style={{ height, backgroundColor: 'rgba(255,255,255,0.08)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${clampedWidth}%`,
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
            boxShadow: `0 0 8px ${color}66`,
          }}
        />
      </div>
      {showLabel && (
        <span
          className="text-sm font-semibold tabular-nums min-w-[48px] text-right"
          style={{ color }}
        >
          {percentage.toFixed(1)}%
        </span>
      )}
    </div>
  );
}
