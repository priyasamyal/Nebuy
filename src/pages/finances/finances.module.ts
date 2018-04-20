import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FinancesPage } from './finances';
import { TranslateService,TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    FinancesPage,
  ],
  imports: [
    IonicPageModule.forChild(FinancesPage)
     ,TranslateModule
    
  ],
  exports: [
    FinancesPage
  ]
})
export class FinancesPageModule {}
