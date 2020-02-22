import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { TranslateModule } from '@ngx-translate/core';
import { AgmCoreModule } from '@agm/core';

import { GeofirePage } from './geofire.page';
// import { ShowUserPage } from '../modal/show-user/show-user.page';

import { environment } from '../../../environments/environment';

const routes: Routes = [
  {
    path: '',
    component: GeofirePage
  }
];

@NgModule({
  declarations: [GeofirePage],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild(),
    AgmCoreModule.forRoot({
      apiKey: environment.googleMapsKey
    })
  ]
})
export class GeofirePageModule {}
