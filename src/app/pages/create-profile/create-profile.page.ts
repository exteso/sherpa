import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, MenuController, AlertController, ActionSheetController } from '@ionic/angular';

import { Keyboard } from '@ionic-native/keyboard/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { User } from '../../models';
// import * as firebase from 'firebase';

import {
  TranslateProvider,
  AuthService,
  LoadingService,
  StorageService,
  ToastService,
  NetworkService,
  NotificationService,
  FirestoreService
} from '../../services';

@Component({
  selector: 'app-create-profile',
  templateUrl: './create-profile.page.html',
  styleUrls: ['./create-profile.page.scss'],
})
export class CreateProfilePage implements OnInit {
  public profileForm: FormGroup;
  public uniqueUsername: boolean;
  photo = 'assets/img/profile.png';
  userId: string;
  hasError: boolean;

  constructor(
    public translate: TranslateProvider,
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public loading: LoadingService,
    public toast: ToastService,
    public formBuilder: FormBuilder,
    public menuCtrl: MenuController,
    public asCtrl: ActionSheetController,
    public network: NetworkService,
    private keyboard: Keyboard,
    private camera: Camera,
    private storage: StorageService,
    private firestore: FirestoreService,
    private notification: NotificationService,
    private auth: AuthService
  ) { }

  ionViewWillEnter() {
    // console.log(this.network.platforms());
    this.menuCtrl.enable(false);

    // Fill up the form with relevant user info based on the authenticated user on Firebase.
    this.auth.getUser().then((user: firebase.User) => {
      this.userId = user.uid;
      if (user.photoURL) {
        this.photo = user.photoURL;
      }
      let firstName = '';
      let lastName = '';
      if (user.displayName) {
        firstName = user.displayName.substr(0, user.displayName.indexOf(' '));
        lastName = user.displayName.substr(user.displayName.indexOf(' ') + 1, user.displayName.length);
      }
      this.profileForm.setValue({
        firstName: firstName,
        lastName: lastName,
        username: '',
        email: user.email
      });
    }).catch(() => { });    
  }

  ngOnInit() {
    this.profileForm = this.formBuilder.group({
      username: ['', Validators.compose([
        Validators.required,
        Validators.pattern('^[0-z.]{4,20}$')
      ])],
      firstName: ['', Validators.compose([
        Validators.required
      ])],
      lastName: ['', Validators.compose([
        Validators.required
      ])],
      email: ['', Validators.compose([
        Validators.required,
        Validators.email
      ])]
    });
  }

  ionViewWillLeave() {
    // Check if userData exists on Firestore. If no userData exists yet, delete the photo uploaded to save Firebase storage space.
    this.firestore.exists('users/' + this.userId).then(exists => {
      if (!exists) {
        this.storage.delete(this.userId, this.photo);
      }
    }).catch(() => { });
  }

  // convenience getter for easy access to form fields
  get f() { return this.profileForm.controls; }

  keyDownFunction(event) {
    // User pressed return on keypad, proceed with creating profile.
    if (event.keyCode === 13) {
      this.keyboard.hide();
      this.createProfile(this.profileForm);
    }
  }

  onInput(username: string) {
    // Check if the username entered on the form is still available.
    this.uniqueUsername = true;
    if (this.profileForm.controls.username.valid && !this.profileForm.controls.username.hasError('required')) {
      this.firestore.getUserByUsername('@' + username.toLowerCase()).then((user: User) => {
        if (user) {
          this.uniqueUsername = false;
        }
      }).catch(() => { });
    }
  }

  public createProfile(profileForm: FormGroup): void {
    // Check if profileForm is valid and username is unique and proceed with creating the profile.
    if (!profileForm.valid || !this.uniqueUsername) {
      this.hasError = true;
    } else {
      if (this.uniqueUsername) {
        this.loading.showLoading('Creating profile...');
        // Create userData on Firestore.
        this.firestore.get('users/' + this.userId).then(ref => {
          // Formatting the first and last names to capitalized.
          const firstName = profileForm.value['firstName'].charAt(0).toUpperCase()
          + profileForm.value['firstName'].slice(1).toLowerCase();

          const lastName = profileForm.value['lastName'].charAt(0).toUpperCase()
          + profileForm.value['lastName'].slice(1).toLowerCase();

          const user = new User(
            this.userId,
            profileForm.value['email'].toLowerCase(),
            firstName,
            lastName,
            profileForm.value['groupId'],
            profileForm.value['familyId'],
            this.photo,
            '@' + profileForm.value['username'].toLowerCase(),
            '',
            true
          );

          ref.set(user.obj).then(() => {
            this.notification.init();
            this.loading.dismiss();
            this.navCtrl.navigateRoot('/home');
          }).catch((e) => {
            console.log('first e: ', e);
          });
        }).catch((e) => {
          console.log('second e: ', e);
        });
      }
    }
  }

  async setPhotoByWeb(event) {
    // Allow user to upload and set their profile photo using their camera or photo gallery.
    // if (this.network.online()) {
      this.storage.uploadByWeb(this.userId, event).then((url: string) => {
        // this.storage.delete(this.userId, this.photo);
        this.photo = url;
      }).catch(() => { });

      // this.storage.uploadByWeb(this.userId, event).then((url: string) => {
      //   if (this.auth.getUserData().photo !== this.photo) {
      //     this.storage.delete(this.userId, this.photo);
      //     this.photo = url;
      //   } else {
      //     this.photo = url;
      //   }
      // }).catch(() => { });

    // }
  }

  async setPhoto() {
    // Allow user to upload and set their profile photo using their camera or photo gallery.
    if (this.network.online()) {

      const actionSheet = await this.asCtrl.create({
        header: this.translate.get('auth.profile.photo.title'),
        buttons: [
          {
            text: this.translate.get('auth.profile.photo.take'),
            role: 'destructive',
            handler: () => {
              this.storage.upload(
                this.userId,
                this.camera.PictureSourceType.CAMERA).then((url: string) => {
                  this.storage.delete(this.userId, this.photo);
                  this.photo = url;
              }).catch(() => { });
            }
          },
          {
            text: this.translate.get('auth.profile.photo.gallery'),
            handler: () => {
              this.storage.upload(
                this.userId,
                this.camera.PictureSourceType.PHOTOLIBRARY).then((url: string) => {
                  this.storage.delete(this.userId, this.photo);
                  this.photo = url;
              }).catch(() => { });
            }
          },
          {
            text: this.translate.get('auth.profile.photo.cancel'),
            role: 'cancel',
            handler: () => { }
          }
        ]
      });

      await actionSheet.present();
    }
  }

}
