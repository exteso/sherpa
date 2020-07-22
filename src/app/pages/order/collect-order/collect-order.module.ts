import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CollectOrderPageRoutingModule } from './collect-order-routing.module';

import { CollectOrderPage } from './collect-order.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CollectOrderPageRoutingModule
  ],
  declarations: [CollectOrderPage]
})
export class CollectOrderPageModule {}
