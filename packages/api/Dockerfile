# Stage 1: Build the application
FROM node:18-alpine AS builder

RUN corepack enable

# Set the working directory in the container
WORKDIR /app

COPY . .

RUN apk add --no-cache --virtual .gyp python3 py-setuptools make g++

# Install dependencies
RUN yarn install

# Build the TypeScript code
RUN yarn nx run api:build

# Stage 2: Run the application
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the built files from the builder stage
COPY --from=builder /app .

# Expose the port the app runs on
EXPOSE 8080:8080

# Define the command to run the app
CMD ["node", "packages/api/dist/server.js"]
