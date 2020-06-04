# specify the node base image with your desired version node:<version>
FROM node:12.16.3-slim

# Install Tools
RUN apt-get update --no-install-recommends \
    && apt-get install -y --no-install-recommends build-essential g++ \
    && apt-get install -y --no-install-recommends git \
    && apt-get install -y --no-install-recommends libltdl7 \
    && apt-get install -y --no-install-recommends python \
    && apt-get install -y --no-install-recommends rsync \
    && apt-get install -y --no-install-recommends vim \
    && apt-get install -y --no-install-recommends python3 \
    && apt-get install -y --no-install-recommends libssl-dev libffi-dev python3-dev python3-setuptools python3-wheel python3-pip \
    && pip3 install -IU docker-compose \
    && ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose \
    && chmod +x /usr/local/bin/docker-compose \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package.json ./
COPY yarn.lock ./

RUN yarn
# If you are building your code for production
# RUN npm install --only=production

# Bundle app source
COPY . .

EXPOSE 3006
CMD [ "yarn", "start" ]