import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReportModalPage } from './report-modal';
import { TranslateService,TranslateModule } from '@ngx-translate/core';
import { IonicImageViewerModule } from "ionic-img-viewer";

@NgModule({
  declarations: [
    ReportModalPage,
  ],
  imports: [
    IonicPageModule.forChild(ReportModalPage),
    IonicImageViewerModule
     ,TranslateModule
   
  ],
  exports: [
    ReportModalPage
  ]
})
export class ReportModalPageModule {}
