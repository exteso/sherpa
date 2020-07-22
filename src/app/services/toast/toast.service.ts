import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class ToastService {

  constructor(
    public toastController: ToastController
  ) { }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      color: 'secondary',
      position: 'bottom',
      buttons: [
        {
          text: 'Done',
          role: 'cancel',
          handler: () => {
            console.log('Toast Done clicked');
          }
        }
      ],
      duration: environment.toast.duration,
    });

    return toast.present();
  }

}
