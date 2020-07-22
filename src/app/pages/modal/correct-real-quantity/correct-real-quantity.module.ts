import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CorrectRealQuantityPageRoutingModule } from './correct-real-quantity-routing.module';

import { CorrectRealQuantityPage } from './correct-real-quantity.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CorrectRealQuantityPageRoutingModule
  ],
  declarations: [CorrectRealQuantityPage]
})
export class CorrectRealQuantityPageModule {}
