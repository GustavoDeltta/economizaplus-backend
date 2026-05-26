# 🚀 Guia de Configuração - Economiza Plus (Backend)

## 1. Requisitos Necessários
* **Node.js**: v18+ (recomendado v20+)
* **Docker & Docker Compose**: Opcional (se for rodar o banco localmente).
* **Git**: Para versionamento.

---

## 2. Instalação Inicial
1. Clone o repositório.
2. Na raiz do projeto, instale as dependências:
   ```bash
   npm install
   ```

---

## 3. Configuração de Ambiente (.env)
O projeto agora suporta banco de dados local (Docker) ou remoto (**Supabase**). Crie um arquivo `.env` baseado no `.env.example`:

### Exemplo para Desenvolvimento Local (Docker):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/databasename"
DIRECT_URL="postgresql://user:password@localhost:5432/databasename"
JWT_SECRET="chave-secreta-para-testes"
```

### Exemplo para Produção/Staging (Supabase):
```env
# URL de Pooling (Porta 6543)
DATABASE_URL="postgresql://[USER]:[SENHA]@[HOST]:6543/postgres?pgbouncer=true"
# URL Direta (Porta 5432) - Obrigatória para Migrations
DIRECT_URL="postgresql://[USER]:[SENHA]@[HOST]:5432/postgres"
```

---

## 4. Banco de Dados e Prisma 7
Este projeto utiliza o **Prisma 7**. Diferente de versões anteriores, a configuração de conexão reside em `prisma.config.ts`.

### 4.1 Subindo o Banco Local (Docker)
```bash
docker-compose up -d
```

### 4.2 Sincronizando o Schema
Para criar/atualizar as tabelas:
```bash
# Para desenvolvimento (gera histórico de migrations)
npx prisma migrate dev

# Para deploy em produção (apenas aplica migrações existentes)
npx prisma migrate deploy
```

> [!IMPORTANT]
> O CLI do Prisma usará automaticamente a `DIRECT_URL` (se definida) para garantir que as migrations funcionem em ambientes de nuvem como o Supabase.

---

## 5. Desenvolvimento e Deploy

### Rodar Localmente:
```bash
npm run dev
```
O servidor rodará em: `http://localhost:3000` (ou a porta definida no seu `.env`).

### Deploy na Vercel:
O projeto está configurado para deploy automático na Vercel via **Serverless Functions**.
1. Certifique-se de que os arquivos `vercel.json` e `api/index.ts` estão presentes.
2. Configure as **Environment Variables** no painel da Vercel com os valores do seu `.env`.

### 5.2 Rodar via Docker (Full Stack Local)
Se preferir rodar tudo em containers (API + Banco):
```bash
docker-compose up --build
```
A API estará disponível em `http://localhost:3000`. Alterações no código serão refletidas automaticamente (Hot Reload).

---

## 6. Comandos Úteis
* `npm run dev`: Inicia o servidor de desenvolvimento.
* `npm run build`: Compila o projeto (usado pela Vercel).
* `npx prisma studio`: Abre a interface visual do banco de dados (http://localhost:5555).
* `npx prisma generate`: Regenera o client após mudanças no schema.
