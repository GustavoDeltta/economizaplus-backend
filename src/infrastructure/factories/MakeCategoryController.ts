import { CategoryService } from "../../application/services/CategoryService";
import { CategoryController } from "../../interface/controllers/CategoryController";
import { CategoryRepository } from "../prisma/repositories/categoryRepository";

export function makeCategoryController() {
    const repository = new CategoryRepository();
    const service = new CategoryService(repository);
    const controller = new CategoryController(service);
    
    return controller;
}