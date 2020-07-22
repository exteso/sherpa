import { Product, Unit } from "./product";

export class Grocery extends Product {
  qty: number;
  isFavorite?: boolean;
  familyId?: string;
  groupId?: string;
  realQty?: number;
  notTaken?: boolean;
  comment?: string;

  static price(g: Grocery) {
    if (g.realQty) {
      if (g.realQty <= 0.01) return 0;
      return g.realQty * g.price;
    }
    if (g.orderUnit == Unit.PZ && (g.priceUnit == Unit.KG || g.priceUnit == Unit.GR))
      return 0;
    return g.qty * g.price; 
  }

}

