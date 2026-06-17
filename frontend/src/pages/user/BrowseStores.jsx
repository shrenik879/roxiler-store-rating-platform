import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Store as StoreIcon, MapPin, Star } from 'lucide-react';
import { storeService } from '@/services/store.service';
import { ratingService } from '@/services/rating.service';
import { useDebounce } from '@/hooks/useDebounce';
import { PageHeader } from '@/components/PageHeader';
import { SearchBar } from '@/components/ui/SearchBar';
import { Select } from '@/components/ui/Select';
import { Pagination } from '@/components/ui/Pagination';
import { StarRating } from '@/components/ui/StarRating';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { extractError } from '@/services/axios';

export default function BrowseStores() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('name:ASC');
  const debouncedSearch = useDebounce(search);
  const [sortBy, sortOrder] = sort.split(':');

  const params = { page, limit: 9, search: debouncedSearch, sortBy, sortOrder };
  const queryKey = ['stores', 'browse', params];

  const { data, isLoading, isFetching } = useQuery({
    queryKey,
    queryFn: () => storeService.browse(params),
    placeholderData: keepPreviousData,
  });

  const mutation = useMutation({
    mutationFn: ({ store, value }) => ratingService.upsert(store.id, value, store.userRating != null),
    onMutate: async ({ store, value }) => {
      await qc.cancelQueries({ queryKey });
      const prev = qc.getQueryData(queryKey);
      qc.setQueryData(queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((s) => {
            if (s.id !== store.id) return s;
            const hadRating = s.userRating != null;
            const count = hadRating ? s.ratingCount : s.ratingCount + 1;
            const sumBefore = s.averageRating * s.ratingCount;
            const sumAfter = hadRating ? sumBefore - s.userRating + value : sumBefore + value;
            return {
              ...s,
              userRating: value,
              ratingCount: count,
              averageRating: Number((sumAfter / count).toFixed(2)),
            };
          }),
        };
      });
      return { prev };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKey, ctx.prev);
      toast.error(extractError(err).message);
    },
    onSuccess: () => toast.success('Rating saved'),
    onSettled: () => qc.invalidateQueries({ queryKey: ['stores', 'browse'] }),
  });

  return (
    <>
      <PageHeader title="Browse Stores" description="Find a store and rate your experience from 1 to 5 stars." />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search by name or address…"
          className="sm:max-w-sm"
        />
        <Select value={sort} onChange={(e) => setSort(e.target.value)} className="sm:w-56">
          <option value="name:ASC">Name (A–Z)</option>
          <option value="name:DESC">Name (Z–A)</option>
          <option value="createdAt:DESC">Newest first</option>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      ) : !data?.items.length ? (
        <div className="card">
          <EmptyState icon={StoreIcon} title="No stores found" description="Try a different search term." />
        </div>
      ) : (
        <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 ${isFetching ? 'opacity-70' : ''}`}>
          {data.items.map((store, i) => (
            <motion.div
              key={store.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.2) }}
              whileHover={{ y: -2 }}
              className="card flex flex-col gap-3 p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold">{store.name}</h3>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{store.address || 'No address'}</span>
                  </p>
                </div>
                <Badge tone="warning" className="shrink-0">
                  <Star className="mr-1 h-3 w-3 fill-warning" /> {store.averageRating || '—'}
                </Badge>
              </div>

              <div className="mt-auto border-t border-border pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">
                    {store.userRating != null ? 'Your rating' : 'Rate this store'}
                  </span>
                  <span className="text-xs text-muted">{store.ratingCount} ratings</span>
                </div>
                <div className="mt-1.5">
                  <StarRating
                    value={store.userRating || 0}
                    onChange={(value) => mutation.mutate({ store, value })}
                    disabled={mutation.isPending}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {data?.meta && <div className="card p-0"><Pagination meta={data.meta} onPageChange={setPage} /></div>}
    </>
  );
}
