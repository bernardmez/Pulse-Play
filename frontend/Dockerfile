# Frontend Dockerfile - FIXED
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

EXPOSE 3000

# Use npm run dev instead of npm start (Vite uses "dev" script)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
