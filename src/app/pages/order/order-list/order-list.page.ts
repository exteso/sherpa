import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { OrderService, AuthService } from 'src/app/services';
import { Grocery } from 'src/app/models/grocery';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.page.html',
  styleUrls: ['./order-list.page.scss'],
})
export class OrderListPage implements OnInit, OnDestroy {

  orderWeek: string;
  familyId: string;
  groupId: string;
  groupWeekOrder$: Observable<Grocery[]>;
  subscription: Subscription;
  
  constructor(private orderService: OrderService, public authService: AuthService) { }

  ngOnInit() {
    this.subscription = this.authService.getUser$().subscribe(user => {
      this.groupId = user.groupId;
      this.familyId = user.familyId;
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
    this.groupWeekOrder$ = this.orderService.getMyGroupOrder(orderWeek, this.groupId);
  }

  nextWeek(){
    this.changeOrderWeek(OrderService.weekAfter(this.orderWeek));
  }

  previousWeek(){
    this.changeOrderWeek(OrderService.weekBefore(this.orderWeek));
  }

}
