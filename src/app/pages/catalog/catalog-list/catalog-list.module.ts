import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CatalogListPageRoutingModule } from './catalog-list-routing.module';

import { CatalogListPage } from './catalog-list.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    TranslateModule.forChild(),
    CatalogListPageRoutingModule
  ],
  declarations: [CatalogListPage]
})
export class CatalogListPageModule {}
