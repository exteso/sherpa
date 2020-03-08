import { Injectable, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Group } from 'src/app/models';
import { filter, map, tap, mergeMap, switchMap } from 'rxjs/operators';
import { Observable, forkJoin } from 'rxjs';
import { Grocery } from 'src/app/models/grocery';
import { Product } from 'src/app/models/product';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  userEmail: string;
  //userProfile$: Observable<userProfile>;
  currentWeek: string;

  constructor(public authService: AuthService, private afs: AngularFirestore) {  
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

  public getMyGroupOrder(orderWeek: string, groupId: string): Observable<Grocery[]>{

    let groupMembers$ = this.afs.collection(`/orders/${orderWeek}/groups/${groupId}/member/`).valueChanges();
    return groupMembers$.pipe(
      map(members => {
        console.log(members);
        const memberOrders$: Observable<Grocery[]>[] = [];
        members.forEach((member:any) => {
          memberOrders$.push(this.afs.collection<Grocery>(`/orders/${orderWeek}/groups/${groupId}/member/${member.id}/items`).valueChanges());
        })
        return memberOrders$;
      }),
      switchMap(memberOrders => memberOrders[0])
      /*mergeMap((memberOrders: Observable<Grocery[]>[]) => 
        forkJoin(memberOrders).pipe(
          map((items: Grocery[][]) => {
            let all = items[0]
            if (items.length > 0) {
              all = all.concat(items[1])
            }
            return all;
          }),
        ))*/
        
      );

  }
  
  public updateMyOrder(orderWeek: string, groupId: string, familyId: string, product: Product, qty: number){
    return this.afs.doc<Grocery>(`/orders/${orderWeek}/groups/${groupId}/member/${familyId}/items/${product.id}`)
                    .set({
                      ...product,
                      qty
                    });
  }
}