export const enum OrderStatus {
    'DRAFT',
    'OPEN',
    'SENT',
    'DISPATCHED',
    'DELIVERED',
    'PAID',
    'CLOSED'
}

export class UserOrder {
    constructor(
        public id?: string,
        public status?: OrderStatus,
        public orderItems?: any[],
        public userId?: number,
    ) {
    }
}
