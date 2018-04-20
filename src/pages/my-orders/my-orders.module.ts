import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MyOrders } from './my-orders';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    MyOrders,
  ],
  imports: [
    IonicPageModule.forChild(MyOrders),
    TranslateModule
  ],
  exports: [
    MyOrders
  ]
})
export class MyOrdersModule {}
