import { Request, Response } from "express";
import { CategoryService } from "../../application/services/CategoryService";

export class CategoryController {
    constructor(private categoryService: CategoryService) {}
    async create(req: Request, res: Response) {
        const userId = req.user as string;
        const { name, color } = req.body;
        const category = await this.categoryService.createCategory(userId, name, color);

        return res.status(201).json({ category });
    }

    async update(req: Request, res: Response) {
        const { id } = req.params as { id: string };
        const { name, color } = req.body;
        const userId = req.user as string;
        const updatedCategory = await this.categoryService.updateCategory(id, userId, name, color);
        return res.json(updatedCategory);
    }

    async delete(req: Request, res: Response) {
        const { id } = req.params as { id: string };
        const userId = req.user as string;
        const deletedCategory = await this.categoryService.deleteCategory(id, userId);
        return res.json(deletedCategory);
    }

    async getByName(req: Request, res: Response) {
        const userId = req.user as string;
        const { name } = req.params as { name: string };
        const category = await this.categoryService.getCategoryByName(userId, name);
        return res.json(category);
    }

    async getAllByUserId(req: Request, res: Response) {
        const userId = req.user as string;
        const categories = await this.categoryService.getAllCategoriesByUserId(userId);
        return res.json(categories);
    }
}