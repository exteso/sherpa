import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { FCM } from '@ionic-native/fcm/ngx';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Headers, RequestOptions } from '@angular/http';

import { AuthService } from '../auth/auth.service';
import { FirestoreService } from '../firestore/firestore.service';
import { ToastService } from '../toast/toast.service';
import { TranslateProvider } from '../translate/translate.service';

import { AngularFireMessaging } from '@angular/fire/messaging';
import { mergeMapTo } from 'rxjs/operators';

// import { User } from '../../models';
import { environment } from '../../../environments/environment';



@Injectable({
  providedIn: 'root'
})

export class NotificationService {

  constructor(
    private platform: Platform,
    private fcm: FCM,
    private afm: AngularFireMessaging,
    private auth: AuthService,
    private firestore: FirestoreService,
    private toast: ToastService,
    private translate: TranslateProvider,
    private http: HttpClient
  ) { }

    // Called after user is logged in to set the pushToken on Firestore.
  public init(): void {
    if (this.platform.is('cordova')) {
      this.fcm.getToken().then((token: string) => {
        this.firestore.setPushToken(this.auth.getUserData().userId, token);

        // tslint:disable-next-line:no-shadowed-variable
        this.fcm.onTokenRefresh().subscribe((token: string) => {
          this.firestore.setPushToken(this.auth.getUserData().userId, token);
        });
        // Listener when push notification is tapped.
        this.fcm.onNotification().subscribe(data => {
          if (data.wasTapped) {
            // Notification was received when app is minimized and tapped by the user.
            this.toast.showToast(
              this.translate.get('notification.opened') + data.message + this.translate.get('notification.by') + data.sender + '.'
            );
          } else {
            // Notification was received while the app is opened or in foreground. In case the user needs to be notified.
            this.toast.showToast(data.sender + this.translate.get('notification.sent') + data.message);
          }
        });
      }).catch(err => {
        console.log('Error Saving Token: ', JSON.stringify(err));
      });
    } else {
      this.afm.requestToken.subscribe(
        (token) => {
          this.firestore.setPushToken(this.auth.getUserData().userId, token);
          // console.log('Permission granted! Save to the server!', token);

          this.afm.messages.subscribe((message: any) => {

            if (message.data) {
              // Notification was received when app is minimized and tapped by the user.
              this.toast.showToast(
                this.translate.get('notification.opened') + message.data.message + this.translate.get('notification.by') + message.data.sender + '.'
              );
            } else {
              // Notification was received while the app is opened or in foreground. In case the user needs to be notified.
              this.toast.showToast(message.data.sender + this.translate.get('notification.sent') + message.data.message);
            }
          });
        },
        (error) => { console.error(error); }
      );
      console.error('Cordova not found. Please deploy on actual device or simulator.');
    }
  }

  // Called when the user logged out to clear the pushToken on Firestore.
  public destroy(): Promise<any> {
    return new Promise((resolve, reject) => {
      // if (this.platform.is('cordova')) {
        this.firestore.removePushToken(this.auth.getUserData().userId);
        resolve();
        // } else {
      //   reject();
      // }
    });
  }

  // Send a push notification given the pushToken, and the message.
  // Change the title, body, and data according to your requirements.
  public sendPush(pushToken: string, message: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const postParams = {
        'notification': {
          'title': 'fireIonic',
          'body': this.auth.getUserData().firstName + ' ' + this.auth.getUserData().lastName + ': ' + message,
          'sound': 'default',
          'click_action': 'FCM_PLUGIN_ACTIVITY',
          'icon': 'fcm_push_icon'
        },
        'data': {
          'sender': this.auth.getUserData().firstName + ' ' + this.auth.getUserData().lastName,
          'message': message
        },
        'to': pushToken,
        'priority': 'high',
        'restricted_package_name': ''
      };

      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'key=' + environment.gcmKey
      });

      const options = { headers: headers };

      this.http.post('https://fcm.googleapis.com/fcm/send', postParams, options).subscribe(response => {
        resolve(response);
      }, err => {
        reject(err);
      });
    });
  }

}
