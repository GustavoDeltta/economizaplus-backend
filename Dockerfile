FROM node:22-slim AS base
# Instala OpenSSL e certificados CA necessários para o Prisma
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia arquivos de dependência e schema do prisma primeiro para melhor cache
COPY package*.json ./
COPY prisma ./prisma/

# Define variáveis de ambiente dummy para permitir que o Prisma Config carregue durante o build
# Estas são usadas apenas para o passo 'generate' e não afetam o runtime
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/db"
ENV DIRECT_URL="postgresql://user:pass@localhost:5432/db"

RUN npm install

# Copia o restante da aplicação
COPY . .

# Gera o client novamente para garantir sincronia com possíveis mudanças no resto do projeto
RUN npx prisma generate

FROM base AS dev

EXPOSE 3000

CMD ["npm", "run", "dev"]