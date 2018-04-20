import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PickPhotoPage } from './pick-photo';
import {TranslateModule} from "@ngx-translate/core";

@NgModule({
  declarations: [
    PickPhotoPage,
  ],
  imports: [
    IonicPageModule.forChild(PickPhotoPage),
    TranslateModule
  ],
})
export class PickPhotoPageModule {}
