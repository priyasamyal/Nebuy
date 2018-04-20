import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReviewsPage } from './reviews';
import { Ionic2RatingModule } from "ionic2-rating";
import { TranslateService,TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    ReviewsPage,
  ],
  imports: [
    IonicPageModule.forChild(ReviewsPage),
    Ionic2RatingModule
     ,TranslateModule
   
  ],
  exports: [
    ReviewsPage
  ]
})
export class ReviewsPageModule {}
