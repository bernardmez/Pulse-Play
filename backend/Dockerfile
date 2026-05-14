# ---- deps stage ----
FROM node:20-alpine AS deps
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
RUN npm rebuild bcrypt --build-from-source

# ---- runtime stage ----
FROM node:20-alpine AS runtime
RUN apk add --no-cache wget
WORKDIR /app

# Non-root user
RUN chown node:node /app
USER node

COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node . .

EXPOSE 5000

CMD ["node", "server.js"]
