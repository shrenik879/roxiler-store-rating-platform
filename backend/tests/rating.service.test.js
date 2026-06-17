process.env.NODE_ENV = 'test';
process.env.DB_DIALECT = 'sqlite';
process.env.DB_STORAGE = ':memory:';
process.env.REDIS_ENABLED = 'false';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-value';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-value';

const { sequelize, User, Store } = require('../src/models');
const ratingService = require('../src/services/rating.service');
const ratingRepository = require('../src/repositories/rating.repository');

let user;
let store;
const actor = { id: 1, name: 'Rater' };

beforeAll(async () => {
  await sequelize.sync({ force: true });
  user = await User.create({
    name: 'Rating Tester Account Full Name',
    email: 'rater@example.com',
    password: 'hashed',
    role: 'USER',
  });
  store = await Store.create({ name: 'Test Store', email: 'store@example.com' });
  actor.id = user.id;
});

afterAll(async () => {
  await sequelize.close();
});

describe('ratingService', () => {
  test('submit creates a rating', async () => {
    const result = await ratingService.submit(user.id, store.id, 4, actor);
    expect(result.rating).toBe(4);

    const stats = await ratingRepository.getStoreStats(store.id);
    expect(stats.averageRating).toBe(4);
    expect(stats.totalRatings).toBe(1);
  });

  test('submitting twice for the same store throws 409', async () => {
    await expect(ratingService.submit(user.id, store.id, 5, actor)).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  test('update changes the existing rating', async () => {
    const result = await ratingService.update(user.id, store.id, 2, actor);
    expect(result.rating).toBe(2);

    const stats = await ratingRepository.getStoreStats(store.id);
    expect(stats.averageRating).toBe(2);
    expect(stats.totalRatings).toBe(1);
  });

  test('submit rejects an unknown store with 404', async () => {
    await expect(ratingService.submit(user.id, 9999, 3, actor)).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
