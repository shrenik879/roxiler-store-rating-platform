const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const env = require('./env');

const definition = {
  openapi: '3.0.3',
  info: {
    title: 'Store Rating Platform API',
    version: '2.0.0',
    description:
      'Layered (controller -> service -> repository) REST API for the Store Rating Platform. ' +
      'JWT auth with refresh-token rotation, RBAC, Redis cache-aside, and CSV export.',
  },
  servers: [{ url: `http://localhost:${env.port}/api`, description: 'Local' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      RegisterInput: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', minLength: 20, maxLength: 60, example: 'Jonathan Michael Anderson' },
          email: { type: 'string', format: 'email', example: 'jon@example.com' },
          address: { type: 'string', maxLength: 400, example: '12 Market Street, Pune' },
          password: { type: 'string', example: 'Passw0rd!' },
        },
      },
      LoginInput: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'admin@storerating.com' },
          password: { type: 'string', example: 'Admin@1234' },
        },
      },
      ChangePasswordInput: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
          currentPassword: { type: 'string', example: 'Admin@1234' },
          newPassword: { type: 'string', example: 'NewPass@1' },
        },
      },
      CreateUserInput: {
        type: 'object',
        required: ['name', 'email', 'password', 'role'],
        properties: {
          name: { type: 'string', example: 'Store Owner Account Number One' },
          email: { type: 'string', format: 'email', example: 'owner@example.com' },
          address: { type: 'string', example: 'Shop 4, Main Road' },
          password: { type: 'string', example: 'Owner@123' },
          role: { type: 'string', enum: ['ADMIN', 'USER', 'STORE_OWNER'] },
        },
      },
      CreateStoreInput: {
        type: 'object',
        required: ['name', 'email'],
        properties: {
          name: { type: 'string', example: 'Acme Supermart' },
          email: { type: 'string', format: 'email', example: 'contact@acme.com' },
          address: { type: 'string', example: '88 Commerce Blvd' },
          ownerId: { type: 'integer', nullable: true, example: 2 },
        },
      },
      RatingInput: {
        type: 'object',
        required: ['rating'],
        properties: { rating: { type: 'integer', minimum: 1, maximum: 5, example: 4 } },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              user: { type: 'object' },
              accessToken: { type: 'string' },
              refreshToken: { type: 'string' },
            },
          },
        },
      },
    },
  },
};

const swaggerSpec = swaggerJsdoc({
  definition,
  apis: [path.join(__dirname, '../routes/*.js').replace(/\\/g, '/')],
});

module.exports = swaggerSpec;
