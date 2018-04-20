import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RateDelivery } from './rate-delivery';
import { Ionic2RatingModule } from "ionic2-rating";
import { TranslateService,TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    RateDelivery,
  ],
  imports: [
    IonicPageModule.forChild(RateDelivery),
    Ionic2RatingModule
     ,TranslateModule
  
  ],
  exports: [
    RateDelivery
  ]
})
export class RateDeliveryModule {}
