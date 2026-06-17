const storeRepository = require('../repositories/store.repository');
const userRepository = require('../repositories/user.repository');
const activityLogService = require('./activityLog.service');
const cacheService = require('./cache.service');
const { buildPagination, buildMeta } = require('../utils/pagination');
const { toCSV } = require('../utils/csv');
const ApiError = require('../utils/ApiError');
const { ROLES, ACTIVITY, CACHE_KEYS } = require('../utils/constants');

const SORT_FIELDS = ['name', 'email', 'createdAt'];

function shape(store) {
  const plain = store.get ? store.get({ plain: true }) : store;
  return {
    id: plain.id,
    name: plain.name,
    email: plain.email,
    address: plain.address,
    owner: plain.owner || null,
    ownerId: plain.owner_id ?? plain.ownerId ?? null,
    averageRating: plain.averageRating != null ? Number(Number(plain.averageRating).toFixed(2)) : 0,
    ratingCount: plain.ratingCount != null ? Number(plain.ratingCount) : 0,
    userRating: plain.userRating != null ? Number(plain.userRating) : null,
    createdAt: plain.createdAt,
  };
}

const storeService = {
  async create({ name, email, address, ownerId }, actor) {
    if (await storeRepository.findByEmail(email)) {
      throw ApiError.conflict('A store with this email already exists');
    }

    if (ownerId) {
      const owner = await userRepository.findById(ownerId);
      if (!owner) throw ApiError.badRequest('Owner user does not exist');
      if (owner.role !== ROLES.STORE_OWNER) {
        throw ApiError.badRequest('Assigned owner must have the STORE_OWNER role');
      }
      if (await storeRepository.findByOwnerId(ownerId)) {
        throw ApiError.conflict('This owner already manages a store');
      }
    }

    const store = await storeRepository.create({ name, email, address, owner_id: ownerId || null });

    await activityLogService.record({
      actor,
      action: ACTIVITY.STORE_CREATED,
      description: `${actor.name} created store '${name}'`,
      metadata: { storeId: store.id },
    });
    await cacheService.delByPattern(CACHE_KEYS.STORE_LIST_PREFIX);
    await cacheService.del(CACHE_KEYS.ADMIN_DASHBOARD);

    return shape(store);
  },

  async update(id, { name, email, address, ownerId }, actor) {
    const store = await storeRepository.findById(id);
    if (!store) throw ApiError.notFound('Store not found');

    if (email && email !== store.email) {
      const existing = await storeRepository.findByEmail(email);
      if (existing && existing.id !== store.id) {
        throw ApiError.conflict('A store with this email already exists');
      }
    }

    if (ownerId) {
      const owner = await userRepository.findById(ownerId);
      if (!owner) throw ApiError.badRequest('Owner user does not exist');
      if (owner.role !== ROLES.STORE_OWNER) {
        throw ApiError.badRequest('Assigned owner must have the STORE_OWNER role');
      }
      const ownersStore = await storeRepository.findByOwnerId(ownerId);
      if (ownersStore && ownersStore.id !== store.id) {
        throw ApiError.conflict('This owner already manages a store');
      }
    }

    await store.update({
      name: name ?? store.name,
      email: email ?? store.email,
      address: address ?? store.address,
      owner_id: ownerId || null,
    });

    await activityLogService.record({
      actor,
      action: ACTIVITY.STORE_UPDATED,
      description: `${actor.name} updated store '${store.name}'`,
      metadata: { storeId: store.id },
    });
    await cacheService.delByPattern(CACHE_KEYS.STORE_LIST_PREFIX);
    await cacheService.del(CACHE_KEYS.ADMIN_DASHBOARD);

    return shape(await storeRepository.findDetailById(store.id));
  },

  async browse(query, userId) {
    const pg = buildPagination(query, { allowedSortFields: SORT_FIELDS });
    const cacheKey = CACHE_KEYS.STORE_LIST(
      cacheService.hashKey({
        search: query.search || '',
        sortBy: pg.sortBy,
        sortOrder: pg.sortOrder,
        page: pg.page,
        limit: pg.limit,
        userId: userId || 'anon',
      })
    );

    return cacheService.getOrSet(cacheKey, undefined, async () => {
      const { count, rows } = await storeRepository.findAndCountForBrowse({
        search: query.search,
        order: pg.order,
        limit: pg.limit,
        offset: pg.offset,
        userId,
      });
      return {
        items: rows.map(shape),
        meta: buildMeta({ count, page: pg.page, limit: pg.limit }),
      };
    });
  },

  async listForAdmin(query) {
    const pg = buildPagination(query, { allowedSortFields: SORT_FIELDS });
    const { count, rows } = await storeRepository.findAndCountForBrowse({
      search: query.search,
      order: pg.order,
      limit: pg.limit,
      offset: pg.offset,
      searchEmail: true,
    });
    return {
      items: rows.map(shape),
      meta: buildMeta({ count, page: pg.page, limit: pg.limit }),
    };
  },

  async getById(id) {
    const store = await storeRepository.findDetailById(id);
    if (!store) throw ApiError.notFound('Store not found');
    return shape(store);
  },

  async exportCSV(query) {
    const { rows } = await storeRepository.findAndCountForBrowse({
      search: query.search,
      order: [['createdAt', 'DESC']],
      limit: 10000,
      offset: 0,
      searchEmail: true,
    });
    return toCSV(rows.map(shape), [
      { key: 'id', header: 'ID' },
      { key: 'name', header: 'Name' },
      { key: 'email', header: 'Email' },
      { key: 'address', header: 'Address' },
      { key: 'averageRating', header: 'Average Rating' },
      { key: 'ratingCount', header: 'Total Ratings' },
      { key: 'createdAt', header: 'Created At' },
    ]);
  },
};

module.exports = storeService;
