import { Component, OnInit } from '@angular/core';
import { Grocery } from 'src/app/models/grocery';
import { ModalController } from '@ionic/angular';
import { DecimalPipe } from '@angular/common';
import { runInThisContext } from 'vm';

@Component({
  selector: 'app-correct-real-quantity',
  templateUrl: './correct-real-quantity.page.html',
  styleUrls: ['./correct-real-quantity.page.scss'],
})
export class CorrectRealQuantityPage implements OnInit {


  orderWeek: string; 
  groupId: string; 
  familyId:  string; 
  item: Grocery;
  realQty: number;
  comment: string;
  notTaken: boolean;

  constructor(public modalCtrl: ModalController, private decimalPipe: DecimalPipe) { 
    
  }

  ngOnInit() {
    this.realQty = this.item.realQty;
    this.comment = this.item.comment;
    if (this.item.notTaken) {
      this.notTaken = this.item.notTaken;
    } else {
      this.notTaken = false;
    }
  }

  submit(){
    let realQty= this.realQty;
    if (this.notTaken){
      realQty = 0.01;
    }
    let response = {notTaken: this.notTaken,
                    realQty: realQty };
    if (this.comment) {
      response['comment'] = this.comment;
    }
    this.modalCtrl.dismiss(response);
  }

  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }

  getRealPrice(){
    if (this.realQty == 0) {
      return "";
    }

    let price = this.realQty * this.item.price;
    let priceText = this.decimalPipe.transform(price, '1.2-2')
    return priceText;
  }

  onChangeRealPrice(realPrice: number){
    let calcQty = realPrice / this.item.price;
    this.realQty = this.formatNumber(calcQty, 4);
  }

  onChangeRealQty(qty: number|string){
    let realQty = 0;
    if (typeof qty === "string"){
      if (qty.indexOf('/') > 0){
        let nums = qty.split('/');
        realQty = parseFloat(nums[0]) / parseFloat(nums[1]);
      } else {
        realQty = parseFloat(qty);
      }
    } else {
      realQty = qty;
    }

    if (realQty > 0){
      this.realQty = parseFloat(this.formatNumber(realQty, 4));
    }
  }

  /**
   * Custom JavaScript function that rounds a number w/
   * decimal places.
   *
   * @param val - The value that you want to format with decimal places.
   * @param decimals - The number of decimal places that should be used.
   * @returns {float}
   */
  formatNumber(val, decimals){
    //Parse the value as a float value
    val = parseFloat(val);
    //Format the value w/ the specified number
    //of decimal places and return it.
    return val.toFixed(decimals);
  }

  validateNumber(event) {
    var key = window.event ? event.keyCode : event.which;

    if (event.keyCode >= 48 && event.keyCode <= 57 || event.keyCode == 46 || event.keyCode == 47) {
      return true;
    } else {
      return false;
    }
  }
}
