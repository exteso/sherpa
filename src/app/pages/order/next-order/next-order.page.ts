import { Component, OnInit } from '@angular/core';
import { OrderService } from 'src/app/services/order/order.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { Group, User } from 'src/app/models';
import { AuthService, FirestoreService, TranslateProvider } from 'src/app/services';
import { Product } from 'src/app/models/product';
import { combineLatest } from 'rxjs';
import { Grocery } from 'src/app/models/grocery';
import { map, withLatestFrom, tap } from 'rxjs/operators';

@Component({
  selector: 'app-next-order',
  templateUrl: './next-order.page.html',
  styleUrls: ['./next-order.page.scss'],
})
export class NextOrderPage implements OnInit {

  orderWeek: string;
  familyId: string;
  groupId: string;
  nrOfProducts: number;
  deliveryDates: Date[];
  myGroups$: Observable<Group[]>
  currentUser: User;
  availableProducts$: Observable<Product[]>;
  familyWeekOrder$: Observable<Grocery[]>;
  filteredGroceryItems$: Observable<Grocery[]>;
  sortedCategories$: Observable<string[]>;
  initializeGroceryItems$: Observable<Grocery[]>;
  searchTerm: string = '';
  searchTerm$: BehaviorSubject<string>;

  constructor(private firestore: FirestoreService, private orderService: OrderService, 
    public authService: AuthService, public translate: TranslateProvider) { }

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
    this.deliveryDates = this.orderService.getOrderDeliveryDates(orderWeek);
    
    this.sortedCategories$ = this.orderService.getCategories$(orderWeek);
    this.availableProducts$ = this.firestore.getCatalogProducts(orderWeek)
                                  .valueChanges().pipe(
                                    map(products => {
                                      return products.sort((p1, p2) => { 
                                          const categories = this.orderService.getCategories();
                                          const c1 = categories.indexOf(p1.category.trim())
                                          if (c1 == -1) console.log(p1.category + " Not Found");
                                          const c2 = categories.indexOf(p2.category.trim())
                                          if (c2 == -1) console.log(p2.category + " Not Found");
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
                                    }),
                                    tap(products => this.nrOfProducts = products.length)
                                    );
    this.familyWeekOrder$ = this.orderService.getMyOrder(orderWeek, this.groupId, this.familyId);
    this.initializeGroceryItems$ = this.availableProducts$.pipe(
      withLatestFrom(this.familyWeekOrder$),
      map(([products, orderedItems]) => {
        return products.map(p => { 
          let qty = 0;
          let item = orderedItems.find(i => i.id == p.id)
          if (item && item.qty > 0){
            qty = item.qty;
          }
          return {...p, qty} });
      }));
    

      this.filteredGroceryItems$ = combineLatest([this.initializeGroceryItems$, this.searchTerm$]).pipe(
        map(([items, searchQuery]) => {
          // here we imperatively implement the filtering logic
          if (!searchQuery) { return items; }
          const q = searchQuery.toLowerCase();
          return items.filter(item => {
            if (item.name && item.name.toLowerCase().includes(q) ||
                item.category && item.category.toLowerCase().includes(q) ||
                item.origin && item.origin.toLowerCase().includes(q)) {
                  return true;
            }
            return false;
          });
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
    this.orderService.updateMyOrder(this.orderWeek, this.groupId, this.familyId, product, qty);
  }
}
