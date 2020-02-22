export const enum OrderStatus {
    'DRAFT',
    'OPEN',
    'SENT',
    'DISPATCHED',
    'DELIVERED',
    'PAID',
    'CLOSED'
}

export class GroupOrder {
    constructor(
        public id?: string,
        public catalogId?: string,
        public orderDeadline?: any,
        public status?: OrderStatus,
        public orderItems?: any[],
        public groupId?: number,
    ) {
    }
}
