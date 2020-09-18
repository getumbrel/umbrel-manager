# Build Stage
FROM node:12-buster-slim

# Install tools
RUN apt-get update \
    && apt-get install -y build-essential \
    && apt-get install -y libffi-dev \
    && apt-get install -y libssl-dev \
    && apt-get install -y python3 \
    && apt-get install -y python3-pip \
    && pip3 install -IU docker-compose \
    && chmod +x /usr/local/bin/docker-compose
