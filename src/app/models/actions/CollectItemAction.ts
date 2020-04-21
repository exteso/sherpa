export class CollectItemAction {
    constructor(public realQty: number,
                public notTaken: boolean,
                public comment?: string) {
    }
} 