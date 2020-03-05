import { Component, OnInit } from '@angular/core';
import { Router, Event, NavigationEnd } from '@angular/router';

import { Platform, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';


import { Storage } from '@ionic/storage';
import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';

import { TranslateProvider, AuthService } from './services';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../environments/environment';

import { Pages } from './interfaces/pages';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {

  public appPages: Observable<Array<any>>;
  public user: any;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private translate: TranslateProvider,
    private translateService: TranslateService,
    public storage: Storage,
    public auth: AuthService,
    public navCtrl: NavController,
    private router: Router
  ) {

    router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        if (this.auth.getUserData() === undefined) {
          this.auth.getUser().then(user => {});
        }
      }
    });

    this.initializeApp();
  }

  ngOnInit() {
    this.appPages = timer(100).pipe(map(res => [
      { title: 'Home', url: '/home', icon: 'home', direct: 'root' },
      { title: 'User List', url: '/user-list', direct: 'forward', icon: 'people' },
      { title: 'Geo Firestore', url: '/geofire', direct: 'forward', icon: 'map' },
      { title: 'CRUD List', url: '/crud', direct: 'forward', icon: 'list' }
    ]));
  }

  initializeApp() {

    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      setTimeout(() => {
        this.splashScreen.hide();
      }, 1000);

      // Set language of the app.
      this.translateService.setDefaultLang(environment.language);
      this.translateService.use(environment.language);
      this.translateService.getTranslation(environment.language).subscribe(translations => {
        this.translate.setTranslations(translations);
      });
    }).catch(() => {
      // Set language of the app.
      this.translateService.setDefaultLang(environment.language);
      this.translateService.use(environment.language);
      this.translateService.getTranslation(environment.language).subscribe(translations => {
        this.translate.setTranslations(translations);
      });
    });
  }

  goToEditProgile() {
    this.navCtrl.navigateForward('/edit-profile');
  }

  logout() {
    this.auth.logout().then(() => {
      this.storage.remove('uid');
      this.navCtrl.navigateRoot('/login');
    });
  }

}
