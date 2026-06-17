const { connectDatabase, closeDatabase } = require('../database');
const { User, Store, Rating, ActivityLog } = require('../models');
const { hashPassword } = require('../utils/password');
const { ROLES, ACTIVITY } = require('../utils/constants');
const env = require('../config/env');
const logger = require('../config/logger');

async function findOrCreateUser({ name, email, password, address, role }) {
  const existing = await User.findOne({ where: { email } });
  if (existing) return existing;
  return User.create({ name, email, address, role, password: await hashPassword(password) });
}

async function seed() {
  await connectDatabase({ sync: true });

  const admin = await findOrCreateUser({
    name: env.admin.name,
    email: env.admin.email,
    password: env.admin.password,
    address: env.admin.address,
    role: ROLES.ADMIN,
  });
  console.log(`Admin ready: ${admin.email}`);

  if (env.isProd && !env.seedDemo) {
    console.log('Production environment — skipping demo data seed. Set SEED_DEMO=true to include it.');
    await closeDatabase();
    return;
  }

  const owner1 = await findOrCreateUser({
    name: 'Ananya Subramaniam Iyer',
    email: 'owner1@storerating.com',
    password: 'Owner@123',
    address: '21 Market Street, Pune',
    role: ROLES.STORE_OWNER,
  });
  const owner2 = await findOrCreateUser({
    name: 'Vikram Aditya Singh Rathore',
    email: 'owner2@storerating.com',
    password: 'Owner@123',
    address: '5 Lakeview Road, Mumbai',
    role: ROLES.STORE_OWNER,
  });

  const [acme] = await Store.findOrCreate({
    where: { email: 'contact@sharmastore.com' },
    defaults: { name: 'Sharma General Store', address: '88 MG Road, Pune', owner_id: owner1.id },
  });
  const [techno] = await Store.findOrCreate({
    where: { email: 'hello@guptaelectronics.com' },
    defaults: { name: 'Gupta Electronics', address: '12 Linking Road, Mumbai', owner_id: owner2.id },
  });
  const [freshco] = await Store.findOrCreate({
    where: { email: 'support@reddyfreshmart.com' },
    defaults: { name: 'Reddy Fresh Mart', address: '7 Garden Lane, Pune', owner_id: null },
  });

  const userDefs = [
    { name: 'Aarav Kumar Sharma Gupta', email: 'aarav@example.com' },
    { name: 'Priya Lakshmi Nair Menon', email: 'priya@example.com' },
    { name: 'Rohan Gupta Srivastava', email: 'rohan@example.com' },
    { name: 'Sneha Reddy Venkatesh', email: 'sneha@example.com' },
  ];
  const users = [];
  for (const u of userDefs) {
    users.push(
      await findOrCreateUser({ ...u, password: 'User@1234', address: 'Demo Address, City', role: ROLES.USER })
    );
  }

  const stores = [acme, techno, freshco];
  const sample = [5, 4, 3, 4, 5, 2, 3, 5, 4];
  let i = 0;
  for (const user of users) {
    for (const store of stores) {
      await Rating.findOrCreate({
        where: { user_id: user.id, store_id: store.id },
        defaults: { rating: sample[i % sample.length] },
      });
      i += 1;
    }
  }

  const count = await ActivityLog.count();
  if (count === 0) {
    await ActivityLog.create({
      actor_id: admin.id,
      actor_name: admin.name,
      action: ACTIVITY.STORE_CREATED,
      description: 'Seeded demo stores and ratings',
    });
  }

  console.log('Seed complete:');
  console.log('  Admin    -> admin@storerating.com / Admin@1234');
  console.log('  Owner    -> owner1@storerating.com / Owner@123');
  console.log('  User     -> aarav@example.com / User@1234');

  await closeDatabase();
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    logger.error(`Seeding failed: ${err.stack || err.message}`);
    process.exit(1);
  });
