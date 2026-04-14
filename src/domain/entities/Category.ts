export class Category {
    constructor(
        public id: string | null,
        public userId: string,
        public name: string,
        public color: string,
        public icon: string
    ) {}
}