# ─────────────────────────────────────────────────────────────
# Stage: production image
# Using alpine so apk is available to install build tools needed
# for the sqlite3 native module (node-gyp / node-pre-gyp).
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine

# Build tools required to compile sqlite3 native addon
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Install dependencies (sqlite3 is optionalDependency — build tools
# ensure it actually compiles instead of being silently skipped)
COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# Create the directory where the persistent disk will be mounted.
# This prevents a "ENOENT" error if the disk hasn't been attached yet
# and also serves as the SQLite storage location.
RUN mkdir -p /app/data

EXPOSE 10000

# Run seed (idempotent: uses findOrCreate) then start the server.
# Seed ensures the admin account always exists after every deploy.
CMD ["sh", "-c", "node src/seed/seed.js && node src/server.js"]
