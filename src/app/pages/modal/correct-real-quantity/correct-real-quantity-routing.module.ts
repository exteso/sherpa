import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CorrectRealQuantityPage } from './correct-real-quantity.page';

const routes: Routes = [
  {
    path: '',
    component: CorrectRealQuantityPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CorrectRealQuantityPageRoutingModule {}
