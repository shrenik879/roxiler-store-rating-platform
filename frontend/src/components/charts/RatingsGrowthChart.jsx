import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { formatDate } from '@/utils/format';
import { EmptyState } from '@/components/ui/EmptyState';
import { TrendingUp } from 'lucide-react';

export function RatingsGrowthChart({ data = [] }) {
  if (!data.length) {
    return <EmptyState icon={TrendingUp} title="No rating activity yet" />;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="ratingFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(d) => formatDate(d).replace(/,.*/, '')}
          stroke="#A1A1AA"
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <YAxis stroke="#A1A1AA" fontSize={11} allowDecimals={false} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            background: '#18181B',
            border: '1px solid #27272A',
            borderRadius: 8,
            fontSize: 12,
          }}
          labelFormatter={(d) => formatDate(d)}
          labelStyle={{ color: '#FAFAFA' }}
        />
        <Area
          type="monotone"
          dataKey="count"
          name="Ratings"
          stroke="#7C3AED"
          strokeWidth={2}
          fill="url(#ratingFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
