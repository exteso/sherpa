import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, MenuController } from '@ionic/angular';

import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.page.html',
  styleUrls: ['./loader.page.scss'],
})
export class LoaderPage implements OnInit {

  constructor(
    public navCtrl: NavController,
    public menuCtrl: MenuController,
    public storage: Storage,
    public loadingController: LoadingController
  ) { }

  ionViewWillEnter() {
    this.menuCtrl.enable(false);
  }

  async ngOnInit() {
    const loading = await this.loadingController.create({
      message: 'Loading App...',
      duration: 1000
    });

    await loading.present();

    this.storage.get('introShown').then((introShown: boolean) => {
      loading.onWillDismiss().then(() => {
        if (introShown) {
          this.navCtrl.navigateRoot('home');
        } else {
          this.navCtrl.navigateRoot('walkthrough');
        }
      });
    }).catch((e) => {});
  }

}
