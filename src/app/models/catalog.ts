export class Catalog {
    constructor(
        public id?: string,
        public year?: string, 
        public week?: string,
        public vendor?: string,
        public displayId?: string,
        public orderDeadline?: any,
        public name?: string,
        public products?: any[],
    ) {
    }
}