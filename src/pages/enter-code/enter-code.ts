import {Component, OnInit} from '@angular/core';
import {IonicPage, NavController, NavParams, ViewController} from 'ionic-angular';
import {LoaderProvider} from "../../providers/loader/loader";
import {AuthService} from "../../providers/auth-service";
import {AlertProvider} from "../../providers/alert/alert";

@IonicPage()
@Component({selector: 'page-enter-code', templateUrl: 'enter-code.html'})
export class EnterCodePage implements OnInit {
  verificationId : string;
  code : number;
  constructor(public navCtrl : NavController, private loader : LoaderProvider, private alert : AlertProvider, private auth : AuthService, public navParams : NavParams, private vc : ViewController) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad EnterCodePage');
  }

  ngOnInit() {
    this.verificationId = this
      .navParams
      .get('verificationId');
  }

  close() {
    this
      .vc
      .dismiss();
  }

  async codeChanged(event) {
    const code = event.value;
    console.log('code', code);
    if (code && code.length === 6) {
      // await this.verify();
    }
  }

  // async verify() {   this.loader.show();   try {     const verified = await
  // this.auth.verify(this.verificationId, this.code);     if (verified) {
  // console.log('logged in', verified);       //
  // this.navCtrl.setRoot('OrderTabs');     }     this.loader.hide();
  // this.close();   } catch (error) {     console.log(error); this.loader.hide();
  //     this.alert.show(error.message);   } }
}