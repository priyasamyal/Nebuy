import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from "../../providers/auth-service";
import { GlobalVariable } from "../../app/global";
import { TranslateService,TranslateModule } from '@ngx-translate/core';
    


@IonicPage()
@Component({
  selector: 'page-change-password',
  templateUrl: 'change-password.html',
})
export class ChangePasswordPage {

  submitAttempt: boolean = false;
  changePasswordForm: FormGroup;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public translate: TranslateService,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    private formBuilder: FormBuilder,
    private globals: GlobalVariable,
    private as: AuthService) {

       


     

    translate.addLangs([globals.language]);

    translate.setDefaultLang(globals.language);

         // the lang to use, if the lang isn't available, it will use the current loader to get them
        translate.use(globals.language);

    this.changePasswordForm = formBuilder.group({
      password: ['', Validators.compose([Validators.minLength(6), Validators.required])],
      confirmPassword: ['', Validators.compose([Validators.minLength(6), Validators.required])],
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChangePaswordPage');
  }

  async changePassword() {
    let loader = this.loadingCtrl.create({
      // content: "Loggin In...",
      dismissOnPageChange: true,
      spinner: 'hide',
      content: `
      <img src="assets/img/loader.gif" style="width:50%">`,
    });
    this.submitAttempt = true;
    if (!this.changePasswordForm.valid || this.changePasswordForm.value.password !== this.changePasswordForm.value.confirmPassword) {
      console.log(' Some values were not given or were incorrect, please fill them');
    } else {
      loader.present();
      try {
        console.log(this.changePasswordForm.value);
        const passwordChange = await this.as.changePassword(this.changePasswordForm.value.password);
        console.log(passwordChange);
        await loader.dismiss()
        let alert = this.alertCtrl.create({
          title: "Password change successfully",
          buttons: ["OK"]
        });
        alert.present();
        alert.onWillDismiss(() => this.navCtrl.pop());
      } catch (error) {
        await loader.dismiss();
        let alert = this.alertCtrl.create({
          title: error,
          buttons: ["Retry"]
        });
        alert.present();
        console.error(error);
      }
    }
  }

}
