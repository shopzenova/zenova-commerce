# Dockerfile per Zenova Backend
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies for Prisma (needed for SQLite)
RUN apk add --no-cache openssl

# Copy package files from backend directory
COPY backend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy prisma schema from backend directory
COPY backend/prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy application code from backend directory
COPY backend/ .

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
