import {Component, OnInit} from '@angular/core';
import {
  IonicPage, NavController, NavParams, LoadingController, ViewController, AlertController,
  PopoverController
} from 'ionic-angular';
import { ImagePicker, ImagePickerOptions } from "@ionic-native/image-picker";
import { Camera, CameraOptions } from '@ionic-native/camera';
import { ImageViewerComponent } from "ionic-img-viewer";
import { FirebaseService } from "../../providers/firebase-service";
import { GlobalVariable } from "../../app/global";
  import { TranslateService,TranslateModule } from '@ngx-translate/core';
import { PushService } from "../../providers/push-service";

@IonicPage()
@Component({
  selector: 'page-report-modal',
  templateUrl: 'report-modal.html',
})
export class ReportModalPage implements OnInit {
  iconName: string;
  submitAttempt: boolean = false;
  complaint: string;
  orderData: any;
  images = [];
  dialog: any;
  from: any;
  lastPage: any;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public translate: TranslateService,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public viewCtrl: ViewController,
    private imagePicker: ImagePicker,
    private fs: FirebaseService,
    private ps: PushService,
      private popoverCtrl: PopoverController,
      private globals: GlobalVariable,
    private camera: Camera) {





    translate.addLangs([globals.language]);

    translate.setDefaultLang(globals.language);

         // the lang to use, if the lang isn't available, it will use the current loader to get them
        translate.use(globals.language);

  }

  ngOnInit() {
    this.orderData = this.navParams.get("orderData");
    this.from = this.navParams.get('from');
    this.complaint = '';
    this.lastPage = this.navParams.get('lastPage');
    this.iconName = this.navParams.get('icon') || 'ai-complain';
  }

  removeError(){
  this.submitAttempt = false;

}

hideDialog(){

    if(this.dialog){

      this.dialog.style.visibility = "hidden" ;
    }
  }

  choosePhoto(){
     const popover = this.popoverCtrl.create('PickPhotoPage', {}, {cssClass: 'pick-photo-popover custom-popover'});
     popover.present();
     popover.onDidDismiss((images) => {
       this.images = images;
       console.log(this.images);
     });
   }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ReportModalPage');
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  // async pickImage() {
  //   this.dialog.style.visibility = "hidden" ;
  //
  //   try {
  //
  //     var images = await this.imagePicker.getPictures(this.pickerOptions)
  //     console.log(images);
  //     images.map(image => {
  //       this.images.push(image);
  //     });
  //     console.log("images after mapping:", this.images);
  //   } catch (error) {
  //     console.error("error uploading image: ", error)
  //   }
  // }
  //
  // async openCamera() {
  //   this.dialog.style.visibility = "hidden" ;
  //   try {
  //     const image = await this.camera.getPicture(this.cameraOptions);
  //     this.images.push(image);
  //     console.log("images:", this.images);
  //   } catch (error) {
  //     console.error("error uploading image: ", error)
  //   }
  // }
  report() {
    if(this.complaint.length){
    if (this.from == 'my-deliveries') {
      this.submit();
    } else if (this.from == "order-detail") {
      this.submitDetail();
    }
    }else{

      this.submitAttempt = true;
    }
  }

  async submitDetail() {

     let noaddress;

     await   this.translate.stream('Your report is successfully submitted').subscribe((res: string) => {

     noaddress = res;


    //await this.translate.instant('Saved Address list');
});
     if(this.complaint.length){
    let loader = this.loadingCtrl.create({
      // content: "Fetching Orders Nearby You",
      duration: 5000,
      spinner: 'hide',
      content: `
      <img src="assets/img/loader.gif" style="width:50%">`
    });
    loader.present();
    const report = await this.fs.report(this.orderData, this.images);

    let orderObject = {
      buyerID: report.orderData.buyer_id,
      orderId: report.orderData.uid,
      deliveryAddress: report.orderData.delivery_address.address,
      shopAddress: report.orderData.shop.address,
      deliveryTime: report.orderData.delivery_time,
      cost: report.orderData.cost,
      reward: report.orderData.reward,
      products: report.orderData.products
    };

    console.log("orderObject", orderObject);
    const reportEmail = await this.ps.reportOrder(orderObject);
    console.log(reportEmail);
    loader.dismiss().then(() => this.showSuccessAlert(noaddress));

  }else{

      this.submitAttempt = true;
    }
}
  async submit() {
    if(this.complaint.length){
    let loader = this.loadingCtrl.create({
      // content: "Fetching Orders Nearby You",
      duration: 5000,
      spinner: 'hide',
      content: `
      <img src="assets/img/loader.gif" style="width:50%">`
    });
    loader.present();
    this.orderData["complaint"] = this.complaint;
    console.log(this.orderData);
    try {
      const report = await this.fs.report(this.orderData, this.images);
      console.log("report", report);
      const buyerEmail = await this.fs.getUserEmail(report.orderData.buyer_id);
      const buyerName = await this.fs.getUserName(report.orderData.buyer_id)
      const sellerEmail = await this.fs.getUserEmail(report.orderData.seller_id);
      const sellerName = await this.fs.getUserName(report.orderData.seller_id);

      console.log("buyerName", buyerName);
      console.log("buyerEmail", buyerEmail);

      let orderObject = {
        buyerID: report.orderData.buyer_id,
        buyerName: buyerName.$value,
        buyerEmail: buyerEmail.$value,
        sellerId: report.orderData.seller_id,
        sellerName: sellerName.$value,
        sellerEmail: sellerEmail.$value,
        orderId: report.orderData.order_id,
        deliveryAddress: report.orderData.delivery_address.address,
        shopAddress: report.orderData.shop.address,
        deliveryTime: report.orderData.delivery_time,
        cost: report.orderData.cost,
        reward: report.orderData.reward,
        products: report.orderData.products
      };

      console.log("orderObject", orderObject);

      let reportObj = {};
      if (report.images) {
        reportObj['images'] = report.images;
        reportObj['order_data'] = orderObject;
        reportObj['complaint'] = report.orderData.complaint;
        reportObj['report_id'] = report.$key;
      } else {
        reportObj['order_data'] = orderObject;
        reportObj['complaint'] = report.orderData.complaint;
        reportObj['report_id'] = report.$key;
      }
      const reportEmail = await this.ps.report(reportObj);
      console.log(reportEmail);
      loader.dismiss().then(() => this.showSuccessAlert("Your report is successfully submitted"));
    } catch (error) {
      console.error(error);
      loader.dismiss();
      this.showErrorAlert(error);
    }
  }else{

      this.submitAttempt = true;
    }
  }

  showSuccessAlert(msg: string) {
    let alert = this.alertCtrl.create({
      title: msg,
      buttons: ["OK"]
    });
    alert.present();
    alert.onWillDismiss(
      () => this.viewCtrl.dismiss()
    );
  }
  showErrorAlert(error) {
    let alert = this.alertCtrl.create({
      title: error,
      buttons: ["Try Again"]
    });
    alert.present();
  }
}
