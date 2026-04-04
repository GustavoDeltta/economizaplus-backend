import { Router } from "express";
import { authMiddleware } from "./shared/middlewares/authMiddleware";
import { roleMiddleware } from "./shared/middlewares/roleMiddleware";

import { makeUserController } from "./infrastructure/factories/MakeUserController";
import { makeLoginController } from "./infrastructure/factories/MakeLoginController";
import { makeGoalController } from "./infrastructure/factories/MakeGoalController";
import { makeCategoryController } from "./infrastructure/factories/MakeCategoryController";
import { makeGoogleLoginController } from "./infrastructure/factories/MakeGoogleLoginController";
import { makeCardController } from "./infrastructure/factories/MakeCardController";
import { makeAIController } from "./infrastructure/factories/MakeAIController";

const routes = Router();

const userController = makeUserController();
const loginController = makeLoginController();
const goalController = makeGoalController();
const categoryController = makeCategoryController();
const googleLogin = makeGoogleLoginController();
const cardController = makeCardController();
const ai = makeAIController();

// ROTAS PÚBLICAS
routes.post("/api/users/register", (req, res) => userController.create(req, res));
routes.post("/api/login", (req, res) => loginController.login(req, res));
routes.post("/api/login/google",     (req, res) => googleLogin.login(req, res));

// AUTH
routes.use(authMiddleware);

// ROTAS PRIVADAS

// USERS
routes.get("/api/users", roleMiddleware("ADMIN"), (req, res) => userController.getAll(req, res));
routes.get("/api/users/profile", roleMiddleware("COMMON", "ADMIN"), (req, res) => userController.getProfile(req, res));
routes.put("/api/users/profile", roleMiddleware("COMMON"), (req, res) => userController.update(req, res));
routes.delete("/api/users/profile", roleMiddleware("COMMON"), (req, res) => userController.delete(req, res));

// CATEGORIES
routes.post("/api/categories", roleMiddleware("COMMON"), (req, res) => categoryController.create(req, res));
routes.get("/api/categories", roleMiddleware("COMMON", "ADMIN"), (req, res) => categoryController.getAllByUserId(req, res));
routes.put("/api/categories/:id", roleMiddleware("COMMON", "ADMIN"), (req, res) => categoryController.update(req, res));
routes.delete("/api/categories/:id", roleMiddleware("COMMON", "ADMIN"), (req, res) => categoryController.delete(req, res));

// GOALS
routes.post("/api/goals", roleMiddleware("COMMON"), (req, res) => goalController.create(req, res));
routes.get("/api/goals", roleMiddleware("COMMON", "ADMIN"), (req, res) => goalController.getAllByUserId(req, res));
routes.put("/api/goals/:id", roleMiddleware("COMMON", "ADMIN"), (req, res) => goalController.update(req, res));
routes.delete("/api/goals/:id", roleMiddleware("COMMON", "ADMIN"), (req, res) => goalController.delete(req, res));

// CARDS
routes.get("/api/cards", roleMiddleware("COMMON", "ADMIN"), (req, res) => cardController.getAllByUserId(req, res));
routes.get("/api/cards/:id", roleMiddleware("COMMON", "ADMIN"), (req, res) => cardController.getCardById(req, res));
routes.post("/api/cards", roleMiddleware("COMMON"), (req, res) => cardController.create(req, res));
routes.put("/api/cards/:id", roleMiddleware("COMMON", "ADMIN"), (req, res) => cardController.update(req, res));
routes.delete("/api/cards/:id", roleMiddleware("COMMON", "ADMIN"), (req, res) => cardController.delete(req, res));

// TIPS
routes.post("/api/ai/tips", roleMiddleware("COMMON", "ADMIN"), (req, res) => ai.generateTips(req, res));


export default routes;