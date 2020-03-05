import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CatalogListPageRoutingModule } from './catalog-list-routing.module';

import { CatalogListPage } from './catalog-list.page';
import { TranslateModule } from '@ngx-translate/core';
import { GroceryItemComponent } from 'src/app/components/grocery-item/grocery-item.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    TranslateModule.forChild(),
    CatalogListPageRoutingModule
  ],
  declarations: [CatalogListPage, GroceryItemComponent]
})
export class CatalogListPageModule {}
