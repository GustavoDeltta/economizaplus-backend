GUIA DE CONFIGURAÇÃO - BACKEND
---

### 1. REQUISITOS NECESSÁRIOS

* Node.js instalado (v18+)
* Docker & Docker Compose instalados
* Git

### 2. INSTALAÇÃO INICIAL

* Abra o terminal na pasta do projeto.

* Rode o comando: `npm install` para instalar as dependências.

* Crie um arquivo chamado `.env` na raiz e cole a linha abaixo: `DATABASE_URL="postgresql://user:password@localhost:5432/mydatabase?schema=public"`

### 3. SUBINDO O BANCO DE DADOS (DOCKER) 
Não precisa instalar o Postgres no Windows/Linux. Basta rodar:

```bash
 docker-compose up -d
 ```
 (Isso vai baixar a imagem do Postgres e deixar o banco rodando em segundo plano)

### 4. CONFIGURANDO O PRISMA (TABELAS) 
Para criar as tabelas no banco de dados que o Docker subiu:

* Rode: `npx prisma migrate dev --name init`
* Para ver o banco de forma visual no navegador, rode: `npx prisma studio`

        O Prisma Studio abrirá em: http://localhost:5555

### 5. RODANDO O SISTEMA 
Para começar a desenvolver com o servidor ligado:

* Rode: `npm run dev` 
* O servidor vai rodar em: `http://localhost:3333`

### 6. COMANDOS ÚTEIS (RESUMO)

* `npm run dev` -> Inicia o projeto.

* `docker-compose up -d` -> Liga o banco de dados.

* `npx prisma studio` -> Abre o visualizador do banco no navegador.

* `npx prisma generate` -> Atualiza os tipos do TypeScript se o Schema mudar.