import { Component } from '@angular/core';
import { NavController, MenuController } from '@ionic/angular';

import { AuthService, PreloaderService } from '../../services';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})

export class HomePage {

  items = [
    {
      title: 'home.card.item1.title',
      desc: 'home.card.item1.desc'
    },
    {
      title: 'home.card.item2.title',
      desc: 'home.card.item2.desc'
    },
    {
      title: 'home.card.item3.title',
      desc: 'home.card.item3.desc'
    },
    {
      title: 'home.card.item4.title',
      desc: 'home.card.item4.desc'
    },
    {
      title: 'home.card.item5.title',
      desc: 'home.card.item5.desc'
    },
    {
      title: 'home.card.item6.title',
      desc: 'home.card.item6.desc'
    },
    {
      title: 'home.card.item7.title',
      desc: 'home.card.item7.desc'
    },
    {
      title: 'home.card.item8.title',
      desc: 'home.card.item8.desc'
    }
  ];

  constructor(
    public auth: AuthService,
    public menuCtrl: MenuController,
    public navCtrl: NavController,
    private preload: PreloaderService
  ) {
    // this.menuCtrl.enable(true);
  }

  async ionViewDidEnter() {
    await this.preload.preloadRoute('song-list');
    await this.preload.preloadRoute('event-list');
    await this.preload.preloadRoute('geofire');
    await this.preload.preloadRoute('edit-profile');
    await this.preload.preloadRoute('user-list');
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true);
  }

  goToEditProgile() {
    this.navCtrl.navigateForward('/edit-profile');
  }

}
