import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule } from '@angular/forms';

import { GroceryItemComponent } from "./grocery-item/grocery-item.component";
import { IonicModule } from '@ionic/angular';
import { LoginModalComponent } from './login-modal/login-modal.component';

@NgModule({
    imports: [
        CommonModule,
        IonicModule,
        FormsModule,
    ],
    declarations: [
        GroceryItemComponent,
        LoginModalComponent
    ],
    providers: [
    ],
    exports: [
        GroceryItemComponent,
        LoginModalComponent
    ]
})
export class SharedComponentModule {}