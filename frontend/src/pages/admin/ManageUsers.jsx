import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Plus, Download, UserPlus } from 'lucide-react';
import { userService } from '@/services/user.service';
import { createUserSchema } from '@/validations/schemas';
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
import { RoleBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ROLES, ROLE_LABELS } from '@/constants';
import { formatDate } from '@/utils/format';
import { extractError } from '@/services/axios';

const columns = () => [
  { key: 'name', header: 'Name', sortable: true, render: (u) => <span className="font-medium">{u.name}</span> },
  { key: 'email', header: 'Email', sortable: true, render: (u) => <span className="text-muted">{u.email}</span> },
  {
    key: 'address',
    header: 'Address',
    render: (u) => <span className="text-muted line-clamp-1 max-w-[220px]">{u.address || '—'}</span>,
  },
  { key: 'role', header: 'Role', sortable: true, render: (u) => <RoleBadge role={u.role} /> },
  {
    key: 'rating',
    header: 'Store Rating',
    render: (u) =>
      u.role === ROLES.STORE_OWNER ? (
        u.ownerStoreAvgRating != null ? (
          <span className="text-warning">★ {u.ownerStoreAvgRating}</span>
        ) : (
          <span className="text-muted">No ratings</span>
        )
      ) : (
        <span className="text-muted">—</span>
      ),
  },
  { key: 'createdAt', header: 'Joined', sortable: true, render: (u) => <span className="text-muted">{formatDate(u.createdAt)}</span> },
];

export default function ManageUsers() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ sortBy: 'createdAt', sortOrder: 'DESC' });
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const debouncedSearch = useDebounce(search);

  const params = { page, limit: 10, search: debouncedSearch, role: role || undefined, ...sort };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => userService.list(params),
    placeholderData: keepPreviousData,
  });

  const { download, downloading } = useDownload(
    () => userService.exportCSV({ search: debouncedSearch, role: role || undefined }),
    'users.csv'
  );

  const handleSort = (key) =>
    setSort((s) => ({
      sortBy: key,
      sortOrder: s.sortBy === key && s.sortOrder === 'ASC' ? 'DESC' : 'ASC',
    }));

  return (
    <>
      <PageHeader
        title="User Management"
        description="Create, search, filter and sort all platform users."
        actions={
          <>
            <Button variant="secondary" onClick={download} loading={downloading}>
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> Add User
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search by name, email or address…"
          className="sm:max-w-sm"
        />
        <Select
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setPage(1);
          }}
          className="sm:w-48"
        >
          <option value="">All roles</option>
          {Object.values(ROLES).map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </Select>
      </div>

      <div className={isFetching ? 'opacity-70 transition-opacity' : ''}>
        <DataTable
          columns={columns()}
          rows={data?.items}
          loading={isLoading}
          sort={sort}
          onSort={handleSort}
          onRowClick={(u) => setSelectedId(u.id)}
          emptyState={<EmptyState icon={UserPlus} title="No users found" description="Try adjusting your search or filters." />}
        />
        {data?.meta && <Pagination meta={data.meta} onPageChange={setPage} />}
      </div>

      <CreateUserModal open={open} onClose={() => setOpen(false)} onCreated={() => qc.invalidateQueries({ queryKey: ['admin'] })} />
      <UserDetailsModal userId={selectedId} onClose={() => setSelectedId(null)} />
    </>
  );
}

function UserDetailsModal({ userId, onClose }) {
  const { data: user, isLoading } = useQuery({
    queryKey: ['admin', 'user', userId],
    queryFn: () => userService.getById(userId),
    enabled: !!userId,
  });

  const Row = ({ label, value }) => (
    <div className="flex justify-between gap-4 border-b border-border/60 py-2.5 last:border-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm text-right">{value}</span>
    </div>
  );

  return (
    <Modal
      open={!!userId}
      onClose={onClose}
      title="User details"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      {isLoading || !user ? (
        <p className="py-6 text-center text-sm text-muted">Loading…</p>
      ) : (
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
              {user.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
            </div>
            <div>
              <p className="font-semibold">{user.name}</p>
              <RoleBadge role={user.role} />
            </div>
          </div>
          <Row label="Email" value={user.email} />
          <Row label="Address" value={user.address || '—'} />
          <Row label="Role" value={ROLE_LABELS[user.role]} />
          {user.role === ROLES.STORE_OWNER && (
            <>
              <Row label="Store" value={user.ownedStore?.name || 'Not assigned'} />
              <Row
                label="Store rating"
                value={
                  user.ownerStoreAvgRating != null ? `★ ${user.ownerStoreAvgRating}` : 'No ratings yet'
                }
              />
            </>
          )}
          <Row label="Joined" value={formatDate(user.createdAt)} />
        </div>
      )}
    </Modal>
  );
}

function CreateUserModal({ open, onClose, onCreated }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(createUserSchema), defaultValues: { role: ROLES.USER } });

  const mutation = useMutation({
    mutationFn: userService.create,
    onSuccess: () => {
      toast.success('User created');
      reset();
      onCreated();
      onClose();
    },
    onError: (err) => toast.error(extractError(err).message),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create user"
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
        <Input id="cu-name" label="Full name" placeholder="20-60 characters" error={errors.name?.message} {...register('name')} />
        <Input id="cu-email" label="Email" type="email" error={errors.email?.message} {...register('email')} />
        <Input id="cu-address" label="Address" error={errors.address?.message} {...register('address')} />
        <Input id="cu-password" label="Password" type="password" hint="8-16 chars, 1 uppercase, 1 special" error={errors.password?.message} {...register('password')} />
        <Select id="cu-role" label="Role" error={errors.role?.message} {...register('role')}>
          {Object.values(ROLES).map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </Select>
      </form>
    </Modal>
  );
}
