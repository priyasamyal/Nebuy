import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { OrderDropoff } from './order-dropoff';
import { TranslateService,TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    OrderDropoff,
  ],
  imports: [
      
    IonicPageModule.forChild(OrderDropoff),TranslateModule
    
  ],
  exports: [
    OrderDropoff
  ]
})
export class OrderDropoffModule {}
