export class Category {
  constructor(
    public id: string | null,
    public userId: string | null,
    public name: string,
    public color: string,
    public icon: string,
    public type: string,
  ) {}
}
