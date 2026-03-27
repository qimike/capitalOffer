# Multi-stage build
FROM node:24-alpine AS builder
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

RUN npm install

# Copy application code
COPY . .

# Production build
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
