FROM node:20-slim AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate

# Estágio de desenvolvimento com hot-reload
FROM base AS dev
EXPOSE 3000
CMD ["npm", "run", "dev"]