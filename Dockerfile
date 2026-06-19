# Stage 1: Build
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Accept VITE env vars as build args so vite bakes them into the bundle
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_USE_EMULATOR=false

ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID
ENV VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID
ENV VITE_USE_EMULATOR=$VITE_USE_EMULATOR

# Build application
RUN npm run build

# Stage 2: Production (Public - No Authentication)
FROM nginx:alpine AS production

# Copy public nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# Stage 3: Protected (With HTTP Basic Authentication)
FROM nginx:alpine AS protected

# Install Apache utils for htpasswd
RUN apk add --no-cache apache2-utils

# Accept username and password as build arguments
ARG AUTH_USERNAME
ARG AUTH_PASSWORD

# Copy protected nginx config
COPY nginx.protected.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Generate htpasswd file with provided credentials
RUN htpasswd -cb /etc/nginx/.htpasswd ${AUTH_USERNAME} ${AUTH_PASSWORD}

# Expose port
EXPOSE 80

# Health check (health endpoint is excluded from auth)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
