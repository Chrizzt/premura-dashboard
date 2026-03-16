import type { LeaderboardEntry } from '../../types';
import { getAchievementColor } from '../../lib/calculations';
import ProgressBar from './ProgressBar';

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
  type: 'client' | 'agent';
}

const rankStyles: Record<number, { bg: string; border: string; label: string }> = {
  1: { bg: 'linear-gradient(135deg, #fbbf24, #f59e0b)', border: '#fbbf24', label: '1st' },
  2: { bg: 'linear-gradient(135deg, #94a3b8, #64748b)', border: '#94a3b8', label: '2nd' },
  3: { bg: 'linear-gradient(135deg, #cd7f32, #a0522d)', border: '#cd7f32', label: '3rd' },
};

export default function LeaderboardCard({ entry, type }: LeaderboardCardProps) {
  const isTopThree = entry.rank <= 3;
  const style = rankStyles[entry.rank];
  const achievementColor = getAchievementColor(entry.achievement);

  return (
    <div
      className={`dashboard-card p-4 transition-all duration-300 ${
        isTopThree ? 'hover:scale-[1.02]' : 'hover:border-cyan/30'
      }`}
      style={
        isTopThree
          ? {
              borderImage: `${style.bg} 1`,
              boxShadow: `0 4px 24px ${style.border}30`,
            }
          : undefined
      }
    >
      <div className="flex items-center gap-4">
        {/* Rank badge */}
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
            isTopThree ? 'text-white' : 'text-secondary'
          }`}
          style={
            isTopThree
              ? { background: style.bg }
              : { backgroundColor: 'rgba(255,255,255,0.06)' }
          }
        >
          {isTopThree ? style.label : `#${entry.rank}`}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-primary font-semibold truncate">{entry.name}</span>
            {type === 'agent' && entry.companyName && (
              <span className="pill-badge text-xs">{entry.companyName}</span>
            )}
          </div>
          <div className="mt-1.5">
            <ProgressBar percentage={entry.achievement} height={6} />
          </div>
        </div>

        {/* Stats */}
        <div className="flex-shrink-0 text-right">
          <div className="text-lg font-bold tabular-nums" style={{ color: achievementColor }}>
            {entry.achievement.toFixed(1)}%
          </div>
          <div className="text-xs text-secondary tabular-nums">
            {entry.appointments} appt{entry.appointments !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  );
}
