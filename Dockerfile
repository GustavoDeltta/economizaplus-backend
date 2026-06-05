FROM node:20-slim AS base

WORKDIR /app

RUN apt-get update && apt-get install -y openssl

COPY package*.json ./
COPY prisma ./prisma

RUN npm install

COPY . .

FROM base AS dev

EXPOSE 3000

CMD ["npm", "run", "dev"]