import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ActiveOrders } from './active-orders';
import { TranslateService,TranslateModule } from '@ngx-translate/core';
import {TooltipsModule} from "ionic-tooltips";

@NgModule({
  declarations: [
    ActiveOrders,
  ],
  imports: [
    IonicPageModule.forChild(ActiveOrders)
     ,TranslateModule,
    TooltipsModule

  ],
  exports: [
    ActiveOrders
  ]
})
export class ActiveOrdersModule {}
