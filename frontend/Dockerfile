# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install
RUN npm install --save-dev @testing-library/react @testing-library/jest-dom jest @types/jest cypress cypress-file-upload

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

FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy project files
COPY . .

# Set environment variables
ENV REACT_APP_API_URL=http://localhost:8000/api

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 