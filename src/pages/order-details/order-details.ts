import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ModalController, App, ViewController, LoadingController, AlertController } from 'ionic-angular';
import { InAppBrowser } from "@ionic-native/in-app-browser";
import { GlobalVariable } from "../../app/global";
import { FirebaseService } from "../../providers/firebase-service";
import { PushService } from "../../providers/push-service";
import moment from 'moment';
import { TranslateService } from '@ngx-translate/core';

@IonicPage()
@Component({
  selector: 'page-order-details',
  templateUrl: 'order-details.html',
})
export class OrderDetails {
  order: any;
  type:any;
  lastPage: string;
  deliveryStatus: string;
  days: string[];
  startDay:any;
  StartTime:any;
  endDay:any;
  EndTime:any;
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public appCtrl: App,
    public translate:TranslateService,
    public viewCtrl: ViewController,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public modalCtrl: ModalController,
    private globals: GlobalVariable,
    private platform: Platform,
     private iab: InAppBrowser,
    private app: App,
    private fs: FirebaseService,
    private ps: PushService
   ) {



     translate.addLangs([globals.language]);

        translate.setDefaultLang(globals.language);

         // the lang to use, if the lang isn't available, it will use the current loader to get them
        translate.use(globals.language);

    this.order = navParams.get("order");
    this.type  = navParams.get("type");

    console.log(this.order);
    // this.lastPage = this.navCtrl.getActive().name
    this.lastPage = navParams.get('lastPage');
    this.deliveryStatus = navParams.get("deliveryStatus");
    console.log("lastPage", this.lastPage);
     this.days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

    this.startDay = this.days[moment.parseZone(this.order.delivery_time.betweenTimeOne).weekday()];
    this.StartTime = moment.parseZone(this.order.delivery_time.betweenTimeOne).format('HH:mm');
    this.endDay   = this.days[moment.parseZone(this.order.delivery_time.betweenTimeTwo).weekday()];

    this.EndTime   = moment.parseZone(this.order.delivery_time.betweenTimeTwo).format('HH:mm');

     console.log('startDay',moment(this.order.delivery_time.betweenTimeTwo).subtract(5,'h').weekday());
      console.log('endDay',this.startDay);
       console.log('endtime',this.StartTime);
        console.log('startTime',this.EndTime);







  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad OrderDetails');
  }

  chatProfile(recipientId) {
    this.navCtrl.push("ChatProfile", { recipientId: recipientId });
  }

  navigate(lat, lng, label) {
    console.log(lat); console.log(lng);
    let destination = lat.toString() + ',' + lng.toString();
    console.log("destination", destination);
    // let label = encodeURI(name);
    // console.log("label", label);
    if (this.platform.is('ios')) {
      // window.open('maps://?q=' + 'dropoff' + '&saddr=' + position.coords.latitude + ',' + position.coords.longitude + '&daddr=' + this.location.latitude + ',' + this.location.longitude, '_system');
      // window.open('maps://?q=' + destination, '_system');
      console.log("yup its ios");
      const browser = this.iab.create('maps://?q=' + destination + '(' + label + ')', '_system');
    };
    // android
    if (this.platform.is('android')) {
      const browser = this.iab.create('geo://' + lat + ',' + lng + '?q=' + lat + ',' + lng + '(' + label + ')', '_system');
      // window.open('http://tebros.com/2016/02/launching-external-maps-app-from-ionic2/', '_system');
    };
  }

//   async deliver(orderId, buyerId, order){

// let result:number = ActiveOrders.deliver( orderId, buyerId, order );
//    this.navCtrl.pop();

//   }

  async deliver(orderId, buyerId, order) {
    let loader = this.loadingCtrl.create({
      // content: "Updating your deliveries",
      duration: 2500,
      dismissOnPageChange: true,
      spinner: 'hide',
      content: `<img src="assets/img/loader.gif" style="width:50%">`
    });
    loader.present();
    try {
        let timeend,subtitle1,subtitle2,tite,button1,button2;

     await   this.translate.stream('Time ended').subscribe((res: string) => {

     timeend = res;


    //await this.translate.instant('Saved Address list');
});

  await   this.translate.stream('Time for this order has ended').subscribe((res: string) => {

     subtitle1 = res;


    //await this.translate.instant('Saved Address list');
});

  await   this.translate.stream('Ok').subscribe((res: string) => {

     button1 = res;


    //await this.translate.instant('Saved Address list');
});

  await   this.translate.stream('Deliveries Updated').subscribe((res: string) => {

     tite = res;


    //await this.translate.instant('Saved Address list');
});

  await   this.translate.stream('This order is placed to delivery list').subscribe((res: string) => {

     subtitle2 = res;


    //await this.translate.instant('Saved Address list');
});

  await   this.translate.stream('Enjoy Shopping').subscribe((res: string) => {

     button2 = res;


    //await this.translate.instant('Saved Address list');
});
      let deadlineReached = this.deadlineReached(order.delivery_time, order.dateCreated);
      if (deadlineReached) {
        let alert = this.alertCtrl.create({
          title: timeend,
          subTitle: subtitle1,
          buttons: [button1]
        });
        alert.present().then(() => loader.dismiss());
      } else {
        let alert = this.alertCtrl.create({
          title: tite,
          subTitle: subtitle2,
          buttons: [button2]
        });

        this.fs.updateOrderStatus(orderId, "in_process");
        this.fs.updateOrderStatusInBuyer(buyerId, orderId, "in_process");
        this.fs.addDeliveriesInCurrentUser(buyerId, orderId, order);
        const playerId = await this.fs.getPlayerId(buyerId);
        console.log(playerId);
        this.ps.acceptOrderNotification(playerId.playerId);
        alert.present().then(() => loader.dismiss())
        alert.onDidDismiss(

          () => {
          this.navCtrl.pop()
          this.navCtrl.push("ActiveOrders")
          this.app.getRootNav().getActiveChildNav().select(3)
          }
          /*this.navCtrl.setRoot("OrderTabs", { pageIndex: '1' })*/
        )
      }


    } catch (error) {
      loader.dismiss();
      console.error("error delivering:", error);
    }
  }

  deadlineReached(deliveryTime, dateCreated) {
    let currentDateTime = new Date();
    let checkHours; let checkMinutes;
    let checkYear; let checkMonth; let checkDate;

    let currentHours = currentDateTime.getHours().toString();
    let currentMinutes = currentDateTime.getMinutes().toString();
    let currentYear = currentDateTime.getFullYear().toString();
    let currentMonth = currentDateTime.getMonth() + 1;
    let currentDate = currentDateTime.getDate().toString();

    if (currentHours.toString().length === 1) {
      checkHours = "0" + currentHours;
    } else {
      checkHours = currentHours;
    }

    if (currentMinutes.length === 1) {
      checkMinutes = "0" + currentMinutes;
    } else {
      checkMinutes = currentMinutes;
    }

    if (currentMonth.toString().length === 1) {
      checkMonth = "0" + currentMonth.toString();
    }
    if (currentDate.length === 1) {
      checkDate = "0" + currentDate;
    }

    console.log("checkHours", checkHours);
    console.log("checkMin", checkMinutes);

    let anyTime = checkHours + ":" + checkMinutes;
    console.log('currentTime', anyTime);

    // let betweenTime = currentYear + "-" + checkMonth + "-" + checkDate + "T" + checkHours + ":" + checkMinutes + ":00Z";
    // console.log("betweenTime", betweenTime);
    let checkDateCreated = currentDate + "-" + currentMonth.toString() + "-" + currentYear;
    console.log("checkDateCreated", checkDateCreated);
    if (deliveryTime.anyTime) {
      console.log("deliveryTime.anyTime", deliveryTime.anyTime);
      let min = deliveryTime.anyTime.substring(deliveryTime.anyTime.indexOf(":") + 1, deliveryTime.anyTime.length);
      /*deliveryTime.anyTime <= anyTime*/
      console.log("min", min);
      let hours = deliveryTime.anyTime.substring(0, deliveryTime.anyTime.indexOf(":"));

      if (checkDateCreated !== dateCreated) {
        return true
      } else if (checkDateCreated == dateCreated && checkHours >= hours && (Number(min) - Number(checkMinutes)) <= 3) {
        return false;
      }
      // if (checkDateCreated == dateCreated && checkHours >= hours && (Number(min) - Number(checkMinutes)) <= 3) {
      //   return true;
      // } else return false;
    } else {
      console.log("deliveryTime.betweenTimeTwo", deliveryTime.betweenTimeTwo);
      let betweenTime = deliveryTime.betweenTimeTwo;
      let date = currentYear + "-" + checkMonth + "-" + checkDate;
      console.log("date", date);

      let betweenDate = betweenTime.substring(0, betweenTime.indexOf('T'));
      console.log("betweenDate", betweenDate);
      let hm = betweenTime.substring(betweenTime.indexOf('T') + 1, betweenTime.indexOf('Z'))
      let hours = hm.substring(0, hm.indexOf(':'));
      console.log("hm", hm);
      let min = hm.substring(hm.indexOf(':') + 1, hm.lastIndexOf(':'))

      if (date == betweenDate && hours == checkHours && (Number(min) - Number(checkMinutes)) <= 3) {
        return true;
      } else return false;
    }
  }


  report(orderData) {
    if (this.lastPage == 'ActiveOrders') {
      this.submitDetail(orderData);
    } else {
      let modal = this.modalCtrl.create("ReportModalPage",
        {
          orderData: orderData,
          from: 'order-detail',
          lastPage: this.lastPage
        });
      modal.present();
    }
  }

  async submitDetail(orderData) {

    let successalert;
    let loader = this.loadingCtrl.create({
      // content: "Fetching Orders Nearby You",
      duration: 5000,
      spinner: 'hide',
      content: `
      <img src="assets/img/loader.gif" style="width:50%">`
    });
    loader.present();
    const report = await this.fs.report(orderData);

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


     await   this.translate.stream('Your report is successfully submitted').subscribe((res: string) => {

     successalert = res;


    //await this.translate.instant('Saved Address list');
});



    console.log("orderObject", orderObject);
    const reportEmail = await this.ps.reportOrder(orderObject);
    console.log(reportEmail);
    loader.dismiss().then(() => this.showSuccessAlert(successalert));
  }

  showSuccessAlert(msg: string) {
    let ok;

   this.translate.stream('Ok').subscribe((res: string) => {

     ok = res;


    //await this.translate.instant('Saved Address list');
});

    let alert = this.alertCtrl.create({
      title: msg,
      buttons: [ok]
    });
    alert.present();
    alert.onWillDismiss(
      () => this.viewCtrl.dismiss()
    );
  }

}
