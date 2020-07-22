import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CatalogCreatePage } from './catalog-create.page';

const routes: Routes = [
  {
    path: '',
    component: CatalogCreatePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CatalogCreatePageRoutingModule {}
