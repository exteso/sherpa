import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.scss'],
})
export class LoginModalComponent implements OnInit {

  loginConfirmed = false;

  username: string;
  password: string;
  orderWeek: string;
  orderNamePattern: string = 'settimana_WW_r2';
  orderName: string;

  constructor(private modalController: ModalController) { }

  ngOnInit() {
    if (this.orderWeek) {
      this.orderName = this.orderNamePattern.replace('WW', this.orderWeek);
    }
  }

  confirmLoginAndData() {
    this.modalController.dismiss({username: this.username, password: this.password, orderName: this.orderName});
  }

}
