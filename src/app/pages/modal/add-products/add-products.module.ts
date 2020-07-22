import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PipesModule } from 'src/app/pipes/pipes.module';
import { AddProductsPageRoutingModule } from './add-products-routing.module';
import { AddProductsPage } from './add-products';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipesModule,
    AddProductsPageRoutingModule
  ],
  declarations: [AddProductsPage]
})
export class AddProductsPageModule {}
