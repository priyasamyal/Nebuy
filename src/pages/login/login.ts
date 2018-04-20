import {Component, OnInit} from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ModalController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GlobalVariable } from "../../app/global";
import { AuthService } from '../../providers/auth-service';
import { PushService } from "../../providers/push-service";
import { TranslateService } from '@ngx-translate/core';
import {LoaderProvider} from "../../providers/loader/loader";
import {AlertProvider} from "../../providers/alert/alert";
import {countries} from "../../data/countries.data";
import {ValidateMobile} from "../../validators/mobile-validator";



@IonicPage()

@Component({

  selector: 'page-login',
  templateUrl: 'login.html',



})



export class Login implements OnInit {
  method = 'mobile';
  public submitAttempt: boolean = false;
  public loginForm: FormGroup;
  mobileLogin: FormGroup;
  mobile = '';
  verificationId = '';
  code = '';
  selectedCountry = countries[0];

  constructor(public navCtrl: NavController,
    public formBuilder: FormBuilder,
    public loader: LoaderProvider,
    public alertCtrl: AlertController,
    public translate: TranslateService,
    public modalCtrl: ModalController,
    private globals: GlobalVariable,
    private alert: AlertProvider,
    private ps: PushService,
    private auth: AuthService) {




    translate.addLangs([globals.language]);

    translate.setDefaultLang(globals.language);

         // the lang to use, if the lang isn't available, it will use the current loader to get them
        translate.use(globals.language);


  }

  ngOnInit() {
    this.createForm(this.selectedCountry.code);
  }

  ionViewDidLoad() {
  }

  async login() {
    this.submitAttempt = true;
    if (this.loginForm.valid) {
      this.loader.show();
      try {
        const data = await this.auth.loginUser(
          this.loginForm.value.username + '@gmail.com',
          this.loginForm.value.password, );
        this.ps.initializePushToken(data.uid);
        this.globals.current_userUID = data.uid;
        this.auth.setGlobals(data.uid);
        this.loader.hide();
        this.navCtrl.setRoot('OrderTabs');
      } catch (error) {
        this.loader.hide();
        const trans = this.translate.get(['Incorrect username or password', 'Error']).toPromise();
        switch (error.code) {
          case 'auth/user-not-found':
            this.alert.showWithTitle(trans['Incorrect username or password'], trans['Error']);
            break;
          default:
            this.alert.showWithTitle(error.message, trans['Error']);
        }
      }
    }
  }

  loginAlert(error) {
    let alert = this.alertCtrl.create({
      title: "Login error",
      subTitle: error,
      buttons: ["OK"]
    })
    alert.present();
  }
  goToSignup() {
    // this.navCtrl.setRoot('Register');
    this.navCtrl.push('Register')
  }
  resetPassword() {
    let modal = this.modalCtrl.create("ResetPassword");
    modal.present();
  }

  createForm(countryCode) {
    if (this.method === 'username') {
      this.loginForm = this.formBuilder.group({
        username: ['', Validators.compose([Validators.required])],
        password: ['', Validators.compose([Validators.minLength(6), Validators.required])],
      });
    } else {
      this.mobileLogin = this.formBuilder.group({
        mobile: ['', [Validators.required, ValidateMobile(countryCode)]],
      });
    }
  }

  async getCode() {
    if (!this.mobileLogin.invalid && this.selectedCountry.code) {
      const mobile = this.mobileLogin.value.mobile;
      this.loader.show();
      let params = {
        mobile,
        countryCode: this.selectedCountry.code
      }
      try {
        const credentials: any = await this.auth.getCode(params);
        if (credentials) {
          this.verificationId = credentials;
          this.loader.hide();
          // show enter pin modal
          const modal = this.modalCtrl.create('EnterCodePage', {verificationId: this.verificationId});
          modal.present();
          modal.onDidDismiss((code) => {

          });
        }
      } catch (error) {
        this.loader.hide();
        this.alert.show(error);
      }
    }
  }

  chooseCountryCode() {
    const modal = this.modalCtrl.create('SelectCountryCodePage');
    modal.present();
    modal.onDidDismiss((country) => {
      if (country) {
        this.selectedCountry = country;
        this.createForm(this.selectedCountry.code);
      }
    })
  }
}
