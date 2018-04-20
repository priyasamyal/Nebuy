import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ShoppingList } from './shopping-list';
import { TranslateService,TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    ShoppingList,
  ],
  imports: [
    IonicPageModule.forChild(ShoppingList)
     ,TranslateModule
   
  ],
  exports: [
    ShoppingList
  ]
})
export class ShoppingListModule {}
