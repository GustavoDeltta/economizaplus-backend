import { randomUUID } from "node:crypto";
import { Category } from "../../domain/entities/Category";
import { InterfaceCategoryRepository } from "../../domain/repositories/InterfaceCategoryRepository";
import { BadRequestError } from "../../helpers/api-erros";
import { CategoryResponseDTO } from "../DTO/CategoryResponseDTO";

export class CategoryService {
    constructor(private categoryRepository: InterfaceCategoryRepository) {}

    async createCategory(userId: string, name: string, color: string): Promise<CategoryResponseDTO> {
        
        const exists = await this.categoryRepository.findCategory(userId, name);

        if (exists) {
            throw new BadRequestError("Categoria já existe para este usuário");
        }

        const category = new Category(null, userId, name, color);

        const createdCategory = await this.categoryRepository.create(category);

        return {
            id: createdCategory.id,
            name: createdCategory.name,
            color: createdCategory.color
        };
    }

    async updateCategory(id: string, name: string, color: string): Promise<CategoryResponseDTO> {
        const category = await this.categoryRepository.update(id, name, color);
        if (!category) {
            throw new BadRequestError("Categoria não encontrada");
        }
        return {
            id: category.id,
            name: category.name,
            color: category.color
        };
    }

    async deleteCategory(id: string): Promise<CategoryResponseDTO> {
        const category = await this.categoryRepository.delete(id);
        if (!category) {
            throw new BadRequestError("Categoria não encontrada");
        }
        return {
            id: category.id,
            name: category.name,
            color: category.color
        };
    }

    async getCategoryByName(userId: string, name: string): Promise<CategoryResponseDTO> {
        const category = await this.categoryRepository.findCategory(userId, name);
        if (!category) {
            throw new BadRequestError("Categoria não encontrada");
        }
        return {
            id: category.id,
            name: category.name,
            color: category.color
        };
    }

    async getAllCategoriesByUserId(userId: string): Promise<CategoryResponseDTO[]> {
        const categories = await this.categoryRepository.findAllByUserId(userId);
        return categories.map(category => ({
            id: category.id,
            name: category.name,
            color: category.color
        }));
    }

}