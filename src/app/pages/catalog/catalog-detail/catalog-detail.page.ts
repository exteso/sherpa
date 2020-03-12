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

import { Catalog, User } from '../../../models';
import { SelectUsersPage } from '../../modal/select-users/select-users.page';
import { OverlayEventDetail } from '@ionic/core';
import { Product } from 'src/app/models/product';
import { AddProductsPage } from '../../modal/add-products/add-products';

@Component({
  selector: 'app-catalog-detail',
  templateUrl: './catalog-detail.page.html',
  styleUrls: ['./catalog-detail.page.scss'],
})

export class CatalogDetailPage implements OnInit, OnDestroy {
  public catalog: Catalog;
  public eID;
  public mode = 'detail';
  private subscription: Subscription;
  private subscription2: Subscription;

  hasError: boolean;
  // catalogID = this.route.snapshot.paramMap.get('id');
  public editCatalogForm: FormGroup;

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

    this.firestore.getCatalogById(this.eID).then(res => {
      this.subscription = res.valueChanges().subscribe((r: Catalog) => {
        this.catalog = new Catalog(r.id, r.year, r.week, r.vendor, r.displayId, r.orderDate, r.deliveryDate, r.name);

        this.subscription2 = this.firestore.getCatalogProducts(this.eID)
          .valueChanges()
          .subscribe(products => {
            this.catalog.products = products
          });

        this.editCatalogForm = this.formBuilder.group({
          id: [this.catalog.id, Validators.compose([
            Validators.required
          ])],
          vendor: [this.catalog.vendor, Validators.compose([
            Validators.required
          ])],
          displayId: [this.catalog.displayId, Validators.compose([])],
          orderDeadline: [this.catalog.orderDate, Validators.compose([])],
          name: [this.catalog.name, Validators.compose([])]
        });
      });
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.subscription2) {
      this.subscription2.unsubscribe();
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.editCatalogForm.controls; }

  async deleteCatalog() {
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
            // this.editCatalogForm = null;
            this.loading.showLoading('Deleting catalog...');

            this.firestore.deleteCatalogById(this.eID).then(() => {
              this.loading.dismiss();
              this.toast.showToast(this.translate.get('alert.delete.success'));

              this.navCtrl.navigateRoot('/catalog-list');
            }).catch(() => {});
          }
        }
      ]
    });

    await alert.present();
  }

  public editCatalog(): void {
    const catalogName = this.f.catalogName.value;
    const contactEmail = this.f.contactEmail.value;
    const catalogLocation = this.f.catalogLocation.value;
    const catalogDate = this.f.catalogDate.value;

    if (!this.editCatalogForm.valid) {
      this.hasError = true;
    } else {
      this.loading.showLoading('Updating catalog...');
/*
      this.firestore
      .updateCatalog(this.eID , catalogName, catalogDate, catalogLocation, contactEmail)
      .then(
        () => {
          this.loading.dismiss().then(() => {
            this.navCtrl.navigateRoot('/catalog-list');
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
      */
    }
    
  }

  async presentProductModal() {
    
    const modal = await this.modalController.create({
      component: AddProductsPage,
      componentProps: { 
        selectedProducts: this.catalog.products
      }
    });
    modal.onDidDismiss().then(data => {
      let products: Product[] = data.data;
      if (products && Array.isArray(products)){
        this.firestore.addProductsToCatalog(products, this.eID);
      }

    });
    return await modal.present();
    
  }

  removeProduct(productId: string) {
    this.firestore.removeProductFromCatalog(productId, this.catalog.id);
  }
}
