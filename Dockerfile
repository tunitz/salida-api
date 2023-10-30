# syntax=docker/dockerfile:1
# FROM oven/bun:latest as base
FROM oven/bun:latest

WORKDIR /app

# ENV NODE_ENV production

# RUN apt-get update && apt-get install -y curl
# RUN curl -sL https://deb.nodesource.com/setup_18.x | bash - 
# RUN apt-get install -y nodejs

COPY package.json ./
COPY bun.lockb ./
COPY src src
# COPY prisma ./

RUN bun install --ci
# RUN bunx prisma generate

CMD ["bun", "src/index.ts"]

EXPOSE 3000