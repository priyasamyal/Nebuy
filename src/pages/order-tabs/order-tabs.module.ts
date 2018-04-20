import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { OrderTabs } from './order-tabs';
import { TranslateService,TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    OrderTabs,
  ],
  imports: [
    IonicPageModule.forChild(OrderTabs)
     ,TranslateModule
   
  ],
  exports: [
    OrderTabs
  ]
})
export class OrderTabsModule {}
