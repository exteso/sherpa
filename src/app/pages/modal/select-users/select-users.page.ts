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
} from '../../../services';

import { User } from '../../../models';
import { Subscription } from 'rxjs';
import { Storage } from '@ionic/storage';


@Component({
  selector: 'app-select-users',
  templateUrl: './select-users.page.html',
  styleUrls: ['./select-users.page.scss'],
})
export class SelectUsersPage implements OnInit, OnDestroy  {
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
  
    header(record, recordIndex, records) {
      if (recordIndex % 20 === 0) {
        return 'Header ' + recordIndex;
      }
      return null;
    }
  
    dismiss() {
      // using the injected ModalController this page
      // can "dismiss" itself and optionally pass back data
      this.modalCtrl.dismiss({
        'dismissed': true
      });
    }
  
  }
  
