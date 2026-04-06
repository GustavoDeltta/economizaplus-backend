# 📋 Documentação de Testes — Economiza+ Backend

**Projeto:** Economiza+ — Sistema de Gestão Financeira  
**Disciplina:** Projeto Integrador — ADS/IFCE  
**Tecnologias de Teste:** Vitest · Supertest · In-Memory Repositories  
**Data de Geração:** Abril/2026  

---

## 1. Estratégia de Testes Adotada

### 1.1 Pirâmide de Testes Aplicada ao Projeto

```
            ┌───────────────────────┐
            │   TESTES E2E          │  (Fora do escopo atual)
            │   (ex: Cypress)       │
            ├───────────────────────┤
            │   TESTES DE           │  tests/integration/
            │   INTEGRAÇÃO (9)      │  Supertest + createApp(DI)
            ├───────────────────────┤
            │   TESTES UNITÁRIOS    │  tests/unit/
            │       (43)            │  In-Memory Repositories
            └───────────────────────┘
```

O projeto adota a **Pirâmide de Testes** clássica, priorizando a base com testes unitários rápidos e isolados, complementados por testes de integração que validam o stack HTTP completo.

### 1.2 Camadas e Abordagens

| Camada | Tipo | Quantidade | Ferramenta | Banco de Dados |
|--------|------|-----------|------------|----------------|
| `application/services` | Unitário (Caixa Branca) | 43 | Vitest + In-Memory Repos | ❌ Não usa |
| `interface/controllers` + rotas | Integração (Caixa Cinza) | 9 | Supertest + `createApp(DI)` | ❌ Não usa |
| API completa com Prisma real | E2E | — | Postman / Cypress | ✅ Exigiria |

### 1.3 Decisões de Arquitetura

**In-Memory Repositories:**  
Ao invés de mocks automáticos (como `vitest-mock-extended`), foram criadas implementações concretas das interfaces de repositório que armazenam dados em arrays na memória. Essa abordagem é:
- ✅ **Type-Safe**: respeita rigorosamente as interfaces TypeScript do domínio
- ✅ **Transparente**: facilita a leitura e o debugging dos testes
- ✅ **Fiel ao contrato**: qualquer mudança na interface de repositório quebra o teste, garantindo coerência

**`createApp(controllers?)` para Integração:**  
A função `createApp` aceita os controllers como parâmetros opcionais, permitindo injetar implementações com In-Memory Repositories nos testes sem modificar o código de produção. Sem parâmetros, a função usa os factories Prisma reais.

**Mock do `authMiddleware`:**  
O middleware de autenticação faz uma consulta direta ao banco Prisma. Para os testes de integração, ele é substituído por um mock que informa um `userId` fixo (`user-autenticado-uuid`), desacoplando os testes de infraestrutura.

---

## 2. Relatório de Cobertura (Coverage)

| Arquivo | % Statements | % Branch | % Funcs | % Lines |
|---------|-------------|----------|---------|---------|
| `CategoryService.ts` | 92,85% | 83,33% | 100% | 92,59% |
| `GoalService.ts` | 95,45% | 90% | 100% | 95,45% |
| `LoginService.ts` | **100%** | **100%** | **100%** | **100%** |
| `UserService.ts` | 86,20% | 80% | 87,50% | 85,18% |
| **Total** | **92,13%** | **86,11%** | **95,65%** | **91,86%** |

---

## 3. Casos de Teste — Testes Unitários

### 3.1 CategoryService

| ID | Título | Cenário | Pré-condição | Resultado Esperado |
|----|--------|---------|--------------|-------------------|
| UT-CAT-01 | Criar categoria com sucesso | 😊 Caminho Feliz | Usuário autenticado; nome de categoria não existe | Retorna `CategoryResponseDTO` com `id`, `name` e `color` |
| UT-CAT-02 | Criar categoria duplicada | 😢 Caminho Triste | Categoria com mesmo nome já existe para o usuário | Lança `BadRequestError` ("Categoria já existe para este usuário") |
| UT-CAT-03 | Múltiplos usuários, mesmo nome | 😊 Caminho Feliz | Usuário B cria categoria com mesmo nome do Usuário A | Categoria criada com sucesso para o Usuário B |
| UT-CAT-04 | Atualizar categoria com sucesso | 😊 Caminho Feliz | Categoria existe e pertence ao usuário | Retorna DTO atualizado com novo `name` e `color` |
| UT-CAT-05 | Atualizar categoria inexistente | 😢 Caminho Triste | ID inválido ou categoria não existe | Lança `BadRequestError` |
| UT-CAT-06 | Usuário B atualiza categoria de A | 😢 Caminho Triste | Categoria pertence ao Usuário A; Usuário B tenta modificar | Lança `BadRequestError` ("não pertence a você") |
| UT-CAT-07 | Deletar categoria com sucesso | 😊 Caminho Feliz | Categoria existe e pertence ao usuário | Retorna DTO da categoria removida; repositório vazio |
| UT-CAT-08 | Deletar categoria inexistente | 😢 Caminho Triste | ID inválido | Lança `BadRequestError` |
| UT-CAT-09 | Usuário B deleta categoria de A | 😢 Caminho Triste | Categoria pertence ao Usuário A; Usuário B tenta deletar | Lança `BadRequestError`; categoria permanece no repositório intacta |
| UT-CAT-10 | Buscar categoria por nome (encontrada) | 😊 Caminho Feliz | Categoria existe no repositório | Retorna DTO correto |
| UT-CAT-11 | Buscar categoria por nome (não encontrada) | 😢 Caminho Triste | Categoria não existe | Lança `BadRequestError` ("Categoria não encontrada") |
| UT-CAT-12 | Listar categorias – lista vazia | 😊 Caminho Feliz | Usuário não possui categorias | Retorna `[]` |
| UT-CAT-13 | Listar categorias – isolamento por usuário | 😊 Caminho Feliz | Usuários A e B possuem categorias distintas | Retorna somente as categorias do usuário solicitante |
| UT-CAT-14 | DTO sem userId exposto | 😊 Caminho Feliz | Categoria criada com sucesso | DTO retornado contém `id`, `name`, `color` — **sem** `userId` |

### 3.2 UserService

| ID | Título | Cenário | Pré-condição | Resultado Esperado |
|----|--------|---------|--------------|-------------------|
| UT-USR-01 | Criar usuário com sucesso | 😊 Caminho Feliz | E-mail não cadastrado | Retorna usuário com `id` gerado |
| UT-USR-02 | Hash da senha ao registrar | 😊 Caminho Feliz | `PasswordHasher.hash()` é computado | `hash()` chamado com a senha em texto claro; retorno é hash |
| UT-USR-03 | Criar usuário com e-mail duplicado | 😢 Caminho Triste | E-mail já cadastrado | Lança `BadRequestError` ("Usuário já existe") |
| UT-USR-04 | Buscar perfil com sucesso | 😊 Caminho Feliz | Usuário existe | Retorna DTO **sem** o campo `password` |
| UT-USR-05 | Buscar perfil de usuário inexistente | 😢 Caminho Triste | `userId` inválido | Lança `NotFoundError` ("Usuário não encontrado") |
| UT-USR-06 | Listar todos os usuários | 😊 Caminho Feliz | Existem usuários cadastrados | Retorna array de DTOs sem o campo `password` |
| UT-USR-07 | Listar usuários – lista vazia | 😊 Caminho Feliz | Nenhum usuário cadastrado | Retorna `[]` |
| UT-USR-08 | Atualizar usuário com sucesso | 😊 Caminho Feliz | Usuário existe | Retorna DTO com `name` e `email` atualizados |
| UT-USR-09 | Atualizar usuário inexistente | 😢 Caminho Triste | `userId` inválido | Lança `NotFoundError` |
| UT-USR-10 | Deletar usuário com sucesso | 😊 Caminho Feliz | Usuário existe | Retorna dados do usuário removido; repositório vazio |
| UT-USR-11 | Deletar usuário inexistente | 😢 Caminho Triste | `userId` inválido | Lança `NotFoundError` |

### 3.3 GoalService

| ID | Título | Cenário | Pré-condição | Resultado Esperado |
|----|--------|---------|--------------|-------------------|
| UT-GOL-01 | Criar meta com sucesso | 😊 Caminho Feliz | Usuário não possui meta | Retorna entidade `Goal` com `id` gerado |
| UT-GOL-02 | Criar múltiplas metas | 😊 Caminho Feliz | Usuário já possui uma meta (ex: Carro) | Permite criar a segunda meta (ex: Celular) e lista ambas |
| UT-GOL-03 | Múltiplos usuários criam metas | 😊 Caminho Feliz | Usuários A e B criam metas independentes | Ambas as metas criadas; repositório com 2 registros |
| UT-GOL-04 | Atualizar meta com sucesso | 😊 Caminho Feliz | Meta existe e pertence ao usuário | Retorna meta com dados atualizados |
| UT-GOL-05 | Usuário B atualiza meta de A | 😢 Caminho Triste (🔒 Segurança) | Meta pertence ao Usuário A | Lança `BadRequestError` ("não pertence a você") |
| UT-GOL-06 | Atualizar meta inexistente | 😢 Caminho Triste | ID inválido | Lança `BadRequestError` |
| UT-GOL-07 | Deletar meta com sucesso | 😊 Caminho Feliz | Meta existe e pertence ao usuário | Repositório vazio após remoção |
| UT-GOL-08 | Usuário B deleta meta de A | 😢 Caminho Triste (🔒 Segurança) | Meta pertence ao Usuário A | Lança `BadRequestError`; meta permanece no repositório |
| UT-GOL-09 | Deletar meta inexistente | 😢 Caminho Triste | ID inválido | Lança `BadRequestError` |
| UT-GOL-10 | Buscar meta por nome (encontrada) | 😊 Caminho Feliz | Meta existe | Retorna entidade `Goal` |
| UT-GOL-11 | Buscar meta por nome (não encontrada) | 😢 Caminho Triste | Nome não existe | Lança `BadRequestError` ("Meta não encontrada") |
| UT-GOL-12 | Listar metas por usuário | 😊 Caminho Feliz | Usuário possui metas | Retorna somente as metas do usuário solicitante |
| UT-GOL-13 | Listar metas – lista vazia | 😊 Caminho Feliz | Usuário sem metas | Retorna `[]` |

### 3.4 LoginService

| ID | Título | Cenário | Pré-condição | Resultado Esperado |
|----|--------|---------|--------------|-------------------|
| UT-LOG-01 | Login com credenciais válidas | 😊 Caminho Feliz | Usuário cadastrado, senha correta | Retorna `{ token, user }` |
| UT-LOG-02 | Token gerado com payload correto | 😊 Caminho Feliz | Login bem-sucedido | `JwtService.generateToken()` chamado com `{ id, role }` |
| UT-LOG-03 | Login com e-mail inexistente | 😢 Caminho Triste | E-mail não cadastrado | Lança `BadRequestError` ("Invalid credentials") |
| UT-LOG-04 | Login com senha incorreta | 😢 Caminho Triste | E-mail correto, senha errada | Lança `BadRequestError` ("Invalid credentials") |
| UT-LOG-05 | Mensagem de erro genérica (segurança) | 😢 Caminho Triste (🔒 Segurança) | Tentativa com e-mail inválido vs. senha inválida | **Ambos** retornam a **mesma mensagem** — não revela qual dado está incorreto |

### 3.5 CardService

| ID | Título | Cenário | Pré-condição | Resultado Esperado |
|----|--------|---------|--------------|-------------------|
| UT-CRD-01 | Criar cartão com sucesso | 😊 Caminho Feliz | Usuário autenticado; últimos 4 dígitos não cadastrados | Retorna `Card` com `id` gerado |
| UT-CRD-02 | Criar cartão duplicado | 😢 Caminho Triste | Mesmos últimos 4 dígitos já existem para o usuário | Lança `BadRequestError` ("Cartão já cadastrado") |
| UT-CRD-03 | Listar cartões do usuário | 😊 Caminho Feliz | Usuário possui cartões cadastrados | Retorna apenas os cartões pertencentes ao `userId` |
| UT-CRD-04 | Buscar cartão por ID (sucesso) | 😊 Caminho Feliz | Cartão existe e pertence ao usuário | Retorna detalhes do cartão |
| UT-CRD-05 | Buscar cartão de outro usuário | 😢 Caminho Triste | ID pertence ao Usuário B; Usuário A tenta acessar | Lança `BadRequestError` ("não pertence ao usuário") |
| UT-CRD-06 | Atualizar cartão com sucesso | 😊 Caminho Feliz | Cartão existe e pertence ao usuário | Retorna objeto `Card` atualizado |
| UT-CRD-07 | Deletar cartão com sucesso | 😊 Caminho Feliz | Cartão existe e pertence ao usuário | Remove do repositório; retorna o cartão deletado |

### 3.6 GoogleLoginService

| ID | Título | Cenário | Pré-condição | Resultado Esperado |
|----|--------|---------|--------------|-------------------|
| UT-GGL-01 | Login Google (Usuário Existente) | 😊 Caminho Feliz | E-mail já cadastrado no sistema | Retorna token JWT sem criar novo registro |
| UT-GGL-02 | Login Google (Novo Usuário) | 😊 Caminho Feliz | E-mail não cadastrado | Cria novo usuário com dados do Google e retorna token |
| UT-GGL-03 | Login Google (Token Inválido) | 😢 Caminho Triste | `idToken` expirado ou inválido | Lança erro de autenticação do provedor |

---

## 4. Casos de Teste — Testes de Integração

| ID | Título | Cenário | Camada Testada | Resultado Esperado |
|----|--------|---------|----------------|-------------------|
| IT-AUTH-01 | Registrar novo usuário | 😊 Caminho Feliz | HTTP → Controller → Service → Repo | `HTTP 201` + body com `{ user }` |
| IT-AUTH-02 | Registrar usuário com e-mail duplicado | 😢 Caminho Triste | HTTP → Controller → Service (BadRequest) | `HTTP 400` + body com `{ message }` |
| IT-AUTH-03 | Login com credenciais válidas | 😊 Caminho Feliz | HTTP → Controller → Service → JWT | `HTTP 200` + body com `{ token, user }` |
| IT-AUTH-04 | Login com e-mail inexistente | 😢 Caminho Triste | HTTP → Controller → Service (BadRequest) | `HTTP 400` + body com `{ message }` |
| IT-AUTH-05 | Login com senha incorreta | 😢 Caminho Triste | HTTP → Controller → Service (BadRequest) | `HTTP 400` + body com `{ message }` |
| IT-AUTH-06 | Acessar perfil autenticado | 😊 Caminho Feliz | HTTP (auth mock) → Controller → Service | `HTTP 200` + perfil **sem** `password` |
| IT-CAT-01 | Criar categoria via API | 😊 Caminho Feliz | HTTP (auth mock) → Controller → Service | `HTTP 201` + `{ category }` |
| IT-CAT-02 | Listar categorias via API | 😊 Caminho Feliz | HTTP (auth mock) → Controller → Service | `HTTP 200` + array de DTOs |
| IT-CAT-03 | Deletar categoria de outro usuário | 😢 Caminho Triste (🔒 Segurança) | HTTP (auth mock) → Controller → Service (BadRequest) | `HTTP 400` + mensagem de propriedade |
| IT-CRD-01 | POST /api/cards | 😊 Caminho Feliz | Autenticado; Payload válido | `HTTP 201` + `{ card }` |
| IT-CRD-02 | GET /api/cards | 😊 Caminho Feliz | Autenticado | `HTTP 200` + array de cartões |
| IT-CRD-03 | PUT /api/cards/:id | 😊 Caminho Feliz | Autenticado; Dono do cartão | `HTTP 200` + cartão atualizado |
| IT-CRD-04 | DELETE /api/cards/:id | 😊 Caminho Feliz | Autenticado; Dono do cartão | `HTTP 204` (No Content) |

---

## 5. Comandos de Execução

```bash
# Executar todos os testes
npm test

# Executar somente testes unitários
npx vitest run tests/unit

# Executar somente testes de integração
npx vitest run tests/integration

# Modo watch (desenvolvimento)
npm run test:watch

# Gerar relatório de cobertura (HTML em coverage/)
npm run test:coverage
```

---

## 6. Estrutura dos Arquivos de Teste

```
tests/
├── unit/
│   ├── helpers/
│   │   ├── InMemoryCategoryRepository.ts   # Implementação em memória
│   │   ├── InMemoryUserRepository.ts       # Implementação em memória
│   │   └── InMemoryGoalRepository.ts       # Implementação em memória
│   └── application/
│       └── services/
│           ├── CategoryService.spec.ts     # 14 testes
│           ├── UserService.spec.ts         # 11 testes
│           ├── GoalService.spec.ts         # 13 testes
│           └── LoginService.spec.ts        # 5 testes
└── integration/
    └── routes/
        └── auth.spec.ts                   # 9 testes (Supertest)
```

---

## 7. Glossário

| Termo | Significado |
|-------|------------|
| **Caminho Feliz** | Fluxo esperado de sucesso, onde todas as pré-condições são satisfeitas |
| **Caminho Triste** | Fluxo de exceção ou erro, testando respostas a entradas inválidas |
| **🔒 Segurança** | Testes específicos que validam que um usuário não acessa dados de outro |
| **In-Memory Repository** | Implementação de repositório que usa arrays em memória (sem banco) |
| **DI (Dependency Injection)** | Padrão em que dependências são passadas para a classe pelo construtor |
| **DTO (Data Transfer Object)** | Objeto que transporta dados sem expor entidades internas de domínio |
| **Coverage** | Percentual do código-fonte coberto pelos testes automatizados |
