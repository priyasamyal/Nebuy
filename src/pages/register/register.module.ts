import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Register } from './register';
import { TranslateService,TranslateModule } from '@ngx-translate/core';
import {DirectivesModule} from "../../directives/directives.module";

@NgModule({
  declarations: [
    Register,
  ],
  imports: [
    IonicPageModule.forChild(Register),
    DirectivesModule,
    TranslateModule

  ],
  exports: [
    Register
  ]
})
export class RegisterModule {}
