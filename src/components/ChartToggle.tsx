'use client';

import { ChartType } from '@/types';
import { analytics } from '@/lib/analytics';

interface ChartToggleProps {
  chartType: ChartType;
  onToggle: (type: ChartType) => void;
}

export default function ChartToggle({ chartType, onToggle }: ChartToggleProps) {
  const handleToggle = (type: ChartType) => {
    onToggle(type);
    analytics.chartToggled(type);
  };

  return (
    <div className="flex gap-2 p-1 bg-white/10 rounded-lg">
      <button
        onClick={() => handleToggle('bar')}
        className={`
          px-4 py-2 rounded-md text-sm font-medium transition-all
          ${chartType === 'bar'
            ? 'bg-white/20 text-white shadow-sm'
            : 'text-white/70 hover:text-white hover:bg-white/10'
          }
        `}
      >
        Bar Chart
      </button>
      <button
        onClick={() => handleToggle('pie')}
        className={`
          px-4 py-2 rounded-md text-sm font-medium transition-all
          ${chartType === 'pie'
            ? 'bg-white/20 text-white shadow-sm'
            : 'text-white/70 hover:text-white hover:bg-white/10'
          }
        `}
      >
        Pie Chart
      </button>
    </div>
  );
}
