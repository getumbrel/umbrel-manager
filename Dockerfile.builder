# Build Stage
FROM node:12-buster-slim

# Install tools
RUN apt-get update \
    && apt-get install -y build-essential \
    && apt-get install -y libffi-dev \
    && apt-get install -y libssl-dev
