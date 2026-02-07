# Production Dockerfile for NestJS
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Create img directory for uploads
RUN mkdir -p ./img

EXPOSE 3005

CMD ["npm", "run", "start:prod"]
