export class AIGeneration {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly response: string,
    public readonly createdAt: Date
  ) {}
}