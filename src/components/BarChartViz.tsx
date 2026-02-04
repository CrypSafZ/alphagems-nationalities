'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { CountryCount } from '@/types';
import { getCountryByCode } from '@/lib/countries';

interface BarChartVizProps {
  data: CountryCount[];
}

const COLORS = [
  '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe',
  '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff',
];

export default function BarChartViz({ data }: BarChartVizProps) {
  const chartData = data.slice(0, 10).map((item) => {
    const country = getCountryByCode(item.country_code);
    return {
      name: country ? `${country.flag} ${item.country_name}` : item.country_name,
      count: item.count,
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
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
      >
        <XAxis type="number" stroke="#fff" opacity={0.7} />
        <YAxis
          type="category"
          dataKey="name"
          stroke="#fff"
          opacity={0.7}
          width={90}
          tick={{ fill: '#fff', fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            color: '#fff',
          }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
