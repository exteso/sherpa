import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CollectOrderPage } from './collect-order.page';

const routes: Routes = [
  {
    path: '',
    component: CollectOrderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CollectOrderPageRoutingModule {}
