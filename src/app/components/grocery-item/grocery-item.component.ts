import { Component, OnInit, Input } from '@angular/core';
import { Grocery } from 'src/app/models/grocery';

@Component({
  selector: 'app-grocery-item',
  templateUrl: './grocery-item.component.html',
  styleUrls: ['./grocery-item.component.scss'],
})
export class GroceryItemComponent implements OnInit {

  @Input() grocery: Grocery;
  
  open: boolean;

  constructor() { }

  ngOnInit() {
    if (!this.grocery.qty) {
      this.grocery.qty = 0
    }
  }

  removeQty(){
    if (this.grocery.qty >= this.getIncrByOrderUnit()) {
      this.grocery.qty -= this.getIncrByOrderUnit();
    } else {
      this.grocery.qty = 0;
    }
  } 

  addQty() {
    this.grocery.qty += this.getIncrByOrderUnit();
  }

  getIncrByOrderUnit() {
    let incr = 1;
    switch (this.grocery.orderUnit) {
      case "PZ": {
        incr = 1;
        break;
      }
      case "KG": {
        incr = 0.5;
        break;
      }
      case "GR": {
        incr = 100;
        break;
      }
    }
    return incr;
  }

}
