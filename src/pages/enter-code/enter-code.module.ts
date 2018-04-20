import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EnterCodePage } from './enter-code';
import {TranslateModule} from "@ngx-translate/core";
import {FormsModule} from "@angular/forms";

@NgModule({
  declarations: [
    EnterCodePage,
  ],
  imports: [
    IonicPageModule.forChild(EnterCodePage),
    TranslateModule,
    FormsModule
  ],
})
export class EnterCodePageModule {}
