const ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  USER: 'USER',
  STORE_OWNER: 'STORE_OWNER',
});

const ROLE_VALUES = Object.values(ROLES);

const ACTIVITY = Object.freeze({
  USER_REGISTERED: 'USER_REGISTERED',
  USER_LOGGED_IN: 'USER_LOGGED_IN',
  USER_CREATED: 'USER_CREATED',
  STORE_CREATED: 'STORE_CREATED',
  RATING_SUBMITTED: 'RATING_SUBMITTED',
  RATING_UPDATED: 'RATING_UPDATED',
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',
});

const CACHE_KEYS = Object.freeze({
  ADMIN_DASHBOARD: 'cache:admin:dashboard',
  STORE_LIST: (hash) => `cache:stores:list:${hash}`,
  STORE_LIST_PREFIX: 'cache:stores:list:*',
  OWNER_DASHBOARD: (ownerId) => `cache:owner:dashboard:${ownerId}`,
});

module.exports = { ROLES, ROLE_VALUES, ACTIVITY, CACHE_KEYS };
