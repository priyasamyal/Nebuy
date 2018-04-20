import {Component, ViewChild, OnInit, NgZone, OnDestroy,} from '@angular/core';
import {
  IonicPage, NavController, NavParams, MenuController, LoadingController, AlertController, ModalController,
  Platform, PopoverController, ToastController, Content, Events
} from 'ionic-angular';
import { GoogleMaps } from '../../providers/google-maps';
import { FirebaseService } from '../../providers/firebase-service';
import { PlaceModel } from '../../models/place-model';
import { GlobalVariable } from "../../app/global";
import { PushService } from "../../providers/push-service";
import { Keyboard } from "@ionic-native/keyboard";
import { Subscription } from "rxjs/Subscription";
import { TranslateService,TranslateModule } from '@ngx-translate/core';
import {Geolocation} from "@ionic-native/geolocation";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import moment from 'moment';
declare var google;



@IonicPage()
@Component({
  selector: 'page-order-pickup',
  templateUrl: 'order-pickup.html',
})
export class OrderPickup implements OnInit, OnDestroy {
  hideFooter = false;
  photoPlaceHolder = 'http://placehold.it/300x150';
  addressList: any;
  showShopLocationOptions = false;
  showDeliveryLocationOptions = false;
  submitAttempt: boolean = false;
  searchbarIcon: boolean = false;
  autocompleteItems: any;
  autocomplete: any;
  deliveryAutocompleteItems:  any;
  deliveryAutoComplete: any;
  dialog: any;
  searchAttempt: boolean = false;
  element: HTMLElement;
  shopDetails = {
    formatted_address: '',
    name: '',
    placeId: '',
    lat: '',
    lng: '',
    opening_hours: '',
    opening_day: '',
    photo: ''
  };
  dropoffAddressDetails = {
    formatted_address: '',
    name: '',
    placeId: '',
    lat: '',
    lng: '',
    reward: 0,
    betweenTimeOne: new Date(),
    betweenTimeTwo: new Date()
  };
  shopSelected = false;
  deliveryAddressSelected = false;
  dateSelected = false;
  shopPicture: any;
  openNow: boolean;
  currentDay: any;
  day: any;
  hour: any;
  opening_hours: boolean = true;
  keyOpen: Subscription;
  keyClosed: Subscription;
  private isKeyboardOpen: boolean = false;
  addressSelectOptions = {
    title: 'Saved Address List',
    subTitle: 'You can add new address from your profile',
    mode: 'ios',
    cssClass: 'address-select'
  };

  currencyIcon: string;

  // Pick time
  startDay:any;
  StartTime:any;
  endDay:any;
  EndTime:any;
  currency: any;
  myDate:any;
  one:any;
  two:any;
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
  orderForm: FormGroup;
  currentMonth; currentYear;
  days: string[];
  @ViewChild(Content) content: Content;



  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public translate: TranslateService,
    public translateModule:TranslateModule,
    public menu: MenuController,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    public platform: Platform,
    private globals: GlobalVariable,
    public gm: GoogleMaps,
    private keyboard: Keyboard,
    private geolocation: Geolocation,
    private ngZone: NgZone,
    private events: Events,
    private ps: PushService,
    public formBuilder: FormBuilder,
    private toastCtrl: ToastController,
    private popoverCtrl: PopoverController,
    public fs: FirebaseService) {

    let date = new Date();
    this.currentDay = date.getDay();
    this.day = new Array<string>(7);
    this.hour = new Array<string>(7);



    translate.addLangs([globals.language]);

    translate.setDefaultLang(globals.language);

         // the lang to use, if the lang isn't available, it will use the current loader to get them
        translate.use(globals.language);


  }


  ngOnInit() {

    // Listed to order placed
    this.events.subscribe('order:placed', () => {
      // clear all fields
      this.autocompleteItems = [];
      this.deliveryAutocompleteItems = [];
      this.autocomplete = {
        query: '',
        delivery: ''
      };
      this.openNow = true;
      this.shopSelected = false;
      this.deliveryAddressSelected = false;
      this.opening_hours = false;
      this.shopDetails = {
        formatted_address: '',
        name: '',
        placeId: '',
        lat: '',
        lng: '',
        opening_hours: '',
        opening_day: '',
        photo: ''
      };
      this.orderForm.reset();
      this.orderForm.patchValue({reward: 0});
      this.initDatePikckerValues();
      this.dateSelected = false;
    });

    this.fs.getUserAddress().subscribe(addressList => {
      this.addressList = addressList;
    })
    // this.addressList = this.fs.getUserAddress();

    this.autocompleteItems = [];
    this.deliveryAutocompleteItems = [];
    this.autocomplete = {
      query: '',
      delivery: ''
    };

    this.initDateTimePicker();
    this.getCurrency();
  }
  ionViewWillEnter() {
    this.element = document.getElementById('map');
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

  ionViewDidLoad() {
    console.log('ionViewDidLoad OrderPickup');

  }
  ionViewDidEnter() {
    // this.fs.watchUserLocation();
  }
  searchZone(type: string) {
   this.searchbarIcon = true;
    this.submitAttempt = false;
    this.ngZone.run(
      () => this.search(type)
    )
  }


removeError(target?){
  if (target && target === 'delivery') {
    this.showDeliveryLocationOptions = false;
  } else {
    this.showShopLocationOptions = false;
  }
  this.submitAttempt = false;
  this.keyboard.disableScroll(false);

}


  search(type: string) {
  console.log('searching');
    let query = '';
    this.hideFooter = true;
    this.content.resize();
    if (type === 'shop') {
      if (this.autocomplete.query == '') {
        this.autocompleteItems = [];
        this.hideFooter = false;
        this.content.resize();
        return;
      }
      this.showShopLocationOptions = false;
      query = this.autocomplete.query;
    } else {
      if (this.autocomplete.delivery == '') {
        this.deliveryAutocompleteItems = [];
        this.hideFooter = false;
        this.content.resize();
        return;
      }
      this.showDeliveryLocationOptions = false;
      query = this.autocomplete.delivery;
      // this.element = document.getElementById('delivery-map');
    }

    var pyrmont = new google.maps.LatLng(this.globals.lat, this.globals.lng);
    console.log('location', pyrmont);
    let request = {
      location: pyrmont,
      radius: '5000',
      query: query,
    }
    let self = this;
    let service = new google.maps.places.PlacesService(this.element);
    service.textSearch(request, (results, status) => {
      if (status == 'OK') {
        if (type === 'shop') {
          this.autocompleteItems = results;
        } else {
          this.deliveryAutocompleteItems = results;
        }
      }

    })

  }

  chooseItem(item, type: string) {
    if (type === 'shop') {
      this.setShopDetails(item, 'autocomplete');
    } else {
      this.setDeliveryAddressDetails(item, 'autocomplete');
    }
    this.hideFooter = false;
    this.content.resize();
  }

  setShopDetails(shop, target?) {
    console.log('set shop details', shop);
    this.searchAttempt = true;
    this.autocompleteItems = [];
    this.shopSelected = true;


    let lat, lng, photoSrc, placeId, name;

    if (target) {
      switch (target) {
        case 'addressList':
          lat = shop.lat;
          lng = shop.lng;
          placeId = shop.placeId;
          this.shopDetails.photo = this.shopPicture = shop.photo || this.photoPlaceHolder;
          break;
        case 'location':
          lat = shop.geometry.location.lat();
          lng = shop.geometry.location.lng();
          placeId = shop.place_id;
          this.shopPicture = shop.photos ? shop.photos[0].getUrl({ 'maxWidth': 300, 'maxHeight': 150 }) : this.photoPlaceHolder;
          this.shopDetails.photo = shop.photos ? shop.photos[0].getUrl({ 'maxWidth': 50, 'maxHeight': 50 }): this.photoPlaceHolder;
          break;
        default:
          lat = shop.geometry.location.lat();
          lng = shop.geometry.location.lng();
          placeId = shop.place_id;
          this.shopPicture = shop.photos ? shop.photos[0].getUrl({ 'maxWidth': 300, 'maxHeight': 150 }) : this.photoPlaceHolder;
          this.shopDetails.photo = shop.photos ? shop.photos[0].getUrl({ 'maxWidth': 50, 'maxHeight': 50 }): this.photoPlaceHolder;
      }
    }

    this.autocomplete.query = shop.name + " " + shop.formatted_address;
    this.shopDetails.formatted_address = shop.formatted_address;
    this.shopDetails.name = shop.name;
    this.globals.orderLat = this.shopDetails.lat = lat;
    this.globals.orderLng  = this.shopDetails.lng = lng;
    this.shopDetails.placeId = placeId;
    // if (shop.opening_hours) {
    //   console.log(shop.opening_hours);
    //
    //   this.opening_hours = true;
    // } else {
    //   this.getPlaceOpeningHours(placeId);
    // }
    this.getPlaceOpeningHours(placeId);
    if (shop.opening_hours) {
      if(shop.opening_hours.open_now)
        this.openNow = shop.opening_hours.open_now;
    } else {
      this.openNow = false;
    }
    this.showShopLocationOptions = false;
    this.shopSelected = true;
  }

  setDeliveryAddressDetails(address, trigger) {
    this.deliveryAutocompleteItems = [];
    this.autocomplete.delivery = address.name + " " + address.formatted_address;
    this.dropoffAddressDetails.formatted_address = address.formatted_address;
    let lat, lng, photoSrc, placeId;

    switch (trigger) {
      case 'addressList':
        lat = address.lat;
        lng = address.lng;
        placeId = address.placeId;
        break;
      case 'location':
        lat = address.geometry.location.lat();
        lng = address.geometry.location.lng();
        placeId = address.place_id;
        break;
      default:
        lat = address.geometry.location.lat();
        lng = address.geometry.location.lng();
        placeId = address.place_id;
    }

    this.dropoffAddressDetails.name = address.name;
    this.dropoffAddressDetails.placeId = placeId;
    this.dropoffAddressDetails.lat = lat;
    this.dropoffAddressDetails.lng = lng;
    this.showDeliveryLocationOptions = false;
    this.deliveryAddressSelected = true;
  }
  addProducts() {
  this.dropoffAddressDetails.reward = this.orderForm.value.reward;
  this.dropoffAddressDetails.betweenTimeOne = this.orderForm.value.betweenTimeOne;
  this.dropoffAddressDetails.betweenTimeTwo = this.orderForm.value.betweenTimeTwo;

  // TODO: ckeck all fields are selected
    if (this.shopDetails.name == '' || this.shopDetails.formatted_address == '') {
      this.submitAttempt = true;
      console.log("no ways");
    } else {
      this.navCtrl.push("ProductList", {
        orderDetails: {
          shopDetails: this.shopDetails,
          dropOffDetails: this.dropoffAddressDetails
        }
      })

    }
  }

  getPlaceOpeningHours(place_id: string) {
    let request = {
      placeId: place_id
    };
    let service = new google.maps.places.PlacesService(this.element);
    service.getDetails(request, (place, status) => {
      console.log(place);
      if (place.opening_hours ) {
        var num = 0;
        var hours = new Array<string>(7);;
        var days = new Array<string>(7);
        this.shopDetails.opening_hours = place.opening_hours.weekday_text;
        this.opening_hours = place.opening_hours.weekday_text;
        for (num = 0; num < 7; num++) {
            var day = this.shopDetails.opening_hours[num].split(':');
            days[num] =  day[0];
            hours[num] = this.shopDetails.opening_hours[num].substring(day[0].length+2) ;
        }
       this.hour = hours;
       this.day = days;
         } else {
        this.opening_hours = false;
      }
    })
  }

  toggleShopLocationOptions() {
    this.showShopLocationOptions = !this.showShopLocationOptions;
  }

  toggleDeliveryLocationOptions() {
    this.showDeliveryLocationOptions = !this.showDeliveryLocationOptions;
  }


  async setCurrentLocation(target?: string) {
    // let myCoords = {lat: 30.0991422, lng: 31.3168434};
    // var geocoder = new google.maps.Geocoder;
    // console.log(geocoder);
    // geocoder.geocode({ 'location': myCoords }, (results, status) => {
    //   console.log(status);
    //   console.log(results);
    //   if (status == 'OK') {
    //     const place = results[0];
    //     console.log(place);
    //     let request = {
    //       placeId: place.place_id
    //     };
    //     service.getDetails(request, (place, status) => {
    //       console.log(place);
    //       if (target) {
    //         if (target === 'shop') {
    //           this.setShopDetails(place, 'location');
    //           this.showShopLocationOptions = false;
    //         } else {
    //           // this.deliveryAutoComplete.query = `${place.address_components[0].short_name} ${place.formatted_address}`;
    //           this.setDeliveryAddressDetails(place, 'location');
    //           this.showDeliveryLocationOptions = false;
    //         }
    //       }
    //
    //       console.log(results[0]);
    //     });
    //
    //   }
    // }, error => {
    //   console.error('error getting location: ' + error);
    // });
    let service = new google.maps.places.PlacesService(this.element);
    let loader = this.loadingCtrl.create({
      dismissOnPageChange: true,
      spinner: 'hide',
      cssClass: 'nebuy-loading',
      content: `<img src="assets/img/loader.gif">`
    });
    loader.present();

    try {
      console.log('trying geolocation');
      const { coords } = await this.geolocation.getCurrentPosition();
      console.log(coords);
      console.log(google);
      let myCoords = {lat: 30.0991422, lng: 31.3168434}
      var geocoder = new google.maps.Geocoder;
      console.log(geocoder);
        let latlng = { lat: coords.latitude, lng: coords.longitude }
        geocoder.geocode({ 'location': latlng }, (results, status) => {
          console.log(status);
          console.log(results);
          if (status == 'OK') {
            const place = results[0];
            console.log(place);
            let request = {
              placeId: place.place_id
            };
            service.getDetails(request, (place, status) => {
              console.log(place);
              loader.dismiss();
              if (target) {
                if (target === 'shop') {
                  this.setShopDetails(place, 'location');
                  this.showShopLocationOptions = false;
                } else {
                  // this.deliveryAutoComplete.query = `${place.address_components[0].short_name} ${place.formatted_address}`;
                  this.setDeliveryAddressDetails(place, 'location');
                  this.showDeliveryLocationOptions = false;
                }
              }

              console.log(results[0]);
            });

          }
        }, error => {
          console.error('error getting location: ' + error);
          loader.dismiss();
        });
    } catch (error) {
      console.log('error', error);
      alert(error);
      loader.dismiss();
    }
  }

  selectAddress(address) {
    this.setShopDetails(address, 'addressList');
  }

  selectDeliveryAddress(address) {
    this.setDeliveryAddressDetails(address, 'addressList');
  }

  addAddress() {
    const alert = this.alertCtrl.create({
      title: 'You don\'t have any saved address',
      subTitle: 'You can add new address from your profile',
      buttons: [
        {
          text: this.translate.instant('Cancel'),
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: this.translate.instant('Ok'),
          handler: () => {
            console.log('go to profile');
            this.navCtrl.push('Profile');
          }
        }
      ]
    });
    alert.present();
  }

  onSearchCleared(type?) {
    console.log('search cleared');
    this.hideFooter = false;
    this.content.resize();
  }

  ngOnDestroy() {
    this.showShopLocationOptions = false;
    this.showDeliveryLocationOptions = false;
    this.hideFooter = false;
    this.content.resize();
  }

  initDatePikckerValues() {
    this.one = '';
    this.two ='';
    this.startDay = '';
    this.endDay   = '';
    this.StartTime = '';
    this.EndTime   = '';

    // this.days = ['','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    this.days = ['Sunday', 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    this.current = moment().format('YYYY-MM-DDTHH:mm');
    console.log("date",this.current);
    this.later = moment().add(6,'d').format('YYYY-MM-DDTHH:mm');

    console.log(this.startDay, this.endDay, this.startTime, this.endTime);
  }

  initDateTimePicker() {
    this.initDatePikckerValues()
    this.deliveryTimeType = new FormGroup({
      "deliveryTimeType": new FormControl({ value: 'anytime', disabled: false })
    });

    this.orderForm = this.formBuilder.group({
      reward: ['0'],
      anyTime: ['',],
      betweenTimeOne: ['',],
      betweenTimeTwo: ['',]
    });

    this.orderForm.get('betweenTimeTwo').disable();
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


  hello(event){
    console.log(event);
    console.log("Hello",this.one);

    if (this.one && this.one !== '') {
      const temp = this.one;
      // this.startDay = this.days[moment(this.one).subtract(5,'h').weekday()];
      // this.StartTime = moment(this.one).subtract(5,'h').format('HH:mm');
      //

      // sunday is 0, mon: 1, tue: 2
      console.log(moment.parseZone(this.one).weekday());
      this.startDay = this.days[moment.parseZone(this.one).weekday()];
      this.StartTime = moment.parseZone(this.one).format('HH:mm');
      // this.startDay = `${event.day}`;
      // this.StartTime = `${event.hour}:${event.minute}`;

      this.startTime = moment.parseZone(this.one).add(1,'h').format('YYYY-MM-DDTHH:mm');
      this.endTime = moment.parseZone(this.one).add(6,'d').format('YYYY-MM-DDTHH:mm');


      console.log('this.startDay',this.startDay);
      console.log('this.startTime',this.StartTime);

      this.orderForm.get('betweenTimeTwo').enable();
    }

  }


  hello2(){
    console.log(event);

    console.log("Hello",this.two);
    if(this.two && this.two !== '') {
      // this.endDay = this.days[moment.parseZone(this.two).subtract(5,'h').weekday()];
      // this.EndTime = moment.parseZone(this.two).subtract(5,'h').format('HH:mm');
      this.endDay = this.days[moment.parseZone(this.two).weekday()];
      this.EndTime = moment.parseZone(this.two).format('HH:mm');
      console.log('this.endDay',this.endDay);
      console.log('this.endTime',this.EndTime);
      this.dateSelected = true;
    }


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

  getCurrency() {
    if(this.globals.currency!=null && this.globals.currency!='invalid' && this.globals.currency!='EUR' && this.globals.currency!='USD'){

      this.currency = 'EUR';
    }else{

      this.currency = this.globals.currency
    }
    this.currencyIcon = 'ai-'+ this.globals.currency;
  }

}
