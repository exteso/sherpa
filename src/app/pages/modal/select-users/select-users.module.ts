import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SelectUsersPageRoutingModule } from './select-users-routing.module';

import { SelectUsersPage } from './select-users.page';
import { PipesModule } from 'src/app/pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipesModule,
    SelectUsersPageRoutingModule
  ],
  declarations: [SelectUsersPage]
})
export class SelectUsersPageModule {}
