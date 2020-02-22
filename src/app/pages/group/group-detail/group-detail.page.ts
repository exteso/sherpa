import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { NavController, AlertController, ModalController } from '@ionic/angular';

import { Subscription } from 'rxjs';

import {
  FirestoreService,
  TranslateProvider,
  LoadingService,
  ToastService
} from '../../../services';

import { Group } from '../../../models';
import { SelectUsersPage } from '../../modal/select-users/select-users.page';

@Component({
  selector: 'app-group-detail',
  templateUrl: './group-detail.page.html',
  styleUrls: ['./group-detail.page.scss'],
})

export class GroupDetailPage implements OnInit, OnDestroy {
  public group: Group;
  public eID;
  public mode = 'detail';
  private subscription: Subscription;

  hasError: boolean;
  // groupID = this.route.snapshot.paramMap.get('id');
  public editGroupForm: FormGroup;

  constructor(
    public formBuilder: FormBuilder,
    public toast: ToastService,
    public loading: LoadingService,
    public alert: AlertController,
    public translate: TranslateProvider,
    public navCtrl: NavController,
    private firestore: FirestoreService,
    private route: ActivatedRoute,
    public modalController: ModalController
  ) {
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(
      (params: ParamMap) => {
        this.eID = params.get('id');
      }
    );

    this.firestore.getGroup(this.eID).then(res => {
      this.subscription = res.valueChanges().subscribe((r: Group) => {
        this.group = new Group(r.id, r.groupName, r.groupLocation, r.groupDeliveryDay, r.contactEmail);

        this.editGroupForm = this.formBuilder.group({
          groupName: [this.group.groupName, Validators.compose([
            Validators.required
          ])],
          contactEmail: [this.group.contactEmail, Validators.compose([
            Validators.required
          ])],
          groupLocation: [this.group.groupLocation, Validators.compose([
            Validators.required
          ])],
          groupDate: [this.group.groupDeliveryDay, Validators.compose([
            Validators.required
          ])]
        });
      });
    });

  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.editGroupForm.controls; }

  async deleteGroup() {
    const alert = await this.alert.create({
      header: this.translate.get('alert.delete.title'),
      message: this.translate.get('alert.delete.message'),
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {}
        },
        {
          text: 'Confirm',
          handler: (e) => {
            this.subscription.unsubscribe();
            // this.editGroupForm = null;
            this.loading.showLoading('Deleting group...');

            this.firestore.deleteGroup(this.eID).then(() => {
              this.loading.dismiss();
              this.toast.showToast(this.translate.get('alert.delete.success'));

              this.navCtrl.navigateRoot('/group-list');
            }).catch(() => {});
          }
        }
      ]
    });

    await alert.present();
  }

  public editGroup(): void {
    const groupName = this.f.groupName.value;
    const contactEmail = this.f.contactEmail.value;
    const groupLocation = this.f.groupLocation.value;
    const groupDate = this.f.groupDate.value;

    if (!this.editGroupForm.valid) {
      this.hasError = true;
    } else {
      this.loading.showLoading('Updating group...');

      this.firestore
      .updateGroup(this.eID , groupName, groupDate, groupLocation, contactEmail)
      .then(
        () => {
          this.loading.dismiss().then(() => {
            this.navCtrl.navigateRoot('/group-list');
          });
        },
        async error => {
          const alertUp = await this.alert.create({
            header: 'Update Error!',
            message: error.message,
            buttons: [
              {
                text: 'OK',
                role: 'cancel',
                cssClass: 'secondary',
                handler: () => {}
              }
            ]
          });

          alertUp.present();
        }
      );
    }
  }

  async presentUserModal() {
    
    const modal = await this.modalController.create({
      component: SelectUsersPage
    });
    return await modal.present();
    
  }

}
