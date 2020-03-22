import { Component } from '@angular/core';
import { NavController, MenuController } from '@ionic/angular';

import { AuthService, PreloaderService, OrderService } from '../../services';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})

export class HomePage {

  items = [
    {
      title: 'home.card.item2.title',
      desc: 'home.card.item2.desc',
      url: '/manage-order/${orderWeek}'
    }
    /*,
    {
      title: 'home.card.item3.title',
      desc: 'home.card.item3.desc',
      url: '/order-to-collect'
    }*/
  ];

  constructor(
    public auth: AuthService,
    public menuCtrl: MenuController,
    public navCtrl: NavController,
    private preload: PreloaderService,
    private orderService: OrderService
  ) {
    // this.menuCtrl.enable(true);
  }

  async ionViewDidEnter() {
    await this.preload.preloadRoute('geofire');
    await this.preload.preloadRoute('edit-profile');
    await this.preload.preloadRoute('user-list');
    this.updateUrlsWithOrderWeek();
  }

  updateUrlsWithOrderWeek() {
    const currentWeek = this.orderService.getCurrentWeek();
    const orderWeek = OrderService.weekAfter(currentWeek);
    this.items.forEach(i => {
      if (i.url && i.url.indexOf('${orderWeek}') >= 0) {
        i.url = i.url.replace('${orderWeek}', orderWeek);
      }
    })
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true);
  }

  goToEditProgile() {
    this.navCtrl.navigateForward('/edit-profile');
  }

}
