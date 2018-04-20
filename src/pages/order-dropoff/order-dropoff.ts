import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController, LoadingController, AlertController, App, Platform } from 'ionic-angular';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
// import { NativeStorage } from "@ionic-native/native-storage";

import { GoogleMaps } from '../../providers/google-maps';
import { PlaceModel } from '../../models/place-model';
import { FirebaseService } from '../../providers/firebase-service';
import { PushService } from "../../providers/push-service";
import { LocalNotificationsService } from "../../providers/local-notifications-service";
import { GlobalVariable } from "../../app/global";
import { Geolocation } from "@ionic-native/geolocation";
import { Keyboard } from "@ionic-native/keyboard";
import { FirebaseListObservable, /*FirebaseObjectObservable,*/ AngularFireDatabase } from "angularfire2/database";
import { Subscription } from "rxjs/Subscription";
import moment from 'moment';
import { ToastController } from 'ionic-angular';
import { TranslateService,TranslateModule } from '@ngx-translate/core';

 import { DatePipe } from '@angular/common';
declare var google;




@IonicPage()
@Component({
  selector: 'page-order-dropoff',
  templateUrl: 'order-dropoff.html',
})




export class OrderDropoff implements OnInit {

  fruits: any[];
  days: string[];
  startDay:any;
  StartTime:any;
  endDay:any;
  EndTime:any;
  currency: any;
  myDate:any;
  one:any;
  two:any;
  submitAttempt: boolean = false;
  products: any;
  orderPickupDetails: any;
  shopDetails: any;
  element: HTMLElement;
  dropoffPicture: any;
  deliveryTimeType: any;
  timeType: string = "anyTime";
  startTime:any;
  endTime:any;
  current: any;
  later: any;

  currentHours: any;
  nextMonth: any;
  nextSevenDays: any;
  currentMinutes: any;
  timmingType: string = 'anyTime';
  checked: boolean = true;
  clearInput: boolean = true;
  clearOnEdit: boolean = true;
  autocompleteItems: any;
  autocomplete: any;
  orderForm: FormGroup;
  totalEstimate: any;
  dropoffAddressDetails = {
    formatted_address: '',
    name: '',
    placeId: '',
    lat: '',
    lng: '',
  }
  currentDay; currentMonth; currentYear;
  addressList: /*FirebaseListObservable<any>*/any;
  month: any; date: any;
  keyOpen: Subscription;
  keyClosed: Subscription;
  isKeyboardOpen: boolean = false;

  constructor(public navCtrl: NavController,
  public datepipe: DatePipe,
    public navParams: NavParams,
    public menu: MenuController,
    private toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public formBuilder: FormBuilder,
    public platform: Platform,
    public gm: GoogleMaps,
    public translate:TranslateService,
    private lns: LocalNotificationsService,
    private globals: GlobalVariable,
    private geolocation: Geolocation,
    private app: App,
    private fs: FirebaseService,
    private af: AngularFireDatabase,
    private keyboard: Keyboard,
    private ps: PushService) {





     translate.addLangs([globals.language]);

        translate.setDefaultLang(globals.language);

         // the lang to use, if the lang isn't available, it will use the current loader to get them
        translate.use(globals.language);



       if(this.globals.currency!=null && this.globals.currency!='invalid' && this.globals.currency!='EUR' && this.globals.currency!='USD'){

        this.currency = 'EUR';
      }else{

       this.currency = this.globals.currency;
      }

    this.shopDetails = navParams.get("shopDetails");
    this.orderPickupDetails = navParams.get("orderPickupDetails");
    this.products = navParams.get("products");
    this.totalEstimate = navParams.get('totalEstimate');


    // this.current  = (new Date()).toISOString();


    this.one = '';
    this.two ='';


    this.startDay = '';
    this.endDay   = '';
    this.StartTime = '';
    this.EndTime   = '';
    this.days = ['','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

    this.current = moment().format('YYYY-MM-DDTHH:mm');





    // this.currentYear = currentDateTime;
    // this.currentMonth = currentDateTime.getMonth() + 1;
    // this.currentDay = currentDateTime.getDate();
    console.log("date",this.current);


     this.later = moment().add(6,'d').format('YYYY-MM-DDTHH:mm');
      console.log("date2",this.later);





    //var temp = new Date(this.orderForm.value.betweenTimeOne.toString());
   // var temp1 = new Date(this.orderForm.value.betweenTimeOne.toString());

   //this.startTime = temp1.toISOString;
   // temp.setDate(temp.getDate()+ 6);
   // this.endTime  = temp.toISOString();

  //  this.nextMonth = currentDateTime.getMonth() + 1;
  //  this.nextSevenDays = currentDateTime.getDay();





    // if (this.currentMonth.toString().length === 1) {
    //   this.currentMonth = "0" + this.currentMonth;
    // }
    // if (this.currentDay.length === 1) {
    //   this.currentDay = "0" + this.currentDay;
    // }
    // let currentHours = currentDateTime.getHours() + 1
    // if (currentHours.toString().length === 1) {
    //   this.currentHours = "0" + currentHours;
    // } else if ((currentHours - 1) == 23) {
    //   this.currentHours = "00";
    // } else {
    //   this.currentHours = currentHours;
    // }
    // console.log('this.currentHours', this.currentHours,this.nextSevenDays,this.currentYear,this.currentDay);

    // let currentMinutes = currentDateTime.getMinutes().toString();
    // if (currentMinutes.length === 1) {
    //   this.currentMinutes = "0" + currentMinutes;
    // } else {
    //   this.currentMinutes = currentMinutes;
    // }
    // console.log("this.currentMinutes", this.currentMinutes);

    this.deliveryTimeType = new FormGroup({
      "deliveryTimeType": new FormControl({ value: 'anytime', disabled: false })
    });

    this.orderForm = formBuilder.group({
      reward: ['', Validators.required],
      anyTime: ['',],
      betweenTimeOne: ['',],
      betweenTimeTwo: ['',]
    });

    this.orderForm.get('betweenTimeTwo').disable();
  }

  ngOnInit() {
    this.element = document.getElementById('map')
    this.autocompleteItems = [];
    this.autocomplete = {
      query: ''
    };
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad OrderDropoff');



  }

  ionViewWillEnter() {



    if (this.platform.is('android')) {
      this.keyOpen = this.keyboard.onKeyboardShow()
        .subscribe(() => {
          this.isKeyboardOpen = true;
        })
      this.keyClosed = this.keyboard.onKeyboardHide()
        .subscribe(() => {
          this.isKeyboardOpen = false;
        })
    }
  }

  ionViewWillLeave() {
    if (this.platform.is('android')) {
      this.keyOpen.unsubscribe();
      this.keyClosed.unsubscribe();
    }
  }

  radioSelect($event) {
    console.log('radio button selected')
    console.log($event);
    this.timeType = $event;
    if ($event === 'specificTime') {
      this.orderForm.get('betweenTimeOne').enable();
      this.orderForm.get('betweenTimeTwo').enable();
      this.orderForm.get('anyTime').disable();
    } else if ($event === 'anyTime') {
      this.orderForm.get('betweenTimeOne').disable();
      this.orderForm.get('betweenTimeTwo').disable();
      this.orderForm.get('anyTime').enable();
    }
  }

  hideCancel(){

     (<HTMLElement>document.getElementsByClassName('picker-button')[0]).style.visibility = 'hidden';
    (<HTMLElement>document.getElementsByClassName('picker-button')[1]).style.color = '#029ff9';
  }

  hello(){



    console.log("Hello",this.one);


    const temp = this.one;


this.startDay = this.days[moment(this.one).subtract(5,'h').weekday()];
this.StartTime = moment(this.one).subtract(5,'h').format('HH:mm');

this.startTime = moment(this.one).subtract(5,'h').add(1,'m').format('YYYY-MM-DDTHH:mm');
    this.endTime = moment(this.one).add(6,'d').format('YYYY-MM-DDTHH:mm');

//this.one = this.startDay+"\n"+this.StartTime;

console.log('this.startDay',this.startDay);
console.log('this.startTime',this.StartTime);

    this.orderForm.get('betweenTimeTwo').enable();


  //   var temp = new Date(this.datepipe.transform(this.one));
  //  var temp1 = new Date(this.datepipe.transform(this.one));

  //  console.log("transformDate",temp);
  //  console.log("transformDate",temp1);

  //   temp.setDate(temp.getDate());
  //  this.startTime = temp1.toISOString();
  //  temp.setDate(temp.getDate()+ 6);
  //  this.endTime  = temp.toISOString();





  }

  hello2(){



    console.log("Hello",this.two);

this.endDay = this.days[moment(this.two).subtract(5,'h').weekday()];
this.EndTime = moment(this.two).subtract(5,'h').format('HH:mm');


//this.one = this.startDay+"\n"+this.StartTime;

console.log('this.endDay',this.endDay);
console.log('this.endTime',this.EndTime);



  //   var temp = new Date(this.datepipe.transform(this.one));
  //  var temp1 = new Date(this.datepipe.transform(this.one));

  //  console.log("transformDate",temp);
  //  console.log("transformDate",temp1);

  //   temp.setDate(temp.getDate());
  //  this.startTime = temp1.toISOString();
  //  temp.setDate(temp.getDate()+ 6);
  //  this.endTime  = temp.toISOString();





  }

  startDate(){

   this.startDay = '';
   this.StartTime ='';
   this.endDay = '';
   this.EndTime ='';
   this.one = '';
   this.two = '';

  }

  endDate(){

    this.endDay = '';
    this.EndTime ='';
    this.two = '';
  }


removeError(){
  this.submitAttempt = false;
  console.log("hello","hello");
  (<HTMLElement>document.getElementsByClassName('searchbar-search-icon')[0]).style.display= 'inline';
 (<HTMLElement>document.getElementsByClassName('searchbar-input')[0]).style.paddingLeft = '30px';

}

  search() {
console.log("llo","llo");


    this.submitAttempt = false;

    console.log("autocomplete query: ", this.autocomplete.query);
    if (this.autocomplete.query == '') {
      this.autocompleteItems = [];
      return;
    }
    var pyrmont = new google.maps.LatLng(this.globals.lat, this.globals.lng);
    let request = {
      location: pyrmont,
      radius: '5000',
      query: this.autocomplete.query,
    }
    let self = this;
    let service = new google.maps.places.PlacesService(this.element);
    service.textSearch(request, (results, status) => {
      console.log(status);
      if (status == 'OK') {
         (<HTMLElement>document.getElementsByClassName('searchbar-search-icon')[0]).style.display= 'none';
   (<HTMLElement>document.getElementsByClassName('searchbar-input')[0]).style.paddingLeft = '6px';
        this.autocompleteItems = results;

      }
      console.log(results);
    })
  }

  chooseItem(item) {
    this.autocompleteItems = [];
    this.autocomplete.query = item.name + " " + item.formatted_address;
    console.log(item);
    this.dropoffAddressDetails.formatted_address = item.formatted_address;
    this.dropoffAddressDetails.name = item.name;
    this.dropoffAddressDetails.lat = item.geometry.location.lat();
    this.dropoffAddressDetails.lng = item.geometry.location.lng();
    this.dropoffAddressDetails.placeId = item.place_id;
    if (item.photos) {
      this.dropoffPicture = item.photos[0].getUrl({ 'maxWidth': 300, 'maxHeight': 150 });
    }
  }

  async addOrder() {

    let Message ;
    this.translate.get('kindly fill all the fields first').subscribe(
  value => {
    // value is our translated string
    Message = value;
  }
)

    if ( this.dropoffAddressDetails.name == ''|| this.one =='' || this.two == '') {
         //this.submitAttempt = true;
          let toast = this.toastCtrl.create({
    message: Message,
    duration: 3000,
    position: 'center'
  });

  toast.onDidDismiss(() => {
    console.log('Dismissed toast');
  });

  toast.present();

         this.dropoffAddressDetails.formatted_address = '';
      console.log("no ways");
    } else {

      try {
        this.initiateLoader("Placing your order")
        console.log(this.orderForm.value);
        console.log(this.shopDetails);
        // console.log(this.orderPickupDetails);
        console.log(this.products);
        console.log(this.dropoffAddressDetails);

        let dateCreated = this.getCreationDate();

        const addOrder = await this.fs.addOrder(
          this.totalEstimate,
          this.shopDetails,
          this.dropoffAddressDetails,
          // this.orderPickupDetails,
          this.products,
          dateCreated
        );
        console.log("order added", addOrder);
        let time;

          time = { betweenTimeOne: this.orderForm.value.betweenTimeOne, betweenTimeTwo: this.orderForm.value.betweenTimeTwo };

        // this.lns.scheduleNotifiction(this.date, this.currentDay, this.currentYear, time, addOrder);

         this.navCtrl.popToRoot();
        // this.app.getRootNav().getActiveChildNav().select(1);
        this.app.getRootNav().getActiveChildNav().select(1);
        // this.ps.sendLocationNotification(this.globals.orderLat.toString(), this.globals.orderLng.toString());
      } catch (error) {
        let alert = this.alertCtrl.create({
          title: "Error",
          subTitle: error,
          buttons: ['Try Again']
        });
        alert.present();
      }




    }
  }

  getCreationDate() {
    let currentDateTime = new Date();
    let currentYear = currentDateTime.getFullYear().toString();
    let currentMonth = currentDateTime.getMonth() + 1;
    let currentDate = currentDateTime.getDate().toString();
    this.date = currentDate; this.month = currentMonth - 1
    let dateCreated = currentDate + "-" + currentMonth.toString() + "-" + currentYear;
    console.log("dateCreated", dateCreated);
    return dateCreated;
  }
  initiateLoader(content: string) {
    let loader = this.loadingCtrl.create({
      // content: content,
      duration: 2500,
      dismissOnPageChange: true,
      spinner: 'hide',
      content: `<img src="assets/img/loader.gif" style="width:50%">`
    });
    loader.present();
  }

  setCurrentLocation() {
    console.log("yo wattup");
    let loader = this.loadingCtrl.create({
      // content: content,
      duration: 2500,
      dismissOnPageChange: true,
      spinner: 'hide',
      content: `<img src="assets/img/loader.gif" style="width:50%">`
    });
    loader.present();
    var geocoder = new google.maps.Geocoder;
    this.geolocation.getCurrentPosition()
      .then((resp) => {
        let latlng = { lat: resp.coords.latitude, lng: resp.coords.longitude }
        geocoder.geocode({ 'location': latlng }, (results, status) => {
          console.log(status);
          console.log(results);
          if (status == 'OK') {
            this.getPlaceDetails(results[0].place_id);
            loader.dismiss();
          }
        }, error => {
          console.error('error getting location: ' + error);
        });
      })

  }
  getPlaceDetails(place_id: string) {
    let request = {
      placeId: place_id
    };
    console.log("details for place id: ", place_id);
    let service = new google.maps.places.PlacesService(this.element);
    service.getDetails(request, (place, status) => {
      console.log(status);
      console.log("placae details");
      console.log(place);
      this.dropoffAddressDetails.formatted_address = place.formatted_address;
      this.dropoffAddressDetails.name = place.name;
      this.dropoffAddressDetails.lat = place.geometry.location.lat();
      this.dropoffAddressDetails.lng = place.geometry.location.lng();
      this.dropoffAddressDetails.placeId = place.place_id;
      console.log(this.dropoffAddressDetails);
      this.autocomplete.query = place.name + ' ' + place.formatted_address;
      (<HTMLElement>document.getElementsByClassName('searchbar-search-icon')[0]).style.display= 'none';
   (<HTMLElement>document.getElementsByClassName('searchbar-input')[0]).style.paddingLeft = '6px';
    })
  }

  async showRadio() {


     let title, subTitle,noaddress

     await this.translate.stream('you can add new address from your profile').subscribe((res: string) => {

     subTitle = res;


    //await this.translate.instant('Saved Address list');
});

  await   this.translate.stream('You have not listed any addresses').subscribe((res: string) => {

     noaddress = res;


    //await this.translate.instant('Saved Address list');
});


await this.translate.stream('Saved Address list').subscribe((res: string) => {

     title = res;


    //await this.translate.instant('Saved Address list');
});



    //let title =
    //let subtitle = await this.translate.instant('you can add new address from your profile')

    console.log('title',noaddress);
    console.log('title',title);
    console.log('title',subTitle);


    let alert = this.alertCtrl.create();
    alert.setTitle(title);
    alert.setSubTitle(subTitle)
    let loader = this.loadingCtrl.create({
      // content: content,
      duration: 2500,
      dismissOnPageChange: true,
      spinner: 'hide',
      content: `<img src="assets/img/loader.gif" style="width:50%">`
    });
    loader.present();
    const addressList = await this.af.list('/users/' + this.globals.current_userUID + '/addresses/').take(1).toPromise();
    loader.dismiss();
    if (addressList.length > 0) {
      addressList.map(address => {
        alert.addInput({
          type: 'radio',
          label: address.nickname,
          value: address
        });
      });
    } else {
      alert.setTitle(noaddress);
    }

    alert.addButton({
     text: this.translate.instant('Cancel'),
     cssClass: 'codeQR',
     handler: ontouchcancel,

    });
    if (addressList.length > 0) {
      alert.addButton({
        text: this.translate.instant('Ok'),
        cssClass: 'codeQR',
        handler: address => {
          console.log(address);
          if(address !=null && address !='undefined'){
          this.dropoffAddressDetails.formatted_address = address.formatted_address;
          this.dropoffAddressDetails.name = address.name;
          this.dropoffAddressDetails.lat = address.lat;
          this.dropoffAddressDetails.lng = address.lng;
          this.dropoffAddressDetails.placeId = address.placeId;
          console.log(this.dropoffAddressDetails);
          this.autocomplete.query = address.name + ' ' + address.formatted_address;
          (<HTMLElement>document.getElementsByClassName('searchbar-search-icon')[0]).style.display= 'none';
   (<HTMLElement>document.getElementsByClassName('searchbar-input')[0]).style.paddingLeft = '6px';
        }
        }
      });
    }
    alert.present();
  }
}
