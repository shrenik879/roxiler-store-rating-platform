const { Op, fn, col, literal } = require('sequelize');
const BaseRepository = require('./base.repository');
const { User, Store } = require('../models');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  findByEmail(email, { withPassword = false } = {}) {
    const scoped = withPassword ? User.scope('withPassword') : User;
    return scoped.findOne({ where: { email } });
  }

  findByIdWithPassword(id) {
    return User.scope('withPassword').findByPk(id);
  }

  findAndCountAdmin({ search, role, order, limit, offset }) {
    const where = {};
    if (role) where.role = role;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } },
      ];
    }

    const ownerAvg = literal(
      '(SELECT AVG(r.rating) FROM ratings AS r ' +
        'INNER JOIN stores AS s ON s.id = r.store_id ' +
        'WHERE s.owner_id = `User`.`id`)'
    );

    return User.findAndCountAll({
      where,
      attributes: { include: [[ownerAvg, 'ownerStoreAvgRating']] },
      include: [{ model: Store, as: 'ownedStore', attributes: ['id', 'name'], required: false }],
      order,
      limit,
      offset,
      subQuery: false,
    });
  }

  countByRole() {
    return User.findAll({
      attributes: ['role', [fn('COUNT', col('id')), 'count']],
      group: ['role'],
      raw: true,
    });
  }
}

module.exports = new UserRepository();
