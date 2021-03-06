import { Component, OnInit } from '@angular/core';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { Grocery } from 'src/app/models/grocery';
import { OrderService, AuthService, LoadingService, ToastService } from 'src/app/services';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ExcelService } from 'src/app/services/excel/excel.service';
import { tap, map } from 'rxjs/operators';
import { Product, Unit } from 'src/app/models/product';
import { Order } from 'src/app/models/order';
import { ModalController } from '@ionic/angular';
import { CorrectRealQuantityPage } from '../../modal/correct-real-quantity/correct-real-quantity.page';
import { CollectItemAction } from 'src/app/models/actions/CollectItemAction';
import { AddProductsPage } from '../../modal/add-products/add-products';

import { DateTime } from 'luxon';

@Component({
  selector: 'app-collect-order',
  templateUrl: './collect-order.page.html',
  styleUrls: ['./collect-order.page.scss'],
})
export class CollectOrderPage implements OnInit {

  orderWeek: string;
  familyId: string;
  groupId: string;
  deliveryDates$: Observable<DateTime[]>;
  myWeekOrder$: Observable<Grocery[]>;
  notOrderedProducts: Product[];
  groupOrder: Grocery[];
  subscription: Subscription;
  subscription2: Subscription;
  productsByCategory: Map<string, Set<string>>;
  public showDone: boolean;
  public productFilter: string;
  public alreadyCollected: number;
  public toCollect: number;
  
  constructor(private orderService: OrderService, public authService: AuthService, 
    public loading: LoadingService, public toast: ToastService, 
    private route: ActivatedRoute, private decimalPipe: DecimalPipe,
    private excelService: ExcelService, public modalController: ModalController) { }

  ngOnInit() {

   //this.categoriesAndProduct = new Map<string, Set<string>>();
    this.route.paramMap.subscribe(
      (params: ParamMap) => {
        let week = params.get('orderWeek');
        if (!week) { week= this.orderService.getCurrentWeek()}
        this.subscription = this.authService.getUser$().subscribe(user => {
          this.groupId = user.groupId;
          this.familyId = user.familyId;
          this.changeOrderWeek(week);
        })
        
      }
    );
    
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
    this.productFilter = 'onlyToCollect';
    this.orderWeek = orderWeek;
    this.loading.showLoading('Loading order...');
    this.deliveryDates$ = this.orderService.getOrderDeliveryDates$(orderWeek);

    const weekOrder$ = this.orderService.getMyOrder(orderWeek, this.groupId, this.familyId)
                .pipe(
                  tap(order => {this.productsByCategory = this.getAllCategoriesWithCounters(order);})
                );

    const availableProducts$ = this.orderService.getAvailableProducts(orderWeek);
   
    this.myWeekOrder$ = combineLatest([availableProducts$, weekOrder$]).pipe(
      map(([products, order]) => {
        this.toCollect = 0;
        this.alreadyCollected = 0;
        products = products.filter(p => (order.items.findIndex(i => i.id == p.id) >= 0));
        let previousCategory = '';
        return products.map(p => {
          if (p.category != previousCategory) {
            p.guiOrder = 0;
            previousCategory = p.category;
          } 
          let qty = 0;
          let item = order.items.find(i => i.id == p.id)
          if (item && item.realQty > 0){
            this.alreadyCollected++;
            return {...p, qty: item.qty, realQty: item.realQty, comment: item.comment, notTaken: item.notTaken} 
          }
          this.toCollect++;
          return {...p, qty: item.qty} });
        })); 

     let notOrderedProducts$ = combineLatest([availableProducts$, weekOrder$]).pipe(
      map(([products, order]) => {
        let notOrderedProducts = products.filter(p => (order.items.findIndex(i => i.id == p.id) < 0));
        return notOrderedProducts;
      })); 
      
     this.subscription2 = notOrderedProducts$.subscribe(products => this.notOrderedProducts = products) 
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

  getOrderPrice(groupId: string, familyId: string){
    const order = this.orderService.getOrderByMember(familyId);
    if (!order) {
      return "? CHF"
    }
    let priceText = this.decimalPipe.transform(order.orderTotal, '1.2-2');
    return priceText + " CHF";
  }

  setRealQtyAsOrdered(item: Grocery) {
    console.log(item);
    this.orderService.pickUp(this.orderWeek, this.groupId, this.familyId, item.id, {realQty: item.qty, notTaken: false});
  }

  async changeRealQty(item: Grocery) { 
    const modal = await this.modalController.create({
      component: CorrectRealQuantityPage,
      componentProps: { 
        orderWeek: this.orderWeek, 
        groupId: this.groupId, 
        familyId: this.familyId,
        item: item
      }
    });
    modal.onDidDismiss().then(data => {
      let collectAction: CollectItemAction = data.data;
      if (collectAction ){
        this.orderService.pickUp(this.orderWeek, this.groupId, this.familyId, item.id, collectAction);
      }

    });
    return await modal.present();
    
  }

  async addNotOrderedProduct() { 
    const modal = await this.modalController.create({
      component: AddProductsPage,
      componentProps: { 
        products: this.notOrderedProducts
      }
    });
    modal.onDidDismiss().then(data => {
      let productsToAdd: Product[] = data.data;
      if (productsToAdd ){
        this.orderService.addProducts(this.orderWeek, this.groupId, this.familyId, productsToAdd);
      }

    });
    return await modal.present();
    
  }

  showCard(item: Grocery): boolean{
    if (this.productFilter == 'onlyCollected' && item.realQty >= 0) return true;
    if (this.productFilter == 'onlyToCollect' && (!item.notTaken && !(item.realQty >= 0))) return true;
    return false;
  }

  getAllCategoriesWithCounters(myOrder: Order){
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

  getCategoryCount(category: string){
    let orderedProducts = this.productsByCategory.get(category);
    if (!orderedProducts) {
      return 0
    }
    return orderedProducts.size;
  }
  
  toggleShowDone(){
    this.showDone = !this.showDone;
  }
  segmentChanged(filter){
    this.productFilter = filter;
  }

  isNotTaken(item){
    return item.notTaken || item.realQty == 0.01;
  }

  isDefaultApprovalEnabled(item){
    if (item.realQty > 0.1) return false;
    if (this.isNotTaken(item)) return false;

    return item.orderUnit == item.priceUnit;
  }

  getPrice(grocery){
    let price = Grocery.price(grocery);
    let priceText = this.decimalPipe.transform(price, '1.2-2')
    return priceText + " CHF"
  }
}
