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

  showBasketOnly$: BehaviorSubject<boolean>;
  categoriesAndProduct: Map<string, Set<string>>;
  expandedCategories: boolean[] = [];
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
  visibleCategoryGroup: string;
  visibleCategoryGroup$: BehaviorSubject<string>;
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
    this.categoriesAndProduct = new Map<string, Set<string>>();
    this.showBasketOnly$ = new BehaviorSubject(false);
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
    this.visibleCategoryGroup = "";
    this.visibleCategoryGroup$ = new BehaviorSubject(this.visibleCategoryGroup);
    
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
    this.categoriesAndProduct = new Map<string, Set<string>>();
    this.showBasketOnly$ = new BehaviorSubject(false);
    
    this.nrOfProducts = undefined;
    this.loading.showLoading('Loading catalog...');

    this.deliveryDates = this.orderService.getOrderDeliveryDates(orderWeek);
    
    this.categoryGroups = this.orderService.getCategoryGroups();
    this.visibleCategoryGroup=this.categoryGroups[0];
    this.visibleCategoryGroup$.next(this.visibleCategoryGroup);

    this.availableProducts$ = this.orderService.getAvailableProducts(orderWeek)
                                  .pipe(
                                    tap(products => {
                                      this.nrOfProducts = products.length;
                                      this.loading.dismiss();
                                      this.toast.showToast('Loaded catalog with '+this.nrOfProducts+' products');
                                    }));
    if (this.groupId && this.familyId) {
      this.subscription2 = this.orderService.getMyOrder(orderWeek, this.groupId, this.familyId).subscribe(
        myOrder => {
          this.familyWeekOrder$.next(myOrder);
          this.initializeAllCategoryCounters(myOrder);
        }
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

    this.filteredGroceryItems$ = combineLatest([this.initializeGroceryItems$, this.searchTerm$, this.visibleCategoryGroup$, this.showBasketOnly$]).pipe(
      map(([items, searchQuery, visCatGroup, onlyBasket]) => {
        if (onlyBasket) return items;
        // here we imperatively implement the filtering logic
        if (!searchQuery) { 
          
          return items.filter(item => {
            if (item.category && visCatGroup == this.orderService.getGroup(item.category)) {
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
    this.refreshCategoryCounter(product, qty);
    this.orderService.updateMyOrder(this.orderWeek, this.groupId, this.familyId, product, qty);
  }

  getCategoryCounter(category: string){
    let orderedProducts = this.categoriesAndProduct.get(category);
    if (!orderedProducts) {
      return 0
    }
    return orderedProducts.size;
  }

  refreshCategoryCounter(product: Product, qty: number) {
    let orderedProducts = this.categoriesAndProduct.get(product.category);
    if (qty == 0) {
      orderedProducts.delete(product.id);
    }else if (!orderedProducts) {
      this.categoriesAndProduct.set(product.category, new Set([product.id]));
    } else {
      orderedProducts.add(product.id);
    }
  }

  isProductInBasket(product: Product){
    let orderedProducts = this.categoriesAndProduct.get(product.category);
    if (!orderedProducts) {
      return false;
    } else {
      return orderedProducts.has(product.id);
    }

  }

  initializeAllCategoryCounters(myOrder: Grocery[]){
    myOrder.forEach(product => {
      let orderedProducts = this.categoriesAndProduct.get(product.category);
      if (!orderedProducts) {
        this.categoriesAndProduct.set(product.category, new Set([product.id]));
      } else {
        orderedProducts.add(product.id);
      }
    })
  }

  segmentChanged(ev: any) {
    this.visibleCategoryGroup$.next(ev.detail.value);
  }

  toggleshowBasketOnly(){
    this.showBasketOnly$.next(!this.showBasketOnly());
  }

  showBasketOnly(){
    return this.showBasketOnly$.value;
  }

  hideProduct(product: Product){
    if (this.searchTerm) return false;

    if (this.showBasketOnly()) { 
      return !this.isProductInBasket(product);
    } 
    return !this.expandedCategories[product.category];
  }

  showCategory(product: Product){
    //if it is not the first product in this category don't show the category anymore
    if (product.guiOrder != 0) return false; 

    // we always show the category before the first product if we show all the products
    if (!this.showBasketOnly()) return true;
    
    // if showBasketOnly we show only categories with at least 1 product 
    return (this.getCategoryCounter(product.category) > 0);
  }
}
