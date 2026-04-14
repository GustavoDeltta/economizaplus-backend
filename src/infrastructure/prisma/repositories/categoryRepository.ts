import { Category } from "../../../domain/entities/Category";
import { InterfaceCategoryRepository } from "../../../domain/repositories/InterfaceCategoryRepository";
import { prisma } from "../client";

export class CategoryRepository implements InterfaceCategoryRepository {
    async create(category: Category): Promise<Category> {
        const data = await prisma.category.create({
            data: {
                name: category.name,
                color: category.color,
                icon: category.icon,
                user: {
                    connect: { id: category.userId }
                }
            }
        });
        return new Category(
            data.id,
            data.userId,
            data.name,
            data.color,
            data.icon
        );

    }

    async update(id: string, name: string, color: string, icon: string): Promise<Category> {
        const data = await prisma.category.update({
            where: {
                id
            },
            data: {
                name,
                color,
                icon
            }
        });
        return new Category(
            data.id,
            data.userId,
            data.name,
            data.color,
            data.icon
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
            data.color,
            data.icon
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
            data.color,
            data.icon
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
            category.color,
            category.icon
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
            data.color,
            data.icon
        );
    }

    async findByIdAndUserId(id: string, userId: string): Promise<Category | null> {
        const data = await prisma.category.findUnique({
            where: {
                id,
                userId
            }
        });
        if (!data) return null;
        return new Category(
            data.id,
            data.userId,
            data.name,
            data.color,
            data.icon
        );
    }
}
