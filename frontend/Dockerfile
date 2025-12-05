# Build stage: build the Vite app
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the source and build
COPY . .
RUN npm run build

# Run stage: serve static files
FROM node:20-alpine
WORKDIR /app

# Simple static file server
RUN npm install -g serve

# Copy built assets from the build stage
COPY --from=build /app/dist ./dist

# Cloud Run will send traffic to port 8080
EXPOSE 8080
CMD ["serve", "-s", "dist", "-l", "8080"]
