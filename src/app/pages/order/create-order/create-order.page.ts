import { Component, OnInit, OnDestroy } from '@angular/core';
import { OrderService } from 'src/app/services/order/order.service';
import { Observable, BehaviorSubject, Subscription, of } from 'rxjs';
import { Group, User } from 'src/app/models';
import { AuthService, FirestoreService, TranslateProvider, LoadingService, ToastService } from 'src/app/services';
import { Product } from 'src/app/models/product';
import { combineLatest } from 'rxjs';
import { Grocery } from 'src/app/models/grocery';
import { map, withLatestFrom, tap } from 'rxjs/operators';
import { ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-create-order',
  templateUrl: './create-order.page.html',
  styleUrls: ['./create-order.page.scss'],
})
export class CreateOrderPage implements OnInit, OnDestroy {

  orderWeek: string;
  prevOrderWeek: string;
  nextOrderWeek: string;
  familyId: string;
  groupId: string;
  nrOfProducts: number;
  deliveryDates: Date[];

  myGroups$: Observable<Group[]>
  currentUser: User;
  availableProducts$: Observable<Product[]>;
  familyWeekOrder$: BehaviorSubject<Grocery[]>;
  filteredGroceryItems$: Observable<Grocery[]>;
  categoryGroups: string[];
  visibleCategoryGroups$: BehaviorSubject<string[]>;
  initializeGroceryItems$: Observable<Grocery[]>;
  searchTerm: string = '';
  searchTerm$: BehaviorSubject<string>;
  subscription: Subscription;
  subscription2: Subscription;

  constructor(private firestore: FirestoreService, private orderService: OrderService, 
    public authService: AuthService, public translate: TranslateProvider, 
    public loading: LoadingService, public toast: ToastService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.paramMap.subscribe(
      (params: ParamMap) => {
        let week = params.get('orderWeek');
        if (!week) { week= this.orderService.getCurrentWeek()}
        this.nextOrderWeek = OrderService.weekAfter(week);
        this.prevOrderWeek = OrderService.weekBefore(week);
        this.subscription = this.authService.getUser$().subscribe(user => {
          this.groupId = user.groupId;
          this.familyId = user.familyId;
          this.changeOrderWeek(week);
        })
        
      }
    );
    this.searchTerm$ = new BehaviorSubject("");
    this.familyWeekOrder$ = new BehaviorSubject([]);
    this.visibleCategoryGroups$ = new BehaviorSubject([]);
    this.myGroups$ = this.orderService.getMyGroups();
   
  }

  ngOnDestroy(){
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
    if (this.subscription2) {
      this.subscription2.unsubscribe()
    }
  }

  changeOrderWeek(orderWeek: string){
    this.orderWeek = orderWeek;
    
    this.nrOfProducts = undefined;
    this.loading.showLoading('Loading catalog...');

    this.deliveryDates = this.orderService.getOrderDeliveryDates(orderWeek);
    
    this.categoryGroups = this.orderService.getCategoryGroups();
    this.visibleCategoryGroups$.next([this.categoryGroups[0]]);

    this.availableProducts$ = this.firestore.getCatalogProducts(orderWeek)
                                  .valueChanges().pipe(
                                    map(products => {
                                      const categories = this.orderService.getCategories();
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
                                    }),
                                    tap(products => {
                                      this.nrOfProducts = products.length;
                                      this.loading.dismiss();
                                      this.toast.showToast('Loaded catalog with '+this.nrOfProducts+' products');
                                    }));
    if (this.groupId && this.familyId) {
      this.subscription2 = this.orderService.getMyOrder(orderWeek, this.groupId, this.familyId).subscribe(
        myOrder => this.familyWeekOrder$.next(myOrder)
      );
    } else {
      this.familyWeekOrder$.next([]);
    }
    this.initializeGroceryItems$ = combineLatest([this.availableProducts$, this.familyWeekOrder$]).pipe(
    //this.initializeGroceryItems$ = this.availableProducts$.pipe(
    //  withLatestFrom(this.familyWeekOrder$),
      map(([products, orderedItems]) => {
        return products.map(p => { 
          let qty = 0;
          let item = orderedItems.find(i => i.id == p.id)
          if (item && item.qty > 0){
            qty = item.qty;
          }
          return {...p, qty} });
      }));  

    this.filteredGroceryItems$ = combineLatest([this.initializeGroceryItems$, this.searchTerm$, this.visibleCategoryGroups$]).pipe(
      map(([items, searchQuery, visCatGroups]) => {

        // here we imperatively implement the filtering logic
        if (!searchQuery) { 
          
          return items.filter(item => {
            if (item.category && visCatGroups.includes(this.orderService.getGroup(item.category))) {
                  return true;
            }
            return false;
          });
        
        }
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

  segmentChanged(ev: any) {
    console.log('Segment changed', ev);
    this.visibleCategoryGroups$.next([ev.detail.value]);
  }
}
