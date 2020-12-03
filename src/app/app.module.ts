import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { Camera } from '@ionic-native/camera/ngx';
import { Device } from '@ionic-native/device/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { Facebook } from '@ionic-native/facebook/ngx';
import { FCM } from '@ionic-native/fcm/ngx';
import { File } from '@ionic-native/file/ngx';
import { Network } from '@ionic-native/network/ngx';

import { AgmCoreModule } from '@agm/core';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { IonicStorageModule } from '@ionic/storage';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule, SETTINGS } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireMessagingModule } from '@angular/fire/messaging';
import { AngularFireFunctionsModule, ORIGIN } from '@angular/fire/functions';


import { ShowUserPageModule } from './pages/modal/show-user/show-user.module';
import { IonImgLazyLoadModule } from './directives/ionimg-lazy-load.module';

import { environment } from '../environments/environment';
import { ServiceWorkerModule } from '@angular/service-worker';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { SelectUsersPageModule } from './pages/modal/select-users/select-users.module';
import { AddProductsPageModule } from './pages/modal/add-products/add-products.module';
import { registerLocaleData, DecimalPipe } from '@angular/common';
import localeIt from '@angular/common/locales/it';

// the second parameter 'fr-FR' is optional
registerLocaleData(localeIt);

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule.enablePersistence(),
    AngularFireAuthModule,
    AngularFireStorageModule,
    AngularFireMessagingModule,
    AngularFireFunctionsModule,
    BrowserModule,
    BrowserAnimationsModule,
    IonicModule.forRoot(environment.config),
    AppRoutingModule,
    HttpClientModule,
    SelectUsersPageModule,
    AddProductsPageModule,
    ShowUserPageModule,
    IonImgLazyLoadModule,
    IonicStorageModule.forRoot({
      name: '__fireionic2',
      driverOrder: ['indexeddb', 'sqlite', 'websql']
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    AgmCoreModule.forRoot({
      apiKey: environment.googleMapsKey
    }),
    ServiceWorkerModule.register('combined-worker.js', { enabled: environment.production }),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [
    DecimalPipe,
    Camera,
    Device,
    Geolocation,
    StatusBar,
    SplashScreen,
    Keyboard,
    Facebook,
    GooglePlus,
    File,
    FCM,
    Network,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: SETTINGS, useValue: {} },
    { provide: ORIGIN, useValue: 'https://sherpa.firebaseapp.com' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
