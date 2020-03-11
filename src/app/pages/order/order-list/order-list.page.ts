import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { OrderService, AuthService, ToastService, LoadingService } from 'src/app/services';
import { Grocery } from 'src/app/models/grocery';

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
  
  constructor(private orderService: OrderService, public authService: AuthService, 
    public loading: LoadingService, public toast: ToastService) { }

  ngOnInit() {
    this.subscription = this.authService.getUser$().subscribe(user => {
      this.groupId = user.groupId;
      this.changeOrderWeek(this.orderService.getCurrentWeek());
    })
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

    this.groupWeekOrder$ = this.orderService.getMyGroupOrder(orderWeek, this.groupId);
  }

  nextWeek(){
    this.changeOrderWeek(OrderService.weekAfter(this.orderWeek));
  }

  previousWeek(){
    this.changeOrderWeek(OrderService.weekBefore(this.orderWeek));
  }

}
