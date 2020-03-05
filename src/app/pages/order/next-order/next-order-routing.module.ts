import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NextOrderPage } from './next-order.page';

const routes: Routes = [
  {
    path: '',
    component: NextOrderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NextOrderPageRoutingModule {}
