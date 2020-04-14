import { Injectable, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from '@angular/fire/firestore';
import { Group } from 'src/app/models';
import { filter, map, tap, mergeMap, switchMap, flatMap, exhaustMap, concatAll, concatMap, take } from 'rxjs/operators';
import { Observable, forkJoin, of, from, BehaviorSubject } from 'rxjs';
import { Grocery } from 'src/app/models/grocery';
import { Product } from 'src/app/models/product';
import { FirestoreService } from '../firestore/firestore.service';
import { Order } from 'src/app/models/order';


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
    // Return array of year and week number
    return [d.getUTCFullYear(), weekNo];
  }

  getOrderDeliveryDates(yearAndWeek: string){
    const yw=yearAndWeek.split('w');
    const year = parseFloat(yw[0]);
    const week = parseFloat(yw[1]);
    let yearStart: Date = new Date(Date.UTC(year,0,1,13));
    const deliveryDate = new Date(yearStart.getTime() + this.weeksInMillis(week));
    const orderDate = new Date(yearStart.getTime() + this.weeksInMillis(week) -5*86400000 +3*3600000);
    return [orderDate, deliveryDate];
  }

  weeksInMillis(week: number) {
    return ((week -1)*7*86400000)-86400000;
  }

  getCurrentWeek(): string {
    return this.currentWeek;
  }

  static weekAfter(yearAndWeek: string): string {
    const year = parseFloat(yearAndWeek.substring(0,4));
    let week = parseFloat(yearAndWeek.substring(5,7));
    week++;
    if (week >52) {
      return (year+1)+'w01';
    }else{
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
    group.ref.get().then((documentSnapshot) => {
      group.set({'closed': true,
                 'closedBy': user,
                 'closedAt': Date.now()});
    });
    families.forEach(familyId => {
      let family = this.afs.doc(`/orders/${orderWeek}/groups/${groupId}/member/${familyId}`);
      family.ref.get().then((documentSnapshot) => {
        family.update({'id': familyId,
                      'closed': true,
                      'closedBy': user,
                      'closedAt': Date.now()});
      });
    })
    console.log("Order closed: "+orderWeek+ ", "+ groupId);  
  }

  public getMyOrder(orderWeek: string, groupId: string, familyId: string): Observable<Order>{
    let family = this.afs.doc<Order>(`/orders/${orderWeek}/groups/${groupId}/member/${familyId}`);
    
    family.ref.get().then((documentSnapshot) => {
      if (!documentSnapshot.exists){
        family.update({'id': familyId,
                    'groupId': groupId,
                    'orderWeek': orderWeek,
                    'familyId': familyId});
      }
    });
      
    return family.valueChanges().pipe(
        flatMap(order => {
            return this.afs.collection<Grocery>(`/orders/${orderWeek}/groups/${groupId}/member/${familyId}/items/`,
                                        ref => ref.orderBy('category')
                                                  .orderBy('guiOrder')).valueChanges()
                            .pipe(
                              map(items => this.createOrder(orderWeek, groupId, familyId, items, order.closed, order.closedBy, order.closedAt)),
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
    order.setItemsAndCalculateTotal(items);
    return order;
  }

  mergeGrocery(acc:  Order, source:  Order){
    source.getItems().forEach(sourceItem => {
      let destItem = acc.getItems().find(d => d.id == sourceItem.id);
      if (destItem){
        destItem.qty += sourceItem.qty;
        destItem.price += sourceItem.price;
      } else {
        acc.getItems().push({...sourceItem});
      }
    });
  }

  mergeOrders(orders: Order[]): Order{
    let final = new Order(orders[0].orderWeek, orders[0].groupId, 'GroupOrder');
    for (let i = 0; i<orders.length;i++){
      this.ordersByMember.set(orders[i].familyId, orders[i]);
      this.mergeGrocery(final, orders[i]);
    }

    return final;
  }

  getAllOrders(members: string[]): Observable<Order> {
    //const urlsMap = urls.map(url => <Observable<Grocery[]>> this.afs.collection<Grocery>(url).valueChanges().pipe(take(1)));

    return forkJoin(this.getUrlsObservable(members)).pipe(
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
  
  getUrlsObservable(members: any[]): Observable<Order>[] {
    return members.map(m => {
      return this.afs.collection<Grocery>(`/orders/${m.orderWeek}/groups/${m.groupId}/member/${m.id}/items`,
                                  ref => ref.orderBy('category')
                                            .orderBy('guiOrder')).valueChanges()
                      .pipe(
                        take(1),
                        map(items => this.createOrder(m.orderWeek, m.groupId, m.id, items, false))
                      );
    });
  }

  public updateMyOrder(orderWeek: string, groupId: string, familyId: string, product: Product, qty: number){
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
              {'name': 'Proposte', 'grpIdx': 0},
              {'name': 'Verdure', 'grpIdx': 0},
              {'name': 'Insalate', 'grpIdx': 0},
              {'name': 'erbette', 'grpIdx': 0},
              {'name': 'frutta', 'grpIdx': 0},
              {'name': 'panetteria', 'grpIdx': 0},
              {'name': 'pane', 'grpIdx': 0},
              {'name': 'pane frigo', 'grpIdx': 0},
              {'name': 'uova', 'grpIdx':1},
              {'name': 'senza lattosio', 'grpIdx':1},
              {'name': 'latte + latticini', 'grpIdx':1},
              {'name': 'formaggi mucca', 'grpIdx':1},
              {'name': 'f.misti', 'grpIdx':1},
              {'name': 'formaggi capra', 'grpIdx':1},
              {'name': 'f.pecora', 'grpIdx':1},
              {'name': 'gastromia', 'grpIdx':2},
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
              {'name': 'biscotti + crackers', 'grpIdx':8},
              {'name': 'frutta secca + snacks', 'grpIdx':8},
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