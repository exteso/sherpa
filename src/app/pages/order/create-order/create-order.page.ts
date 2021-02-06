import { Component, OnInit, OnDestroy } from '@angular/core';
import { OrderService } from 'src/app/services/order/order.service';
import { Observable, BehaviorSubject, Subscription, of } from 'rxjs';
import { Group, User } from 'src/app/models';
import { AuthService, FirestoreService, TranslateProvider, LoadingService, ToastService } from 'src/app/services';
import { Product } from 'src/app/models/product';
import { combineLatest } from 'rxjs';
import { Grocery } from 'src/app/models/grocery';
import { map, tap } from 'rxjs/operators';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Order } from 'src/app/models/order';
import { DecimalPipe } from '@angular/common';

import { DateTime } from 'luxon';

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
  deliveryDates$: Observable<DateTime[]>;

  isOrderClosed: boolean;
  orderClosingDate: Date;

  myGroups$: Observable<Group[]>
  currentUser: User;
  availableProducts$: Observable<Product[]>;
  categoriesGroupFromProducts$: Observable<string[]>;
  familyWeekOrder$: BehaviorSubject<Order>;
  filteredGroceryItems$: Observable<Grocery[]>;
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
    private route: ActivatedRoute, private decimalPipe: DecimalPipe) { }

  ngOnInit() {
    this.categoriesAndProduct = new Map<string, Set<string>>();
    this.showBasketOnly$ = new BehaviorSubject(false);
    this.route.paramMap.subscribe(
      (params: ParamMap) => {
        let week = params.get('orderWeek');
        if (!week) { week= OrderService.weekAfter(this.orderService.getCurrentWeek())}
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
    this.familyWeekOrder$ = new BehaviorSubject(Order.EMPTY);
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

  //TODO pass groupId and familyId as method parameter
  changeOrderWeek(orderWeek: string){
    this.orderWeek = orderWeek;
    this.showBasketOnly$ = new BehaviorSubject(false);
    
    this.nrOfProducts = undefined;
    this.loading.showLoading('Loading catalog...');

    this.deliveryDates$ = this.orderService.getOrderDeliveryDates$(orderWeek);
    
    this.availableProducts$ = this.orderService.getAvailableProducts(orderWeek)
                                  .pipe(
                                    tap(products => {
                                      this.nrOfProducts = products.length;
                                      this.loading.dismiss();
                                      this.toast.showToast('Loaded catalog with '+this.nrOfProducts+' products');
                                    }));
    this.categoriesGroupFromProducts$ = this.availableProducts$.pipe(
      map((products: Product[]) => {
        const categories = this.orderService.getCategories();
        const categoryGroups = this.orderService.getCategoryGroups();
        let catGroups: Array<string> = [];
        products.forEach(p => {
          const productCat = categories.find(c => c.name === p.category);
          const productGrpCat = categoryGroups[productCat.grpIdx];
          if (!catGroups.includes(productGrpCat)) {
            catGroups.push(productGrpCat);
          }
          
        });
        return catGroups;
      }),
      tap(catGroups =>  {
        this.visibleCategoryGroup=catGroups[0];
        this.visibleCategoryGroup$.next(this.visibleCategoryGroup);
      }),
      
      );

    if (this.groupId && this.familyId) {
      this.subscription2 = this.orderService.getMyOrder(orderWeek, this.groupId, this.familyId).subscribe(
        myOrder => {
          this.isOrderClosed = myOrder.closed;
          this.orderClosingDate = myOrder.closedAt;
          this.familyWeekOrder$.next(myOrder);
          this.categoriesAndProduct = this.getAllCategoryCounters(myOrder);
        }
      );
    } else {
      this.familyWeekOrder$.next(Order.EMPTY);
    }
    this.initializeGroceryItems$ = combineLatest([this.availableProducts$, this.familyWeekOrder$]).pipe(
    //this.initializeGroceryItems$ = this.availableProducts$.pipe(
    //  withLatestFrom(this.familyWeekOrder$),
      map(([products, order]) => {
        return products.map(p => { 
          let qty = 0;
          let item = order.items.find(i => i.id == p.id)
          if (item && item.qty > 0){
            qty = item.qty;
            if (item.realQty > 0) {
              return {...p, qty, realQty: item.realQty};
            }
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

  isReadOnly(){
    return this.showBasketOnly() || this.isOrderClosed;
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

  getAllCategoryCounters(myOrder: Order){
    const catAndProd = new Map<string, Set<string>>();
    myOrder.items.forEach(product => {
      let orderedProducts = catAndProd.get(product.category);
      if (!orderedProducts) {
        catAndProd.set(product.category, new Set([product.id]));
      } else {
        orderedProducts.add(product.id);
      }
    })
    return catAndProd;
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

    // we always show the category before the first product but only when we show all the products
    if (!this.showBasketOnly()) return true;
    
    // if showBasketOnly we show only categories with at least 1 product 
    return (this.getCategoryCounter(product.category) > 0);
  }

  getPrice(): Observable<string> {
    return this.familyWeekOrder$.pipe(
      map(order => {
        let priceText = this.decimalPipe.transform(order.orderTotal, '1.2-2');
        return priceText + " CHF";
      }));
  }
}
