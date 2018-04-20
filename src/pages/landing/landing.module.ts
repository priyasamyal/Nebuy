import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Landing } from './landing';
import { TranslateService,TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    Landing,
  ],
  imports: [
    IonicPageModule.forChild(Landing)
     ,TranslateModule
   
  ],
  exports: [
    Landing
  ]
})
export class LandingModule {}
