const userRepository = require('../repositories/user.repository');
const activityLogService = require('./activityLog.service');
const cacheService = require('./cache.service');
const { hashPassword } = require('../utils/password');
const { buildPagination, buildMeta } = require('../utils/pagination');
const { toCSV } = require('../utils/csv');
const ApiError = require('../utils/ApiError');
const { ACTIVITY, CACHE_KEYS } = require('../utils/constants');

const SORT_FIELDS = ['name', 'email', 'role', 'createdAt'];

function shape(user) {
  const plain = user.get ? user.get({ plain: true }) : user;
  const avg = plain.ownerStoreAvgRating;
  return {
    id: plain.id,
    name: plain.name,
    email: plain.email,
    address: plain.address,
    role: plain.role,
    ownedStore: plain.ownedStore || null,
    ownerStoreAvgRating: avg != null ? Number(Number(avg).toFixed(2)) : null,
    createdAt: plain.createdAt,
  };
}

const userService = {
  async createByAdmin({ name, email, address, password, role }, actor) {
    const existing = await userRepository.findByEmail(email);
    if (existing) throw ApiError.conflict('An account with this email already exists');

    const user = await userRepository.create({
      name,
      email,
      address,
      role,
      password: await hashPassword(password),
    });

    await activityLogService.record({
      actor,
      action: ACTIVITY.USER_CREATED,
      description: `${actor.name} created ${role} '${name}'`,
      metadata: { userId: user.id, role },
    });
    await cacheService.del(CACHE_KEYS.ADMIN_DASHBOARD);

    return shape(user);
  },

  async list(query) {
    const pg = buildPagination(query, { allowedSortFields: SORT_FIELDS });
    const { count, rows } = await userRepository.findAndCountAdmin({
      search: query.search,
      role: query.role,
      order: pg.order,
      limit: pg.limit,
      offset: pg.offset,
    });
    return {
      items: rows.map(shape),
      meta: buildMeta({ count, page: pg.page, limit: pg.limit }),
    };
  },

  async getById(id) {
    const user = await userRepository.findById(id, {
      include: [{ association: 'ownedStore' }],
    });
    if (!user) throw ApiError.notFound('User not found');
    return shape(user);
  },

  async exportCSV(query) {
    const { rows } = await userRepository.findAndCountAdmin({
      search: query.search,
      role: query.role,
      order: [['createdAt', 'DESC']],
      limit: 10000,
      offset: 0,
    });
    return toCSV(rows.map(shape), [
      { key: 'id', header: 'ID' },
      { key: 'name', header: 'Name' },
      { key: 'email', header: 'Email' },
      { key: 'address', header: 'Address' },
      { key: 'role', header: 'Role' },
      { key: 'ownerStoreAvgRating', header: 'Owner Store Avg Rating' },
      { key: 'createdAt', header: 'Created At' },
    ]);
  },
};

module.exports = userService;
