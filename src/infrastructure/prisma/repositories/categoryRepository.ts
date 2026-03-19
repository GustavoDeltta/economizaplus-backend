import { Category } from "../../../domain/entities/Category";
import { InterfaceCategoryRepository } from "../../../domain/repositories/InterfaceCategoryRepository";
import { prisma } from "../client";

export class CategoryRepository implements InterfaceCategoryRepository {
    async create(category: Category): Promise<Category> {
        const data = await prisma.category.create({
            data: {
                name: category.name,
                color: category.color,
                user: {
                    connect: { id: category.userId }
                }
            }
        });
        return new Category(
            data.id,
            data.userId,
            data.name,
            data.color
        );

    }

    async update(id: string, name: string, color: string): Promise<Category> {
        const data = await prisma.category.update({
            where: {
                id
            },
            data: {
                name,
                color
            }
        });
        return new Category(
            data.id,
            data.userId,
            data.name,
            data.color
        );
    }

    async delete(id: string): Promise<Category | null> {
        const data = await prisma.category.delete({
            where: {
                id
            }
        });
        if (!data) return null;
        return new Category(
            data.id,
            data.userId,
            data.name,
            data.color
        );
    }

    async findCategory(userId: string, name: string): Promise<Category | null> {
        const data = await prisma.category.findUnique({
            where: {
                userId_name: {
                    userId,
                    name
                }
            }
        });
        if (!data) return null;
        return new Category(
            data.id,
            data.userId,
            data.name,
            data.color
        );
    }

    async findAllByUserId(userId: string): Promise<Category[]> {
        const data = await prisma.category.findMany({
            where: {
                userId
            }
        });
        return data.map(category => new Category(
            category.id,
            category.userId,
            category.name,
            category.color
        ));
    }

    async findUnique(id: string): Promise<Category | null> {
        const data = await prisma.category.findUnique({
            where: {
                id
            }
        });
        if (!data) return null;
        return new Category(
            data.id,
            data.userId,
            data.name,
            data.color
        );
    }
}
