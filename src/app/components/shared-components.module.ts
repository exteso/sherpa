import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';

import {GroceryItemComponent} from "./grocery-item/grocery-item.component";
import { IonicModule } from '@ionic/angular';

@NgModule({
    imports: [
        CommonModule,
        IonicModule
    ],
    declarations: [
        GroceryItemComponent
    ],
    providers: [
    ],
    exports: [
        GroceryItemComponent
    ]
})
export class SharedComponentModule {}