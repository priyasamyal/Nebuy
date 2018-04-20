import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Chat } from './chat';
import { TranslateService,TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    Chat,
  ],
  imports: [
    IonicPageModule.forChild(Chat)
     ,TranslateModule
    
  ],
  exports: [
    Chat
  ]
})
export class ChatModule {}
