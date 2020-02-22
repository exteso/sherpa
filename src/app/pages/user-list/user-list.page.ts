import { Component, ViewChild, OnInit, OnDestroy  } from '@angular/core';
import { AlertController, ModalController, IonVirtualScroll } from '@ionic/angular';
import {
  AuthService,
  FirestoreService,
  NetworkService,
  TranslateProvider,
  LoadingService,
  ToastService,
  NotificationService
} from '../../services';

import { User } from '../../models';
import { Subscription } from 'rxjs';
import { Storage } from '@ionic/storage';

import { ShowUserPage } from '../modal/show-user/show-user.page';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.page.html',
  styleUrls: ['./user-list.page.scss']
})

export class UserListPage implements OnInit, OnDestroy  {
  searchUser: string;
  users: User[];
  excludedIds: string[];
  userId: string;

  public loadImg = 'assets/img/profile.png';
  private subscription: Subscription;

  @ViewChild(IonVirtualScroll, { static: true }) virtualScroll: IonVirtualScroll;

  constructor(
    public translate: TranslateProvider,
    public modalCtrl: ModalController,
    public storage: Storage,
    private alertCtrl: AlertController,
    private firestore: FirestoreService,
    private network: NetworkService,
    private loading: LoadingService,
    private toast: ToastService,
    private notification: NotificationService
  ) {
    this.excludedIds = [];
  }

  ngOnInit() {
    this.loading.showLoading('Loading users...');

    this.storage.get('uid').then(uid => {
      this.userId = uid;
    });


    // Get the list of users on Firestore.
    this.subscription = this.firestore.getUsers().valueChanges().subscribe((users: User[]) => {
      this.loading.dismiss();

      // Add logged in user to excludedIds so they won't show up on the list of users.
      this.excludedIds = [this.userId];
      // Set pushToken if the user has enabled push notifications.
      // if (this.auth.getUserData().notifications) {
      //   this.notification.init();
      // }

      this.users = users;
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  async showUser(uid: string) {
    return await this.firestore.getUserByUID(uid).then(async(usr: User) => {
      // console.log('Await:', usr);
      const modal = await this.modalCtrl.create({
        component: ShowUserPage,
        componentProps: { user: usr }
      });

      return await modal.present();
    });
  }

  header(record, recordIndex, records) {
    if (recordIndex % 20 === 0) {
      return 'Header ' + recordIndex;
    }
    return null;
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

}
