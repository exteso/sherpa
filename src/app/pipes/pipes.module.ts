import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { UsersPipe } from './users.pipe';

// Add your pipes here for easy indexing.
@NgModule({
  declarations: [
    UsersPipe
  ],
  imports: [
    IonicModule
  ],
  exports: [
    UsersPipe
  ]
})

export class PipesModule { }
