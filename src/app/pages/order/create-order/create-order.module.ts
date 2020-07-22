import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateOrderPageRoutingModule } from './create-order-routing.module';

import { CreateOrderPage } from './create-order.page';
import { SharedComponentModule } from 'src/app/components/shared-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedComponentModule,
    IonicModule,
    CreateOrderPageRoutingModule
  ],
  declarations: [CreateOrderPage]
})
export class CreateOrderPageModule {}
