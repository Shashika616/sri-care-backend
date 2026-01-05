# 1. Use a lightweight Node image (Alpine Linux)
FROM node:18-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy ONLY package files first (Crucial for caching!)
COPY package*.json ./

# 4. Install dependencies (CacheInstall)
RUN npm ci --only=production

# 5. Copy the rest of your service code
COPY . .

# 6. Security: Run as a non-root user (Standard in Node images)
USER node

# 7. Expose the port (Render ignores this, but it's good documentation)
EXPOSE 6000

# 8. Start the app
CMD ["node", "src/app.js"]