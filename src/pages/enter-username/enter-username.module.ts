import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EnterUsernamePage } from './enter-username';
import {TranslateModule} from "@ngx-translate/core";

@NgModule({
  declarations: [
    EnterUsernamePage,
  ],
  imports: [
    IonicPageModule.forChild(EnterUsernamePage),
    TranslateModule
  ],
})
export class EnterUsernamePageModule {}
