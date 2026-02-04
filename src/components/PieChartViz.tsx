'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { CountryCount } from '@/types';
import { getCountryByCode } from '@/lib/countries';

interface PieChartVizProps {
  data: CountryCount[];
}

const COLORS = [
  '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe',
  '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe',
  '#4f46e5', '#7c3aed',
];

export default function PieChartViz({ data }: PieChartVizProps) {
  const chartData = data.slice(0, 10).map((item) => {
    const country = getCountryByCode(item.country_code);
    return {
      name: country ? `${country.flag} ${item.country_name}` : item.country_name,
      value: item.count,
    };
  });

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-white/60">
        No data yet. Be the first to submit!
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
          labelLine={{ stroke: '#fff', strokeOpacity: 0.5 }}
        >
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            color: '#fff',
          }}
        />
        <Legend
          wrapperStyle={{ color: '#fff' }}
          formatter={(value) => <span style={{ color: '#fff' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
