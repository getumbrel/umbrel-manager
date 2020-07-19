# specify the node base image with your desired version node:<version>
FROM node:12.16.3-buster-slim

# Install tools
RUN apt-get update --no-install-recommends \
    && apt-get install -y --no-install-recommends build-essential g++ make \
    && apt-get install -y --no-install-recommends libssl-dev libffi-dev \
    && apt-get install -y --no-install-recommends python3-dev python3-setuptools python3 python3-pip \
    && pip3 install -IU docker-compose \
    && ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose \
    && chmod +x /usr/local/bin/docker-compose \
    && rm -rf /var/lib/apt/lists/*

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

EXPOSE 3006
CMD [ "yarn", "start" ]




