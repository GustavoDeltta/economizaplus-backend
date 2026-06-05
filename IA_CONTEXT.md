# 🧠 Contexto para Agentes de IA: Economiza+ Backend

Este documento fornece o contexto técnico completo e as instruções normativas para que agentes de IA possam desenvolver, refatorar e testar o código deste repositório com máxima eficiência e mínimo consumo de tokens.

---

## 🏛️ 1. Arquitetura e Estrutura de Pastas (DDD)

O projeto segue os princípios de **Domain-Driven Design (DDD)** e **Clean Architecture**. O código está dividido em 4 camadas principais dentro de `src/`:

### 📂 `domain/` (Coração do Negócio)
*   **Responsabilidade**: Regras de negócio puras, entidades e contratos (interfaces).
*   **Regra de Ouro**: NÃO pode importar nada de camadas externas (application, interface, infrastructure).
*   **Subpastas**:
    *   `entities/`: Classes que representam o negócio (ex: `User.ts`, `Transaction.ts`). Devem conter validações ricas.
    *   `repositories/`: Interfaces que definem como os dados são acessos (ex: `InterfaceUserRepository.ts`).

### 📂 `application/` (Casos de Uso)
*   **Responsabilidade**: Orquestração do fluxo de dados. Traduz as intenções do usuário em ações no domínio.
*   **Padrões**:
    *   `services/`: Classes que recebem repositórios via **Injeção de Dependência** no construtor.
    *   `DTO/`: Objetos de transferência de dados para entrada e saída, evitando o vazamento de entidades de banco.

### 📂 `interface/` (Adaptadores de Entrada)
*   **Responsabilidade**: Interface com o mundo externo (HTTP/Express).
*   **Componentes**:
    *   `controllers/`: Recebem `Request` e `Response`, chamam os `Services` e retornam o status HTTP.
    *   `middlewares/`: Autenticação, autorização e tratamento de erros.

### 📂 `infrastructure/` (Implementações Concretas)
*   **Responsabilidade**: Detalhes técnicos, banco de dados, APIs externas.
*   **Componentes**:
    *   `prisma/`: Cliente Prisma e Schema.
    *   `repositories/`: Implementações concretas das interfaces do `domain` usando Prisma.
    *   `factories/`: Centralizam a criação de instâncias (DI manual), injetando os repositórios nos services e services nos controllers.

---

## 🛠️ 2. Stack Tecnológica
- **Linguagem**: TypeScript
- **Framework**: Express (com `express-async-errors`)
- **ORM**: Prisma (PostgreSQL)
- **Testes**: Vitest, Supertest
- **Auth**: JWT + Bcrypt

---

## 📋 3. Regras de Desenvolvimento para a IA

### 3.1 Ao Criar um Novo Recurso (Fluxo Obrigatório)
1.  **Domain/Entity**: Crie a entidade com suas propriedades.
2.  **Domain/Repository Interface**: Defina os métodos necessários para a persistência.
3.  **Infrastructure/Repository**: Implemente a interface usando Prisma.
4.  **Application/DTO**: Crie os DTOs de Request e Response.
5.  **Application/Service**: Implemente a lógica de negócio, injetando o repositório no constructor.
6.  **Interface/Controller**: Crie o controller para expor o serviço via HTTP.
7.  **Infrastructure/Factory**: Crie uma função `makeXController()` para instanciar tudo.
8.  **Routes**: Registre a rota em `src/routes.ts` ou `src/app.ts`.

### 3.2 Injeção de Dependência (DI)
Não use ferramentas de DI automáticas (como Inversify). O projeto usa **DI Manual via Factories**. 
Sempre defina as dependências no `constructor` como interfaces:
```typescript
class MyService {
  constructor(private repository: IMyRepository) {}
}
```

### 3.3 Tratamento de Erros
- NÃO use `try/catch` para erros de negócio nos controllers ou services.
- Dispare erros customizados (`throw new BadRequestError('...')`).
- O `errorHandler` em `src/shared/middlewares/` captura e formata a resposta.

### 3.4 Segurança e Propriedade
Sempre valide se o recurso pertence ao usuário autenticado:
```typescript
// No Service
const resource = await this.repository.findById(id);
if (resource.userId !== userId) throw new BadRequestError("Não autorizado");
```

---

## 🧪 4. Padrão de Testes

O projeto utiliza uma pirâmide de testes:

### 🟢 Testes Unitários (`tests/unit`)
- **Foco**: Services.
- **Mocking**: Use **In-Memory Repositories** (implementações simples com arrays) localizados em `tests/unit/helpers/`.
- Não use mocks de biblioteca (ex: `jest.mock`) para os repositórios; prefira as versões In-Memory por serem Type-Safe.

### 🟡 Testes de Integração (`tests/integration`)
- **Foco**: Rotas HTTP e Controllers.
- **Ferramenta**: Supertest.
- **Configuração**: Use a factory `createApp(controllers)` em `src/app.ts` para injetar os controllers com repositórios In-Memory, evitando a necessidade de um banco de dados real nos testes de CI.

---

## 🤖 5. Integração com IA (Gemini)
O projeto conta com o `AIService` que utiliza o modelo **`gemini-2.0-flash`** via SDK do `GoogleGenAI`.
- **Funcionalidade**: Atualmente gera dicas financeiras baseadas em metas do usuário.
- **Configuração**: Requer a variável de ambiente `GOOGLE_GENAI_API_KEY`.
- **Prompt Building**: Utiliza o `PrompBuilderService` para padronizar as instruções enviadas ao modelo.

---

## 🗄️ 6. Resumo do Banco de Dados (Prisma)
- **User**: Id, Name, Email, PasswordHash, Role (COMMON/ADMIN).
- **Category**: Per usuário (userId + name unique). Color, Transactions.
- **Card**: Cartões de crédito/débito. Limite, Brand, Last4Digits (Unique por usuário).
- **Goal**: Metas financeiras. TargetAmount, Deadline.
- **Transaction**: Vinculada a User, Category, Card e Goal (opcionais).
- **EducationalContent**: Conteúdos para educação financeira.

---

## 🦾 7. Instruções de Prompt para o Agente
Quando me pedir para realizar uma tarefa, considere:
1.  **Analise o `schema.prisma`** primeiro se houver mudanças no banco.
2.  **Siga o padrão de camadas** à risca. Se eu pedir um "Create User", você deve saber que isso envolve Entity, Repository Interface, Prisma Repo, Service, Controller e Factory.
3.  **Sugira testes** sempre que criar um novo Service. 
4.  **Token Economy**: Não leia todos os arquivos. Use este guia para saber onde cada peça se encaixa. Se precisar entender um padrão, peça para ler um Service existente (ex: `CategoryService.ts`) e sua Factory correspondente.

---
*Atualizado em: 05/04/2026*
