import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditModal } from './edit-modal';
import { TranslateService,TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    EditModal,
  ],
  imports: [
    IonicPageModule.forChild(EditModal)
     ,TranslateModule
    
  ],
  exports: [
    EditModal
  ]
})
export class EditModalModule {}
