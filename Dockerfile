# Build Stage
FROM getumbrel/manager-builder:latest AS umbrel-manager-builder

# Create app directory
WORKDIR /app

# Copy 'yarn.lock' and 'package.json'
COPY yarn.lock package.json ./

# Install dependencies
RUN yarn install --production

# Copy project files and folders to the current working directory (i.e. '/app')
COPY . .

# Final image
FROM node:12-buster-slim AS umbrel-manager

# Install python3 and python3-pip (required for docker-compose)
RUN apt-get update --no-install-recommends \
    && apt-get install -y --no-install-recommends python3 \
    && apt-get install -y --no-install-recommends python3-pip

# Copy built code from build stage to '/app' directory
COPY --from=umbrel-manager-builder /app /app

# Copy pip3 modules from build stage (we only need docker-compose module though)
COPY --from=umbrel-manager-builder /usr/local/lib/python3.7/dist-packages /usr/local/lib/python3.7/dist-packages

# Copy docker-compose binary from build stage
COPY --from=umbrel-manager-builder /usr/local/bin/docker-compose /usr/local/bin/docker-compose

# Change directory to '/app' 
WORKDIR /app

EXPOSE 3006
CMD [ "yarn", "start" ]
