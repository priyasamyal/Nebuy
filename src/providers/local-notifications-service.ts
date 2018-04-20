import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
// import { IonicPage, NavController, NavParams, AlertController, Tabs, App, ModalController, Platform } from 'ionic-angular';
// import { LocalNotifications } from "@ionic-native/local-notifications";
import { GlobalVariable } from "../app/global";
import { FirebaseListObservable } from 'angularfire2/database';
import { AlertController, ModalController, App } from 'ionic-angular';
import { FirebaseService } from "./firebase-service";
import { PushService } from "./push-service";
import { OneSignal } from '@ionic-native/onesignal';
import { NativeStorage } from "@ionic-native/native-storage";
import { Storage } from '@ionic/storage';
import { Subscription } from "rxjs/Subscription";
import { TranslateService,TranslateModule } from '@ngx-translate/core';




@Injectable()
export class LocalNotificationsService {

  notifyTime: any;
  notifications: any[] = [];
  days: any[];
  userOrders$: FirebaseListObservable<any>;
  userDeliveries$: FirebaseListObservable<any>;
  chosenHours: number;
  chosenMinutes: number;
  userSubscription: Subscription;

  constructor(public http: Http,
    private globals: GlobalVariable,
    private ns: NativeStorage,
    private fs: FirebaseService,
    private ps: PushService,
    private storage:Storage,
    public translate: TranslateService,
    private _SIGNAL: OneSignal,
    public alertCtrl: AlertController,
    public modalCtrl: ModalController,
    public app: App) {
    console.log('Hello LocalNotificationsService Provider');
     storage.ready().then(() => {
     });

     translate.addLangs([globals.language]);

    translate.setDefaultLang(globals.language);

         // the lang to use, if the lang isn't available, it will use the current loader to get them
        translate.use(globals.language);

    this.userOrders$ = this.fs.getUserOrders();
    this.userDeliveries$ = this.fs.getUserDeliveries();

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MyOrders');
    // this.getUserOrders();
    // this.getUserDeliveries();
    // this.getFinishedOrders();
  }

  ionViewWillLeave() {
    this.userSubscription.unsubscribe();
  }

  getUserOrders() {
    // this.userOrders$ = this.fs.getUserOrders();
    this.userSubscription = this.fs.getUserOrders().subscribe(
      (resp) => {
        console.log("my-orders response", resp);
         this.globals.myOrdersNotifications = 0;
        for (let item of resp) {
          if (item.chat_id) {
            this.storage.get(item.chat_id).then((name) => {
               this.globals.chatNotifications[item.chat_id] = name;
               this.globals.myOrdersNotifications += name;
               console.log("my-orders",this.globals.chatNotifications[item.chat_id]);
            });
          }

         // userSubscription.unsubscribe();
      }

      }
    );
  }

    getUserDeliveries() {
    // this.userDeliveries$ = this.fs.getUserDeliveries();
    this.userSubscription = this.fs.getUserDeliveries().subscribe(
      (resp) => {
         this.globals.myDeliveriesNotifications = 0;
        for (let item of resp) {
            this.storage.get(item.chat_id).then((name) => {
               this.globals.chatNotifications[item.chat_id] = name;
               this.globals.myDeliveriesNotifications += name;
               console.log("my-deliveries",this.globals.chatNotifications[item.chat_id]);
            });
        }
        // userSubscription$.unsubscribe();
      }
    );
    }

  scheduleNotifiction(date, month, year, time, orderData) {
    let myDate = new Date();
    console.log("time", time);
    if (time.anyTime) {
      let hours = time.anyTime.substring(0, time.anyTime.indexOf(":"));
      let minutes = time.anyTime.substring(time.anyTime.indexOf(":") + 1, time.anyTime.length);
      myDate.setHours(Number(hours));
      myDate.setMinutes(Number(minutes) - 1);
      this.ps.orderExpired(myDate, orderData.orderId, orderData.chatRef);
    } else {
      let betweenTime = time.betweenTimeTwo;
      let date = betweenTime.substring(0, betweenTime.indexOf('T'));
      let hm = betweenTime.substring(betweenTime.indexOf('T') + 1, betweenTime.indexOf('Z'))

      let year = date.substring(0, date.indexOf('-'));
      let month = date.substring(date.indexOf('-') + 1, date.lastIndexOf('-'));
      let day = date.substring(date.lastIndexOf('-') + 1);
      let hours = hm.substring(0, hm.indexOf(':'));
      let minutes = hm.substring(hm.indexOf(':') + 1, hm.lastIndexOf(':'))

      myDate.setFullYear(Number(year));
      myDate.setMonth(Number(month - 1));
      myDate.setDate(Number(day));
      myDate.setHours(Number(hours));
      myDate.setMinutes(Number(minutes) - 1);

      this.ps.orderExpired(myDate, orderData.orderId, orderData.chatRef);
    }
  }

  responseToNotifications() {
    this._SIGNAL.handleNotificationReceived()
      .subscribe(async (msg) => {
        console.log('Notification received');
        console.dir(msg);
        if (msg.payload.additionalData.type == "orderAccepted") this.orderAccepted(msg.payload);
        if (msg.payload.additionalData.type == "confirmDelivery") this.orderDelivered(msg.payload);
        if (msg.payload.additionalData.type == "buyerConfirmation") this.buyerConfirmation(msg.payload);
        if (msg.payload.additionalData.type == "orderNearby") this.orderNearby();
        if (msg.payload.additionalData.type == "msgNotification") this.recieveMsgs(msg.payload, 'received');
        if (msg.payload.additionalData.type == "declineDelivery") this.deliveryDeclined();
        if (msg.payload.additionalData.type == "cancelOrder") this.deliveryCancelled(msg.payload);
      });

    this._SIGNAL.handleNotificationOpened()
      .subscribe(async (msg) => {
        console.log('Notification opened');
        console.log("msg", msg);
        if (msg.notification.payload.additionalData.type == "orderAccepted") this.orderAccepted(msg.notification.payload);
        if (msg.notification.payload.additionalData.type == "confirmDelivery") this.orderDelivered(msg.notification.payload);
        if (msg.notification.payload.additionalData.type == "buyerConfirmation") this.buyerConfirmation(msg.notification.payload);
        if (msg.notification.payload.additionalData.type == "orderNearby") this.orderNearby();
        if (msg.notification.payload.additionalData.type == "msgNotification") this.recieveMsgs(msg.notification.payload, 'opened');
        if (msg.notification.payload.additionalData.type == "declineDelivery") this.deliveryDeclined();
        if (msg.notification.payload.additionalData.type == "cancelOrder") this.deliveryCancelled(msg.notification.payload);

      });

    // this._SIGNAL.endInit();
  }

//   recieveMsg(msg, type: string) {
//     console.log("msg-local", msg);
//     let pageNo = Number(msg.additionalData.pageNo);
//     let chatId = msg.additionalData.chatId;
//     let senderName = msg.additionalData.name;
//     console.log("senderName-local", senderName)

//   if (pageNo == 3) {
//     if (this.globals.chatNotifications[chatId] >= 1) {
//       this.globals.chatNotifications[chatId] +=  1;


//     } else
//     {
//       this.globals.chatNotifications[chatId] = 1;
//     }

//     this.globals.myOrdersNotifications  += 1;
//      console.log("local1",this.globals.myOrdersNotifications);
//      console.log("local2",this.globals.chatNotifications[chatId]);
//     }else{

//       if (this.globals.chatNotifications[chatId] >= 1) {
//       this.globals.chatNotifications[chatId] += 1;


//     } else
//     {
//       this.globals.chatNotifications[chatId] = 1;

//     }

//     this.globals.myDeliveriesNotifications  += 1;


//  console.log("local3",this.globals.myDeliveriesNotifications);
//      console.log("local4",this.globals.chatNotifications[chatId]);

//     }

//     this.storage.set(chatId, this.globals.chatNotifications[chatId]);


//      //this.app.getRootNav().getActiveChildNav().select(pageNo);
//   }

  orderAccepted(msg) {

      let noaddress,add2,add3;

        this.translate.get('Your order will be delivered by').subscribe((res: string) => {

     noaddress = res;


    //await this.translate.instant('Saved Address list');
});

   this.translate.get('Open to chat').subscribe((res: string) => {

     add2 = res;


    //await this.translate.instant('Saved Address list');
});

this.translate.get('Ok').subscribe((res: string) => {

     add3 = res;


    //await this.translate.instant('Saved Address list');
});
    console.log("orderAccepted", msg);

    let name = msg.additionalData.name;
    let alert = this.alertCtrl.create({
      title: msg.title,
      subTitle: noaddress+ " " + name + ". " + add2,
      buttons: [add3]
    });
    alert.present();
    alert.onDidDismiss(
      () => {
        this.globals.orderStatus = "in_process";
        this.app.getRootNav().getActiveChildNav().select(1)
      }
    )
  }

  orderDelivered(msg) {

     let noaddress,add2,add3,add4;

        this.translate.get('has delivered your order please confirm').subscribe((res: string) => {

     noaddress = res;


    //await this.translate.instant('Saved Address list');
});

   this.translate.get('has delivered your order from').subscribe((res: string) => {

     add2 = res;


    //await this.translate.instant('Saved Address list');
});

 this.translate.get('please confirm').subscribe((res: string) => {

     add3 = res;


    //await this.translate.instant('Saved Address list');
});

this.translate.get('View Order').subscribe((res: string) => {

     add4 = res;


    //await this.translate.instant('Saved Address list');
});
    let payload = msg.additionalData;
    let confirmationMsg = payload.name + " "+ add2 +" "+ payload.deliveryData.shop.shop_name + " "+add3;

    let alert = this.alertCtrl.create({
      title: payload.name + " "+ noaddress,
      subTitle: payload.name + " "+ add2 + payload.deliveryData.shop.shop_name + " "+add3,
      buttons: [
        {
          text: add4,
          handler: data => {
            let modal = this.modalCtrl.create("OrderDeliveredModal", { payload: payload.deliveryData,  message: confirmationMsg });
            modal.present();
            modal.onDidDismiss(data => {
              if (data.response == "confirm") {
                this.confirmDelivery(msg, payload.deliveryData, data.total);
              } else {
                console.log("after decline", msg);
                this.fs.discardReview(payload.deliveryData.order_id);
                this.decline(msg);
              }
            })
          }
        },
      ]
    });
    alert.present();
  }

  confirmDelivery(msg, deliveryData, total) {
    console.log(deliveryData);
    console.log('finish','confirm');
    this.fs.finishOrder(deliveryData, total);
    this.ps.confirmDeliveryFromBuyer(msg.additionalData.playerId, deliveryData);
    // this.rateDelivery(msg.additionalData.name, deliveryData);
    let modal = this.modalCtrl.create("RateDelivery",
      {
        name: msg.additionalData.name,
        deliveryData: deliveryData,
        ratingFrom: 'buyer'
      });
    modal.present();
    modal.onDidDismiss(
      () => this.app.getRootNav().getActiveChildNav().select(1)
    );


  }

  decline(msg) {

     let noaddress;

        this.translate.get('Thank you. We will ask the delivery person to provide new details').subscribe((res: string) => {

     noaddress = res;


    //await this.translate.instant('Saved Address list');
});
    let alert = this.alertCtrl.create({
      title: noaddress,
      buttons: ["OK"]
    });
    alert.present();
    console.log('msg.additionalData.playerId', msg.additionalData.playerId)
    this.ps.delinceDeliveryFromBuyer(msg.additionalData.playerId);
  }

  deliveryDeclined() {

     let noaddress;

        this.translate.get('The confirmation was declined by buyer. Edit and send again').subscribe((res: string) => {

     noaddress = res;


    //await this.translate.instant('Saved Address list');
});
    let alert = this.alertCtrl.create({
      title: noaddress,
      buttons: ["OK"]
    });
    alert.present();
  }

  buyerConfirmation(msg) {

     let noaddress;

        this.translate.get('The confirmation was accepted').subscribe((res: string) => {

     noaddress = res;


    //await this.translate.instant('Saved Address list');
});
    let payload = msg.additionalData;
    let alert = this.alertCtrl.create({
      title: noaddress,
      buttons: ["OK"]
    });
    alert.present();


    alert.onDidDismiss(
      () => this.app.getRootNav().getActiveChildNav().select(3)
    )
  }

  rateDelivery(name, deliveryData) {
    let modal = this.modalCtrl.create("RateDelivery", { name: name, deliveryData: deliveryData });
    modal.present();
    modal.onDidDismiss(
      () => this.app.getRootNav().getActiveChildNav().select(3)
    );
  }

  orderNearby() {
    this.app.getRootNav().getActiveChildNav().select(0);
  }

 recieveMsgs(msg, type: string) {

    let noaddress;

        this.translate.get('You received a message from user').subscribe((res: string) => {

     noaddress = res;


    //await this.translate.instant('Saved Address list');
});
    console.log("msg-local", msg);
    let pageNo = Number(msg.additionalData.pageNo);
    let chatId = msg.additionalData.chatId;
    let senderName = msg.additionalData.name;
    console.log("senderName-local", senderName)
    let alert = this.alertCtrl.create({
      title: noaddress+" " + senderName,
      buttons: ["OK"]
    });

    if (type = 'opened') alert.present();



  if (pageNo == 3) {
    console.log('chat notifications', this.globals.chatNotifications[chatId]);
    if (this.globals.chatNotifications[chatId] >= 1) {
      this.globals.chatNotifications[chatId] +=  1;



    } else
    {
      this.globals.chatNotifications[chatId] = 1;
    }

     if(this.globals.myOrdersNotifications == 0){

                 this.globals.myOrdersNotifications = this.globals.chatNotifications[chatId];
               }else{
               this.globals.myOrdersNotifications += 1;
               }
     console.log("page-local",this.globals.myOrdersNotifications);
     console.log("pageName-local",this.globals.chatNotifications[chatId]);
    }else{

      if (this.globals.chatNotifications[chatId] >= 1) {
      this.globals.chatNotifications[chatId] += 1;


    } else
    {
      this.globals.chatNotifications[chatId] = 1;

    }

     if(this.globals.myDeliveriesNotifications == 0){

                 this.globals.myDeliveriesNotifications = this.globals.chatNotifications[chatId];
               }else{
               this.globals.myDeliveriesNotifications += 1;
               }


 console.log("page-local",this.globals.myDeliveriesNotifications);
     console.log("pageName-local",this.globals.chatNotifications[chatId]);

    }

    this.storage.set(chatId, this.globals.chatNotifications[chatId]);


     //this.app.getRootNav().getActiveChildNav().select(pageNo);
  }
  deliveryCancelled(payload) {
     let noaddress;

        this.translate.get('cancelled delivery. Your order is active again').subscribe((res: string) => {

     noaddress = res;


    //await this.translate.instant('Saved Address list');
});


    let data = payload.additionalData;
    let alert = this.alertCtrl.create({
      title: data.user+ " "+ noaddress,
      buttons: ["OK"]
    });
    alert.present();
  }

  myOrdersTab($event) {
    // console.log($event);
    console.log("my orders tab clicked");
    //this.globals.myOrdersNotifications = '';
  }

  myDeliveriesTab($event) {
    console.log("my deliveries clicked");
    //this.globals.myDeliveriesNotifications = '';
  }

}
