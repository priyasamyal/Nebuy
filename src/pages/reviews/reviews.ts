import {Component, OnInit} from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FirebaseService } from "../../providers/firebase-service";
import { GlobalVariable } from "../../app/global";
import { Ionic2Rating } from "ionic2-rating";
import { AuthService } from '../../providers/auth-service';
import { Subscription } from "rxjs/Subscription";
import { ImageViewerController } from "ionic-img-viewer";
import { TranslateService,TranslateModule } from '@ngx-translate/core';




@IonicPage()
@Component({
  selector: 'page-reviews',
  templateUrl: 'reviews.html',

})
export class ReviewsPage implements OnInit {

  userReviews$: any;
  ratings: any;
  _imageViewerCtrl: ImageViewerController;
  name: any;
  one:number=0;
  two:number=0;
  three:number=0;
  four:number=0;
  five:number=0;
   userSubscription: Subscription;

  constructor(public navCtrl: NavController,
      public navParams: NavParams,
      public translate: TranslateService,
      private imageViewerCtrl: ImageViewerController,
      private auth: AuthService,
      private fs: FirebaseService,
      private globals: GlobalVariable) {




    translate.addLangs([globals.language]);

    translate.setDefaultLang(globals.language);

         // the lang to use, if the lang isn't available, it will use the current loader to get them
        translate.use(globals.language);


  }

  ngOnInit() {
    this.getReviewCount();
    this.userReviews$ = this.fs.getUserReviews(this.globals.current_userUID);
    this._imageViewerCtrl = this.imageViewerCtrl;
    // this.name    = this.auth.getUserProfilePicture(this.userReviews$[0].id);
    this.ratings = 5;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ReviewsPage');
  }

  presentImage(myImage) {

    const imageViewer = this._imageViewerCtrl.create(myImage);
    imageViewer.present();

  }

  getReviewCount(){

 this.userSubscription = this.fs.getUserReviews(this.globals.current_userUID).subscribe(
      (resp) => {

        resp.forEach((item, index) => {

          if(item.rating==0){


         }else{

         if(item.rating==1){

           this.one += 1;

         }else{

           if(item.rating==2){

           this.two += 1;

         }else{

           if(item.rating==3){

           this.three += 1;

         }else{

           if(item.rating==4){

           this.four += 1;

         }else{

           this.five += 1;

         }

         }

         }


         }
         }

        });


         // userSubscription.unsubscribe();

        });

  }

}
