import 'dotenv/config';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import { errorHandler } from './shared/middlewares/errorHandler';
import { authMiddleware } from './shared/middlewares/authMiddleware';
import { roleMiddleware } from './shared/middlewares/roleMiddleware';

// Tipos dos controllers para injeção nos testes
import type { UserController } from './interface/controllers/UserController';
import type { LoginController } from './interface/controllers/LoginController';
import type { CategoryController } from './interface/controllers/CategoryController';
import type { GoalController } from './interface/controllers/GoalController';
import type { CardController } from './interface/controllers/CardController';
import type { GoogleLoginController } from './interface/controllers/GoogleLoginController';
import type { AIController } from './interface/controllers/AIController';
import type { WalletController } from './interface/controllers/WalletController';
import type { TransactionController } from './interface/controllers/TransactionController';
import type { SavingController } from './interface/controllers/SavingController';

export interface AppControllers {
  userController: UserController;
  loginController: LoginController;
  categoryController: CategoryController;
  goalController: GoalController;
  cardController: CardController;
  googleLoginController: GoogleLoginController;
  aiController: AIController;
  walletController: WalletController;
  transactionController: TransactionController;
  savingController: SavingController;
}

/**
 * Factory que cria e configura uma instância do Express.
 * Aceita controllers opcionais para permitir injeção de dependências nos testes.
 * Se não fornecidos, usa os factories de produção (Prisma).
 */
export function createApp(controllers?: AppControllers) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  let userController: UserController;
  let loginController: LoginController;
  let categoryController: CategoryController;
  let goalController: GoalController;
  let cardController: CardController;
  let googleLoginController: GoogleLoginController;
  let aiController: AIController;
  let walletController: WalletController;
  let transactionController: TransactionController;
  let savingController: SavingController;

  if (controllers) {
    // Modo de teste: controllers injetados externamente
    userController = controllers.userController;
    loginController = controllers.loginController;
    categoryController = controllers.categoryController;
    goalController = controllers.goalController;
    cardController = controllers.cardController;
    googleLoginController = controllers.googleLoginController;
    aiController = controllers.aiController;
    walletController = controllers.walletController;
    transactionController = controllers.transactionController;
    savingController = controllers.savingController;
  } else {
    // Modo de produção: factories com Prisma real
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { makeUserController } = require('./infrastructure/factories/MakeUserController');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { makeLoginController } = require('./infrastructure/factories/MakeLoginController');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { makeCategoryController } = require('./infrastructure/factories/MakeCategoryController');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { makeGoalController } = require('./infrastructure/factories/MakeGoalController');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { makeCardController } = require('./infrastructure/factories/MakeCardController');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { makeGoogleLoginController } = require('./infrastructure/factories/MakeGoogleLoginController');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { makeAIController } = require('./infrastructure/factories/MakeAIController');
    const { makeWalletController } = require('./infrastructure/factories/MakeWalletController');
    const { makeTransactionController } = require('./infrastructure/factories/MakeTransactionController');
    const { makeSavingController } = require('./infrastructure/factories/MakeSavingController');

    userController = makeUserController();
    loginController = makeLoginController();
    categoryController = makeCategoryController();
    goalController = makeGoalController();
    cardController = makeCardController();
    googleLoginController = makeGoogleLoginController();
    aiController = makeAIController();
    walletController = makeWalletController();
    transactionController = makeTransactionController();
    savingController = makeSavingController();
  }

  // ── Rotas Públicas ────────────────────────────────────────────────────────
  app.post('/api/users/register', (req, res) => userController.create(req, res));
  app.post('/api/login', (req, res) => loginController.login(req, res));
  app.post('/api/login/google', (req, res) => googleLoginController.login(req, res));

  // ── Middleware de Autenticação ─────────────────────────────────────────────
  app.use(authMiddleware);

  // ── Rotas Privadas: Users ──────────────────────────────────────────────────
  app.get('/api/users', roleMiddleware('ADMIN'), (req, res) => userController.getAll(req, res));
  app.get('/api/users/profile', roleMiddleware('COMMON', 'ADMIN'), (req, res) => userController.getProfile(req, res));
  app.put('/api/users/profile', roleMiddleware('COMMON'), (req, res) => userController.update(req, res));
  app.delete('/api/users/profile', roleMiddleware('COMMON'), (req, res) => userController.delete(req, res));

  // ── Rotas Privadas: Categories ─────────────────────────────────────────────
  app.post('/api/categories', roleMiddleware('COMMON'), (req, res) => categoryController.create(req, res));
  app.get('/api/categories', roleMiddleware('COMMON', 'ADMIN'), (req, res) => categoryController.getAllByUserId(req, res));
  app.put('/api/categories/:id', roleMiddleware('COMMON', 'ADMIN'), (req, res) => categoryController.update(req, res));
  app.delete('/api/categories/:id', roleMiddleware('COMMON', 'ADMIN'), (req, res) => categoryController.delete(req, res));

  // ── Rotas Privadas: Goals ──────────────────────────────────────────────────
  app.post('/api/goals', roleMiddleware('COMMON'), (req, res) => goalController.create(req, res));
  app.get('/api/goals', roleMiddleware('COMMON', 'ADMIN'), (req, res) => goalController.getAllByUserId(req, res));
  app.put('/api/goals/:id', roleMiddleware('COMMON', 'ADMIN'), (req, res) => goalController.update(req, res));
  app.delete('/api/goals/:id', roleMiddleware('COMMON', 'ADMIN'), (req, res) => goalController.delete(req, res));

  // ── Rotas Privadas: Cards ──────────────────────────────────────────────────
  app.get('/api/cards', roleMiddleware('COMMON', 'ADMIN'), (req, res) => cardController.getAllByUserId(req, res));
  app.get('/api/cards/:id', roleMiddleware('COMMON', 'ADMIN'), (req, res) => cardController.getCardById(req, res));
  app.post('/api/cards', roleMiddleware('COMMON'), (req, res) => cardController.create(req, res));
  app.put('/api/cards/:id', roleMiddleware('COMMON', 'ADMIN'), (req, res) => cardController.update(req, res));
  app.delete('/api/cards/:id', roleMiddleware('COMMON', 'ADMIN'), (req, res) => cardController.delete(req, res));

  // ── Rotas Privadas: AI ─────────────────────────────────────────────────────
  app.post('/api/ai/tips', roleMiddleware('COMMON', 'ADMIN'), (req, res) => aiController.generateTips(req, res));

  // ── Rotas Privadas: Wallets ────────────────────────────────────────────────
  app.post('/api/wallets', roleMiddleware('COMMON'), (req, res) => walletController.create(req, res));
  app.get('/api/wallets', roleMiddleware('COMMON', 'ADMIN'), (req, res) => walletController.getAll(req, res));
  app.get('/api/wallets/:id', roleMiddleware('COMMON', 'ADMIN'), (req, res) => walletController.getById(req, res));
  app.delete('/api/wallets/:id', roleMiddleware('COMMON', 'ADMIN'), (req, res) => walletController.delete(req, res));

  // ── Rotas Privadas: Transactions ───────────────────────────────────────────
  app.post('/api/transactions', roleMiddleware('COMMON'), (req, res) => transactionController.create(req, res));
  app.get('/api/transactions', roleMiddleware('COMMON', 'ADMIN'), (req, res) => transactionController.getAll(req, res));
  app.delete('/api/transactions/:id', roleMiddleware('COMMON', 'ADMIN'), (req, res) => transactionController.delete(req, res));

  // ── Rotas Privadas: Savings ────────────────────────────────────────────────
  app.post('/api/savings', roleMiddleware('COMMON'), (req, res) => savingController.create(req, res));
  app.get('/api/savings/goal/:goalId', roleMiddleware('COMMON', 'ADMIN'), (req, res) => savingController.getByGoal(req, res));

  app.use(errorHandler);

  return app;
}


