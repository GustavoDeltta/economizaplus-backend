import { Saving } from "../entities/Saving";

export interface InterfaceSavingRepository {
    create(saving: Saving, tx?: any): Promise<Saving>;
    findByGoalId(goalId: string): Promise<Saving[]>;
}
