# specify the node base image with your desired version node:<version>
FROM node:12.16.3-buster-slim AS umbrel-manager-builder

# Install tools
RUN apt-get update --no-install-recommends \
    && apt-get install -y --no-install-recommends build-essential g++ \
    && apt-get install -y --no-install-recommends rsync \
    && apt-get install -y --no-install-recommends make \
    && apt-get install -y --no-install-recommends python3 

# Create app directory
WORKDIR /app

# copy 'package.json'
COPY package.json ./

# copy 'yarn.lock'
COPY yarn.lock ./

# install dependencies
RUN yarn

# copy project files and folders to the current working directory (i.e. '/app' folder)
COPY . .

FROM node:12.16.3-buster-slim AS umbrel-manager

RUN apt-get update --no-install-recommends \
    && apt-get install -y --no-install-recommends curl \
    && apt-get install -y --no-install-recommends ca-certificates \
    && curl -L "https://github.com/docker/compose/releases/download/1.26.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose \
    && chmod +x /usr/local/bin/docker-compose \
    && docker-compose --version

COPY --from=umbrel-manager-builder /app .

EXPOSE 3006
CMD [ "yarn", "start" ]




