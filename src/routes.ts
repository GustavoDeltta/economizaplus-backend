import { Router } from "express";
import { authMiddleware } from "./middlewares/authMiddleware";
import { roleMiddleware } from "./middlewares/roleMiddleware";

import { makeUserController } from "./infrastructure/factories/MakeUserController";
import { makeLoginController } from "./infrastructure/factories/MakeLoginController";
import { makeGoalController } from "./infrastructure/factories/MakeGoalController";
import { makeCategoryController } from "./infrastructure/factories/MakeCategoryController";

const routes = Router();

const userController = makeUserController();
const loginController = makeLoginController();
const goalController = makeGoalController();
const categoryController = makeCategoryController();


// ROTAS PÚBLICAS
routes.post("/api/users/register", (req, res) => userController.create(req, res));
routes.post("/api/login", (req, res) => loginController.login(req, res));


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

export default routes;