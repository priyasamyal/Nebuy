import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { Ionic2Rating } from "ionic2-rating";
import { FirebaseService } from "../../providers/firebase-service";
import { /*FirebaseListObservable,*/ FirebaseObjectObservable, AngularFireDatabase } from "angularfire2/database";
import { GlobalVariable } from "../../app/global";
import { AuthService } from '../../providers/auth-service';
import { TranslateService,TranslateModule } from '@ngx-translate/core';
import { ToastController } from 'ionic-angular';



@IonicPage()
@Component({
  selector: 'page-rate-delivery',
  templateUrl: 'rate-delivery.html',
})
export class RateDelivery {

  name: any;
  deliveryData: any;
  rate = 0;
  review: string;
  ratingFrom;
  buyerName;
  userProfile;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private viewCtrl: ViewController,
    private af: AngularFireDatabase,
    private auth: AuthService,
    public translate: TranslateService,
    private toastCtrl: ToastController,
    private globals: GlobalVariable,
    private fs: FirebaseService) {




    translate.addLangs([globals.language]);

    translate.setDefaultLang(globals.language);

         // the lang to use, if the lang isn't available, it will use the current loader to get them
        translate.use(globals.language);

    this.name = navParams.get('name');
    this.deliveryData = navParams.get("deliveryData");
    this.ratingFrom = navParams.get("ratingFrom");
    //let userProfile = this.fs.getUserProfilePicture(this.deliveryData.buyer_id);

    console.log(this.deliveryData);
    if (this.ratingFrom == 'seller') {
      this.buyerName = this.fs.getUserName(this.deliveryData.buyer_id)
        .then(
        (data) => {
          this.buyerName = data;
          console.log(data);
        }
        );


this.fs.getUserProfilePicture(this.deliveryData.seller_id)
     .then(
        (data) => {
          this.userProfile  = data.$value;
          console.log('userProfile',this.userProfile);
        }
        );



    }else{

if(this.deliveryData.buyer_id){
this.fs.getUserProfilePicture(this.deliveryData.buyer_id)
     .then(
        (data) => {
          this.userProfile  = data.$value;
          console.log('userProfile',this.userProfile);
        }
        );

    }else{


      this.fs.getUserProfilePicture(this.deliveryData.seller_id)
     .then(
        (data) => {
          this.userProfile  = data.$value;
          console.log('userProfile',this.userProfile);
        }
        );

    }
    }


  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RateDelivery');
  }

  onModelChange($event) {
    console.log($event);
  }

  skip() {
    this.viewCtrl.dismiss();
  }

  confirm() {

    if(this.rate>0){
    console.log('delivery Data', this.deliveryData);
    console.log("review", this.review);
    if (this.ratingFrom == 'buyer') {
      console.log('userProfile',this.userProfile);
      if (this.review) {
        if(this.deliveryData.order_id){
        this.af.list('/users/' + this.deliveryData.seller_id + '/reviews/')
          .push(
          {
            review: this.review,
            rating: this.rate,
            name: this.globals.userName,
            id: this.globals.current_userUID,
            order_id: this.deliveryData.order_id,
            delivery_id: this.deliveryData.uid,
            profile_photo: this.userProfile
          });
      }else{

        this.af.list('/users/' + this.deliveryData.seller_id + '/reviews/')
          .push(
          {
            review: this.review,
            rating: this.rate,
            name: this.globals.userName,
            id: this.globals.current_userUID,
            order_id: this.deliveryData.uid,
            delivery_id: this.deliveryData.delivery,
            profile_photo: this.userProfile
          });
      }
      } else {
          if(this.deliveryData.order_id){
        this.af.list('/users/' + this.deliveryData.seller_id + '/reviews/')
          .push(
          {

            rating: this.rate,
            name: this.globals.userName,
            id: this.globals.current_userUID,
            order_id: this.deliveryData.order_id,
            delivery_id: this.deliveryData.uid,
            profile_photo: this.userProfile
          });
      }else{

        this.af.list('/users/' + this.deliveryData.seller_id + '/reviews/')
          .push(
          {

            rating: this.rate,
            name: this.globals.userName,
            id: this.globals.current_userUID,
            order_id: this.deliveryData.uid,
            delivery_id: this.deliveryData.delivery,
            profile_photo: this.userProfile
          });
      }
      }
      this.fs.updateUserRating(this.rate, this.deliveryData.seller_id);
      this.fs.editFinishedOrders(this.deliveryData.uid, {rated: true});

    } else if (this.ratingFrom == 'seller') {
      // Rate finished Delivery
      console.log('userProfile',this.userProfile);
      console.log("rating from ", this.ratingFrom)
      if (this.review) {
        this.af.list('/users/' + this.deliveryData.buyer_id + '/reviews/')
          .push(
          {
            review: this.review,
            rating: this.rate,
            name: this.globals.userName,
            id: this.globals.current_userUID,
            order_id: this.deliveryData.order_id,
            delivery_id: this.deliveryData.uid,
            profile_photo: this.userProfile
          });
      } else {
        this.af.list('/users/' + this.deliveryData.buyer_id + '/reviews/')
          .push(
          {
            rating: this.rate,
            name: this.globals.userName,
            id: this.globals.current_userUID,
            order_id: this.deliveryData.order_id,
            delivery_id: this.deliveryData.uid,
            profile_photo: this.userProfile
          });
      }
      this.fs.updateUserRating(this.rate, this.deliveryData.buyer_id);
      this.fs.rateFinishedDelivery(this.deliveryData.uid);
      // this.fs.rateFinishedDelivery(this.deliveryData.seller_id, this.deliveryData.uid, {rated: true});
    }
    this.viewCtrl.dismiss();
  }
  else{

       let noaddress

           this.translate.get('Kindly rate first').subscribe((res: string) => {

           noaddress = res;


    //await this.translate.instant('Saved Address list');
});
 let toast = this.toastCtrl.create({
    message: noaddress,
    duration: 3000,
    position: 'center'
  });

  }
  }
}
