# syntax=docker/dockerfile:1

ARG BUN_VERSION=1.0.4
FROM oven/bun:${BUN_VERSION} as base

WORKDIR /app

ENV NODE_ENV production

RUN apt-get update && apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_18.x | bash - 
RUN apt-get install -y nodejs

COPY package.json tsconfig.json .
COPY src src
COPY prisma prisma

RUN bun install --ci
RUN bunx prisma generate

CMD ["bun", "src/index.ts"]

EXPOSE 3000