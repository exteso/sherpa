import { Component, OnInit } from '@angular/core';
import { Grocery } from 'src/app/models/grocery';
import { ModalController } from '@ionic/angular';

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

  constructor(public modalCtrl: ModalController) { 
    this.notTaken = false;
  }

  ngOnInit() {
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
}
