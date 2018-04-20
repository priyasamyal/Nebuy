import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddressList } from './address-list';
import { TranslateService,TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    AddressList,
  ],
  imports: [
    IonicPageModule.forChild(AddressList)
     ,TranslateModule
    
  ],
  exports: [
    AddressList
  ]
})
export class AddressListModule {}
