export class Catalog {
    constructor(
        public id?: string,
        public vendor?: string,
        public displayId?: string,
        public orderDeadline?: any,
        public name?: string,
        public items?: any[],
    ) {
    }
}