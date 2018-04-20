import { Component,NgModule } from '@angular/core';
import { IonicPage,IonicModule, NavController, NavParams, App, ModalController, AlertController, LoadingController, Platform } from 'ionic-angular';

import { OneSignal } from '@ionic-native/onesignal';
import { Camera, CameraOptions } from "@ionic-native/camera";
import { NativeStorage } from "@ionic-native/native-storage";
import { Facebook } from "@ionic-native/facebook";
// import { ImagePicker, ImagePickerOptions } from "@ionic-native/image-picker";

import { AuthService } from '../../providers/auth-service';
import { FirebaseService } from "../../providers/firebase-service";
import { PushService } from "../../providers/push-service";
import { GlobalVariable } from "../../app/global";

import { Ionic2Rating } from "ionic2-rating";
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { ImageViewerComponent } from "ionic-img-viewer";
import { SocialSharing } from "@ionic-native/social-sharing";
import { Storage } from '@ionic/storage';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService,TranslateModule } from '@ngx-translate/core';
import {AlertProvider} from "../../providers/alert/alert";


@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class Profile {

  userProfile: any;
  profilePhoto: any;
  userName: any;
  dialog: any;
  cameraOptions: CameraOptions = {
    quality: 40,
    destinationType: this.camera.DestinationType.DATA_URL,
    sourceType: this.camera.PictureSourceType.CAMERA,
    encodingType: this.camera.EncodingType.JPEG,
    targetWidth: 1500,
    targetHeight: 1000,
    saveToPhotoAlbum: true
  };
  pickerOptions: CameraOptions = {
    quality: 100,
    destinationType: this.camera.DestinationType.DATA_URL,
    sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
    encodingType: this.camera.EncodingType.JPEG,
    saveToPhotoAlbum: true
  };

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    private sanitizer: DomSanitizer,
    private alert: AlertProvider,
    public platform: Platform,
    private auth: AuthService,
    private storage: Storage,
    private ps: PushService,
    private globals: GlobalVariable,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    private _SIGNAL: OneSignal,
    private camera: Camera,
    private ns: NativeStorage,
    private fs: FirebaseService,
    private fb: Facebook,
    public translate: TranslateService,
    private app: App,
    private socialSharing: SocialSharing,
    private iab: InAppBrowser,
    public appCtrl: App) {





    translate.addLangs([globals.language]);

    translate.setDefaultLang(globals.language);

         // the lang to use, if the lang isn't available, it will use the current loader to get them
        translate.use(globals.language);

    // this.fs.getUserProfileObject().take(1).subscribe((obj) => {
    //   console.log("obj", obj);
    //   this.userProfile = obj;
    // })
    this.userProfile = this.fs.getUserProfileObject();
    this.profilePhoto = this.auth.getUserProfile().photoURL;
    //this.userName = this.auth.getUserProfile().displayName;
    this.userName = this.auth.getUserProfile().email.replace('@gmail.com', '');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Profile');

  }

  async logOut() {
    let loader = this.loadingCtrl.create({
      // content: "Fetching Orders Nearby You",
      dismissOnPageChange: true,
      duration: 5000,
      spinner: 'hide',
      content: `
      <img src="assets/img/loader.gif" style="width:50%">`
    });
    loader.present();
    await this.ps.clearPushToken(this.globals.current_userUID);
    this.auth.unsetGlobals();
    // this._SIGNAL.setSubscription(false);
    await this.ns.clear();
    await this.auth.logoutUser();
    this.appCtrl.getRootNav().setRoot('Landing');
  }
  addAddresses() {
    // let modal = this.modalCtrl.create("AddressList");
    // modal.present();
    this.navCtrl.push("AddressList");
  }

  openFaq() {
    const browser = this.iab.create('http://flexorda.com/faq.html', '_blank', 'location=no');
  }

  editUserName() {
    let alert = this.alertCtrl.create({
      title: "Enter new User name",
      inputs: [
        {
          name: 'username',
          placeholder: 'Username',
          type: 'text'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'OK',
          handler: data => {
            console.log('Okay clicked');
            console.log(data);

              this.auth.getUserProfile().updateEmail(data.username + '@gmail.com').then((res) => {
                console.log(res);
                this.userName = data.username;
                this.fs.updateUserProfile('user_name', data.username, this.globals.current_userUID);
              }, (error: any) => {
                console.log(error);
                if (error.code == 'auth/email-already-in-use') {
                  this.alert.showWithTitle('This username is taken. Please try another one.','Error');
                } else {
                  this.alert.showWithTitle(error.message,'Error');
                }
              });

          }
        }

      ]
    });

    alert.present();

  }

  CancelDialog(){

    if(this.dialog){

      this.dialog.style.visibility = "hidden" ;
    }
  }

  Image1(){

    this.globals.backgroundImage = 'one';
    console.log('backgroundImage',this.globals.backgroundImage);
    this.ns.setItem("backgroundImage", {
      backgroundImage: 'one'
    })
  }

   Image2(){

    this.globals.backgroundImage = 'two';
    console.log('backgroundImage',this.globals.backgroundImage);
    this.ns.setItem("backgroundImage", {
      backgroundImage: 'two'
    })
  }

   Image3(){

    this.globals.backgroundImage = 'three';
    console.log('backgroundImage',this.globals.backgroundImage);
    this.ns.setItem("backgroundImage", {
      backgroundImage: 'three'
    })
  }

   Image4(){

    this.globals.backgroundImage = 'four';
    console.log('backgroundImage',this.globals.backgroundImage);
    this.ns.setItem("backgroundImage", {
      backgroundImage: 'four'
    })
  }

  changeImage() {
     this.dialog = document.getElementById('dialog');
    this.dialog.style.visibility = "visible" ;
  }

  chooseImage() {
     this.dialog = document.getElementById('my_dialog');
    this.dialog.style.visibility = "visible" ;
  }


  async takeBackgroundPicture(img) {
    this.dialog.style.visibility = "hidden" ;
    try {
      let loader = this.loadingCtrl.create({
        // content: "Fetching Orders Nearby You",
        duration: 5000,
        spinner: 'hide',
        content: `
      <img src="assets/img/loader.gif" style="width:50%">`
      });
      const image = await this.camera.getPicture(this.cameraOptions);
      loader.present();
      const savedImage = await this.fs.storeProfileBackground(image);

      //img.style.background = "url(savedImage)";

      this.storage.set('backgroundImage', savedImage);
  //      this.storage.get('backgroundImage').then((val) => {
  //   //this.profilePhoto = val;
  //   this.globals.backgroundImage = val;
  // });
      loader.dismiss();
    } catch (error) {
      console.error(error);
    }
  }
  async pickBackgroundPickture(img) {

    this.dialog.style.visibility = "hidden" ;
    try {
      let loader = this.loadingCtrl.create({
        // content: "Fetching Orders Nearby You",
        duration: 5000,
        spinner: 'hide',
        content: `
      <img src="assets/img/loader.gif" style="width:50%">`
      });
      const image = await this.camera.getPicture(this.pickerOptions);
      loader.present();
      const savedImage = await this.fs.storeProfileBackground(image);
      //img.style.background = "url(savedImage)";

      this.storage.set('backgroundImage', savedImage);
  //      this.storage.get('backgroundImage').then((val) => {
  //   this.globals.backgroundImage = val;
  //   console.log('backgroundImage',this.globals.backgroundImage);
  // });

      loader.dismiss();
    } catch (error) {
      console.error(error);
    }
  }

  async takePicture() {

    this.dialog.style.visibility = "hidden" ;
    try {
      let loader = this.loadingCtrl.create({
        // content: "Fetching Orders Nearby You",
        duration: 3000,
        spinner: 'hide',
        content: `
      <img src="assets/img/loader.gif" style="width:50%">`
      });
      const image = await this.camera.getPicture(this.cameraOptions);
      loader.present();
      const savedImage = await this.fs.storeProfilePhoto(image);
       //(<HTMLElement>document.getElementsByClassName('img-bg')[0]).style.background = savedImage;
      await this.auth.updatePhoto(savedImage, this.userName);
      this.profilePhoto = this.auth.getUserProfile().photoURL;
      loader.dismiss();
    } catch (error) {
      console.error(error);
    }
  }
  async pickPicture() {

    this.dialog.style.visibility = "hidden" ;
    try {
      let loader = this.loadingCtrl.create({
        // content: "Fetching Orders Nearby You",
        duration: 3000,
        spinner: 'hide',
        content: `
      <img src="assets/img/loader.gif" style="width:50%">`
      });
      const image = await this.camera.getPicture(this.pickerOptions);
      loader.present();
      const savedImage = await this.fs.storeProfilePhoto(image);
      await this.auth.updatePhoto(savedImage, this.userName);
      this.profilePhoto = this.auth.getUserProfile().photoURL;
      loader.dismiss();
    } catch (error) {
      console.error(error);
    }
  }
  // https://play.google.com/store/apps/details?id=com.flickverx.flexorda
  share() {
    let options = {
      url: '',
      picture: 'https://scontent.fkhi1-1.fna.fbcdn.net/v/t1.0-9/19601097_150916715477341_6616391698235173609_n.jpg?oh=804b68042fc5cfb7f7286ae24fb227bc&oe=5A119C0A'
    };
    if (this.platform.is('ios')) {
      // options['url'] = 'https://www.facebook.com/FleXorda-113610559207957/';
      options['url'] = 'https://fb.me/1893468244252362'
    } else if (this.platform.is('android')) {
      // options['url'] = 'https://play.google.com/store/apps/details?id=com.flickverx.flexorda'
      options['url'] = 'https://fb.me/1893486357583884'
    }

    this.fb.appInvite(options)
      .then(
      (data) => {
        console.log(data);
      }
      ).catch(error => console.error("error", error));
  }

  // share() {
  //   let options = {
  //     url: 'https://play.google.com/store/apps/details?id=com.flickverx.flexorda',
  //     file: 'assets/img/logo.png'
  //   }
  //   this.socialSharing.shareWithOptions(options)
  //     .then(res => {
  //       console.log(res)
  //     }).catch(err => console.error(err));
  // }

  selectLanguage(e) {
    console.log('hell',this.globals.currency)
     //this.navCtrl.popToRoot();


     if(this.globals.language == 'USD'){

    this.ns.setItem("currencyType", {
      currency: 'USD'
    })

    }else{

this.ns.setItem("currencyType", {
      currency: 'EUR'
    })
    }


  }

   selectCurrency(e) {
    //console.log('hell',this.globals.currency)

    if(this.globals.language == 'de'){
     console.log('De',this.globals.language)
    this.ns.setItem("myLangauage", {
      langauge: 'de'
    })

    }else{

       if(this.globals.language == 'es'){
console.log('ES',this.globals.language)
    this.ns.setItem("myLangauage", {
      langauge: 'es'
    })

    }else{

       if(this.globals.language == 'tr'){
console.log('Tr',this.globals.language)
    this.ns.setItem("myLangauage", {
      langauge: 'tr'
    })

    }else{
console.log('En',this.globals.language)
this.ns.setItem("myLangauage", {

      langauge: 'en'
    })
    }
    }
    }
 //this.globals.language = e;
      //console.log('language',this.globals.language);
 this.navCtrl.push("Profile");

    //  this.navCtrl.popToRoot();
    // this.ns.setItem("currencyType", {
    //   currency: e
    // })
  }
  finances() {
    this.navCtrl.push("FinancesPage");
  }
  changePassword() {
    this.navCtrl.push("ChangePasswordPage")
  }

  help() {
    this.navCtrl.push("HelpPage", {icon:'ai-support'});
  }

  reviews() {
    this.navCtrl.push("ReviewsPage")
  }

  termsAndConditions() {
    const browser = this.iab.create('http://nebuy.com/terms.html', '_blank', 'location=no');
  }

  privacyPolicy() {
    const browser = this.iab.create('http://nebuy.com/privacy.html', '_blank', 'location=no');
  }
}
