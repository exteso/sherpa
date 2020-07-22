import { Facebook } from '@ionic-native/facebook';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, MenuController, AlertController } from '@ionic/angular';

import { Keyboard } from '@ionic-native/keyboard/ngx';

import { Storage } from '@ionic/storage';

import { User } from '../../models';

import {
  TranslateProvider,
  AuthService,
  LoadingService,
  ToastService,
  NetworkService,
  NotificationService,
  FirestoreService,
  PreloaderService
} from '../../services';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})

export class LoginPage implements OnInit {
  loginForm: FormGroup;
  hasError: boolean;

  // public isOffline = this.network.online(); // !this.network.online();

  constructor(
    public translate: TranslateProvider,
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public loading: LoadingService,
    public toast: ToastService,
    public formBuilder: FormBuilder,
    public keyboard: Keyboard,
    public menuCtrl: MenuController,
    public storage: Storage,
    private network: NetworkService,
    private firestore: FirestoreService,
    private notification: NotificationService,
    private auth: AuthService,
    private preload: PreloaderService
  ) {
  }

  async ionViewDidEnter() {
    await this.preload.preloadRoute('home');
    await this.preload.preloadRoute('create-profile');

    setTimeout(() => {
      this.menuCtrl.enable(false);
    }, 1000);
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.compose([
        Validators.required,
        Validators.email
      ])],
      password: ['', Validators.compose([
        Validators.required,
        Validators.minLength(6)
      ])]
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }


  keyDownFunction(event) {
    // User pressed return on keypad, proceed with logging in.
    if (event.keyCode === 13) {
      this.keyboard.hide();
      this.login(this.loginForm);
    }
  }

  login(loginForm: FormGroup) {
    // Login using Email and Password.
    if (!loginForm.valid) {
      this.hasError = true;
    } else {
      this.loading.showLoading('Please wait...');

      this.auth.loginWithEmail(this.loginForm.value['email'], this.loginForm.value['password']).then(res => {
        // this.navCtrl.navigateRoot('/home');
        // Check if user is authenticated on Firebase or not.
        this.auth.getUser().then((user: firebase.User) => {
          if (!user) {
            // User is not authenticated, proceed to LoginPage.
            this.navCtrl.navigateRoot('/login');
          } else {
            // Check if userData is already created on Firestore.
            this.firestore.exists('users/' + user.uid).then(exists => {
              // No data yet, proceed to CreateProfilePage.
              if (!exists) {
                this.navCtrl.navigateRoot('/create-profile');
              } else {
                this.notification.init();
                this.storage.set('uid', user.uid);
                this.navCtrl.navigateRoot('/home');
              }
            }).catch(() => { });
          }
        }).catch(() => { });
        //
        this.loading.dismiss();
        //
      }).catch(err => {
        this.loading.dismiss();
        this.toast.showToast(this.translate.get(err.code));
      });
    }
  }
  // // //

  async forgotPass() {
    const alert = await this.alertCtrl.create({
      header: this.translate.get('auth.login.label.forgot'),
      message: this.translate.get('auth.login.text.forgot'),
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: this.translate.get('app.label.email')
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {}
        }, {
          text: 'Confirm',
          handler: async (input) => {
            const loader = await this.loading.loadingController.create({
              duration: 3000
            });
            loader.present();

            this.auth.resetPassword(input.email).then(r => {
              loader.onWillDismiss().then(async l => {
                this.toast.showToast(this.translate.get('auth.login.text.sended'));
              });
            });
          }
        }
      ]
    });

    await alert.present();
  }

  // // //
  goToRegister() {
    this.navCtrl.navigateRoot('/register');
  }

  // // //

  public loginWithFacebook(): void {
    // Login using Facebook.
    this.loading.showLoading('Log-In with Facebook...');
    this.auth.authWithFacebook().then(res => {
      if (res.additionalUserInfo.isNewUser) {

        this.firestore.get('users/' + res.user.uid).then(ref => {
          const user = new User(
            res.user.uid,
            res.user.email,
            res.additionalUserInfo.profile.first_name,
            res.additionalUserInfo.profile.last_name,
            'Roncaccio',
            res.additionalUserInfo.profile.last_name,
            res.user.photoURL,
            '',

            true
          );

          ref.set(user.obj).then(() => {
            this.notification.init();
            this.loading.dismiss();
            this.navCtrl.navigateRoot('/home');
          }).catch(() => { });
        }).catch(() => { });

      } else {
        this.notification.init();
        this.navCtrl.navigateRoot('/home');
        this.loading.dismiss();
      }

      this.storage.set('uid', res.user.uid);
    }).catch(err => {
      console.log(err);
      this.loading.dismiss();
      this.toast.showToast(err);
    });
  }

  public loginWithGoogle(): void {
    this.loading.showLoading('Log-In with Google...');

    this.auth.authWithGoogle().then(res => {
      if (res.additionalUserInfo.isNewUser) {

        this.firestore.get('users/' + res.user.uid).then(ref => {
          const user = new User(
            res.user.uid,
            res.user.email,
            res.additionalUserInfo.profile.given_name,
            res.additionalUserInfo.profile.family_name,
            'Roncaccio',
            res.additionalUserInfo.profile.family_name,
            res.user.photoURL,
            '',
            true
          );

          ref.set(user.obj).then(() => {
            this.notification.init();
            this.loading.dismiss();
            this.navCtrl.navigateRoot('/home');
          }).catch(() => { });
        }).catch(() => { });

      } else {
        this.notification.init();
        this.navCtrl.navigateRoot('/home');
        this.loading.dismiss();
      }

      this.storage.set('uid', res.user.uid);
    }).catch(err => {
      this.loading.dismiss();
      this.toast.showToast(err.message);
    });
  }

}
