# Production image. Build: docker build -t app . Run: docker run -p 8080:8080 app

# One pinned base for every stage. Dependabot bumps the tag and digest together.
FROM node:24.22.1-alpine3.24@sha256:06d7adf3e0ef61a13f1d28682726366f97a15aa1888c934d3ecec86c33918b53 AS base
WORKDIR /app

# Compile with the full dependency tree.
FROM base AS build
COPY package.json package-lock.json .npmrc ./
RUN npm ci --ignore-scripts
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN npm run build

# Production dependencies only, so dev-only packages never reach the image.
FROM base AS prod-deps
COPY package.json package-lock.json .npmrc ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

FROM base AS runtime
ENV NODE_ENV=production \
	PORT=8080 \
	SHUTDOWN_DRAIN_MS=5000
# The app never calls npm or yarn, so drop them and their dependencies.
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx \
	/usr/local/lib/node_modules/corepack /usr/local/bin/corepack /opt/yarn-* /usr/local/bin/yarn /usr/local/bin/yarnpkg
# Files stay owned by root, so the app can't modify its own code.
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
# The base image's `node` user, by number so runtimes can verify it isn't root.
USER 1000:1000
EXPOSE 8080
# node runs as PID 1 and handles SIGTERM itself (enableShutdownHooks), so no init wrapper is needed.
CMD ["node", "dist/main.js"]
