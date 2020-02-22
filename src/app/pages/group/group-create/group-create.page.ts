import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage';

import { Keyboard } from '@ionic-native/keyboard/ngx';

import {
  FirestoreService,
  TranslateProvider,
  LoadingService,
  ToastService
} from '../../../services';


@Component({
  selector: 'app-group-create',
  templateUrl: './group-create.page.html',
  styleUrls: ['./group-create.page.scss'],
})

export class GroupCreatePage implements OnInit {
  userId: string;
  hasError: boolean;
  // groupID = this.route.snapshot.paramMap.get('id');
  public createGroupForm: FormGroup;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public translate: TranslateProvider,
    public loading: LoadingService,
    public toast: ToastService,
    public formBuilder: FormBuilder,
    public navCtrl: NavController,
    private firestore: FirestoreService,
    private storage: Storage,
    private keyboard: Keyboard
  ) {
    // console.log(this.groupID);
  }

  ngOnInit() {
    this.storage.get('uid').then(uid => {
      this.userId = uid;
    });

    this.createGroupForm = this.formBuilder.group({
      groupName: ['', Validators.compose([
        Validators.required
      ])],
      contactEmail: ['', Validators.compose([
        Validators.required
      ])],
      groupLocation: ['', Validators.compose([
        Validators.required
      ])],
      groupDate: ['', Validators.compose([
        Validators.required
      ])]
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.createGroupForm.controls; }

  keyDownFunction(group) {
    // User pressed return on keypad, proceed with creating profile.
    if (group.keyCode === 13) {
      this.keyboard.hide();
      this.createGroup();
    }
  }

  public createGroup(): void {
    const groupName: string = this.f.groupName.value;
    const contactEmail = this.f.contactEmail.value;
    const groupLocation = this.f.groupLocation.value;
    const groupDate = this.f.groupDate.value;
    if (!this.createGroupForm.valid) {
      // console.log('Errooo!');
      this.hasError = true;
    } else {
      this.loading.showLoading('Creating group...');

      this.firestore.createGroup(groupName, groupDate, groupLocation, contactEmail).then(() => {
        this.loading.dismiss();
        this.toast.showToast(this.translate.get('register.add.success'));
        this.navCtrl.navigateRoot('/group-list');
      });
    }
  }

  onChange($group) {
    console.log($group);
  }

}
