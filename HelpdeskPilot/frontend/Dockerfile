# Base image for build
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files (to be added later)
# COPY package*.json ./

# Install dependencies (to be run later)
# RUN npm install

# Copy source code (to be added later)
# COPY . .

# Build the app (placeholder)
# RUN npm run build

# Production image
FROM nginx:alpine

# Copy build artifacts (placeholder)
# COPY --from=build /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]