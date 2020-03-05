import { Component, ViewChild, OnInit, OnDestroy  } from '@angular/core';
import { AlertController, ModalController, IonVirtualScroll } from '@ionic/angular';
import {
  AuthService,
  FirestoreService,
  NetworkService,
  TranslateProvider,
  LoadingService,
  ToastService,
  NotificationService
} from '../../../services';

import { Subscription, BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { Storage } from '@ionic/storage';
import { Product } from 'src/app/models/product';
import { map } from 'rxjs/operators';


@Component({
  selector: 'app-add-products',
  templateUrl: './add-products.page.html',
  styleUrls: ['./add-products.page.scss'],
})
export class AddProductsPage implements OnInit, OnDestroy  {
    searchTerm: string;
    searchTerm$: BehaviorSubject<string>;
    //products: Product[];
    products$: Observable<Product[]>;
    filteredProducts$: Observable<Product[]>;
    selectedProducts: Product[];
    userId: string;
  
    public loadImg = 'assets/img/profile.png';
    private subscription: Subscription;
  
    @ViewChild(IonVirtualScroll, { static: true }) virtualScroll: IonVirtualScroll;
  
    constructor(
      public translate: TranslateProvider,
      public modalCtrl: ModalController,
      public storage: Storage,
      private alertCtrl: AlertController,
      private firestore: FirestoreService,
      private network: NetworkService,
      private loading: LoadingService,
      private toast: ToastService,
      private notification: NotificationService
    ) {
      this.selectedProducts = [];
    }
  
    ngOnInit() {
      //this.loading.showLoading('Loading products...');
  
      this.storage.get('uid').then(uid => {
        this.userId = uid;
      });

      // Get the list of products on Firestore.
      this.products$ = this.firestore.getProducts().valueChanges();
      
      this.searchTerm$ = new BehaviorSubject(this.searchTerm);

      this.filteredProducts$ = combineLatest([this.products$, this.searchTerm$]).pipe(
        map(([products, searchQuery]) => {
          // here we imperatively implement the filtering logic
          if (!searchQuery) { return products; }
          const q = searchQuery.toLowerCase();
          return products.filter(item => {
            if (item.name && item.name.toLowerCase().includes(q) ||
                item.category && item.category.toLowerCase().includes(q) ||
                item.origin && item.origin.toLowerCase().includes(q)) {
                  return true;
            }
            return false;
          });
        }));
    }
  
    search(searchValue) {
      this.searchTerm$.next(searchValue);
    }

    ngOnDestroy() {
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
    }
  
    header(record, recordIndex, records) {
      if (recordIndex % 20 === 0) {
        return 'Header ' + recordIndex;
      }
      return null;
    }
  
    selectProduct(product: Product) {
      this.selectedProducts.push(product);
    }

    deselectProduct(product: Product) {
      const index = this.selectedProducts.findIndex(item => {
        return (item.name === product.name)
      })
      if (index > -1) {
        this.selectedProducts.splice(index, 1);
      }
    }

    isSelected(product: Product) {
      const index = this.selectedProducts.findIndex(item => {
          return (item.name === product.name)
      })
      if (index > -1) {
        return true;
      }
      return false;
    }


    done(){
      this.modalCtrl.dismiss(this.selectedProducts);
    }

    dismiss() {
      // using the injected ModalController this page
      // can "dismiss" itself and optionally pass back data
      this.modalCtrl.dismiss({
        'dismissed': true
      });
    }
  
  }
  
