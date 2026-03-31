import { Category } from "../entities/Category";

export interface InterfaceCategoryRepository {
    create(category: Category): Promise<Category>;
    update(id: string, name: string, color: string): Promise<Category>;
    delete(id: string): Promise<Category | null>;
    findCategory(userId: string, name: string): Promise<Category | null>;
    findAllByUserId(userId: string): Promise<Category[]>;
    findUnique(id: string): Promise<Category | null>;
    findByIdAndUserId(id: string, userId: string): Promise<Category | null>;
}