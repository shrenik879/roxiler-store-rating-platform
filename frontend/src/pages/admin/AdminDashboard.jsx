import { useQuery } from '@tanstack/react-query';
import { Users, Store, Star, Activity } from 'lucide-react';
import { dashboardService } from '@/services/dashboard.service';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { Card, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { RatingsGrowthChart } from '@/components/charts/RatingsGrowthChart';
import { UsersByRoleChart } from '@/components/charts/UsersByRoleChart';
import { formatRelative, humanizeAction } from '@/utils/format';

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: dashboardService.adminStats,
  });

  return (
    <>
      <PageHeader title="Dashboard" description="Platform overview and analytics." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : (
          <>
            <StatCard label="Total Users" value={data.totals.users} icon={Users} tone="primary" index={0} />
            <StatCard label="Total Stores" value={data.totals.stores} icon={Store} tone="warning" index={1} />
            <StatCard label="Total Ratings" value={data.totals.ratings} icon={Star} tone="success" index={2} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Ratings growth" subtitle="Daily ratings submitted (last 14 days)" />
          {isLoading ? <Skeleton className="h-[260px]" /> : <RatingsGrowthChart data={data.ratingsGrowth} />}
        </Card>
        <Card>
          <CardHeader title="Users by role" />
          {isLoading ? <Skeleton className="h-[260px]" /> : <UsersByRoleChart data={data.usersByRole} />}
        </Card>
      </div>

      <Card>
        <CardHeader title="Recent activity" subtitle="Latest actions across the platform" />
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        ) : data.recentActivity.length ? (
          <ul className="space-y-1">
            {data.recentActivity.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-4 rounded-lg px-2 py-2.5 hover:bg-white/[0.02]"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-1.5">
                    <Activity className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm">{a.description || humanizeAction(a.action)}</p>
                    <p className="text-xs text-muted">{a.actorName}</p>
                  </div>
                </div>
                <span className="text-xs text-muted">{formatRelative(a.createdAt)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={Activity} title="No activity yet" />
        )}
      </Card>
    </>
  );
}
