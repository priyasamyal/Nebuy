import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ResetPassword } from './reset-password';
import { TranslateService,TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    ResetPassword,
  ],
  imports: [
    IonicPageModule.forChild(ResetPassword)
     ,TranslateModule
    
  ],
  exports: [
    ResetPassword
  ]
})
export class ResetPasswordModule {}
