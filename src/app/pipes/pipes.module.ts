import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { UsersPipe } from './users.pipe';
import { SearchPipe } from './search.pipe';
import { SearchProductPipe } from './search-product.pipe';

// Add your pipes here for easy indexing.
@NgModule({
  declarations: [
    UsersPipe,
    SearchPipe,
    SearchProductPipe
  ],
  imports: [
    IonicModule
  ],
  exports: [
    UsersPipe,
    SearchPipe,
    SearchProductPipe
  ]
})

export class PipesModule { }
