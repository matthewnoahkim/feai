FROM ubuntu:22.04

# Install system dependencies
RUN apt-get update && apt-get install -y \
    wget \
    tar \
    gfortran \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install CalculiX (using pre-built binary for simplicity)
WORKDIR /opt
RUN wget http://www.dhondt.de/ccx_2.21_amd64.tar.bz2 \
    && tar -xvf ccx_2.21_amd64.tar.bz2 \
    && mv ccx_2.21_amd64 /usr/local/bin/ccx \
    && chmod +x /usr/local/bin/ccx \
    && rm ccx_2.21_amd64.tar.bz2

# Install Node.js 18
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Create app directory
WORKDIR /app

# Copy workspace files
COPY package*.json ./
COPY packages/compute-server/package.json ./packages/compute-server/
COPY packages/shared ./packages/shared/
COPY packages/kernel ./packages/kernel/

# Install dependencies
WORKDIR /app/packages/shared
RUN npm install && npm run build

WORKDIR /app/packages/kernel
RUN npm install && npm run build

WORKDIR /app/packages/compute-server
RUN npm install

# Copy compute server source
COPY packages/compute-server/src ./src
COPY packages/compute-server/tsconfig.json ./

# Build
RUN npm run build

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Run
CMD ["npm", "start"]

