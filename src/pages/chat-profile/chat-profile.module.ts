import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChatProfile } from './chat-profile';
import { Ionic2RatingModule } from "ionic2-rating";
import { TranslateService,TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    ChatProfile,
  ],
  imports: [
    IonicPageModule.forChild(ChatProfile),
    Ionic2RatingModule
     ,TranslateModule
    
  ],
  exports: [
    ChatProfile
  ]
})
export class ChatProfileModule {}
