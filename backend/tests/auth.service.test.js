process.env.NODE_ENV = 'test';
process.env.DB_DIALECT = 'sqlite';
process.env.DB_STORAGE = ':memory:';
process.env.REDIS_ENABLED = 'false';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-value';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-value';

const { sequelize } = require('../src/models');
const authService = require('../src/services/auth.service');

const validUser = {
  name: 'Test User Account Full Name Here',
  email: 'test.user@example.com',
  address: 'Somewhere in the city',
  password: 'Passw0rd!',
};

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('authService', () => {
  test('register creates a USER and returns tokens', async () => {
    const result = await authService.register(validUser);

    expect(result.user.email).toBe(validUser.email);
    expect(result.user.role).toBe('USER');
    expect(result.user).not.toHaveProperty('password');
    expect(typeof result.accessToken).toBe('string');
    expect(typeof result.refreshToken).toBe('string');
  });

  test('register rejects a duplicate email with 409', async () => {
    await expect(authService.register(validUser)).rejects.toMatchObject({ statusCode: 409 });
  });

  test('login succeeds with correct credentials', async () => {
    const result = await authService.login({ email: validUser.email, password: validUser.password });
    expect(result.user.email).toBe(validUser.email);
    expect(result.accessToken).toBeDefined();
  });

  test('login fails with a wrong password (401)', async () => {
    await expect(
      authService.login({ email: validUser.email, password: 'WrongPass!1' })
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  test('changePassword rejects an incorrect current password', async () => {
    const { user } = await authService.login({ email: validUser.email, password: validUser.password });
    await expect(
      authService.changePassword(user.id, { currentPassword: 'Nope!1234', newPassword: 'NewPass!9' })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test('refresh issues a new token pair and rotates the old one', async () => {
    const { refreshToken } = await authService.login({ email: validUser.email, password: validUser.password });
    const rotated = await authService.refresh(refreshToken);
    expect(rotated.accessToken).toBeDefined();

    await expect(authService.refresh(refreshToken)).rejects.toMatchObject({ statusCode: 401 });
  });
});
