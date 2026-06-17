import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Plus, Download, Store as StoreIcon } from 'lucide-react';
import { storeService } from '@/services/store.service';
import { userService } from '@/services/user.service';
import { createStoreSchema } from '@/validations/schemas';
import { useDebounce } from '@/hooks/useDebounce';
import { useDownload } from '@/hooks/useDownload';
import { PageHeader } from '@/components/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { SearchBar } from '@/components/ui/SearchBar';
import { Pagination } from '@/components/ui/Pagination';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { ROLES } from '@/constants';
import { formatDate } from '@/utils/format';
import { extractError } from '@/services/axios';

const columns = [
  { key: 'name', header: 'Store', sortable: true, render: (s) => <span className="font-medium">{s.name}</span> },
  { key: 'email', header: 'Email', sortable: true, render: (s) => <span className="text-muted">{s.email}</span> },
  { key: 'address', header: 'Address', render: (s) => <span className="text-muted line-clamp-1 max-w-[220px]">{s.address || '—'}</span> },
  {
    key: 'averageRating',
    header: 'Rating',
    render: (s) => (
      <span className="text-warning">
        ★ {s.averageRating} <span className="text-muted">({s.ratingCount})</span>
      </span>
    ),
  },
  { key: 'owner', header: 'Owner', render: (s) => <span className="text-muted">{s.owner?.name?.split(' ').slice(0, 2).join(' ') || 'Unassigned'}</span> },
  { key: 'createdAt', header: 'Created', sortable: true, render: (s) => <span className="text-muted">{formatDate(s.createdAt)}</span> },
];

export default function ManageStores() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ sortBy: 'createdAt', sortOrder: 'DESC' });
  const [open, setOpen] = useState(false);
  const debouncedSearch = useDebounce(search);

  const params = { page, limit: 10, search: debouncedSearch, ...sort };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin', 'stores', params],
    queryFn: () => storeService.listAdmin(params),
    placeholderData: keepPreviousData,
  });

  const { download, downloading } = useDownload(() => storeService.exportCSV({ search: debouncedSearch }), 'stores.csv');

  const handleSort = (key) =>
    setSort((s) => ({ sortBy: key, sortOrder: s.sortBy === key && s.sortOrder === 'ASC' ? 'DESC' : 'ASC' }));

  return (
    <>
      <PageHeader
        title="Store Management"
        description="Register stores and link them to owner accounts."
        actions={
          <>
            <Button variant="secondary" onClick={download} loading={downloading}>
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> Add Store
            </Button>
          </>
        }
      />

      <SearchBar
        value={search}
        onChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        placeholder="Search by name or address…"
        className="sm:max-w-sm"
      />

      <div className={isFetching ? 'opacity-70 transition-opacity' : ''}>
        <DataTable
          columns={columns}
          rows={data?.items}
          loading={isLoading}
          sort={sort}
          onSort={handleSort}
          emptyState={<EmptyState icon={StoreIcon} title="No stores found" />}
        />
        {data?.meta && <Pagination meta={data.meta} onPageChange={setPage} />}
      </div>

      <CreateStoreModal open={open} onClose={() => setOpen(false)} onCreated={() => qc.invalidateQueries({ queryKey: ['admin'] })} />
    </>
  );
}

function CreateStoreModal({ open, onClose, onCreated }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(createStoreSchema) });

  const { data: owners } = useQuery({
    queryKey: ['admin', 'users', 'owners-for-store'],
    queryFn: () => userService.list({ role: ROLES.STORE_OWNER, limit: 100 }),
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: storeService.create,
    onSuccess: () => {
      toast.success('Store created');
      reset();
      onCreated();
      onClose();
    },
    onError: (err) => toast.error(extractError(err).message),
  });

  const availableOwners = (owners?.items || []).filter((o) => !o.ownedStore);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create store"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit((v) => mutation.mutate(v))} loading={mutation.isPending}>
            Create
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit((v) => mutation.mutate(v))}>
        <Input id="cs-name" label="Store name" error={errors.name?.message} {...register('name')} />
        <Input id="cs-email" label="Email" type="email" error={errors.email?.message} {...register('email')} />
        <Input id="cs-address" label="Address" error={errors.address?.message} {...register('address')} />
        <Select id="cs-owner" label="Owner (optional)" error={errors.ownerId?.message} {...register('ownerId')}>
          <option value="">Unassigned</option>
          {availableOwners.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name} · {o.email}
            </option>
          ))}
        </Select>
      </form>
    </Modal>
  );
}
