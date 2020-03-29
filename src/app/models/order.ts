import { Grocery } from "./grocery";
import { Observable } from 'rxjs';
import { isNumber } from 'util';

export class Order {

    static EMPTY = new Order('','','');

    public id: string;
    private items: Grocery[];
    public orderTotal: number;

    constructor(public orderWeek: string,
                public groupId: string,
                public familyId: string
    ) {
        this.id = orderWeek;
        this.items = [];
    }

    getItems(){
        return this.items;
    }

    setItemsAndCalculateTotal(items: Grocery[]){
        this.items = items;
        this.orderTotal = this.items.reduce((acc: number, item) => acc + Grocery.price(item), 0)
    }

}