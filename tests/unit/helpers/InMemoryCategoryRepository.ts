import { Category } from '../../../src/domain/entities/Category';
import { InterfaceCategoryRepository } from '../../../src/domain/repositories/InterfaceCategoryRepository';

export class InMemoryCategoryRepository implements InterfaceCategoryRepository {
  public categories: Category[] = [];

  async create(category: Category): Promise<Category> {
    const newCategory: Category = {
      ...category,
      id: category.id ?? crypto.randomUUID(),
    };
    this.categories.push(newCategory);
    return newCategory;
  }

  async update(id: string, name: string, color: string): Promise<Category> {
    const index = this.categories.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Categoria não encontrada no repositório em memória');
    this.categories[index] = { ...this.categories[index], name, color };
    return this.categories[index];
  }

  async delete(id: string): Promise<Category | null> {
    const index = this.categories.findIndex((c) => c.id === id);
    if (index === -1) return null;
    const [removed] = this.categories.splice(index, 1);
    return removed;
  }

  async findCategory(userId: string, name: string): Promise<Category | null> {
    return (
      this.categories.find(
        (c) => c.userId === userId && c.name.toLowerCase() === name.toLowerCase()
      ) ?? null
    );
  }

  async findAllByUserId(userId: string): Promise<Category[]> {
    return this.categories.filter((c) => c.userId === userId);
  }

  async findUnique(id: string): Promise<Category | null> {
    return this.categories.find((c) => c.id === id) ?? null;
  }

  async findByIdAndUserId(id: string, userId: string): Promise<Category | null> {
    return (
      this.categories.find((c) => c.id === id && c.userId === userId) ?? null
    );
  }
}
