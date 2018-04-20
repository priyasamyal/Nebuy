import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { GlobalVariable } from "../../app/global";
import { TranslateService } from '@ngx-translate/core';

@IonicPage()
@Component({
  selector: 'page-landing',
  templateUrl: 'landing.html',
})
export class Landing {
  constructor(public navCtrl: NavController,
  private globals: GlobalVariable,
  public translate: TranslateService,
   public navParams: NavParams) {







    translate.addLangs([globals.language]);

    translate.setDefaultLang(globals.language);

         // the lang to use, if the lang isn't available, it will use the current loader to get them
        translate.use(globals.language);
  }

  ionViewDidLoad() {
  }

  goToSignup() {
    this.navCtrl.push('Register');
  }

  goToLogin() {
    this.navCtrl.push('Login');
  }

}
