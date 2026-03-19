import { GoalService } from "../../application/services/GoalService";
import { GoalController } from "../../interface/controllers/GoalController";
import { GoalRepository } from "../prisma/repositories/goalRepository";

export function makeGoalController() {
    const repository = new GoalRepository();
    const service = new GoalService(repository);
    const controller = new GoalController(service);
    
    return controller;
}
