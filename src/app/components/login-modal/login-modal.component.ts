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
  orderName: string = 'settimana_50_r2';

  constructor(private modalController: ModalController) { }

  ngOnInit() {
  }

  confirmLoginAndData() {
    this.modalController.dismiss({username: this.username, password: this.password, orderName: this.orderName});
  }

}
