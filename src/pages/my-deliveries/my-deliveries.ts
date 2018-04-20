import { Component } from '@angular/core';
import { CurrencyPipe } from "@angular/common";
import { IonicPage, NavController, NavParams, AlertController, Platform, App, ModalController } from 'ionic-angular';
import { FirebaseService } from '../../providers/firebase-service';
import { PushService } from "../../providers/push-service";
import { FirebaseListObservable } from 'angularfire2/database';
import { GlobalVariable } from "../../app/global";
import { NativeStorage } from "@ionic-native/native-storage";
import { InAppBrowser } from "@ionic-native/in-app-browser";
import { LaunchNavigator, LaunchNavigatorOptions } from "@ionic-native/launch-navigator";
import { Subscription } from "rxjs/Subscription";
import { Storage } from '@ionic/storage';
import { TranslateService,TranslateModule } from '@ngx-translate/core';
import { ToastController } from 'ionic-angular';






@IonicPage()
@Component({
  selector: 'page-my-deliveries',
  templateUrl: 'my-deliveries.html',
})
export class MyDeliveries {
  currencyIcon: string;
  item: any;
  costErrorMessage: string;
  userDeliveries$: FirebaseListObservable<any>;
  finishedDeliveries$: FirebaseListObservable<any>;
  deliveryStatus: string = "active";
  destination: string;
  start: string;
  currency:any;
  dialog:any;
  deliveryData:any;
  key: any;
   status: any;
   orderId: any;
   buyerId: any;
   chatId: any;
   deliveryTime: any;
   dateCreated: any;
  cost:any;
  deliveryCost: any;
  userNames: Array<string>;
  userName:string;
  userSubscription$: Subscription;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public storage: Storage,
    private toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public app: App,
    public modalCtrl: ModalController,
    public translate: TranslateService,
    private globals: GlobalVariable,
    private fs: FirebaseService,
    private ns: NativeStorage,
    private platform: Platform,
    private currencyPipe: CurrencyPipe,
    private iab: InAppBrowser,
    private ps: PushService) {

      storage.ready().then(() => {
     });




    translate.addLangs([globals.language]);

    translate.setDefaultLang(globals.language);

         // the lang to use, if the lang isn't available, it will use the current loader to get them
        translate.use(globals.language);

    this.getCurrency();


    this.finishedDeliveries$ = this.fs.getFinishedDeliveries();
    this.userDeliveries$ = this.fs.getUserDeliveries();


    // this.getUserDeliveries();
    // this.getFinishedDeliveries();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Deliveries');

    this.getUserDeliveries();

    // this.getFinishedDeliveries();
  }

  ionViewWillEnter() {
  }

  ionViewWillLeave() {
    this.userSubscription$.unsubscribe();
  }

    getUserDeliveries() {
    // this.userOrders$ = this.fs.getUserOrders();
    this.userDeliveries$ = this.fs.getUserDeliveries();
    this.userSubscription$ = this.fs.getUserDeliveries().subscribe(
      (resp) => {
        console.log("my-orders response", resp);
        this.globals.myDeliveriesNotifications = 0;
        this.userNames = new Array<string>(resp.length);
        resp.forEach((item, index) => {
          if (item.chat_id) {
            this.storage.get(item.chat_id).then((name) => {
               this.globals.chatNotifications[item.chat_id] = name;

                if(this.globals.myDeliveriesNotifications == 0){

                 this.globals.myDeliveriesNotifications = this.globals.chatNotifications[item.chat_id];;
               }else{
               this.globals.myDeliveriesNotifications += this.globals.chatNotifications[item.chat_id];;
               }
            });
          }
            if(item.seller_id){
            this.add(item.buyer_id,index);
            }


        });


         // userSubscription.unsubscribe();

        });

  }



  deleteDelivery(seller_id:string,item){
    let status = this.fs.deleteDelivery(seller_id, item.$key);
    status.then(data => {
      console.log(data);
      console.log('delivery deleted');
    }, (error) => {
      console.error('Error deleting delivery: ' + error);
    })

       //this.fs.deleteDelivery(seller_id, seller_id);
  }

  async add(seller_id:string,index){

    const recipientName = await this.fs.getPlayerId(seller_id);
     this.userNames[index] = recipientName.user_name
            console.log('userName',this.userNames[index]);
    //console.log('userName',this.userName);
}


  viewDetails(order) {
    this.navCtrl.push('OrderDetails', {
      order: order,
      type:'deliveries',
      deliveryStatus: this.deliveryStatus
    });
  }
  // getUserDeliveries() {
  //   // this.userDeliveries$ = this.fs.getUserDeliveries();
  //   this.userSubscription$ = this.fs.getUserDeliveries().subscribe(
  //     (resp) => {
  //        this.globals.myDeliveriesNotifications = 0;
  //       for (let item of resp) {
  //           this.storage.get(item.chat_id).then((name) => {
  //              this.globals.chatNotifications[item.chat_id] = name;
  //              if(this.globals.myDeliveriesNotifications == 0){

  //                this.globals.myDeliveriesNotifications = this.globals.chatNotifications[item.chat_id];
  //              }else{
  //              this.globals.myDeliveriesNotifications += this.globals.chatNotifications[item.chat_id];
  //              }
  //           });

  //           this.add(item.seller_id,index);

  //       }
  //       // userSubscription$.unsubscribe();
  //     }
  //   );


  // }

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

  getFinishedDeliveries() {
    this.finishedDeliveries$ = this.fs.getFinishedDeliveries();
    const userSubscription$ = this.finishedDeliveries$.subscribe((resp) => {
      console.log(resp);
      userSubscription$.unsubscribe();
    });
  }
  message(item) {
    console.log('delivery item', item);
    this.app.getRootNav().push("Chat",
      {
        item,
        pageName: "MyDeliveries",
        pageNo: 3,
        recipientId: item.buyer_id
      }
    );
  }

  confirm(deliveryData) {
    this.deliveryData = deliveryData;
    this.dialog = document.getElementById('my_confirm_dialog');
    this.dialog.style.visibility = "visible" ;
  }

   CancelDialog(){

     this.cost = 0;

this.dialog.style.visibility = "hidden";

  }

  async confirmdelivery() {

     console.log('confirm delivery');

    let noaddress;

    this.translate.get('Please enter cost').subscribe((res: string) => {

     noaddress = res;


    //await this.translate.instant('Saved Address list');
});

      if (this.cost > 0 && this.deliveryCost > 0) {
        this.confirmDelivery(this.deliveryData,this.cost, this.deliveryCost);
        this.dialog.style.visibility = "hidden";
        this.costErrorMessage = '';
      }

      if(!(this.cost>0 || this.deliveryCost > 0)){
        this.costErrorMessage = noaddress;
      }

      // else{
      //   let toast = this.toastCtrl.create({
      //     message: noaddress,
      //     duration: 3000,
      //     position: 'center'
      //   });
      // }
  }

  async confirmDelivery(deliveryData, cost, deliveryCost) {

    let add4,ok;

     this.translate.get('Waiting for buyer\'s confirmation').subscribe((res: string) => {

     add4 = res;


    //await this.translate.instant('Saved Address list');
});

 this.translate.get('Ok').subscribe((res: string) => {

     ok = res;


    //await this.translate.instant('Saved Address list');
});

    let alert = this.alertCtrl.create({
      title: add4,
      buttons: [ok]
    });

    alert.present();
    console.log('actual total cost', cost);
    console.log('delivery cost', deliveryCost);
    const deliveryCosts = {
      actual_cost: cost,
      delivery_cost: deliveryCost
    };
    deliveryData = Object.assign(deliveryData, deliveryCosts);
    // TODO: update orders and deliveries to have both actual_cost and delivery_cost
    // Only show these in confirm status

    console.log('delivery data', deliveryData);
    await this.fs.updateDeliveryStatus(deliveryData.uid, deliveryData.seller_id, 'comfirming', deliveryCosts);

    // TODO: temporarily comment out this line
    await this.fs.addDeliveryStatus(deliveryData.uid, deliveryData.order_id,deliveryData.buyer_id);
    await this.fs.updateOrderStatus(deliveryData.order_id, 'Confirmation');
    await this.fs.updateOrderStatusInBuyer(deliveryData.buyer_id, deliveryData.order_id, 'Confirmation', deliveryCosts);
    const playerId = await this.fs.getPlayerId(deliveryData.buyer_id);
    console.log("playerId", playerId.playerId);

    const notification = await this.ps.confirmDeliveryFromSeller(playerId.playerId, deliveryData, cost);
    this.cost = 0;
    this.deliveryCost = 0;
    console.log("notificaiton", notification);
  }

  navigateToDropoff(lat, lng, name) {
    console.log(lat); console.log(lng);
    let destination = lat.toString() + ',' + lng.toString();
    console.log("destination", destination);
    let label = encodeURI(name);
    console.log("label", label);
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

  report(orderData) {
    let modal = this.modalCtrl.create("ReportModalPage",
      {
        orderData: orderData,
        from: 'my-deliveries'
      });
    modal.present();
  }

  async cancelDelivry()
  {
    this.dialog.style.visibility = "hidden" ;


      console.log(this.deliveryTime);
    console.log(this.orderId); // update status to active
    console.log(this.buyerId); // update status to active
    console.log(this.chatId);  // delete
    console.log(this.key);     // delete
    console.log(this.dateCreated);

    let deadlineReached = this.deadlineReached(this.deliveryTime, this.dateCreated);
    console.log("deadlineReached", deadlineReached);
    const playerId = await this.fs.getPlayerId(this.buyerId);
    console.log("playerId", playerId.playerId)

    await this.ps.cancelOrderNotification(playerId.playerId)
    await this.fs.updateOrderStatus(this.orderId, 'active')
    await this.fs.updateOrderStatusInBuyer(this.buyerId, this.orderId, 'active')
    await this.fs.removeDeliveryInCurrentUser(this.key, this.orderId);

    //TODO: Remove order messages count from buyer

  }

  async cancelOrder(item) {
    // if (deliveryTime.anyTime) {

    // }

    this.item = item;
    this.dialog = document.getElementById('my-dialog');
   this.dialog.style.visibility = "visible" ;

   this.key = item.$key;
   this.status = item.status;
   this.orderId = item.order_id;
   this.buyerId = item.buyer_id;
   this.chatId = item.chat_id;
   this.deliveryTime = item.delivery_time;
   this.dateCreated = item.dateCreated;




    // if (deadlineReached) {
    //   this.fs.deleteOrder(orderId, chatId, buyerId);
    //   await this.fs.removeDeliveryInCurrentUser(key, orderId);
    // } else {
    //   await this.fs.updateOrderStatus(orderId, 'active')
    //   await this.fs.updateOrderStatusInBuyer(buyerId, orderId, 'active')
    //   await this.fs.removeDeliveryInCurrentUser(key, orderId);
    // }

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

  async rateDelivery(deliveryData) {
    deliveryData.uid =  deliveryData.$key;
    console.log(deliveryData);
    console.log('item from my deliveries', deliveryData);
    console.log('uid', deliveryData.uid);
    const user = await this.fs.getPlayerId(deliveryData.buyer_id);
    const name = user.user_name
     console.log(deliveryData);
    let modal = this.modalCtrl.create("RateDelivery",
      {
        name,
        deliveryData,
        ratingFrom: 'seller'
      });
    modal.present();
  }


  getCurrency() {
    if(this.globals.currency!=null && this.globals.currency!='invalid' && this.globals.currency!='EUR' && this.globals.currency!='USD'){

      this.currency = 'EUR';
    }else{

      this.currency = this.globals.currency
    }
    this.currencyIcon = 'ai-'+ this.globals.currency;
  }
}
