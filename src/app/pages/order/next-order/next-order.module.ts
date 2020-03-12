import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NextOrderPageRoutingModule } from './next-order-routing.module';

import { NextOrderPage } from './next-order.page';
import { SharedComponentModule } from 'src/app/components/shared-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedComponentModule,
    IonicModule,
    NextOrderPageRoutingModule
  ],
  declarations: [NextOrderPage]
})
export class NextOrderPageModule {}
