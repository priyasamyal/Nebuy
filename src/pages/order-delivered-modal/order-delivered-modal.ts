import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { GlobalVariable } from "../../app/global";
import { TranslateService,TranslateModule } from '@ngx-translate/core';

@IonicPage()
@Component({
  selector: 'page-order-delivered-modal',
  templateUrl: 'order-delivered-modal.html',
})
export class OrderDeliveredModal {

  payload: any;
  deliveryData: any;
  total: any;
  message: string;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private globals: GlobalVariable,
    public translate: TranslateService,
    public viewCtrl: ViewController) {





    translate.addLangs([globals.language]);

    translate.setDefaultLang(globals.language);

     // the lang to use, if the lang isn't available, it will use the current loader to get them
    translate.use(globals.language);
    this.payload = navParams.get("payload");
    this.message = navParams.get("message");
    console.log("the payload", this.payload);

    this.deliveryData = this.payload.deliveryData ? this.payload.deliveryData : this.payload;

    console.log('delivery data', this.deliveryData);
    this.total = Number(this.deliveryData.actual_cost) + Number(this.deliveryData.delivery_cost) + Number(this.deliveryData.reward);
    // If opened from notification
    // if(this.payload.deliveryData){
    //   console.log("hello","deliveryData");
    //
    //   //TODO: adjust total to actual_cost + delivery_cost + reward
    // this.total = Number(this.payload.deliveryData.actual_cost) + Number(this.payload.deliveryData.delivery_cost) + Number(this.payload.deliveryData.reward);
    // }else{
    //   console.log("hello","Data");
    //   this.total = Number(this.payload.actual_cost) + Number(this.payload.delivery_cost) + Number(this.payload.reward);
    // }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad OrderDeliveredModal');
  }

  confirm() {
    console.log('confirm','confirmview');
    this.viewCtrl.dismiss(
      {
        response: "confirm",
        total: this.total
      }
    );
  }

  decline() {
    console.log('confirm','confirmview');

    this.viewCtrl.dismiss(
      {
        response: "decline"
      }
    );
  }

  close() {
    this.viewCtrl.dismiss();
  }

}
