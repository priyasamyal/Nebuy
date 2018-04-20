import { Component,Output, EventEmitter } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, App,AlertController } from 'ionic-angular';
import { GlobalVariable } from "../../app/global";
import { FirebaseService } from '../../providers/firebase-service';
import { Subscription } from "rxjs/Subscription";
import { PushService } from "../../providers/push-service";
import { Storage } from '@ionic/storage';
import { FirebaseListObservable, AngularFireDatabase } from "angularfire2/database";
import { FormBuilder, FormGroup} from '@angular/forms';
import moment from 'moment';
import { TranslateService } from '@ngx-translate/core';



@IonicPage()
@Component({
  selector: 'page-my-orders',
  templateUrl: 'my-orders.html',

})


export class MyOrders {


  userOrders$: FirebaseListObservable<any>;
  finishedOrders$: FirebaseListObservable<any>;
  orderStatus: string;
  id:any;
  recipientName:any;
  userNames: Array<string>;
  userName:string;
  userSubscription: Subscription;
  isenabled:boolean;
  days: string[];
  item:any;
  startDay:any;
  StartTime:any;
  endDay:any;
  EndTime:any;
  currency: any;
  myDate:any;
  one:any;
  two:any;
  startTime:any;
  endTime:any;
  current: any;
  later: any;
  orderForm: FormGroup;
  cost: any;
  delivery_address: any;
  time: any;
  reward: any;
  deliveryTimeType: any;
  betweenTimeOne: any;
  betweenTimeTwo: any;
  dialog: any;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public app: App,
    private af: AngularFireDatabase,
    private ps: PushService,
    public alertCtrl: AlertController,
    public storage: Storage,
    public translate: TranslateService,
    private fs: FirebaseService,
    public formBuilder: FormBuilder,
    // private lns: LocalNotificationsService,
    private globals: GlobalVariable) {

      storage.ready().then(() => {
     });




    translate.addLangs([globals.language]);

    translate.setDefaultLang(globals.language);

         // the lang to use, if the lang isn't available, it will use the current loader to get them
        translate.use(globals.language);




    this.orderStatus = this.globals.orderStatus;
    this.finishedOrders$ = this.fs.getFinishedOrders();
    this.userOrders$ = this.fs.getUserOrders();

    this.userName = 'hello';
    this.recipientName = '';

    this.startDay = '';
    this.endDay   = '';
    this.StartTime = '';
    this.EndTime   = '';
    this.startTime = '';
    this.endTime   = '';
    this.days = ['Sunday', 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];


    this.current = moment().format('YYYY-MM-DDTHH:mm');



     this.later = moment().add(6,'d').format('YYYY-MM-DDTHH:mm');
     this.isenabled = false;

     this.orderForm = formBuilder.group({
      betweenTimeone: ['',],
      betweenTimetwo: ['',]
    });

    this.orderForm.get('betweenTimetwo').disable();



    // platform.ready().then(() => this.lns.responseToNotifications());

    // this.getUserOrders();
    // this.getFinishedOrders();
  }

  async activate() {
    console.log('activate fired');
    var editData;

    if(this.one !='' && this.two != ''){

      if(this.dialog){

        this.dialog.style.visibility = "hidden" ;
      }
      this.deliveryTimeType == 'betweenTimeOne';
      editData = {
        betweenTimeOne: this.one,
        betweenTimeTwo: this.two
      };
      await this.fs.editOrderActivate(this.item.uid, editData, this.deliveryTimeType, this.item.shop.lat, this.item.shop.lng);
    }
  }

  ionViewWillEnter() {
  }


  ngOnInit() {
  }



  ionViewDidLoad() {
    this.getUserOrders();
    // this.getFinishedOrders();
  }

  ionViewWillLeave() {
    // this.userSubscription.unsubscribe();
  }



  public async getUserOrders() {
    // this.userOrders$ = this.fs.getUserOrders();
    this.userSubscription = this.fs.getUserOrders().subscribe(
      (resp) => {
        console.log("my-orders response", resp);
        // this.globals.myOrdersNotifications = 0;
        this.userNames = new Array<string>(resp.length);
        console.log('usernames', this.userNames);
        resp.forEach((item, index) => {
          if (item.chat_id) {
            this.storage.get(item.chat_id).then((name) => {
              this.globals.chatNotifications[item.chat_id] = name;

              if(this.globals.myOrdersNotifications == 0){

                this.globals.myOrdersNotifications = name;
              }else{
                this.globals.myOrdersNotifications += name;
              }
            });
          }

          if(item.status=='active'){


              var expirydate  = moment(item.delivery_time.betweenTimeTwo).subtract(5,'h').toDate();
              var todayDate = moment(new Date());

               console.log('expired',expirydate);
                     console.log('toDate',todayDate);
                     console.log('uid',item.uid);

              if(todayDate.diff(expirydate)>0){
                     console.log('expired',expirydate);
                     console.log('toDate',todayDate);
                     console.log('uid',item.uid);

                     this.hello(item.uid,this.globals.current_userUID);



                    //this.fs.updateOrderStatus(item.uid, "in_active");
              }

          }

            if(item.seller_id){
            this.add(item.seller_id,index);
        }



        });


         // this.userSubscription.unsubscribe();

        });

  }

   hello1(event){
     this.startDay = this.days[moment.parseZone(this.one).weekday()];
     this.StartTime = moment.parseZone(this.one).format('HH:mm');
     this.startTime = moment.parseZone(this.one).add(1,'h').format('YYYY-MM-DDTHH:mm');
     this.endTime = moment.parseZone(this.one).add(6,'d').format('YYYY-MM-DDTHH:mm');
     this.orderForm.get('betweenTimetwo').enable();
  }

  hello2(){
    this.endDay = this.days[moment.parseZone(this.two).weekday()];
    this.EndTime = moment.parseZone(this.two).format('HH:mm');
    this.isenabled = true;
  }




  async Activate(item){

    this.dialog = document.getElementById('my_dialog');
    this.dialog.style.visibility = "visible" ;

    this.item = item;

    //await this.fs.updateOrderStatus(orderId, 'active')
    //await this.fs.updateOrderStatusInBuyer(this.globals.current_userUID, orderId, 'active')
  }

  async hello(uid,buyerId){

    this.fs.updateOrderStatusInBuyer(buyerId, uid, "in_active");

     const orderObject$ = this.af.object('orders/' + uid);
    try {
      const orderLocation = await this.af.object('/orders/locations/' + uid).take(1).toPromise()
      let orderLatLng = { orderLat: '', orderLng: '' };

        orderLatLng.orderLat = orderLocation.l[0];
        orderLatLng.orderLng = orderLocation.l[1];
        this.globals.updateOrderLocations = orderLatLng;
        console.log(this.globals.updateOrderLocations)
        this.af.object('/orders/locations/' + uid).remove();


      return orderObject$.update({ status: "in_active" });
    } catch (error) {
      console.error("error", error);
    }
  }

  getFinishedOrders() {
    this.finishedOrders$ = this.fs.getFinishedOrders();
    const userSubscription = this.finishedOrders$.subscribe((resp) => {
      console.log(resp);
      userSubscription.unsubscribe();
    });
  }
  deleteOrder(orderKey, chatId) {
    let status = this.fs.deleteOrder(orderKey, chatId);
    status.then(data => {
    }, (error) => {
    })
  }

  DeleteOrder(orderKey, chatId) {
    let status = this.fs.DeleteOrder(orderKey, chatId);
    status.then(data => {
    }, (error) => {
    })
  }

  async editOrder(orderUID) {
    await this.fs.updateOrderStatus(orderUID, 'in_active');
    let editModal = this.modalCtrl.create('EditModal',
      {
        orderUID: orderUID
      });
    editModal.present();
  }

 async  Confirmation(msg) {

     let noaddress,add2,add3,add4, confirmationMsg;

     const playerId = await this.fs.getPlayerId(msg.seller_id);

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
    let payload = msg;
    confirmationMsg = playerId.user_name + " "+ add2 +" "+ payload.shop.shop_name + " "+add3;
   let modal = this.modalCtrl.create("OrderDeliveredModal", { payload: payload, message: confirmationMsg });
   modal.present();
   modal.onDidDismiss((data: any) => {
     console.log('data', data);
     if (data) {
       if (data.response == "confirm") {
         this.confirmDelivery(msg, payload, data.total);
       } else {
         console.log("after decline", msg);
         // this.fs.discardReview(payload.uid);
         this.decline(msg);
       }
     }

   });
  }

 async confirmDelivery(msg, deliveryData, total) {
    console.log(deliveryData);
    console.log('finish','confirm');
    msg.buyer_id = this.globals.current_userUID;
    this.fs.finishOrders(msg, total);
     this.recipientName = await this.fs.getPlayerId(msg.seller_id);
     const userName = this.recipientName.user_name
    this.ps.confirmDeliveryFromBuyer(this.recipientName.playerId, deliveryData);
  }

  decline(msg) {
    console.log('decline', msg);
     this.fs.updateDeliveryStatus(msg.delivery_id, msg.seller_id, "delivering");
     this.fs.updateOrderStatusInBuyer(this.globals.current_userUID, msg.uid, "in_process");
     this.fs.updateOrderstatus(msg.uid, 'in_process');
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
    console.log('msg.additionalData.playerId', this.recipientName)
    this.ps.delinceDeliveryFromBuyer(this.recipientName);
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

  message(item) {
    this.app.getRootNav().push("Chat",
      {
        item: item,
        pageName: "MyOrders",
        pageNo: 1,
        recipientId: item.seller_id
      }
    );

    // this.navCtrl.push("Chat",
    //   {
    //     chatId: chatId,
    //     pageName: "MyDeliveries",
    //     pageNo: 3,
    //     recipientId: sellerId
    //   }
    // );
  }


async add(seller_id:string,index){

    const recipientName = await this.fs.getPlayerId(seller_id);
     this.userNames[index] = recipientName.user_name;
}

  someFnToRefreshParent(chatId:string){
    this.globals.myOrdersNotifications -= this.globals.chatNotifications[chatId];
}

  report(orderContent) {
    let reportModal = this.modalCtrl.create("ReportModal", { order: orderContent });
    reportModal.present();
  }

  viewDetails(order,pagename) {
    this.navCtrl.push('OrderDetails', {
      order: order,
      type:pagename,
      lastPage: 'MyOrders'
    });
  }

  chatProfile(recipientId) {
    this.navCtrl.push("ChatProfile", { recipientId: recipientId });
  }

  async rateOrder(item) {
    item.uid =  item.$key;
    this.recipientName = await this.fs.getPlayerId(item.seller_id);
    const userName = this.recipientName.user_name
    let modal = this.modalCtrl.create("RateDelivery",
      {
        name: userName,
        deliveryData: item,
        ratingFrom: 'buyer'
      });
    modal.present();
    // modal.onDidDismiss(
    //   () => this.app.getRootNav().getActiveChildNav().select(1)
    // );
  }

  hideDialog() {
    this.dialog.style.visibility = "hidden";
  }

}
