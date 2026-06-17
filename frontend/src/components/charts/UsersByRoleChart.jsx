import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ROLE_LABELS } from '@/constants';
import { EmptyState } from '@/components/ui/EmptyState';
import { Users } from 'lucide-react';

const COLORS = { ADMIN: '#7C3AED', STORE_OWNER: '#EAB308', USER: '#22C55E' };

export function UsersByRoleChart({ data = [] }) {
  if (!data.length) return <EmptyState icon={Users} title="No users yet" />;

  const chartData = data.map((d) => ({ ...d, label: ROLE_LABELS[d.role] || d.role }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="count"
          nameKey="label"
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          stroke="none"
        >
          {chartData.map((entry) => (
            <Cell key={entry.role} fill={COLORS[entry.role] || '#A1A1AA'} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: '#18181B', border: '1px solid #27272A', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: '#FAFAFA' }}
        />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          formatter={(value) => <span style={{ color: '#A1A1AA', fontSize: 12 }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
