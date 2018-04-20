import { Component } from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {TranslateService} from "@ngx-translate/core";
import {LoaderProvider} from "../../providers/loader/loader";
import {AuthService} from "../../providers/auth-service";
import {AlertProvider} from "../../providers/alert/alert";
import {NgForm} from "@angular/forms";


@IonicPage()
@Component({
  selector: 'page-enter-username',
  templateUrl: 'enter-username.html',
})
export class EnterUsernamePage {
  username = '';
  password = '';
  constructor(
    public navCtrl: NavController,
    private loader: LoaderProvider,
    public alert: AlertProvider,
    public translate: TranslateService,
    private auth: AuthService,
    public navParams: NavParams) {
  }

  ionViewDidLoad() {
  }

  async register(form: NgForm) {
    if (form.valid) {
      this.loader.show();
      try {
        await this.auth.register(this.username, this.password);
        this.loader.hide();
        this.navCtrl.setRoot('OrderTabs');
      } catch (error) {
        this.loader.hide();
        switch(error.code) {
          case 'auth/email-already-in-use':
            this.alert.showWithTitle('This username is taken. Please try another one.','Error');
            break;
          case 'auth/provider-already-linked':
            this.alert.showWithTitle('An account already exists for this mobile number','Error');
          break;

          case 'auth/requires-recent-login':
            this.auth.logoutUser();
            this.alert.showWithTitle('Please login with your mobile number then choose a username', 'Error');
            // this.navCtrl.setRoot('Login');
            break;
          default:
            this.alert.showWithTitle( error.message, 'Error');
        }
      }
    }
  }

}
