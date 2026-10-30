# syntax=docker/dockerfile:1

# Missivox: the web server and the sending worker run in one process, on a
# SQLite database kept in /app/storage (mount a volume there).

FROM node:24-alpine AS base
WORKDIR /app

# Every dependency, to compile the server and bundle the frontend.
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Only what the server needs at runtime.
FROM base AS production-deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Read by Vite while bundling: it ends every page title.
ENV VITE_APP_NAME=Missivox
RUN node ace build

FROM base AS production
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3333 \
    LOG_LEVEL=info \
    SESSION_DRIVER=cookie \
    MAIL_MAILER=smtp \
    MAIL_FROM_NAME=Missivox \
    DB_FILE=/app/storage/db.sqlite3

COPY --from=production-deps /app/node_modules ./node_modules
COPY --from=build /app/build ./
RUN mkdir -p storage tmp && chown node:node storage tmp

USER node
EXPOSE 3333

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO /dev/null "http://127.0.0.1:${PORT}/health" || exit 1

# Brings the database up to date, then hands the process over to the server
# so it receives the stop signal and finishes the email being sent.
CMD ["sh", "-c", "node ace migration:run --force && exec node bin/server.js"]
