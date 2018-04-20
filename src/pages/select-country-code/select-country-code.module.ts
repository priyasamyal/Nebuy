import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SelectCountryCodePage } from './select-country-code';
import {TranslateModule} from "@ngx-translate/core";

@NgModule({
  declarations: [
    SelectCountryCodePage,
  ],
  imports: [
    IonicPageModule.forChild(SelectCountryCodePage),
    TranslateModule
  ],
})
export class SelectCountryCodePageModule {}
