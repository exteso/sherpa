import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Grocery } from 'src/app/models/grocery';
import { DecimalPipe } from '@angular/common';
import { Unit } from 'src/app/models/product';

@Component({
  selector: 'app-grocery-item',
  templateUrl: './grocery-item.component.html',
  styleUrls: ['./grocery-item.component.scss'],
})
export class GroceryItemComponent implements OnInit {

  @Input() grocery: Grocery;
  @Input() readOnly: boolean = true;
  @Output() updateQty = new EventEmitter<number>();

  open: boolean;

  constructor(private decimalPipe: DecimalPipe) { }

  ngOnInit() {
    if (!this.grocery.qty) {
      this.grocery.qty = 0
    }
  }

  resetQty(){
    this.grocery.qty = 0;
    this.updateQty.emit(this.grocery.qty);
  }
  
  removeQty(){
    if (this.grocery.qty >= this.getIncrByOrderUnit()) {
      this.grocery.qty -= this.getIncrByOrderUnit();
    } else {
      this.grocery.qty = 0;
    }
    this.updateQty.emit(this.grocery.qty);
  } 

  addQty() {
    this.grocery.qty += this.getIncrByOrderUnit();
    this.updateQty.emit(this.grocery.qty);
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

  getPrice(){
    if (this.grocery.qty == 0) {
      return "";
    }

    if (this.grocery.orderUnit == Unit.PZ && (this.grocery.priceUnit == Unit.KG || this.grocery.priceUnit == Unit.GR)) {
      return "da pesare";
    }
    let price = this.grocery.qty * this.grocery.price;
    let priceText = this.decimalPipe.transform(price, '1.2-2')
    return priceText + " CHF"
  }

  getRealPrice(){
    if (!this.grocery.realQty || this.grocery.realQty <= 0.1) {
      return "";
    }

    let price = this.grocery.realQty * this.grocery.price;
    let priceText = this.decimalPipe.transform(price, '1.2-2')
    return priceText + " CHF"
  }

  hasBeenCollected(){
    if (!this.grocery.realQty || this.grocery.realQty <= 0.1) {
      return false;
    }
    return true;
  }

  areOrderedAndCollectedEquals(){
    if (this.grocery.qty === this.grocery.realQty)
      return true;
    return false;
  }
}
