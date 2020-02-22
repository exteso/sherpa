import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { LazyLoadDirective } from './ionimg-lazy-load.directive';

@NgModule({
  imports: [
    CommonModule,
    IonicModule
  ],
  declarations: [LazyLoadDirective],
  exports: [LazyLoadDirective]
})

export class IonImgLazyLoadModule { }
