import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';

import {
  FirestoreService,
  AuthService,
  NetworkService
} from '../../services';

import { GeoMap, User } from '../../models';
import { Subscription } from 'rxjs';

import { Geolocation } from '@ionic-native/geolocation/ngx';

import { ShowUserPage } from '../modal/show-user/show-user.page';

@Component({
  selector: 'app-geofire',
  templateUrl: './geofire.page.html',
  styleUrls: ['./geofire.page.scss'],
})

export class GeofirePage implements OnInit, OnDestroy {
  zoom = 15;
  lat: number;
  lng: number;
  markers: any;
  u: string;
  t = Math.floor(Date.now() / 1000);
  subscription: Subscription;

  markerIcon = {
    users: '/assets/icon/markers/user-location.png',
    you: '/assets/icon/markers/your-location.png',
  };

  constructor(
    public modalCtrl: ModalController,
    public network: NetworkService,
    public auth: AuthService,
    private firestore: FirestoreService,
    private geolocation: Geolocation
  ) {
    this.auth.getUser().then(user => {
      this.u = user.uid;
      console.log('geofire user: ', this.u);
      // this.firestore.getUserByUID('0hdSvDezJeZUxWa4bfzdYybnNPw2').then((usr: User) => {
      //   console.log(usr);
      // });
    });
    this.getUserLocation();
  }

  ngOnInit() {
    // Get all Locations registered on Firestore.
    this.subscription = this.firestore.getAllLocations().valueChanges().subscribe((markers: GeoMap[]) => {
      this.markers = markers;
      console.log(this.markers);
      // console.log(this.showUser('sDMgA2kUY3PxFsqsgjxeO3lEKmk2'));
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  async showUser(uid: string) {
    return await this.firestore.getUserByUID(uid).then(async(usr: User) => {
      // console.log('Await:', usr);
      const modal = await this.modalCtrl.create({
        component: ShowUserPage,
        componentProps: { user: usr }
      });

      return await modal.present();
    });
  }

  public showDate(t: number) {
    const theDate = new Date(t * 1000);
    return theDate.toLocaleString();
  }

  private getUserLocation() {
    /// locate the user
    if (this.network.isPlatform('desktop')) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
          this.lat = position.coords.latitude;
          this.lng = position.coords.longitude;
          // console.log(this.lat);
          // console.log(this.lng);
          this.firestore.setLocation([this.lat, this.lng], this.u, this.t);
        });
      }
    } else {
      this.geolocation.getCurrentPosition().then((res) => {
        // console.log(res);
        this.lat = res.coords.latitude;
        this.lng = res.coords.longitude;
        this.firestore.setLocation([this.lat, this.lng], this.u, this.t);
      }).catch((error) => {
        console.log('Error getting location', error);
      });
    }
  }

}
