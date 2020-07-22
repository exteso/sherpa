import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Catalog } from 'src/app/models/catalog';
import { Observable } from 'rxjs';
import { FirestoreService } from 'src/app/services';

@Component({
  selector: 'app-catalog-list',
  templateUrl: './catalog-list.page.html',
  styleUrls: ['./catalog-list.page.scss'],
})
export class CatalogListPage implements OnInit {

  public catalogList: Observable<Catalog[]>;

  constructor(
    public storage: Storage,
    private firestore: FirestoreService
  ) {
  }

  ngOnInit() {
    this.catalogList = this.firestore.getCatalogList().valueChanges();
  }
}
