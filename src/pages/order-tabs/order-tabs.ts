import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Tabs, App, ModalController, Platform } from 'ionic-angular';
import { PushService } from "../../providers/push-service";
import { FirebaseService } from "../../providers/firebase-service";
import { GlobalVariable } from "../../app/global";
import { OneSignal } from '@ionic-native/onesignal';
import { Keyboard } from "@ionic-native/keyboard";
import { Subscription } from "rxjs/Subscription";
import { FirebaseListObservable } from 'angularfire2/database';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';


@IonicPage()
@Component({
  selector: 'page-order-tabs',
  templateUrl: 'order-tabs.html',
})
export class OrderTabs {
  @ViewChild('orderTabs') tabs: Tabs;
  tab1Root: any = 'ActiveOrders';
  tab2Root: any = 'MyOrders';
  tab3Root: any = 'OrderPickup';
  tab4Root: any = 'MyDeliveries';
  tab5Root: any = 'Profile';
  pageIndex: string = '2';
  userOrders$: FirebaseListObservable<any>;
  userDeliveries$: FirebaseListObservable<any>;
  id: any = '';
  keyOpen: Subscription;
  keyClosed: Subscription;
  userSubscription: Subscription;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public modalCtrl: ModalController,
    public platform: Platform,
    private storage: Storage,
    private ps: PushService,
    private fs: FirebaseService,
    private globals: GlobalVariable,
    private _SIGNAL: OneSignal,
    public translate: TranslateService,
    private keyboard: Keyboard,
    private app: App) {

      storage.ready().then(() => {
     });





translate.addLangs([globals.language]);

    translate.setDefaultLang(globals.language);

         // the lang to use, if the lang isn't available, it will use the current loader to get them
        translate.use(globals.language);

     this.userDeliveries$ = this.fs.getUserDeliveries();
     this.userOrders$ = this.fs.getUserOrders();

    this.pageIndex = navParams.get('pageIndex');
    if(navParams.get('id'))
    this.id = navParams.get('id');
    if (this.pageIndex == undefined || this.pageIndex == '') {
      this.pageIndex = "2";

      // this.orderTabs.select(2);
    }

    // this.listenForPushNotification();
  }

  ionViewWillEnter() {
    if (this.platform.is('android')) {
      this.keyOpen = this.keyboard.onKeyboardShow()
        .subscribe((res) => {
          // console.log(res);
          this.tabs.setTabbarHidden(true);
        })
      this.keyClosed = this.keyboard.onKeyboardHide()
        .subscribe((res) => {
          // console.log(res);
          this.tabs.setTabbarHidden(false);
        })
    }
  }

  ionViewWillLeave() {
    if (this.platform.is('android')) {
      this.keyOpen && this.keyOpen.unsubscribe();
      this.keyClosed && this.keyClosed.unsubscribe();
    }
  }
  ionViewDidLoad() {
    this.getUserOrders();
    this.getUserDeliveries();
  }


  getUserOrders() {
    // this.userOrders$ = this.fs.getUserOrders();
    this.userSubscription = this.fs.getUserOrders().subscribe(
      (resp) => {
        this.globals.myOrdersNotifications = 0;
        for (let item of resp) {
          if (item.chat_id) {
            this.storage.get(item.chat_id).then((name) => {
              this.globals.chatNotifications[item.chat_id] = name;
              this.globals.myOrdersNotifications += name;
            });
          }

          console.log('chat notifications', this.globals.chatNotifications);
          console.log('order notifications', this.globals.myOrdersNotifications);

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
          });
        }
        // userSubscription$.unsubscribe();
      }
    );
  }



  listenForPushNotification() {
    // this._SIGNAL.endInit();
  }



  orderAccepted(msg) {
    let name = msg.additionalData.name;
    let alert = this.alertCtrl.create({
      title: msg.title,
      subTitle: 'Your order will be delivered by ' + name + '. Open to chat',
      buttons: ['OK']
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
    let payload = msg.additionalData;
    let alert = this.alertCtrl.create({
      title: payload.name + " has delivered your order plase confirm",
      subTitle: payload.name + " has delivered your order from " + payload.deliveryData.shop.shop_name + " plase confirm",
      buttons: [
        {
          text: 'View Order',
          handler: data => {
            let modal = this.modalCtrl.create("OrderDeliveredModal", { payload: payload });
            modal.present();
            modal.onDidDismiss(data => {
              if (data.response == "confirm") {
                this.confirmDelivery(msg, payload.deliveryData, data.total);
              } else {
                this.fs.discardReview(payload.deliveryData.order_id);
                this.decline(msg);
              }
            })
          }
        },
        // {
        //   text: 'Confirm',
        //   handler: data => {
        //     console.log('Saved clicked');
        //     this.confirmDelivery(msg, payload.deliveryData);
        //   }
        // }
      ]
    });
    alert.present();
  }

  confirmDelivery(msg, deliveryData, total) {
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
      () => this.app.getRootNav().getActiveChildNav().select(3)
    );
  }

  decline(msg) {
    let alert = this.alertCtrl.create({
      title: "Thank you. We will ask the delivery person to provide new details",
      buttons: ["OK"]
    });
    alert.present();
    this.ps.delinceDeliveryFromBuyer(msg.additionalData.playerId);
  }

  deliveryDeclined() {
    let alert = this.alertCtrl.create({
      title: "The confirmation was declined by buyer. Edit and send again",
      buttons: ["OK"]
    });
    alert.present();
  }

  buyerConfirmation(msg) {
    let payload = msg.additionalData;
    let alert = this.alertCtrl.create({
      title: "The confirmation was accepted",
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


  deliveryCancelled(payload) {
    let data = payload.additionalData;
    let alert = this.alertCtrl.create({
      title: `${data.user} cancelled delivery. Your order is active again`,
      buttons: ["OK"]
    });
    alert.present();
  }


   profileTab($event) {

  }


}
