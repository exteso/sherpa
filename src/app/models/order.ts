import { Grocery } from "./grocery";
import { Observable } from 'rxjs';
import { isNumber } from 'util';

export class Order {

    static EMPTY = new Order('','','');

    public id: string;
    private _items: Grocery[];
    public orderTotal: number;
    public closed: boolean;
    public closedBy?: string;
    public closedAt?: Date;

    constructor(public orderWeek: string,
                public groupId: string,
                public familyId: string
    ) {
        this.id = familyId;
        this._items = [];
    }

    get items(): Grocery[] {
        return this._items;
    }
    set items(value: Grocery[]) {
        this._items = value;
        this.orderTotal = this.items.reduce((acc: number, item) => acc + Grocery.price(item), 0)
    }

}