import { Injectable, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { Group, Catalog } from 'src/app/models';
import { filter, map, tap, switchMap, flatMap, first } from 'rxjs/operators';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { Grocery } from 'src/app/models/grocery';
import { Product } from 'src/app/models/product';
import { FirestoreService } from '../firestore/firestore.service';
import { Order } from 'src/app/models/order';
import { CollectItemAction } from 'src/app/models/actions/CollectItemAction';
import { GroupOrder } from 'src/app/models/group-order';

import { DateTime } from 'luxon';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  userEmail: string;
  //userProfile$: Observable<userProfile>;
  currentWeek: string;

  //TODO remove this temp variable
  members$: BehaviorSubject<string[]>;
  ordersByMember: Map<string, Order>;

  constructor(public authService: AuthService, private afs: AngularFirestore, private catalogService: FirestoreService) { 
    this.members$ = new BehaviorSubject([]); 
    this.ordersByMember = new Map();
    let week: any = this.getWeekNumber(new Date());
    this.currentWeek = `${week[0]}w${week[1]}`;
    this.authService.getUser().then(user => {
      this.userEmail = user.email;
    });
  }

  getWeekNumber(d) {
    // Copy date so don't modify original
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    // Get first day of year
    let yearStart: any = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    // Calculate full weeks to nearest Thursday
    let weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    let weekText = weekNo.toString();
      if (weekNo<10) {
        weekText = "0"+weekNo;
      }
    // Return array of year and week number
    return [d.getUTCFullYear(), weekText];
  }

  static hasYear53Weeks(year: number){
    let lastDayOfYear: any = new Date(Date.UTC(year, 11, 31));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    lastDayOfYear.setUTCDate(lastDayOfYear.getUTCDate() + 4 - (lastDayOfYear.getUTCDay()||7));
    // Get first day of year
    let yearStart: any = new Date(Date.UTC(lastDayOfYear.getUTCFullYear(),0,1));
    // Calculate full weeks to nearest Thursday
    let weekNo = Math.ceil(( ( (lastDayOfYear - yearStart) / 86400000) + 1)/7);
    return weekNo === 53;
  }

  getOrderDeliveryDates$(yearAndWeek: string){
    let catalogWeek$ = this.afs.doc<Catalog>(`/catalogs/${yearAndWeek}`).valueChanges();
    return catalogWeek$.pipe(
      map(catalogWeek =>  [catalogWeek.orderDate, catalogWeek.deliveryDate])
    )
  }

  getOrderDeliveryDates(yearAndWeek: string){
    const deliveryDayOfTheWeek = 2; //Tuesday
    const deliveryDate = DateTime.fromISO(yearAndWeek.toUpperCase()+'-'+deliveryDayOfTheWeek).set({hour: 14});
    const orderDate = deliveryDate.minus({days: 5}).set({hour: 22});
    return [orderDate, deliveryDate];
  }

  weeksInMillis(week: number) {
    return ((week)*7*86400000)-86400000;
  }

  getCurrentWeek(): string {
    return this.currentWeek;
  }

  static weekAfter(yearAndWeek: string): string {
    const year = parseFloat(yearAndWeek.substring(0,4));
    let week = parseFloat(yearAndWeek.substring(5,7));
    week++;
    if (week === 53 && this.hasYear53Weeks(year)) {
      return (year)+'w53';
    } else if (week >52) {
      return (year+1)+'w01';
    } else {
      let weekText = week.toString();
      if (week<10) {
        weekText = "0"+week;
      }
      return year+'w'+weekText;
    }
  }

  static weekBefore(yearAndWeek: string): string {
    const year = parseFloat(yearAndWeek.substring(0,4));
    let week = parseFloat(yearAndWeek.substring(5,7));
    week--;
    if (week <1) {
      if (this.hasYear53Weeks(year-1)){
        return (year-1)+'w53';
      }
      return (year-1)+'w52';
    }else{
      let weekText = week.toString();
      if (week<10) {
        weekText = "0"+week;
      }
      return year+'w'+weekText;
    }
  }

  getAvailableProducts(orderWeek: string): Observable<Product[]> {
    const categories = this.getCategories();
    const availableProducts$ = this.catalogService.getCatalogProducts(orderWeek)
      .valueChanges().pipe(
        map(products => {
          return products.sort((p1, p2) => { 
              const c1 = categories.findIndex(i => i.name.toLowerCase().trim() == p1.category.toLowerCase().trim())
              if (c1 == -1) console.log("Category "+p1.category + " Not Found");
              const c2 = categories.findIndex(i => i.name.toLowerCase().trim() == p2.category.toLowerCase().trim())
              if (c2 == -1) console.log("Category "+p2.category + " Not Found");
              if (c1 < c2)
                  return -1;
              if (c1 > c2)
                  return 1;
              //same category, we sort by guiOrder
              if (p1.guiOrder < p2.guiOrder)
                  return -1;
              if (p1.guiOrder > p2.guiOrder)
                  return 1;
              return 0;
          });
        }));
      return availableProducts$;
  }

  public getMyGroups(): Observable<Group[]> {
    return this.afs.collection<Group>('groups').valueChanges().pipe(
      map((groups: Group[]) => groups.filter(group => {return group.families.includes(this.userEmail)}),
    ));

  }

  public closeOrder(orderWeek: string, groupId: string, families: string[], user: string){
    let group = this.afs.doc(`/orders/${orderWeek}/groups/${groupId}`);
    const now = Date.now();
    group.ref.get().then((documentSnapshot) => {
      
      group.update({
                 'closed': true,
                 'closedBy': user,
                 'closedAt': now });
    });
    families.forEach(familyId => {
      let family = this.afs.doc(`/orders/${orderWeek}/groups/${groupId}/member/${familyId}`);
      family.ref.get().then((documentSnapshot) => {
        family.update({'id': familyId,
                      'closed': true,
                      'closedBy': user,
                      'closedAt': now });
      });
    })
    console.log("Order closed: "+orderWeek+ ", "+ groupId);  
  }

  pickUp(orderWeek: string, groupId: string, familyId: string, itemId: string, collectAction: CollectItemAction) {
    let item = this.afs.doc<Grocery>(`/orders/${orderWeek}/groups/${groupId}/member/${familyId}/items/${itemId}`);
    item.update(collectAction)
  }

  addProducts(orderWeek: string, groupId: string, familyId: string, productsToAdd: Product[]) {
    productsToAdd.forEach(p => this.updateMyOrder(orderWeek, groupId, familyId, p, 0.01));
  }

  public getMyOrder(orderWeek: string, groupId: string, familyId: string): Observable<Order>{
    
    let group = this.afs.doc<GroupOrder>(`/orders/${orderWeek}/groups/${groupId}`);
    group.ref.get().then((documentSnapshot) => {
      if (!documentSnapshot.exists){
        let gorder: any = new GroupOrder(orderWeek, groupId);
        group.set(Object.assign({}, gorder));
      }
    });

    let family = this.afs.doc<Order>(`/orders/${orderWeek}/groups/${groupId}/member/${familyId}`);
  
    family.ref.get().then((documentSnapshot) => {
      if (!documentSnapshot.exists){
        let order = new Order(orderWeek, groupId, familyId);
        family.set(Object.assign({}, order));
      }
    });
 
    return combineLatest(group.valueChanges(), family.valueChanges()).pipe(
            flatMap(([go, order]) => {
              return this.afs.collection<Grocery>(`/orders/${orderWeek}/groups/${groupId}/member/${familyId}/items/`,
                                          ref => ref.orderBy('category')
                                                    .orderBy('guiOrder')).valueChanges()
                          .pipe(
                            map(items => this.createOrder(orderWeek, groupId, familyId, items, go.closed, go.closedBy, go.closedAt)),
                          )
            }));
  }

  getOrderByMember(familyId: any): Order {
    if (familyId.id) {
      return this.ordersByMember.get(familyId.id);  
    }
    return this.ordersByMember.get(familyId);
  }

  private createOrder(orderWeek: string, groupId: string, familyId: string, items: Grocery[], isClosed: boolean, closedBy?: string, closedAt?: Date, index?: number): Order {
    const order = new Order(orderWeek, groupId, familyId);
    order.closed = isClosed;
    order.closedBy = closedBy;
    order.closedAt = closedAt;
    order.items = items;
    return order;
  }

  mergeGrocery(acc:  Order, source:  Order){
    source.items.forEach(sourceItem => {
      let destItem = acc.items.find(d => d.id == sourceItem.id);
      if (destItem){
        destItem.qty += sourceItem.qty;
        //destItem.price += sourceItem.price;
        if (sourceItem.notTaken !== undefined && sourceItem.notTaken === false) {
          if (sourceItem.realQty && sourceItem.realQty > 0.1) {
            if (destItem.realQty && destItem.realQty > 0.1) {
              destItem.realQty += sourceItem.realQty;
            }else{
              destItem.realQty = sourceItem.realQty;
            }
          }
        }
      } else {
        acc.items.push({...sourceItem});
      }
    });
  }

  private storeOrders(orders: Order[]){
    this.ordersByMember.clear();
    for (let i = 0; i<orders.length;i++){
      this.ordersByMember.set(orders[i].familyId, orders[i]);
    }
  }

  private mergeOrders(orders: Order[]): Order{
    let final = new Order(orders[0].orderWeek, orders[0].groupId, 'GroupOrder');

    if (orders.length > 0) {
      final.closed = orders[0].closed;
      final.closedAt = orders[0].closedAt;
      final.closedBy = orders[0].closedBy;
    }

    for (let i = 0; i<orders.length;i++){
      this.mergeGrocery(final, orders[i]);
    }
    return final;
  }

  private getAllOrders(members: string[]): Observable<Order> {
    //const urlsMap = urls.map(url => <Observable<Grocery[]>> this.afs.collection<Grocery>(url).valueChanges().pipe(take(1)));

    return combineLatest(this.getUrlsObservable(members)).pipe(
      tap((orders: Order[]) => this.storeOrders(orders)),
      map((orders: Order[]) => this.mergeOrders(orders))
    );
  }

  public getMembers(): Observable<any[]>{
    return this.members$;
  }

  public getMyGroupOrder(orderWeek: string, groupId: string): Observable<Order>{

    let groupOrderUrl$ = this.afs.collection(`/orders/${orderWeek}/groups/${groupId}/member/`).valueChanges().pipe(
      tap((members: any[]) => this.members$.next(members)),
      map(members => {
        return members.map(m => {return { ...m, orderWeek, groupId}})
      }),
      switchMap(members => {
        return this.getAllOrders(members);
      })
      );

      return groupOrderUrl$;
  }
  
  private getUrlsObservable(members: any[]): Observable<Order>[] {
    return members.map(m => {
      return this.afs.collection<Grocery>(`/orders/${m.orderWeek}/groups/${m.groupId}/member/${m.id}/items`,
                                  ref => ref.orderBy('category')
                                            .orderBy('guiOrder')).valueChanges()
                      .pipe(
                        map(items => this.createOrder(m.orderWeek, m.groupId, m.id, items, m.closed, m.closedBy, m.closedAt))
                      );
    });
  }

  public updateMyOrder(orderWeek: string, groupId: string, familyId: string, product: Product, qty: number) : Promise<void>{
    //TODO when qty == 0 we should remove a product from the order 
    let grocery = this.afs.doc<Grocery>(`/orders/${orderWeek}/groups/${groupId}/member/${familyId}/items/${product.id}`);
    if (qty == 0){
      return grocery.delete();
    }

    return grocery.set({
                    ...product,
                    qty,
                    familyId
                  });
  }

  getCategories(): { name: string, grpIdx: number }[] {
    const categories = [
              {'name': 'PROMOZIONI', 'grpIdx': 0},
              {'name': 'Proposte', 'grpIdx': 0},
              {'name': 'Verdure', 'grpIdx': 0},
              {'name': 'Insalate', 'grpIdx': 0},
              {'name': 'erbette', 'grpIdx': 0},
              {'name': 'frutta', 'grpIdx': 0},
              {'name': 'panetteria', 'grpIdx': 0},
              {'name': 'pane', 'grpIdx': 0},
              {'name': 'pane frigo', 'grpIdx': 0},
              {'name': 'uova', 'grpIdx':1},
              {'name': 'alternative vegetali ai latticini', 'grpIdx':1},
              {'name': 'senza lattosio', 'grpIdx':1},
              {'name': 'latte + latticini', 'grpIdx':1},
              {'name': 'formaggi mucca', 'grpIdx':1},
              {'name': 'formaggi misti', 'grpIdx':1},
              {'name': 'f.misti', 'grpIdx':1},
              {'name': 'formaggi capra', 'grpIdx':1},
              {'name': 'f.pecora', 'grpIdx':1},
              {'name': 'formaggi pecora', 'grpIdx':1},
              {'name': 'gastromia', 'grpIdx':2},
              {'name': 'congelati', 'grpIdx':2},
              {'name': 'congelati per consumo immediato', 'grpIdx':2},
              {'name': 'carne + pesce freschi', 'grpIdx':2},
              {'name': 'salumeria', 'grpIdx':2},
              {'name': 'burger veg', 'grpIdx':2},
              {'name': 'tofu + seitan', 'grpIdx':2},
              {'name': 'diversi', 'grpIdx':2},
              {'name': 'documenti', 'grpIdx':-1},
              {'name': 'pomodoro ', 'grpIdx':3},
              {'name': 'pomodoro cartoni', 'grpIdx':3},
              {'name': 'olio', 'grpIdx':3},
              {'name': 'olio box', 'grpIdx':3},
              {'name': 'aceto', 'grpIdx':3},
              {'name': 'vino', 'grpIdx':4},
              {'name': 'bibite e succhi', 'grpIdx':4},
              {'name': 'bibite casse + box', 'grpIdx':4},
              {'name': 'sciroppi', 'grpIdx':4},
              {'name': 'drink diversi', 'grpIdx':4},
              {'name': 'drink cartoni', 'grpIdx':4},
              {'name': 'confetture', 'grpIdx':5},
              {'name': 'miele', 'grpIdx':5},
              {'name': 'creme + birnel', 'grpIdx':5},
              {'name': 'conserve', 'grpIdx':5},
              {'name': 'prodotti soia', 'grpIdx':6},
              {'name': 'condimenti', 'grpIdx':6},
              {'name': 'spezie', 'grpIdx':6},
              {'name': 'pasta integrale', 'grpIdx':7},
              {'name': 'pasta bianca', 'grpIdx':7},
              {'name': 'pasta bianca cartoni', 'grpIdx':7},
              {'name': 'pasta farro', 'grpIdx':7},
              {'name': 'paste speciali', 'grpIdx':7},
              {'name': 'riso', 'grpIdx':7},
              {'name': 'riso cartoni', 'grpIdx':7},
              {'name': 'farine e cereali', 'grpIdx':7},
              {'name': 'farine + cereali cartoni e sacchi', 'grpIdx':7},
              {'name': 'flakes + muesli', 'grpIdx':8},
              {'name': 'leguminose', 'grpIdx':8},
              {'name': 'te + tisane', 'grpIdx':8},
              {'name': 'caffé + surrogati', 'grpIdx':8},
              {'name': 'zucchero + lievito + unigel', 'grpIdx':8},
              {'name': 'zucchero sacchi', 'grpIdx':8},
              {'name': 'cioccolato + cacao', 'grpIdx':8},
              {'name': 'cioccolato rotto', 'grpIdx':8},
              {'name': 'cioccolato pacco', 'grpIdx':8},
              {'name': 'biscotti + crackers', 'grpIdx':8},
              {'name': 'frutta secca + snacks', 'grpIdx':8},
              {'name': 'frutta secca cartoni', 'grpIdx':8},
              {'name': 'diversi secchi', 'grpIdx':8},
              {'name': 'idee regalo' , 'grpIdx':8}
              ];
       return categories;
  }

  getCategoryGroups(){
    const catGroups = [
      'Vegetali+Pane', // 0
      'Uova+Latticini', // 1
      'Carne+Gastron', // 2
      "Sughi+Condim", // 3
      "Bevande", // 4
      "Confettur", // 5
      "Spezie", // 6
      "Pasta+Riso", // 7
      "Altro" // 8
    ] 
    return catGroups;
  }

  getGroup(category: string){
    const cat = this.getCategories().find(i => i.name.toLowerCase().trim() == category.toLowerCase().trim());
    if (!cat || !cat.grpIdx) {
      return this.getCategoryGroups()[0];
    } else {
      const grpIdx = cat.grpIdx;
      return this.getCategoryGroups()[grpIdx];
    }
  }
}