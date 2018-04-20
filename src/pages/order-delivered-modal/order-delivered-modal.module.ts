import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { OrderDeliveredModal } from './order-delivered-modal';
import { TranslateService,TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    OrderDeliveredModal,
  ],
  imports: [
    IonicPageModule.forChild(OrderDeliveredModal)
     ,TranslateModule
    
  ],
  exports: [
    OrderDeliveredModal
  ]
})
export class OrderDeliveredModalModule {}
