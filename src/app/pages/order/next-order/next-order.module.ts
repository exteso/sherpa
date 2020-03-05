import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NextOrderPageRoutingModule } from './next-order-routing.module';

import { NextOrderPage } from './next-order.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NextOrderPageRoutingModule
  ],
  declarations: [NextOrderPage]
})
export class NextOrderPageModule {}
