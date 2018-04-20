import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { OrderDetails } from './order-details';
import { IonicImageViewerModule } from "ionic-img-viewer";
import { TranslateService,TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [
    OrderDetails,
  ],
  imports: [
    IonicPageModule.forChild(OrderDetails),TranslateModule,
    IonicImageViewerModule
  ],
  exports: [
    OrderDetails
  ]
})
export class OrderDetailsModule {}
