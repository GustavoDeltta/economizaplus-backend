# Guia de Contribuição - Economiza Plus Backend 🚀

Bem-vindo ao desenvolvimento do backend do Economiza Plus! Para manter o código organizado, estável e escalável, seguimos um fluxo de trabalho baseado no **Git Flow**.

---

## 1. Fluxo de Branchs

NUNCA realize commits diretamente nas branchs `main` ou `develop`. Todo o trabalho deve ser feito em branchs auxiliares.

### 1.1 Branchs Principais
- **`main`**: Reflete o estado atual em **Produção**. É protegida e só aceita merges vindos da `develop` ou branchs de `hotfix`.
- **`develop`**: Nossa branch de **Integração**. É onde as novas funcionalidades são testadas antes de irem para produção.

### 1.2 Categorias de Branchs Auxiliares
Sempre use o prefixo correspondente ao tipo de tarefa:

| Prefixo | Descrição | Exemplo |
| :--- | :--- | :--- |
| `feat/` | Nova funcionalidade | `feat/login-google` |
| `fix/` | Correção de bug | `fix/erro-auth-middleware` |
| `docs/` | Mudanças em documentação | `docs/update-readme` |
| `chore/` | Mudanças de infra, build ou dependências | `chore/add-zod-validation` |
| `test/` | Adição ou correção de testes | `test/user-service` |
| `hotfix/` | Correção urgente em Produção | `hotfix/vazamento-memoria` |

---

## 2. Processo de Desenvolvimento

1. **Sincronize sua base**: Antes de começar, garanta que sua `develop` local está atualizada.
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **Crie sua branch**:
   ```bash
   git checkout -b feat/minha-nova-feature
   ```

3. **Desenvolva e Teste**: Certifique-se de que os testes passam (`npm test`) antes de subir o código.

4. **Abra um Pull Request (PR)**:
   - Destino: `develop`.
   - Descreva brevemente o que foi feito.
   - Aguarde o Code Review de pelo menos um colega.

---

## 3. Padrões de Código

- **Commits em Inglês (Opcional, defina com o time)** ou Português claro.
- **Validação de Variáveis**: Sempre cheque se novas váriáveis de ambiente foram adicionadas ao `src/shared/env.ts` e `.env.example`.

---

## 4. Deploy

- O deploy na **Vercel de Staging** acontece automaticamente a cada merge na branch `develop`.
- O deploy na **Vercel de Produção** só acontece quando há um merge da `develop` para a `main`.

---

Agradecemos sua contribuição para tornar o **Economiza Plus** cada vez melhor! 💸
