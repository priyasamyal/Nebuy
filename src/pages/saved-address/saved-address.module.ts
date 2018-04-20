import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SavedAddressPage } from './saved-address';

@NgModule({
  declarations: [
    SavedAddressPage,
  ],
  imports: [
    IonicPageModule.forChild(SavedAddressPage),
  ],
})
export class SavedAddressPageModule {}
