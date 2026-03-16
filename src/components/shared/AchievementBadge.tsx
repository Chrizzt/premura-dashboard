import { getAchievementColor, getAchievementTier } from '../../lib/calculations';

interface AchievementBadgeProps {
  percentage: number;
  size?: 'sm' | 'md';
}

const tierLabels = {
  blue: 'Above Target',
  green: 'On Track',
  yellow: 'At Risk',
  red: 'Below Target',
};

export default function AchievementBadge({ percentage, size = 'sm' }: AchievementBadgeProps) {
  const color = getAchievementColor(percentage);
  const tier = getAchievementTier(percentage);

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      }`}
      style={{
        color,
        backgroundColor: `${color}18`,
        border: `1px solid ${color}40`,
      }}
    >
      {tierLabels[tier]}
    </span>
  );
}
