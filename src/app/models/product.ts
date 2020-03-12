export enum Unit {
    PZ = "PZ",
    GR = "GR",
    KG = "KG"
}

export class Product {
    constructor(
        public id?: string,
        public name?: string,
        public origin?: string,
        public category?: string,
        public orderUnit?: Unit,
        public price?: number,
        public currency?: string,
        public priceUnit?: Unit,
        public unitText?: string,
        public guiOrder?: number,
        public certification?: string
        //public version?: any,
        //public previousId?: number,
        //public catalogId?: number,
    ) {
        if (!this.certification) {this.certification=''}
        if (!this.unitText) {this.unitText='pz'}
    }
}