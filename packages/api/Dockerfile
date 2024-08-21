# Stage 1: Build the application
FROM node:18-alpine AS builder

RUN corepack enable

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package.json yarn.lock .yarnrc.yml .yarn ./

RUN apk add --no-cache --virtual .gyp python3 py-setuptools make g++

# Install dependencies
RUN yarn install

RUN ls -la

# Copy the rest of the application code
COPY . .

RUN ls -la

# Build the TypeScript code
RUN yarn nx run api:build

# Stage 2: Run the application
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the built files from the builder stage
COPY --from=builder /app/api/dist ./dist

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the app
CMD ["node", "api/dist/server.js"]
