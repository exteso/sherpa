import { Component, OnInit } from '@angular/core';
import { OrderService } from 'src/app/services/order/order.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { Group, User } from 'src/app/models';
import { AuthService, FirestoreService } from 'src/app/services';
import { Product } from 'src/app/models/product';
import { combineLatest } from 'rxjs';
import { Grocery } from 'src/app/models/grocery';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-next-order',
  templateUrl: './next-order.page.html',
  styleUrls: ['./next-order.page.scss'],
})
export class NextOrderPage implements OnInit {

  orderWeek: string;
  familyId: string;
  groupId: string;
  myGroups$: Observable<Group[]>
  currentUser: User;
  availableProducts$: Observable<Product[]>;
  familyWeekOrder$: Observable<Grocery[]>;
  productsWithOrderQty$: Observable<Grocery[]>;
  searchTerm: string = '';
  searchTerm$: BehaviorSubject<string>;

  constructor(private firestore: FirestoreService, private orderService: OrderService, public authService: AuthService) { }

  ngOnInit() {
    this.searchTerm$ = new BehaviorSubject("");
    this.groupId = "Roncaccio";
    this.familyId = "yanke";
    this.changeOrderWeek(this.orderService.getCurrentWeek());
    this.myGroups$ = this.orderService.getMyGroups();
    this.currentUser = this.authService.getUserData()
  }

  changeOrderWeek(orderWeek: string){
    this.orderWeek = orderWeek;
    this.availableProducts$ = this.firestore.getCatalogProducts(orderWeek).valueChanges();
    this.familyWeekOrder$ = this.orderService.getMyOrder(orderWeek, this.groupId, this.familyId);
    this.productsWithOrderQty$ = combineLatest([this.availableProducts$, this.familyWeekOrder$]).pipe(
      map(([products, orderedItems]) => {
        return products.map(p => { 
          let qty = 0;
          let item = orderedItems.find(i => i.id == p.id)
          if (item && item.qty > 0){
            qty = item.qty;
          }
          return {...p, qty} });
      }));
  }

  nextWeek(){
    this.changeOrderWeek(OrderService.weekAfter(this.orderWeek));
  }

  previousWeek(){
    this.changeOrderWeek(OrderService.weekBefore(this.orderWeek));
  }

  search(term){
    this.searchTerm$.next(term);
  }

  myHeaderFn(record, recordIndex, records) {
    if (recordIndex == 0) { return record.category; }

    let previousItem = records[recordIndex-1];
    if (record.category != previousItem.category) {
      return record.category;
    }
    return null;
  }

  updateQty(product: Product, qty: number){
    console.log("updateQty: "+ product.name + " "+ qty);
    this.orderService.updateMyOrder(this.orderWeek, this.groupId, this.familyId, product, qty);
  }
}
