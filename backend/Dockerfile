# Backend Dockerfile - FIXED
FROM node:20-alpine

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Remove any existing node_modules and install fresh
RUN rm -rf node_modules && npm install --production

# Copy application code
COPY . .

# Remove Windows-compiled bcrypt and rebuild for Linux
RUN npm rebuild bcrypt --build-from-source

EXPOSE 5000

CMD ["node", "server.js"]
