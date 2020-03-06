import { Component, OnInit } from '@angular/core';
import { OrderService } from 'src/app/services/order/order.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { Group, User } from 'src/app/models';
import { AuthService, FirestoreService } from 'src/app/services';
import { Product } from 'src/app/models/product';

@Component({
  selector: 'app-next-order',
  templateUrl: './next-order.page.html',
  styleUrls: ['./next-order.page.scss'],
})
export class NextOrderPage implements OnInit {

  orderWeek: string;
  familyId: string;
  groupId: string;
  myGroups$: Observable<Group[]>
  currentUser: User;
  availableProducts$: Observable<Product[]>
  searchTerm: string = '';
  searchTerm$: BehaviorSubject<string>;

  constructor(private firestore: FirestoreService, private orderService: OrderService, public authService: AuthService) { }

  ngOnInit() {
    this.searchTerm$ = new BehaviorSubject("");
    this.orderWeek = this.orderService.getCurrentWeek();
    this.myGroups$ = this.orderService.getMyGroups();
    this.currentUser = this.authService.getUserData()

    this.availableProducts$ = this.firestore.getCatalogProducts(this.orderWeek).valueChanges();
  }

  nextWeek(){
    this.orderWeek = this.orderService.nextWeek(this.orderWeek);
  }

  previousWeek(){
    this.orderWeek = this.orderService.previousWeek(this.orderWeek);
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
}
