import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, MenuController, AlertController, ActionSheetController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { Keyboard } from '@ionic-native/keyboard/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { User } from '../../models';

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
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
})
export class EditProfilePage implements OnInit, OnDestroy {
  public eprofileForm: FormGroup;
  public uniqueUsername: boolean;
  public hasPushToken: boolean;
  public subscription: Subscription;
  public user;
  photo = 'assets/img/profile.png';
  userId: string;
  hasError: boolean;
  hasPassword: boolean;

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

  ngOnInit() {
    this.eprofileForm = this.formBuilder.group({
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
      groupId: ['', Validators.compose([
        Validators.required
      ])],
      familyId: ['', Validators.compose([
        Validators.required
      ])],
      email: ['', Validators.compose([
        Validators.required,
        Validators.email
      ])]
    });

    // Set placeholder photo, while the user data is loading.
    // this.user = new User('', '', '', '', this.photo, '', '', true);

    this.auth.getUser().then((user: firebase.User) => {
      // Check if user is logged in using email and password and show the change password button.
      this.userId = user.uid;

      if (user.providerData[0].providerId === 'password') {
        this.hasPassword = true;
      }
      // Get userData from Firestore and update the form accordingly.
      this.firestore.get('users/' + this.userId).then(ref => {
        this.subscription = ref.valueChanges().subscribe((user: User) => {
          if (user.photo) {
            this.photo = user.photo;
          }

          this.user = user;
          this.hasPushToken = user.notifications;
          this.eprofileForm.setValue({
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username.substring(1, user.username.length),
            email: user.email,
            familyId: user.familyId ? user.familyId : 'DefaultFamily',
            groupId: user.groupId ? user.groupId : 'DefaultGroup'
          });
          this.uniqueUsername = true;
        });

      }).catch(() => { });
    }).catch(() => { });

  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  ionViewWillLeave() {
    // Check if userData exists on Firestore. If no userData exists yet, delete the photo uploaded to save Firebase storage space.
    this.firestore.exists('users/' + this.userId).then(exists => {
      if (!exists) {
        this.storage.delete(this.userId, this.photo);
      }
    }).catch(() => { });
  }

  onInput(username: string) {
    // Check if the username entered on the form is still available.
    this.uniqueUsername = true;
    if (this.eprofileForm.controls.username.valid && !this.eprofileForm.controls.username.hasError('required')) {
      this.firestore.getUserByUsername('@' + username.toLowerCase()).then((user: User) => {
        if (user && (this.userId !== user.userId)) {
          this.uniqueUsername = false;
        }
      }).catch(() => { });
    }
  }


  keyDownFunction(event) {
    // User pressed return on keypad, proceed with updating profile.
    if (event.keyCode === 13) {
      this.keyboard.hide();
      this.updateProfile();
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.eprofileForm.controls; }


  async setPhotoByWeb(event) {
    // Allow user to upload and set their profile photo using their camera or photo gallery.
    // if (this.network.online()) {
      // this.storage.uploadByWeb(this.userId, event).then((url: string) => {
      //   // console.log(url);
      //     // this.storage.delete(this.userId, this.photo);
      //     this.photo = url;
      // }).catch(() => { });
      console.log('userID setPhoto: ', this.userId);
      this.storage.uploadByWeb(this.userId, event).then((url: string) => {
        console.log('upload inside promisse: ', url);
        console.log('this.auth.getUserData(url).photo: ', this.auth.getUserData().photo);
        if (this.auth.getUserData().photo !== this.photo) {
          console.log('Diferente!!');
          this.storage.delete(this.userId, this.photo);
          this.photo = url;
        } else {
          this.photo = url;
        }
      }).catch(() => { });
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

  public updateProfile(): void {
    if (!this.eprofileForm.valid || !this.uniqueUsername) {
      this.hasError = true;
    } else {
      if (this.uniqueUsername) {
        this.loading.showLoading('Updating profile...');

        // Delete previous user photo to preserve Firebase storage space, since it's going to be updated to this.user.photo.
        if (this.auth.getUserData().photo !== this.user.photo) {
          this.storage.delete(this.auth.getUserData().userId, this.auth.getUserData().photo);
        }

        console.log(this.user.photo);

        // Update userData on Firestore.
        this.firestore.get('users/' + this.userId).then(ref => {
          // Formatting the first and last names to capitalized.
          const firstName = this.eprofileForm.value['firstName'].charAt(0).toUpperCase() +
          this.eprofileForm.value['firstName'].slice(1).toLowerCase();
          const lastName = this.eprofileForm.value['lastName'].charAt(0).toUpperCase() +
          this.eprofileForm.value['lastName'].slice(1).toLowerCase();
          // let pushToken: string;

          const user = new User(
            this.userId,
            this.eprofileForm.value['email'].toLowerCase(),
            firstName,
            lastName,
            this.eprofileForm.value['groupId'],
            this.eprofileForm.value['familyId'],
            this.photo,
            '@' + this.eprofileForm.value['username'].toLowerCase(),
            '',
            this.hasPushToken
          );

          ref.update({
            userId: user.userId,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            groupId: user.groupId,
            familyId: user.familyId,
            photo: this.photo,
            username: user.username,
            notifications: this.hasPushToken
          }).then(() => {
            // Initialize pushToken to receive push notifications if the user enabled them, otherwise clear pushToken.
            if (this.hasPushToken) {
              this.notification.init();
            } else {
              this.notification.destroy();
            }
            this.loading.dismiss();
            this.toast.showToast(this.translate.get('auth.profile.updated'));
          }).catch(() => { });
        }).catch(() => { });

      }
    }
  }

}
