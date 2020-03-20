import { Injectable, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from '@angular/fire/firestore';
import { Group } from 'src/app/models';
import { filter, map, tap, mergeMap, switchMap, flatMap, exhaustMap, concatAll, concatMap, take } from 'rxjs/operators';
import { Observable, forkJoin, of, from, BehaviorSubject } from 'rxjs';
import { Grocery } from 'src/app/models/grocery';
import { Product } from 'src/app/models/product';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  userEmail: string;
  //userProfile$: Observable<userProfile>;
  currentWeek: string;

  //TODO remove this temp variable
  members: BehaviorSubject<string[]>;

  constructor(public authService: AuthService, private afs: AngularFirestore) { 
    this.members = new BehaviorSubject([]); 
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

  public getMyGroups(): Observable<Group[]> {
    return this.afs.collection<Group>('groups').valueChanges().pipe(
      map((groups: Group[]) => groups.filter(group => {return group.families.includes(this.userEmail)}),
    ));

  }

  public getMyOrder(orderWeek: string, groupId: string, familyId: string): Observable<Grocery[]>{
    return this.afs.collection<Grocery>(`/orders/${orderWeek}/groups/${groupId}/member/${familyId}/items/`).valueChanges();
  }

  mergeGrocery(acc:  Grocery[], source:  Grocery[]){
    source.forEach(sourceItem => {
      let destItem = acc.find(d => d.id == sourceItem.id);
      if (destItem){
        destItem.qty += sourceItem.qty;
        destItem.price += sourceItem.price;
      } else {
        acc.push(sourceItem);
      }
    });
  }

  mergeOrder(orders: Grocery[][]): Grocery[]{
    let final = orders[0];
    for (let i = 1; i<orders.length;i++){
      this.mergeGrocery(final, orders[i]);
    }

    return final;
  }

  getAllOrders(urls: string[]): Observable<Grocery[]> {
    const urlsMap = urls.map(url => <Observable<Grocery[]>> this.afs.collection<Grocery>(url).valueChanges().pipe(take(1)));

    return forkJoin(urlsMap).pipe(
      map((groceries: Grocery[][]) => this.mergeOrder(groceries))
    );
  }

  public getMembers(): Observable<string[]>{
    return this.members;
  }

  public getMyGroupOrder(orderWeek: string, groupId: string): Observable<Grocery[]>{

    let groupOrderUrl$ = this.afs.collection(`/orders/${orderWeek}/groups/${groupId}/member/`).valueChanges().pipe(
      tap((members: any[]) => this.members.next(members)),
      map(members => {
        const groupOrderUrls: string[] = [];
        members.forEach((member:any) => {
          groupOrderUrls.push(`/orders/${orderWeek}/groups/${groupId}/member/${member.id}/items`);
        })
        return groupOrderUrls;
      }),
      switchMap(urls => {
        return this.getAllOrders(urls);
      })
      );

      return groupOrderUrl$;
  }
  
  getUrlsObservable(urls: string[]): Observable<Grocery[]>[] {
    return urls.map(url => {
      return this.afs.collection<Grocery>(url).valueChanges();
    });
  }

  public updateMyOrder(orderWeek: string, groupId: string, familyId: string, product: Product, qty: number){
    return this.afs.doc<Grocery>(`/orders/${orderWeek}/groups/${groupId}/member/${familyId}/items/${product.id}`)
                    .set({
                      ...product,
                      qty
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
      'Carne+Gastronomia', // 2
      "Sughi+Condimenti", // 3
      "Bevande", // 4
      "Confetture", // 5
      "Spezie", // 6
      "Pasta+Riso", // 7
      "Altro" // 8
    ] 
    return catGroups;
  }

  getGroup(category: string){
    const cat = this.getCategories().find(i => i.name.toLowerCase().trim() == category.toLowerCase().trim());
    const grpIdx = cat.grpIdx;
    return this.getCategoryGroups()[grpIdx];
  }
}