import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CatalogCreatePageRoutingModule } from './catalog-create-routing.module';

import { CatalogCreatePage } from './catalog-create.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CatalogCreatePageRoutingModule
  ],
  declarations: [CatalogCreatePage]
})
export class CatalogCreatePageModule {}
