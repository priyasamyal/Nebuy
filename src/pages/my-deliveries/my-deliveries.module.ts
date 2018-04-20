import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MyDeliveries } from './my-deliveries';
import { TranslateService,TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    MyDeliveries,
  ],
  imports: [
    IonicPageModule.forChild(MyDeliveries)
     ,TranslateModule
    
  ],
  exports: [
    MyDeliveries
  ]
})
export class MyDeliveriesModule {}
