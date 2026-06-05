# 🧠 Contexto do Projeto: Economiza+ Backend

Este arquivo serve como um "cérebro" de contexto para inteligências artificiais e novos desenvolvedores que venham a atuar no repositório. **Deve ser lido antes de iniciar novas implementações** e **atualizado regularmente** conforme o projeto evolui.

---

## 📌 Visão Geral do Projeto
**Nome**: Economiza+ (Backend)
**Descrição**: Sistema de gestão financeira construído como Projeto Integrador do curso de Análise e Desenvolvimento de Sistemas (ADS - IFCE).
**Objetivo**: Oferecer uma API Restful robusta, com autenticação, gestão de categorias, transações financeiras e controle de contas para usuários finais.
**Fase Atual**: Desenvolvimento Ativo / Refatoração. O projeto passou recentemente por uma padronização arquitetural e refatoração para DDD (Domain-Driven Design).

## 🛠️ Stack Tecnológica
- **Linguagem**: TypeScript (`ts-node-dev` para desenvolvimento).
- **Runtime**: Node.js.
- **Framework Web**: Express (`express-async-errors` para exceptions, `cors` para cross-origin).
- **Banco de Dados**: PostgreSQL (executado via Docker / `docker-compose`).
- **ORM**: Prisma (`@prisma/client` e `@prisma/adapter-pg`).
- **Autenticação**: JWT (`jsonwebtoken`) e criptografia de senhas com `bcrypt`.
- **Utilitários**: `date-fns` para manipulação de dados, `reflect-metadata` para possíveis decorações base.

---

## 🏛️ Arquitetura e Padrões (DDD / Clean Architecture)
A arquitetura do projeto divide as responsabilidades em camadas rigorosas no diretório `/src`. A regra principal é: **Camadas internas (Domain) não devem conhecer camadas externas (Infra/Web)**.

### Estrutura de Diretórios:
📂 **`src/domain/`** (Regras de Negócio Core)
- Contém as **Entities** (Classes que representam o núcleo do negócio, ex: `Category`, `User`), ricas em regras puras em vez de apenas dados.
- Contém as **Repository Interfaces** (Ex: `InterfaceCategoryRepository`). O domínio dita *quais* métodos o banco deve ter, mas não *como* eles funcionam.

📂 **`src/application/`** (Casos de Uso)
- Contém os **Services** (ex: `CategoryService.ts`), responsáveis pela orquestração.
- Os Services recebem dependências via DI (Dependency Injection) pelo construtor (Ex: instâncias de repositórios).
- Contém **DTOs** (Data Transfer Objects) que mapeiam os dados que entram e que saem, escondendo as entidades de domínio da resposta web.

📂 **`src/interface/`** (Controladores e Rotas)
- Contém os **Controllers**, que extraem dados da requisição (`req.body`, `req.params`) e interagem com a camada de `application` (Services).
- Pode abrigar Middlewares (Ex: Autenticação JWT).

📂 **`src/infrastructure/`** (Bancos e Serviços Externos)
- Implementações concretas de Repositórios usando **Prisma ORM**.
- Comunicações externas (APIs de terceiros, se existirem no futuro).

📂 **`src/shared/`** (Código Comum)
- Middlewares globais (Ex: `authMiddleware`, `roleMiddleware`).
- Custom errors no diretório `errors` (Ex: `BadRequestError`).
- Utilitários globais.

📄 **`src/app.ts`**: Factory `createApp` que configura o Express, injeta dependências e registra as rotas.
📄 **`src/index.ts`**: Ponto de entrada que inicializa o servidor.

---

## 📖 Documentação Adicional
- [🧠 Contexto para IA (IA_CONTEXT.md)](./IA_CONTEXT.md): Guia técnico profundo para agentes de IA e novos desenvolvedores.

---

## 📋 Regras de Ouro e Boas Práticas (Para IAs e Devs)

1. **Gestão de Exceções**: NÃO use `try/catch` extensivos nos controllers. O `express-async-errors` está instalado. Se uma regra de negócio quebra no Service, apenas dispare a exceção (`throw new BadRequestError('Mensagem')`). Um middleware global de erro no Express deve formatar isso para o usuário final.
2. **Injeção de Dependências**: Evite instanciar repositórios do Prisma diretamente dentro dos Services. Sempre exija a interface de repositório no `constructor` do service.
3. **Validação de Propriedade**: Toda ação que muta ou busca recursos específicos (ex: Update de Categoria) precisa validar se o ID de quem está acessando é dono do dado. Nos repositórios, faça buscas conditivas (`userId` + `Id do Recurso`).
4. **Sem Vazamento de Entidades ou BD**: O retorno de um Service deve sempre ser um DTO mapeado ou um primitivo. Nunca retorne o modelo de banco cru diretamente para o controller sem um tratamento, evite expor senhas e campos confidenciais como o `userId` não-essencial nas respostas.

---

## 🚀 Próximos Passos & CI/CD (Histórico)
- Foi sondada a necessidade de implementação de **Testes Automatizados (White Box, Black Box, Gray Box)** com vista a montar esteiras de integração contínua (CI/CD).
- O framework Vitest chegou a ser instalado como experimento prévio.
- Quando a iniciativa de testes for retomada, os Services deverão ser testados unicamente através de `Mocks` repassados em seus construtores (Caixa Branca/Testes de Unidade Isolada).

---
*(Instrução para IAs: Sempre que uma nova funcionalidade que altera a dinâmica arquitetural for adicionada ou uma nova biblioteca de core for instalada, atualize este arquivo com as informações.)*
