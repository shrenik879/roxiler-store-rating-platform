function buildPagination(query = {}, { allowedSortFields = [], defaultSort = 'createdAt' } = {}) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  const offset = (page - 1) * limit;

  const requestedSort = query.sortBy;
  const sortBy = allowedSortFields.includes(requestedSort) ? requestedSort : defaultSort;
  const sortOrder = String(query.sortOrder).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  return { page, limit, offset, sortBy, sortOrder, order: [[sortBy, sortOrder]] };
}

function buildMeta({ count, page, limit }) {
  return {
    page,
    limit,
    total: count,
    totalPages: Math.max(Math.ceil(count / limit), 1),
    hasNextPage: page * limit < count,
    hasPrevPage: page > 1,
  };
}

module.exports = { buildPagination, buildMeta };
