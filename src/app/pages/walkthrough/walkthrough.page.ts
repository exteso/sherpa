import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, IonSlides, MenuController } from '@ionic/angular';

import { Storage } from '@ionic/storage';

import { TranslateProvider } from '../../services';
import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-walkthrough',
  templateUrl: './walkthrough.page.html',
  styleUrls: ['./walkthrough.page.scss'],
})

export class WalkthroughPage implements OnInit {
  @ViewChild(IonSlides, { static: true }) slides: IonSlides;
  showSkip = true;
  slideOpts = {
    effect: 'flip',
    speed: 1000
  };
  dir: String = 'ltr';

  slideList: Observable<Array<any>>;

  constructor(
    public navCtrl: NavController,
    public menuCtrl: MenuController,
    public translate: TranslateProvider,
    public storage: Storage,
    public router: Router
  ) {
  }

  ionViewWillEnter() {
    this.storage.get('introShown').then((introShown: boolean) => {
      if (introShown === null) {
        this.storage.set('introShown', true);
      }
    }).catch((e) => {});

    this.menuCtrl.enable(false);
  }

  ngOnInit() {
    this.slideList = timer(100).pipe(map(res => [{
      title: '<span class="text-tertiary">CON</span><span class="text-secondary">PRO</span><strong><span class="text-primary">Bio</span></strong> App',
      description: this.translate.get('intro.slide1.text'),
      image: 'assets/icon/icon256.png',
    },
    {
      title: '<span class="text-tertiary">CON</span><span class="text-secondary">PRO</span><strong><span class="text-primary">Bio</span></strong> App',
      description: this.translate.get('intro.slide2.text'),
      image: 'assets/icon/icon256.png',
    },
    {
      title: '<span class="text-tertiary">CON</span><span class="text-secondary">PRO</span><strong><span class="text-primary">Bio</span></strong> App',
      description: this.translate.get('intro.slide3.text'),
      image: 'assets/icon/icon256.png',
    }]));
  }

  onSlideNext() {
    this.slides.slideNext(1000, false);
  }

  onSlidePrev() {
    this.slides.slidePrev(300);
  }

  // onLastSlide() {
  // 	this.slides.slideTo(3, 300)
  // }

  openHomeLocation() {
    this.navCtrl.navigateRoot('home');
    // this.router.navigateByUrl('/tabs/(home:home)');
  }

  openLoginPage() {
    this.navCtrl.navigateRoot('login');
  }

}
