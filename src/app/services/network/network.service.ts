import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

import { Subscription, Subject } from 'rxjs';
import { Network } from '@ionic-native/network/ngx';

import { ToastService } from '../toast/toast.service';
import { TranslateProvider } from '../translate/translate.service';

@Injectable({
  providedIn: 'root'
})

export class NetworkService {
  public onlineSubscription: Subscription;
  public offlineSubscription: Subscription;
  public connected: boolean;
  public platformOS: string;
  public subject: Subject<boolean> = new Subject<boolean>();

  constructor(
    private platform: Platform,
    private network: Network,
    private toast: ToastService,
    private translate: TranslateProvider
  ) {
    // Subscribe to network changes.
    this.platform.ready().then(() => {
      this.subject = new Subject<boolean>();
      const self = this;
      setTimeout(() => {
        self.onlineSubscription = self.network.onConnect().subscribe(() => {
          self.connected = true;
          // self.toast.hide();
          self.subject.next(true);
        });
        self.offlineSubscription = self.network.onDisconnect().subscribe(() => {
          self.connected = false;
          self.toast.showToast(self.translate.get('network.offline'));
          self.subject.next(false);
        });
      }, 1000);
      if (this.network.type === 'none') {
        this.connected = false;
      } else {
        this.connected = true;
      }
    }).catch(() => { });

  }

  // Check if network is online or offline.
  public online(): boolean {
    return this.connected;
  }

  public isPlatform(n): boolean {
    return this.platform.is(n);
  }

  public platforms(): string[] {
    return this.platform.platforms();
  }

}
