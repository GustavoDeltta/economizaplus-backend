import { randomUUID } from "node:crypto";
import { Category } from "../../domain/entities/Category";
import { InterfaceCategoryRepository } from "../../domain/repositories/InterfaceCategoryRepository";
import { BadRequestError } from "../../shared/errors/api-erros";
import { CategoryResponseDTO } from "../DTO/CategoryResponseDTO";

export class CategoryService {
  constructor(private categoryRepository: InterfaceCategoryRepository) {}

  async createCategory(
    userId: string,
    name: string,
    color: string,
    icon: string,
    type: string,
  ): Promise<CategoryResponseDTO> {
    const exists = await this.categoryRepository.findCategory(userId, name);

    if (exists) {
      throw new BadRequestError("Categoria já existe para este usuário");
    }

    const category = new Category(null, userId, name, color, icon, type);

    const createdCategory = await this.categoryRepository.create(category);

    return {
      id: createdCategory.id,
      name: createdCategory.name,
      color: createdCategory.color,
      icon: createdCategory.icon,
    };
  }

  async updateCategory(
    id: string,
    userId: string,
    name: string,
    color: string,
    icon: string,
  ): Promise<CategoryResponseDTO> {
    const existing = await this.categoryRepository.findByIdAndUserId(
      id,
      userId,
    );
    if (!existing) {
      throw new BadRequestError(
        "Categoria não encontrada ou não pertence a você",
      );
    }

    const category = await this.categoryRepository.update(
      id,
      name,
      color,
      icon,
    );
    if (!category) {
      throw new BadRequestError("Falha na atualização da Categoria");
    }
    return {
      id: category.id,
      name: category.name,
      color: category.color,
      icon: category.icon,
    };
  }

  async deleteCategory(
    id: string,
    userId: string,
  ): Promise<CategoryResponseDTO> {
    const existing = await this.categoryRepository.findByIdAndUserId(
      id,
      userId,
    );
    if (!existing) {
      throw new BadRequestError(
        "Categoria não encontrada ou não pertence a você",
      );
    }

    const category = await this.categoryRepository.delete(id);
    if (!category) {
      throw new BadRequestError("Falha ao deletar a Categoria");
    }
    return {
      id: category.id,
      name: category.name,
      color: category.color,
      icon: category.icon,
    };
  }

  async getCategoryByName(
    userId: string,
    name: string,
  ): Promise<CategoryResponseDTO> {
    const category = await this.categoryRepository.findCategory(userId, name);
    if (!category) {
      throw new BadRequestError("Categoria não encontrada");
    }
    return {
      id: category.id,
      name: category.name,
      color: category.color,
      icon: category.icon,
      type: category.type,
    };
  }

  async getAllCategoriesByUserId(
    userId: string,
  ): Promise<CategoryResponseDTO[]> {
    const categories = await this.categoryRepository.findAllByUserId(userId);
    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      color: category.color,
      icon: category.icon,
      type: category.type,
    }));
  }
}
