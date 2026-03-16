import { Search } from 'lucide-react';
import type { AchievementTier } from '../../types';

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  achievementFilter: AchievementTier;
  onAchievementFilterChange: (tier: AchievementTier) => void;
  extraFilters?: React.ReactNode;
}

const tiers: { value: AchievementTier; label: string; color: string }[] = [
  { value: 'all', label: 'All', color: '#e2e8f0' },
  { value: 'blue', label: '100%+', color: '#00d4ff' },
  { value: 'green', label: '85-100%', color: '#22c55e' },
  { value: 'yellow', label: '60-84%', color: '#eab308' },
  { value: 'red', label: '<60%', color: '#ef4444' },
];

export default function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  achievementFilter,
  onAchievementFilterChange,
  extraFilters,
}: FilterBarProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap mb-4">
      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="input-field pl-8 text-sm w-56"
        />
      </div>

      {/* Achievement tier pills */}
      <div className="flex items-center gap-1">
        {tiers.map((tier) => (
          <button
            key={tier.value}
            onClick={() => onAchievementFilterChange(tier.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
              achievementFilter === tier.value
                ? 'text-white'
                : 'text-secondary hover:text-primary'
            }`}
            style={
              achievementFilter === tier.value
                ? {
                    backgroundColor: `${tier.color}25`,
                    border: `1px solid ${tier.color}50`,
                    color: tier.color,
                  }
                : { border: '1px solid rgba(255,255,255,0.06)' }
            }
          >
            {tier.label}
          </button>
        ))}
      </div>

      {extraFilters}
    </div>
  );
}
