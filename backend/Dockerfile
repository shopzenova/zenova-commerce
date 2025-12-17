# Dockerfile per Zenova Backend su Fly.io
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies for Prisma (needed for SQLite)
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
