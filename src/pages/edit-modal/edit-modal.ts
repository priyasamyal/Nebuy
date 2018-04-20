import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { FirebaseListObservable } from 'angularfire2/database';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { GlobalVariable } from "../../app/global";
import moment from 'moment';
 import { TranslateService,TranslateModule } from '@ngx-translate/core';


// importing provider
import { FirebaseService } from '../../providers/firebase-service';

@IonicPage()
@Component({
  selector: 'page-edit-modal',
  templateUrl: 'edit-modal.html',
})
export class EditModal {
  userOrder$: FirebaseListObservable<any>;
  order: any;
  orderUID: any;
  items = [];
  isenabled:boolean;
  days: string[];
  startDay:any;
  StartTime:any;
  endDay:any;
  EndTime:any;
  currency: any;
  myDate:any;
  one:any;
  label1:any;
  label2:any;
  two:any;
  startTime:any;
  endTime:any;
  current: any;
  later: any;
  orderForm: FormGroup;
  initProd: any;
  shopName: any;
  cost: any;
  delivery_address: any;
  time: any;
  reward: any = 0;
  deliveryTimeType = 'betweenTimeOne';
  betweenTimeOne: any;
  betweenTimeTwo: any;
  lat; lng;
  products: Array<{ name: string, cost: number, images: string[] }> = [];
  data: any;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public translate: TranslateService,
     private globals: GlobalVariable,
    public formBuilder: FormBuilder,
    public fs: FirebaseService) {






    translate.addLangs([globals.language]);

    translate.setDefaultLang(globals.language);

         // the lang to use, if the lang isn't available, it will use the current loader to get them
        translate.use(globals.language);

    this.orderUID = navParams.get('orderUID');
    console.log(this.orderUID);
    this.getOrder(this.orderUID);



    this.startDay = '';
    this.endDay   = '';
    this.StartTime = '';
    this.EndTime   = '';
    this.startTime = '';
    this.endTime   = '';
    this.days = ['Sunday', 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

    this.current = moment().format('YYYY-MM-DDTHH:mm');



    console.log("date",this.current);


     this.later = moment().add(6,'d').format('YYYY-MM-DDTHH:mm');
     this.isenabled = false;

     this.orderForm = formBuilder.group({
      betweenTimeone: ['',],
      betweenTimetwo: ['',]
    });

    // this.orderForm.get('betweenTimetwo').disable();



  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EditModal');


  }

  async dismiss() {
    await this.fs.updateOrderStatus(this.orderUID, 'active', this.lat, this.lng);
    // .then(() => {
    // })
    this.viewCtrl.dismiss();
  }

   hello(){

     console.log(event);
     console.log("Hello",this.one);

     const temp = this.one;

     // sunday is 0, mon: 1, tue: 2
     // console.log(moment.parseZone(this.one).weekday());
     this.startDay = this.days[moment.parseZone(this.one).weekday()];
     this.StartTime = moment.parseZone(this.one).format('HH:mm');

     this.startTime = moment.parseZone(this.one).add(1,'h').format('YYYY-MM-DDTHH:mm');
     this.endTime = moment.parseZone(this.one).add(6,'d').format('YYYY-MM-DDTHH:mm');


     console.log('this.startDay',this.startDay);
     console.log('this.startTime',this.StartTime);
     this.two = moment.parseZone(this.one).add(1,'h').format('YYYY-MM-DDTHH:mm');


   }

  hello2(){
    console.log("Hello",this.two);

    // this.endDay = this.days[moment.parseZone(this.two).subtract(5,'h').weekday()];
    // this.EndTime = moment.parseZone(this.two).subtract(5,'h').format('HH:mm');
    this.endDay = this.days[moment.parseZone(this.two).weekday()];
    this.EndTime = moment.parseZone(this.two).format('HH:mm');
    console.log('this.endDay',this.endDay);
    console.log('this.endTime',this.EndTime);
    console.log("Hello",this.two);
    this.isenabled = true;

  }



  async getOrder(orderUID) {

    const item = await this.fs.getSpecificOrder(orderUID);

    console.log('order', item);
    this.order = item;
    this.reward = item.reward || 0;
    this.lat = item.shop.lat; this.lng = item.shop.lng;

    if (item.delivery_time.betweenTimeOne) {
      this.deliveryTimeType = 'betweenTimeOne';

      this.one = item.delivery_time.betweenTimeOne;
      this.startDay = this.days[moment.parseZone(this.one).weekday()];
      this.StartTime = moment.parseZone(this.one).format('HH:mm');

      this.startTime = moment.parseZone(this.one).add(1,'h').format('YYYY-MM-DDTHH:mm');
      this.endTime = moment.parseZone(this.one).add(6,'d').format('YYYY-MM-DDTHH:mm');

      this.two   = item.delivery_time.betweenTimeTwo;
      this.endDay = this.days[moment.parseZone(this.two).weekday()];
      this.EndTime = moment.parseZone(this.two).format('HH:mm');

    }

    this.products = item.products
  }


  async saveChanges() {
    var editData;
    let cost: number = 0;
    console.log(this.products);
    this.products.map(item => {
      cost += Number(item.cost);
    })

    // if (this.deliveryTimeType == 'betweenTimeOne') {
    //
    // }
    editData = {
      reward: this.reward,
      betweenTimeOne: this.one,
      betweenTimeTwo: this.two
    };
    console.log("the cost", cost);
    console.log('order id', this.orderUID);
    await this.fs.editOrder(this.orderUID, editData, this.products, 'betweenTimeOne', cost, this.order.location.lat, this.order.location.lng);
    await this.fs.updateOrderStatus(this.orderUID, 'active', this.order.location.lat, this.order.location.lat)
    this.viewCtrl.dismiss();
  }
}
