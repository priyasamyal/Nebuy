import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FirebaseListObservable, FirebaseObjectObservable, AngularFireDatabase } from "angularfire2/database";
import { Ionic2Rating } from "ionic2-rating";
import { FirebaseService } from "../../providers/firebase-service";
import { Subscription } from "rxjs/Subscription";
 import { GlobalVariable } from "../../app/global";
 import { TranslateService,TranslateModule } from '@ngx-translate/core';
    


@IonicPage()
@Component({
  selector: 'page-chat-profile',
  templateUrl: 'chat-profile.html',
})
export class ChatProfile {
  recipientprofile: FirebaseObjectObservable<any>;
  recipientReviews: FirebaseListObservable<any>
  userReviews$: any;
   one:number=0;
  two:number=0;
  three:number=0;
  four:number=0;
  five:number=0;
  recipientId:any;
  userSubscription: Subscription;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private af: AngularFireDatabase,
    public translate: TranslateService,
    private globals: GlobalVariable,
    private fs: FirebaseService) {

       


     

    translate.addLangs([globals.language]);

    translate.setDefaultLang(globals.language);

         // the lang to use, if the lang isn't available, it will use the current loader to get them
        translate.use(globals.language);

     this.recipientId = navParams.get("recipientId");
    this.recipientprofile = this.af.object('/users/' + this.recipientId);
    this.recipientReviews = this.af.list('/users/' + this.recipientId + '/reviews/')

    this.userReviews$ = this.fs.getUserReviews(this.recipientId);
  this.getReviewCount();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ReviewsPage');
  }

  getReviewCount(){

 this.userSubscription = this.fs.getUserReviews(this.recipientId).subscribe(
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
