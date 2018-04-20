import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, LoadingController, AlertController } from 'ionic-angular';
import { AuthService } from "../../providers/auth-service";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmailValidator } from '../../validators/email';
import { GlobalVariable } from "../../app/global";
import { TranslateService } from '@ngx-translate/core';



@IonicPage()
@Component({
  selector: 'page-reset-password',
  templateUrl: 'reset-password.html',
})
export class ResetPassword {

  public submitAttempt: boolean = false;

  resetPasswordForm: FormGroup;

  constructor(public navCtrl: NavController,
    public viewCtrl: ViewController,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
     private globals: GlobalVariable,
    public navParams: NavParams,
    public translate: TranslateService,
    private formBuilder: FormBuilder,
    private auth: AuthService) {





    translate.addLangs([globals.language]);

    translate.setDefaultLang(globals.language);

         // the lang to use, if the lang isn't available, it will use the current loader to get them
        translate.use(globals.language);

    this.resetPasswordForm = formBuilder.group({
      email: ['', Validators.compose([Validators.required, EmailValidator.isValid])]
    })
    // const email = new FormControl('', Validators.compose([Validators.required, EmailValidator.isValid]));

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ResetPassword');
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  async submit() {

    let noaddress,ok;

     await   this.translate.stream('An email has been sent at').subscribe((res: string) => {

     noaddress = res;


    //await this.translate.instant('Saved Address list');
});

 await   this.translate.stream('Ok').subscribe((res: string) => {

     ok = res;


    //await this.translate.instant('Saved Address list');
});
    // const email = new FormControl('', Validators.compose([Validators.required, EmailValidator.isValid]));
    let loader = this.loadingCtrl.create({
      // content: "Loggin In...",
      dismissOnPageChange: true,
      spinner: 'hide',
      content: `
      <img src="assets/img/loader.gif" style="width:50%">`,
    });
    // loader.present();
    this.submitAttempt = true;
    if (!this.resetPasswordForm.valid) {
      console.log(' Some values were not given or were incorrect, please fill them');
    } else {
      console.log(this.resetPasswordForm.value);
      loader.present();
      try {
        const reset = await this.auth.resetPassword(this.resetPasswordForm.value.email)
        loader.dismiss();
        let alert = this.alertCtrl.create({
          title: noaddress +" " + this.resetPasswordForm.value.email,
          buttons: [ok]
        })
        console.log(reset);
        alert.present();
        alert.onWillDismiss(() => this.viewCtrl.dismiss());
      } catch (error) {
        console.log("error reseting password", error);
        loader.dismiss();
        let alert = this.alertCtrl.create({
          title: error,
          buttons: [ok]
        })
        alert.present();
      }
    }
  }
}
