import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';

import { PipesModule } from '../../pipes/pipes.module';

import { UserListPage } from './user-list.page';

const routes: Routes = [
  {
    path: '',
    component: UserListPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    PipesModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild()
  ],
  declarations: [UserListPage]
})
export class UserListPageModule {}
