import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Star, Users, MessageSquare, Download } from 'lucide-react';
import { ownerService } from '@/services/dashboard.service';
import { useDownload } from '@/hooks/useDownload';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { Card, CardHeader } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { Button } from '@/components/ui/Button';
import { StarRating } from '@/components/ui/StarRating';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDateTime } from '@/utils/format';

const raterColumns = [
  { key: 'user', header: 'User', render: (r) => <span className="font-medium">{r.user?.name}</span> },
  { key: 'email', header: 'Email', render: (r) => <span className="text-muted">{r.user?.email}</span> },
  { key: 'rating', header: 'Rating', sortable: true, render: (r) => <StarRating value={r.rating} readOnly size="sm" /> },
  { key: 'createdAt', header: 'Rated', sortable: true, render: (r) => <span className="text-muted">{formatDateTime(r.createdAt)}</span> },
];

export default function OwnerDashboard() {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ sortBy: 'createdAt', sortOrder: 'DESC' });

  const { data, isLoading, error } = useQuery({
    queryKey: ['owner', 'dashboard'],
    queryFn: ownerService.dashboard,
    retry: false,
  });

  const ratersParams = { page, limit: 10, ...sort };
  const { data: raters, isLoading: ratersLoading, isFetching } = useQuery({
    queryKey: ['owner', 'raters', ratersParams],
    queryFn: () => ownerService.raters(ratersParams),
    placeholderData: keepPreviousData,
    enabled: !error,
  });

  const { download, downloading } = useDownload(ownerService.exportRaters, 'store-ratings.csv');

  const handleSort = (key) =>
    setSort((s) => ({ sortBy: key, sortOrder: s.sortBy === key && s.sortOrder === 'ASC' ? 'DESC' : 'ASC' }));

  if (error) {
    return (
      <>
        <PageHeader title="My Store" />
        <Card>
          <EmptyState
            icon={Star}
            title="No store linked yet"
            description="An administrator hasn't linked a store to your account. Please check back later."
          />
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={isLoading ? 'My Store' : data.store.name}
        description={isLoading ? undefined : data.store.address}
        actions={
          <Button variant="secondary" onClick={download} loading={downloading}>
            <Download className="h-4 w-4" /> Export ratings
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : (
          <>
            <StatCard label="Average Rating" value={`${data.stats.averageRating} ★`} icon={Star} tone="warning" index={0} />
            <StatCard label="Total Ratings" value={data.stats.totalRatings} icon={MessageSquare} tone="primary" index={1} />
            <StatCard label="Unique Raters" value={data.stats.uniqueUsers} icon={Users} tone="success" index={2} />
          </>
        )}
      </div>

      <Card className="p-0">
        <div className="p-5 pb-0">
          <CardHeader title="Users who rated your store" subtitle="Everyone who has submitted a rating" />
        </div>
        <div className={isFetching ? 'opacity-70' : ''}>
          <DataTable
            columns={raterColumns}
            rows={raters?.items}
            loading={ratersLoading}
            sort={sort}
            onSort={handleSort}
            emptyState={<EmptyState icon={Users} title="No ratings yet" description="Your store hasn't been rated yet." />}
          />
          {raters?.meta && <Pagination meta={raters.meta} onPageChange={setPage} />}
        </div>
      </Card>
    </>
  );
}
