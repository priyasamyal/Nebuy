import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Profile } from './profile';
import { Ionic2RatingModule } from "ionic2-rating";
import { IonicImageViewerModule } from "ionic-img-viewer";
import { TranslateService,TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    Profile,
  ],
  imports: [
    IonicPageModule.forChild(Profile),
    Ionic2RatingModule,
    IonicImageViewerModule
     ,TranslateModule
    
  ],
  exports: [
    Profile
  ]
})
export class ProfileModule {}
