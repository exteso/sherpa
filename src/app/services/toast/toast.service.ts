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
      position: 'bottom',
      showCloseButton: true,
      duration: environment.toast.duration,
      closeButtonText: 'Done'
    });

    return toast.present();
  }

}
