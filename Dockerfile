# specify the node base image with your desired version node:<version>
FROM node:12.16.3-slim

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

RUN mkdir -p /db

EXPOSE 3006
CMD [ "yarn", "start" ]
