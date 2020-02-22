export const enum Unit {
    'PZ',
    'GR',
    'KG'
}

export class OrderItem {
    constructor(
        public id?: string,
        public qty?: number,
        public unit?: Unit,
        public productId?: number,
        public groupOrderId?: number,
        public userOrderId?: number,
    ) {
    }
}