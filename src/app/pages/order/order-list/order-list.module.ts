import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrderListPageRoutingModule } from './order-list-routing.module';

import { OrderListPage } from './order-list.page';
import { SharedComponentModule } from 'src/app/components/shared-components.module';


@NgModule({
  imports: [
    CommonModule,
    SharedComponentModule,
    FormsModule,
    IonicModule,
    OrderListPageRoutingModule
  ],
  declarations: [OrderListPage]
})
export class OrderListPageModule {}
