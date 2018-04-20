import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { GlobalVariable } from "../../app/global";
import { FirebaseService } from "../../providers/firebase-service";
import { FirebaseListObservable, AngularFireDatabase } from "angularfire2/database";
 import { TranslateService } from '@ngx-translate/core';
declare var google;

@IonicPage()
@Component({
  selector: 'page-address-list',
  templateUrl: 'address-list.html',
})
export class AddressList implements OnInit {

  element: HTMLElement;
  autocompleteItems: any;
  autocomplete: any;
  nickname: string;
  submitAttempt: boolean = false;
  item: any;
  addressList: FirebaseListObservable<any>;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    private globals: GlobalVariable,
    public translate: TranslateService,
    private af: AngularFireDatabase,
    private fs: FirebaseService) {






    translate.addLangs([globals.language]);

    translate.setDefaultLang(globals.language);

         // the lang to use, if the lang isn't available, it will use the current loader to get them
        translate.use(globals.language);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddressList');
  }
  ngOnInit() {
    this.addressList = this.fs.getUserAddress();
    // this.addressList.subscribe(obj => console.log(obj));
    // this.af.object('/users/' + this.globals.current_userUID + '/addresses/').subscribe((onj) => console.log(onj));
    this.element = document.getElementById('map');
    this.autocompleteItems = [];
    this.autocomplete = {
      query: ''
    };
    // this.nativeStorage.getItem("addresses")
    //   .then(
    //   (data) => this.addressDetails = data.addresses
    //   )
    //   .catch(
    //   () => this.addressDetails = []
    //   )
  }

  removeError(){
  this.submitAttempt = false;

}

  search() {
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
      if (status == 'OK') {
        this.autocompleteItems = results;

      }
    })
  }

  chooseItem(item) {
    // this.searchAttempt = true;
    this.item = item;
    this.autocompleteItems = [];
    this.autocomplete.query = item.name + " " + item.formatted_address;
    console.log(item);
    let addressDetails = {}

  }

  removeAddress(index: number, $key) {
    this.af.list('/users/' + this.globals.current_userUID + '/addresses/' + $key).remove();
  }

  async addAddress() {
    let item = this.item;
    this.submitAttempt = false;
    let addressObject = {
      formatted_address: item.formatted_address,
      name: item.name,
      nickname: this.nickname,
      placeId: item.place_id,
      lat: item.geometry.location.lat(),
      lng: item.geometry.location.lng(),
      photo: item.photos[0].getUrl({ 'maxWidth': 300, 'maxHeight': 150 })
    };
    this.item = '';
    this.nickname = '';
    this.autocomplete.query = '';
    this.addressList.push(addressObject);
  }

  async dismiss() {
    this.viewCtrl.dismiss();
  }

}
