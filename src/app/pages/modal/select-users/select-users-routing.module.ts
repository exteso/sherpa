import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SelectUsersPage } from './select-users.page';

const routes: Routes = [
  {
    path: '',
    component: SelectUsersPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SelectUsersPageRoutingModule {}
