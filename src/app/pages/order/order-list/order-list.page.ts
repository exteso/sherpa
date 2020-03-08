import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderService } from 'src/app/services';
import { Grocery } from 'src/app/models/grocery';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.page.html',
  styleUrls: ['./order-list.page.scss'],
})
export class OrderListPage implements OnInit {

  orderWeek: string;
  familyId: string;
  groupId: string;
  groupWeekOrder$: Observable<Grocery[]>;
  
  constructor(private orderService: OrderService) { }

  ngOnInit() {
    this.groupId = "Roncaccio";
    this.familyId = "yanke";
    this.changeOrderWeek(this.orderService.getCurrentWeek());
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
