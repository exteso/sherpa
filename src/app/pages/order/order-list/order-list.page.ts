import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { OrderService, AuthService, ToastService, LoadingService } from 'src/app/services';
import { Grocery } from 'src/app/models/grocery';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { tap, map } from 'rxjs/operators';
import { Product } from 'src/app/models/product';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.page.html',
  styleUrls: ['./order-list.page.scss'],
})
export class OrderListPage implements OnInit, OnDestroy {

  orderWeek: string;
  families: string[];
  groupId: string;
  deliveryDates: Date[];
  groupWeekOrder$: Observable<Grocery[]>;
  groupOrder: Grocery[];
  subscription: Subscription;
  productsByCategory: Map<string, Set<string>>;
  
  constructor(private orderService: OrderService, public authService: AuthService, 
    public loading: LoadingService, public toast: ToastService, private route: ActivatedRoute) { }

  ngOnInit() {

   //this.categoriesAndProduct = new Map<string, Set<string>>();
    this.route.paramMap.subscribe(
      (params: ParamMap) => {
        let week = params.get('orderWeek');
        if (!week) { week= OrderService.weekAfter(this.orderService.getCurrentWeek())}
        this.subscription = this.authService.getUser$().subscribe(user => {
          this.groupId = user.groupId;
          this.changeOrderWeek(week);
        })
        
      }
    );
    
  }

  ngOnDestroy(){
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

  changeOrderWeek(orderWeek: string){
    this.orderWeek = orderWeek;
    this.orderService.getMembers().subscribe(members => this.families = members);
    this.loading.showLoading('Loading order...');
    this.deliveryDates = this.orderService.getOrderDeliveryDates(orderWeek);

    const myGroupWeekOrder$ = this.orderService.getMyGroupOrder(orderWeek, this.groupId)
                .pipe(
                  tap(groupOrder => {this.productsByCategory = this.getAllCategoriesWithCounters(groupOrder);})
                );

    const availableProducts$ = this.orderService.getAvailableProducts(orderWeek);
   
    this.groupWeekOrder$ = combineLatest([availableProducts$, myGroupWeekOrder$]).pipe(
      map(([products, orderedItems]) => {
        products = products.filter(p => (orderedItems.findIndex(i => i.id == p.id) >= 0));
        let previousCategory = '';
        return products.map(p => {
          if (p.category != previousCategory) {
            p.guiOrder = 0;
            previousCategory = p.category;
          } 
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

  showCategory(product: Product){
    //if it is not the first product in this category don't show the category anymore
    if (product.guiOrder != 0) return false; 
    
    return true;
    //we show only categories with at least 1 product 
    //return (this.getCategoryCounter(product.category) > 0);
  }

  getAllCategoriesWithCounters(myOrder: Grocery[]){
    const catAndProd = new Map<string, Set<string>>();
    myOrder.forEach(product => {
      let orderedProducts = catAndProd.get(product.category);
      if (!orderedProducts) {
        catAndProd.set(product.category, new Set([product.id]));
      } else {
        orderedProducts.add(product.id);
      }
    })
    return catAndProd;
  }

  getCategoryCount(category: string){
    let orderedProducts = this.productsByCategory.get(category);
    if (!orderedProducts) {
      return 0
    }
    return orderedProducts.size;
  }
}
