import { Component, Input, OnInit } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';

import {
  NetworkService,
  TranslateProvider,
  LoadingService,
  ToastService,
  NotificationService
} from '../../../services';

import { User } from '../../../models';

@Component({
  selector: 'app-show-user',
  templateUrl: './show-user.page.html',
  styleUrls: ['./show-user.page.scss'],
})
export class ShowUserPage implements OnInit {

  @Input() user: any;
  public getUser;

  constructor(
    public translate: TranslateProvider,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private network: NetworkService,
    private loading: LoadingService,
    private toast: ToastService,
    private notification: NotificationService
  ) {
    // console.log(navParams.data.user);
  }

  ngOnInit() {

  }

  // Popup to send a push notification to a user.
  async sendPushNotification(user: User) {
    if (this.network.online()) {
      // Check if user is accepting push notifications or not.
      if (user.notifications && user.pushToken) {
        // Show a popup for the user to enter a message to be sent as push notification.
        const alert = await this.alertCtrl.create({
          header: user.firstName + ' ' + user.lastName,
          subHeader: this.translate.get('home.send.text'),
          inputs: [
            {
              name: 'message',
              placeholder: this.translate.get('home.send.message'),
              type: 'text'
            }
          ],
          buttons: [
            {
              text: this.translate.get('auth.menu.logout.button.cancel'),
              role: 'cancel',
              handler: data => { }
            },
            {
              text: this.translate.get('home.send.button.send'),
              handler: data => {
                // Send push notification to user.
                if (data.message) {
                  if (user.pushToken) {
                    this.loading.showLoading('Loading...');
                    this.notification.sendPush(user.pushToken, data.message).then(response => {
                      this.loading.dismiss();
                      this.toast.showToast(this.translate.get('notification.sent'));
                    }).catch(err => {
                      this.loading.dismiss();
                      this.toast.showToast(this.translate.get('notification.send.error') + JSON.stringify(err));
                    });
                  }
                } else {
                  return false;
                }
              }
            }
          ]
        });

        await alert.present();
      } else {
        // User has disabled push notifications.
        // console.log('errrooo');
        this.toast.showToast(this.translate.get('home.send.disabled'));
      }
    }
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

}
