FROM node:22-slim

# Install OpenSSL and dependencies needed for Playwright
RUN apt-get update && \
    apt-get install -y openssl python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/node-app

# Create directory and set permissions before switching user
RUN mkdir -p /usr/src/node-app/node_modules && \
    chown -R node:node /usr/src/node-app

# Copy the rest of the application code with correct ownership
COPY --chown=node:node . .

# Switch to node user before installing dependencies
USER node

# Install dependencies
RUN npm install

USER root

# Switch back to node user
USER node

# Build the application
RUN npm run build

EXPOSE 3030

ENV NODE_ENV=production

CMD ["npx", "pm2-runtime", "start", "ecosystem.config.json"]