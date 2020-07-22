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
  FirestoreService
} from '../../services';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})

export class RegisterPage implements OnInit {
  public onRegisterForm: FormGroup;
  hasError: boolean;

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
    private firestore: FirestoreService,
    private network: NetworkService,
    private auth: AuthService
  ) { }

  // ionViewWillEnter() {
  //   this.menuCtrl.enable(false);
  // }
  ionViewWillEnter() {
    this.menuCtrl.enable(false);
  }


  ngOnInit() {
    this.onRegisterForm = this.formBuilder.group({
      email: ['', Validators.compose([
        Validators.required,
        Validators.email
      ])],
      password: ['', Validators.compose([
        Validators.required,
        Validators.minLength(6)
      ])],
      confirmPassword: ['', Validators.compose([
        Validators.required,
        Validators.minLength(6)
      ])]
    }, { 
      validators: this.password.bind(this)
    });
  }

  password(formGroup: FormGroup) {
    const { value: password } = formGroup.get('password');
    const { value: confirmPassword } = formGroup.get('confirmPassword');
    return password === confirmPassword ? null : { passwordNotMatch: true };
  }
  // convenience getter for easy access to form fields
  get f() { return this.onRegisterForm.controls; }


  keyDownFunction(event) {
    // User pressed return on keypad, proceed with logging in.
    if (event.keyCode === 13) {
      this.keyboard.hide();
      this.register(this.onRegisterForm);
    }
  }

  // // //
  register(registerForm: FormGroup) {
    // Login using Email and Password.
    if (!registerForm.valid || registerForm.value['password'] !== registerForm.value['confirmPassword']) {
      this.hasError = true;
    } else {
      this.loading.showLoading('Sign in! Please wait...');

      this.auth.registerWithEmail(this.onRegisterForm.value['email'], this.onRegisterForm.value['password']).then(res => {
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
                this.loading.dismiss();
                this.navCtrl.navigateRoot('/create-profile');
              } else {
                this.navCtrl.navigateRoot('/home');
              }
            }).catch(() => { });
          }
        }).catch(() => { });
      }).catch(err => {
        this.loading.dismiss();
        this.toast.showToast(this.translate.get(err.code));
      });
    }
  }
  // // //

  goToLogin() {
    this.navCtrl.navigateRoot('/login');
  }

  // // //

  public registerWithFacebook(): void {
    // Login using Facebook.
    this.loading.showLoading('SignUp with Facebook...');
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
            this.loading.dismiss();
            this.navCtrl.navigateRoot('/home');
          }).catch(() => { });
        }).catch(() => { });

      } else {
        this.navCtrl.navigateRoot('/home');
        this.loading.dismiss();
      }

      this.storage.set('uid', res.user.uid);
    }).catch(err => {
      this.loading.dismiss();
      this.toast.showToast(err.message);
    });
  }

  // public registerWithGoogle(): void {
  //   this.loading.showLoading('SignUp with Google...');

  //   this.auth.authWithGoogle().then(res => {
  //     if (res.additionalUserInfo.isNewUser) {

  //       this.firestore.get('users/' + res.user.uid).then(ref => {
  //         const user = new User(
  //           res.user.uid,
  //           res.user.email,
  //           res.additionalUserInfo.profile.given_name,
  //           res.additionalUserInfo.profile.family_name,
  //           res.user.photoURL,
  //           '@' + res.additionalUserInfo.profile.family_name.toLowerCase() + res.additionalUserInfo.profile.id.substring(0, 4),
  //           '',
  //           true
  //         );

  //         ref.set(user.obj).then(() => {
  //           this.loading.dismiss();
  //           this.navCtrl.navigateRoot('/home');
  //         }).catch(() => { });
  //       }).catch(() => { });

  //     } else {
  //       this.navCtrl.navigateRoot('/home');
  //       this.loading.dismiss();
  //     }

  //     this.storage.set('uid', res.user.uid);
  //   }).catch(err => {
  //     this.loading.dismiss();
  //     this.toast.showToast(err.message);
  //   });
  // }
}
