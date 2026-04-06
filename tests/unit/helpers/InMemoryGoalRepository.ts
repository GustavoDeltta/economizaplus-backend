import { Decimal } from '@prisma/client/runtime/client';
import { Goal } from '../../../src/domain/entities/Goal';
import { InterfaceGoalRepository } from '../../../src/domain/repositories/InterfaceGoalRepository';

export class InMemoryGoalRepository implements InterfaceGoalRepository {
  public goals: Goal[] = [];

  async create(goal: Goal): Promise<Goal> {
    this.goals.push(goal);
    return goal;
  }

  async findByName(name: string): Promise<Goal | null> {
    return this.goals.find((g) => g.name === name) ?? null;
  }

  async findGoal(userId: string): Promise<Goal | null> {
    return this.goals.find((g) => g.userId === userId) ?? null;
  }

  async findByIdAndUserId(id: string, userId: string): Promise<Goal | null> {
    return this.goals.find((g) => g.id === id && g.userId === userId) ?? null;
  }

  async findAllByUserId(userId: string): Promise<Goal[]> {
    return this.goals.filter((g) => g.userId === userId);
  }

  async update(
    id: string,
    name: string,
    targetAmount: Decimal,
    deadline: Date,
  ): Promise<Goal> {
    const index = this.goals.findIndex((g) => g.id === id);
    if (index === -1) throw new Error('Meta não encontrada no repositório em memória');
    this.goals[index] = { ...this.goals[index], name, targetAmount, deadline };
    return this.goals[index];
  }

  async delete(id: string): Promise<Goal | null> {
    const index = this.goals.findIndex((g) => g.id === id);
    if (index === -1) return null;
    const [removed] = this.goals.splice(index, 1);
    return removed;
  }
}
