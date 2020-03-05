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

  ngOnInit() {}

  removeQty(){
    this.grocery.qty -= 1;
  } 

  addQty() {
    this.grocery.qty += 1;
  }

}
