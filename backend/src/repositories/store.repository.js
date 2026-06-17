const { Op, literal } = require('sequelize');
const BaseRepository = require('./base.repository');
const { Store, User, Rating } = require('../models');

class StoreRepository extends BaseRepository {
  constructor() {
    super(Store);
  }

  findByEmail(email) {
    return Store.findOne({ where: { email } });
  }

  findByOwnerId(ownerId) {
    return Store.findOne({ where: { owner_id: ownerId } });
  }

  findAndCountForBrowse({ search, order, limit, offset, userId }) {
    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } },
      ];
    }

    const avgRating = literal(
      '(SELECT AVG(r.rating) FROM ratings AS r WHERE r.store_id = `Store`.`id`)'
    );
    const ratingCount = literal(
      '(SELECT COUNT(*) FROM ratings AS r WHERE r.store_id = `Store`.`id`)'
    );

    const attributes = {
      include: [
        [avgRating, 'averageRating'],
        [ratingCount, 'ratingCount'],
      ],
    };

    if (userId) {
      attributes.include.push([
        literal(
          `(SELECT r.rating FROM ratings AS r WHERE r.store_id = \`Store\`.\`id\` AND r.user_id = ${Number(
            userId
          )})`
        ),
        'userRating',
      ]);
    }

    return Store.findAndCountAll({
      where,
      attributes,
      include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'], required: false }],
      order,
      limit,
      offset,
      subQuery: false,
    });
  }

  findDetailById(id) {
    return Store.findByPk(id, {
      attributes: {
        include: [
          [literal('(SELECT AVG(r.rating) FROM ratings AS r WHERE r.store_id = `Store`.`id`)'), 'averageRating'],
          [literal('(SELECT COUNT(*) FROM ratings AS r WHERE r.store_id = `Store`.`id`)'), 'ratingCount'],
        ],
      },
      include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'], required: false }],
    });
  }

  countAll() {
    return Store.count();
  }
}

module.exports = new StoreRepository();
