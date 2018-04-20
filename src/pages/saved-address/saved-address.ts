import {Component, OnInit} from '@angular/core';
import {IonicPage, NavController, NavParams, ViewController} from 'ionic-angular';
import {AngularFireDatabase, FirebaseListObservable} from "angularfire2/database";
import {FirebaseService} from "../../providers/firebase-service";

@IonicPage()
@Component({
  selector: 'page-saved-address',
  templateUrl: 'saved-address.html',
})
export class SavedAddressPage implements OnInit {
  addressList: FirebaseListObservable<any>;

  constructor(
    public navCtrl: NavController,
    private af: AngularFireDatabase,
    private fs: FirebaseService,
    private vc: ViewController,
    public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SavedAddressPage');
  }

  ngOnInit() {
    this.addressList = this.fs.getUserAddress();
  }

  chooseAddress(address) {
    console.log(address);
    this.vc.dismiss(address);
  }
}
