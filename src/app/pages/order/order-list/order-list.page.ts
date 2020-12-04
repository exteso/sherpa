import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { OrderService, AuthService, ToastService, LoadingService } from 'src/app/services';
import { Grocery } from 'src/app/models/grocery';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { tap, map } from 'rxjs/operators';
import { Product } from 'src/app/models/product';
import { Order } from 'src/app/models/order';
import { DecimalPipe } from '@angular/common';
import { ExcelService } from 'src/app/services/excel/excel.service';
import { User } from 'src/app/models/user';
import * as firebase from 'firebase';
import { ModalController, AlertController } from '@ionic/angular';
import { LoginModalComponent } from 'src/app/components/login-modal/login-modal.component';
import { AngularFireFunctions } from '@angular/fire/functions';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.page.html',
  styleUrls: ['./order-list.page.scss'],
})
export class OrderListPage implements OnInit, OnDestroy {

  isOrderClosed: boolean;
  orderClosedAt: Date;
  currentUser: User;
  orderWeek: string;
  families: string[];
  groupId: string;
  deliveryDates: Date[];
  groupWeekOrder$: Observable<Grocery[]>;
  groupOrder: Grocery[];
  subscription: Subscription;
  productsByCategory: Map<string, Set<string>>;
  
  constructor(private orderService: OrderService, public authService: AuthService, 
    public loading: LoadingService, public toast: ToastService, 
    private route: ActivatedRoute, private decimalPipe: DecimalPipe,
    private excelService: ExcelService,
    private modalController: ModalController,
    public alertController: AlertController,
    private fns: AngularFireFunctions) { }

  ngOnInit() {

   //this.categoriesAndProduct = new Map<string, Set<string>>();
    this.route.paramMap.subscribe(
      (params: ParamMap) => {
        let week = params.get('orderWeek');
        if (!week) { week= OrderService.weekAfter(this.orderService.getCurrentWeek())}
        this.subscription = this.authService.getUser$().subscribe(user => {
          this.groupId = user.groupId;
          this.currentUser = user;
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
                  tap(groupOrder => {
                                      this.productsByCategory = this.getAllCategoriesWithCounters(groupOrder);
                                      this.isOrderClosed = groupOrder.closed;
                                      this.orderClosedAt = groupOrder.closedAt;
                                    })
                );

    const availableProducts$ = this.orderService.getAvailableProducts(orderWeek);
   
    this.groupWeekOrder$ = combineLatest([availableProducts$, myGroupWeekOrder$]).pipe(
      map(([products, order]) => {
        products = products.filter(p => (order.items.findIndex(i => i.id == p.id) >= 0));
        let previousCategory = '';
        return products.map(p => {
          if (p.category != previousCategory) {
            p.guiOrder = 0;
            previousCategory = p.category;
          } 
          let qty = 0;
          let item = order.items.find(i => i.id == p.id)
          if (item && item.qty > 0){
            qty = item.qty;
            if (item.realQty) {
              return {...p, qty, realQty: item.realQty};
            }
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

  getOrderPrice(groupId: string, familyId: string){
    const order = this.orderService.getOrderByMember(familyId);
    if (!order) {
      return "? CHF"
    }
    let priceText = this.decimalPipe.transform(order.orderTotal, '1.2-2');
    return priceText + " CHF";
  }


  hasCollected(familyId: string) {
    const order = this.orderService.getOrderByMember(familyId);
    return !!order && order.collected;
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

  closeOrder(){
    let famIds = this.families.map((f:any) => f.id);
    this.orderService.closeOrder(this.orderWeek, this.groupId, famIds, this.currentUser.email);
  }

  printOrder(){
    let items = [];

    this.families.forEach((family: any) => {
      let items0 = this.getOrderedItems(family.id);
      items = items.concat(...items0);
    })

    const categories = this.orderService.getCategories();
    
    items = items.sort((p1, p2) => { 
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

    items = this.groupSameItems(items);

    this.excelService.exportAsExcelFile(items, this.orderWeek, this.groupId);
  }

  private getOrderedItems(familyId: string){
    let order = this.orderService.getOrderByMember(familyId);
    let items: Grocery[] = order.items.map(i => {return {...i, familyId}});
    return items;
  }

  private groupSameItems(items: Grocery[]): Grocery[] {
    let grouped: Grocery[] = [];
    let lastItem: Grocery;
    items.forEach(i => {
      let it;
      if (lastItem && i.id == lastItem.id) {
        grouped.pop();
        it = {...lastItem };
        it['qty'] = lastItem.qty + i.qty; 
        if (i.realQty > 0.1) {
          it['realQty'] = lastItem.realQty + i.realQty; 
        }
      } else {
       it = {...i };
      }
      it[i.familyId] = i.qty+'/';
      delete it['familyId'];

      grouped.push(it);
      lastItem = it;
    });
    return grouped.map(i => { 
                        let it = { ...i, unit: i.unitText };
                        delete it['id'];
                        delete it['familyId'];
                        delete it['currency'];
                        delete it['guiOrder'];
                        delete it['orderUnit'];
                        delete it['priceUnit'];
                        delete it['unitText'];
                        delete it['realQty'];
                        delete it['notTaken'];
                        delete it['dismissed'];
                        return it;
                      });
  }

  async showLoginModal() {
    let week = this.orderWeek.split('w')[1];
    const m = await this.modalController.create({component: LoginModalComponent,
                                                 componentProps: { 
                                                    orderWeek: week
                                                }});
    m.onDidDismiss().then(data => {
      this.prepareOrder2(data.data.username, data.data.password, data.data.orderName);
    })
    await m.present();
  }

  prepareOrder() {
    this.showLoginModal();
  }

  prepareOrder2(username: string, pwd: string, orderId: string) {

    this.orderService.getMyGroupOrder(this.orderWeek, this.groupId).subscribe(o => {
      const grouped = this.groupSameItems(o.items);
      //firebase.functions().useFunctionsEmulator("http://localhost:5001");
      //
      const callable = this.fns.httpsCallable('prepareOrder');
      callable({username:username, password: pwd, orderId: orderId}).toPromise().then(r => {
        const matched = matchOrder(grouped, r.info)
        if (matched.unmatched.length > 0) {
          console.log(matched.unmatched);
          alert(matched.unmatched.length +" prodotti NON sono stati ordinati: vedi console");
        }
        if (grouped.length > 0 && matched.matched.length > 0) {
          let url = `http://conprobio.ch/conprobio/editOrderUser.action?order=${orderId}&`;
          for (let o of matched.matched) {
            url+= `${o.product.inputQuantityName}=${(o.order.qty).toString()}&`
          }
          window.location.href = url;
        } else {
          this.alertController.create({header: 'Errore', message: 'Errore nella creazione della lista'}).then(o => {
            o.present();
          })
        }
      });
    });
  }
}

//remove everything which is not A-Z or 0-9
function normalizeName(name: string) {
  return name.toUpperCase().replace(/[^A-Z0-9]/gi, '')
}

//some fuzzy logic, as sometimes the import is not 100% correct
function matchItemNameAndPrice(itemName: string, productName: string, itemPrice: number, productPrice: string) {
  return itemName == productName || (normalizeName(itemName) == normalizeName(productName) && itemPrice === Number(productPrice));
}

function matchOrder(order: Grocery[], products) {

  let matches: {product: any, order: Grocery}[] = [];
  let unmatched: Grocery[] = [];

   for(let item of order) {
      let matched = false;
       for(let productCategories of products) {
          for(let product of productCategories) {
              if (matchItemNameAndPrice(item.name.trim(), product.product.trim(), item.price, product.price) && item.origin.trim() == product.provenience.trim() && item.certification.trim() == product.certification.trim()) {
                matches.push({product: product, order: item}); matched = true; 
                break;
              }
          }
      }
      if(!matched) {unmatched.push(item)}
  }
  return {matched: matches, unmatched: unmatched};
}
