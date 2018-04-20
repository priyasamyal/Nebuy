import {Component, OnInit, ViewChild} from '@angular/core';
import {
  IonicPage,
  NavController,
  NavParams,
  AlertController,
  LoadingController,
  ModalController
} from 'ionic-angular';
import {FormBuilder, FormGroup, NgForm, Validators} from '@angular/forms';
import {PushService} from "../../providers/push-service";
import {AuthService} from '../../providers/auth-service';
import {GlobalVariable} from "../../app/global";
import {EmailValidator} from '../../validators/email';
import {InAppBrowser} from "@ionic-native/in-app-browser";
import {TranslateService, TranslateModule} from '@ngx-translate/core';
import {ToastController, Slides} from 'ionic-angular';
import {AlertProvider} from "../../providers/alert/alert";
import {LoaderProvider} from "../../providers/loader/loader";
import {countries} from "../../data/countries.data";

@IonicPage()
@Component({selector: 'page-register', templateUrl: 'register.html'})
export class Register implements OnInit {
  signupForm : FormGroup;
  mobile = '';
  verificationId = '';
  code = '';
  selectedCountry = countries[0];
  @ViewChild(Slides)slides : Slides;
  constructor(public navCtrl : NavController, public navParams : NavParams, private alert : AlertProvider, public formBuilder : FormBuilder, private loader : LoaderProvider, public alertCtrl : AlertController, public translate : TranslateService, public modalCtrl : ModalController, private globals : GlobalVariable, private ps : PushService, private auth : AuthService, private iab : InAppBrowser) {

    console.log('selected country', this.selectedCountry);

    translate.addLangs([globals.language]);

    translate.setDefaultLang(globals.language);

    // the lang to use, if the lang isn't available, it will use the current loader
    // to get them
    translate.use(globals.language);

  }

  ionViewDidLoad() {
    this
      .slides
      .lockSwipeToNext(true);
  }

  ngOnInit() {
    // this.initForm();

  }

  slideNext() {
    // this.slides.lockSwipeToNext(false);
    this
      .slides
      .slideNext(300, true);
  }

  slideChanged() {
    // this.slides.lockSwipeToNext(true);
  }

  login() {
    this
      .navCtrl
      .setRoot('LoginPage');
  }

  async getCode(form : NgForm) {
    if (form.valid) {
      this
        .loader
        .show();
      let params = {
        mobile: this.mobile,
        countryCode: this.selectedCountry.code
      };
      try {
        const credentials : any = await this
          .auth
          .getCode(params);
        if (credentials) {
          this.verificationId = credentials;
          this
            .loader
            .hide();
          this
            .slides
            .lockSwipeToNext(false);
          this.slideNext();
        }
      } catch (error) {
        console.log(error);
        this
          .loader
          .hide();
        this
          .alert
          .show(error);
      }
    }
  }

  async verify(form : NgForm) {
    if (form.valid) {
      this
        .loader
        .show();
      try {
        const verified = await
        this
          .auth
          .verify(this.verificationId, this.code);
        if (verified) {
          console.log('verified', verified);
          this
            .loader
            .hide();
          this.slideNext();
        }
      } catch (error) {
        console.log(error);
        this
          .loader
          .hide();
        this
          .alert
          .show(error.message);
      }
    }
  }

  termsAndConditions() {
    const browser = this
      .iab
      .create('http://nebuy.co/terms.html', '_blank', 'location=no');
  }

  privacyPolicy() {
    const browser = this
      .iab
      .create('http://nebuy.co/privacy.html', '_blank', 'location=no');
  }

  chooseCountryCode() {
    console.log('chooseCountryCode');
    const modal = this
      .modalCtrl
      .create('SelectCountryCodePage');
    modal.present();
    modal.onDidDismiss((country) => {
      console.log('country sected', country);
      if (country) {
        this.selectedCountry = country;
      }
    })
  }

  initForm() {
    // console.log(this.currentYear); this.signupForm = this.formBuilder.group({
    // userName: ['', Validators.required],   username: ['',
    // Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z
    // ]*'), Validators.required])],   password: ['',
    // Validators.compose([Validators.minLength(6), Validators.required])],
    // confirmPassword: ['', Validators.compose([Validators.minLength(6),
    // Validators.required])] });
  }

}
