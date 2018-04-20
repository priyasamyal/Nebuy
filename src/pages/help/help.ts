import { Component } from '@angular/core';
import {
  IonicPage, NavController, NavParams, AlertController, LoadingController,
  PopoverController
} from 'ionic-angular';
import { FirebaseService } from "../../providers/firebase-service";
import { PushService } from "../../providers/push-service";
import { GlobalVariable } from "../../app/global";
import { TranslateService,TranslateModule } from '@ngx-translate/core';


@IonicPage()
@Component({
  selector: 'page-help',
  templateUrl: 'help.html',
})
export class HelpPage {
  images = [];
  helpText: string;
  submitAttempt = false;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    private fs: FirebaseService,
    private popoverCtrl: PopoverController,
    private globals: GlobalVariable,
    private ps: PushService) {
    translate.addLangs([globals.language]);

    translate.setDefaultLang(globals.language);

         // the lang to use, if the lang isn't available, it will use the current loader to get them
        translate.use(globals.language);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HelpPage');
  }

  async submit() {

    let noaddress;

     await   this.translate.stream('Your message was successfully sent. We will reply to your provided email address shortly').subscribe((res: string) => {

     noaddress = res;


    //await this.translate.instant('Saved Address list');
});

    let loader = this.loadingCtrl.create({
      // content: "Fetching Orders Nearby You",
      spinner: 'hide',
      content: `
    <img src="assets/img/loader.gif" style="width:50%">`
    });
    try {
      loader.present();
      const user = await this.fs.getUserProfileObject().take(1).toPromise();
      user["helpText"] = this.helpText;
      console.log(user);
      console.log(this.helpText);
      let email = user.email;
      const help = await this.ps.help(email, this.helpText);
      console.log(help);
      loader.dismiss();
      this.showSuccessAlert(noaddress)
    } catch (error) {
      console.error("error in help", error);
      loader.dismiss();
      this.showErrorAlert(error);
    }

  }

  showSuccessAlert(msg: string) {
    let alert = this.alertCtrl.create({
      title: msg,
      buttons: ["OK"]
    });
    alert.present();
    alert.onWillDismiss(
      () => this.navCtrl.pop()
    );
  }
  showErrorAlert(error) {
    let alert = this.alertCtrl.create({
      title: error,
      buttons: ["Try Again"]
    });
    alert.present();
  }

  choosePhoto(){
    const popover = this.popoverCtrl.create('PickPhotoPage', {}, {cssClass: 'pick-photo-popover custom-popover'});
    popover.present();
    popover.onDidDismiss((images) => {
      this.images = images;
      console.log(this.images);
    });
  }

  removeError(){
    this.submitAttempt = false;
  }
}
