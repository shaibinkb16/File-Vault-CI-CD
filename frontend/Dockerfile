# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Install dependencies with caching
COPY package*.json ./
RUN npm ci --only=production --no-audit --no-fund

# Copy project files
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 