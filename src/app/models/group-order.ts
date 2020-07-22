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

    public id: string;
    public closed?: boolean;
    public closedBy?: string;
    public closedAt?: Date;

    constructor(
        public orderWeek: string,
        public groupId: string
    ) {
        this.id = orderWeek +"-"+groupId;
    }
}
