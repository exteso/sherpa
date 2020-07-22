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
export class AddProductsPage implements OnInit {
    searchTerm: string;
    searchTerm$: BehaviorSubject<string>;
    products: Product[];
    filteredProducts$: Observable<Product[]>;
    selectedProducts: Product[];
  
    public loadImg = 'assets/img/profile.png';
  
    @ViewChild(IonVirtualScroll, { static: true }) virtualScroll: IonVirtualScroll;
  
    constructor(
      public translate: TranslateProvider,
      public modalCtrl: ModalController,
      public storage: Storage
    ) {
      this.selectedProducts = [];
    }
  
    ngOnInit() {
      this.searchTerm$ = new BehaviorSubject(this.searchTerm);

      let products$ = new BehaviorSubject(this.products);

      this.filteredProducts$ = combineLatest([products$, this.searchTerm$]).pipe(
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
  
