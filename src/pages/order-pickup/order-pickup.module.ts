import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { OrderPickup } from './order-pickup';
import { TranslateService,TranslateModule } from '@ngx-translate/core';
import {TooltipsModule} from "ionic-tooltips";

@NgModule({
  declarations: [
    OrderPickup,
  ],
  imports: [
    IonicPageModule.forChild(OrderPickup),
    TranslateModule,
    TooltipsModule
  ],
  exports: [
    OrderPickup
  ]
})
export class OrderPickupModule {}
