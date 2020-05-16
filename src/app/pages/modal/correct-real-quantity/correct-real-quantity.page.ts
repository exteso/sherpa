import { Component, OnInit } from '@angular/core';
import { Grocery } from 'src/app/models/grocery';
import { ModalController } from '@ionic/angular';
import { DecimalPipe } from '@angular/common';

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
    this.notTaken = false;
  }

  ngOnInit() {
    this.realQty = this.item.realQty;
    this.comment = this.item.comment;
    this.notTaken = this.item.notTaken;
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
    return priceText + " CHF"
  }
}
