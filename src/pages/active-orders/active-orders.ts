import { Component, NgZone, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, Nav, App, Platform } from 'ionic-angular';
import firebase from 'firebase';
import { FirebaseService } from '../../providers/firebase-service';
import { PushService } from "../../providers/push-service";
import { GlobalVariable } from "../../app/global";
import { FirebaseListObservable, FirebaseObjectObservable, AngularFireDatabase } from "angularfire2/database";
import { InAppBrowser } from "@ionic-native/in-app-browser";
import { Subscription } from "rxjs/Subscription";
import { TranslateService } from '@ngx-translate/core';
import 'rxjs/add/operator/toPromise';

declare var GeoFire: any;

@IonicPage()
@Component({
  selector: 'page-active-orders',
  templateUrl: 'active-orders.html',
})
export class ActiveOrders implements OnInit {

  orderList$: FirebaseListObservable<any>;
  orderObject$: FirebaseObjectObservable<any>;
  loader: any;
  items: any;
  noOrder:any;
  orders: Array<any> = [];
  orderRef: any;
  currentTime: any;
  Earn: string;
  onKeyEnteredRegistration: any;
  keyArray = [];
  obsArray = [];
  checkDateCreated;
  orderSubscription$: Subscription;
  // ordersInProcess = [];

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private fs: FirebaseService,
    private ps: PushService,
    private platform: Platform,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    private zone: NgZone,
    public translate: TranslateService,
    private app: App,
    private globals: GlobalVariable,
    private iab: InAppBrowser,
    private db: AngularFireDatabase) {

    translate.addLangs([globals.language]);

    translate.setDefaultLang(globals.language);

         // the lang to use, if the lang isn't available, it will use the current loader to get them
        translate.use(globals.language);

    this.orderRef = firebase.database().ref("orders/");
    let ref = firebase.database().ref("orders/");
    // ref.on("value", () => {})
    // this.getActiveOrders();
    // let today = new Date();
    // this.currentTime = today.getHours() + ':' + today.getMinutes();
    this.readyTime();

    // this.loader = this.loadingCtrl.create({
    //   // content: "Fetching Orders Nearby You",
    //   spinner: 'hide',
    //   content: `
    //   <img src="assets/img/loader.gif" style="width:50%">`
    // });
    // this.loader.present();
    // if (this.obsArray.length > 0) this.loader.dismiss();
  }

  viewDetails(order) {
    this.navCtrl.push('OrderDetails', {
      type:'noType',
      order: order
    });
  }

  doRefresh(refresher) {
    console.log('Begin async operation', refresher);
console.log('noOrder',this.noOrder);
    this.getNearbyOrders();
    setTimeout(() => {
      console.log('Async operation has ended');
      if(this.obsArray.length==0){
        this.noOrder = 'Sorry, no orders for this shop';
      }
      refresher.complete();
    }, 2000);
  }

  public  async deliver(orderId, buyerId, item) {

    let add4,ok,title1,subtile1,button1;

    this.translate.get('Enjoy Shopping').subscribe((res: string) => {

     button1 = res;


    //await this.translate.instant('Saved Address list');
});

  this.translate.get('This order is placed to delivery list').subscribe((res: string) => {

     subtile1 = res;


    //await this.translate.instant('Saved Address list');
});

 this.translate.get('Deliveries updated').subscribe((res: string) => {

     title1 = res;


    //await this.translate.instant('Saved Address list');
});

    let loader = this.loadingCtrl.create({
      // content: "Updating your deliveries",
      duration: 2500,
      dismissOnPageChange: true,
      spinner: 'hide',
      content: `<img src="assets/img/loader.gif" style="width:50%">`
    });
    loader.present();
    try {
      let deadlineReached = this.deadlineReached(item.delivery_time, item.dateCreated);
      this.obsArray.map((item, i, array) => {
        if (orderId == item.uid) {
          array.splice(i, 1)
        }
      })
      if (deadlineReached) {



     this.translate.get('Time ended').subscribe((res: string) => {

     add4 = res;


    //await this.translate.instant('Saved Address list');
});

 this.translate.get('Time for this order has ended').subscribe((res: string) => {

     ok = res;


    //await this.translate.instant('Saved Address list');
});




        let alert = this.alertCtrl.create({
          title: add4,
          subTitle: ok,
          buttons: ['Ok']
        });
        alert.present().then(() => loader.dismiss());
      } else {
        let alert = this.alertCtrl.create({
          title: title1,
          subTitle: subtile1,
          buttons: [button1]
        });

        this.fs.updateOrderStatus(orderId, "in_process");
        this.fs.updateOrderStatusInBuyer(buyerId, orderId, "in_process");
        this.fs.addDeliveriesInCurrentUser(buyerId, orderId, item);
        const playerId = await this.fs.getPlayerId(buyerId);
        console.log(playerId);

        // TODO: readd notification
        //this.ps.acceptOrderNotification(playerId.playerId);
        alert.present().then(() => loader.dismiss())
        alert.onDidDismiss(
          () => this.app.getRootNav().getActiveChildNav().select(3)/*this.navCtrl.setRoot("OrderTabs", { pageIndex: '1' })*/
        )
      }

    } catch (error) {
      loader.dismiss();
      console.error("error delivering:", error);
    }
  }

  ngOnInit() {
    this.loader = this.loadingCtrl.create({
      // content: "Fetching Orders Nearby You",
      spinner: 'hide',
      content: `
      <img src="assets/img/loader.gif" style="width:50%">`
    });
    this.loader.present();
    this.getNearbyOrders();
    setTimeout(() => {
      console.log('Async operation has ended');
      if(this.obsArray.length==0){
        this.noOrder = 'Sorry, no orders for this shop';
      }
      this.loader.dismiss();
    }, 2000);

  }

  async getNearbyOrders() {
    this.keyArray = [];
    this.obsArray = [];
    const pos = await this.fs.getCurrentPosition();
    console.log('lat: ' + pos.coords.latitude + ', lng: ' + pos.coords.longitude);
    await this.fs.setUserLocation(pos.coords.latitude, pos.coords.longitude);
    let ref = firebase.database().ref('orders/locations');
    let geoFire = new GeoFire(ref);
    let geoQuery = geoFire.query({
      center: [pos.coords.latitude, pos.coords.longitude],
      radius: 50
    });
    /*if (this.orders.length == 0)*/ this.onKeyEnteredRegistration = geoQuery.on("key_entered", key => this.ordersInZone(key));
    geoQuery.on("key_exited", key => this.deleteOrders(key));
  }

  ordersInZone(key) {
    this.zone.run(
      () => this.insertOrders(key)
    )
  }
  async insertOrders(key) {
    try {
      // this.keyArray = [];
      // this.obsArray = [];
      console.log(key);
      this.keyArray.push(key);
      console.log("key array", this.keyArray);
      this.orderSubscription$ = this.db.object('/orders/')
        .take(1)
        .subscribe((resp) => {
          console.log("Object resp", resp);
          if (this.obsArray.length > 0) {
            this.obsArray.forEach((item, i) => {
              if (item.uid == key) {
                console.log("no pushing");
                this.obsArray.splice(i, 1);
              }
            })
          }else{

               this.noOrder = 'Sorry, no orders for this shop';
               console.log('noOrder',this.noOrder);
          }
          // if(resp.)
          let deadlineReached = this.deadlineReached(resp[key].delivery_time, resp[key].dateCreated)
          console.log("deadlineReached", deadlineReached);
          if (resp[key].status == "active" && !deadlineReached) {
            this.obsArray.push(resp[key]);
          }
          console.log("obsArray", this.obsArray);
          this.orderSubscription$.unsubscribe();
        });

    } catch (error) {
      this.noOrder = 'Sorry, no orders for this shop';
      console.error("error in insert Orders: ", error);
    }
    // console.log(this.orders);
  }

  async deleteOrders(key) {
    console.log("key-exis", key);
    this.obsArray.map(
      (resp, i) => {
        if (resp.uid == key) {
          this.obsArray.splice(i, 1);
        }
      }
    );
    console.log("obsArray", this.obsArray);
  }
  readyTime() {
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
    this.checkDateCreated = currentDate + "-" + currentMonth.toString() + "-" + currentYear;
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
}
