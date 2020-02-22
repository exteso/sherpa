import { Grocery } from "./grocery";

export class Order {
    public id: string;
    public items: Map<string, Grocery>;

    constructor(
        
    ) {
        this.items = new Map();
    }
}