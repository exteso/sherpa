import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NextOrderPageRoutingModule } from './next-order-routing.module';

import { NextOrderPage } from './next-order.page';
import { GroceryItemComponent } from 'src/app/components/grocery-item/grocery-item.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NextOrderPageRoutingModule
  ],
  declarations: [NextOrderPage, GroceryItemComponent]
})
export class NextOrderPageModule {}
