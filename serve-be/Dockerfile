# Production Dockerfile for NestJS
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy source code and tsconfig
COPY . .

# Build the application
RUN npm run build

# Check if dist was created
RUN ls -la dist/

# Production stage
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Create img directory for uploads
RUN mkdir -p ./img

# Verify dist/main.js exists
RUN ls -la dist/

EXPOSE 3005

CMD ["node", "dist/src/main.js"]
