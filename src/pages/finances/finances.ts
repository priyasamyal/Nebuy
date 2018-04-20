import {Component, OnInit} from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FirebaseService } from "../../providers/firebase-service";
import { GlobalVariable } from "../../app/global";
import { TranslateService,TranslateModule } from '@ngx-translate/core';

@IonicPage()
@Component({
  selector: 'page-finances',
  templateUrl: 'finances.html',
})
export class FinancesPage implements OnInit {
  deliveries: any;
  totalReward: number = 0;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public translate: TranslateService,
    private globals: GlobalVariable,
    private fs: FirebaseService) {

    translate.addLangs([globals.language]);

    translate.setDefaultLang(globals.language);

    // the lang to use, if the lang isn't available, it will use the current loader to get them
    translate.use(globals.language);
  }

  ngOnInit() {
    this.getFinishedDeliveries();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FinancesPage');
  }

  getFinishedDeliveries() {
    this.deliveries = this.fs.getFinishedDeliveries()
      .subscribe(
      (snapshot) => {
        console.log(snapshot);
        snapshot.forEach(item => {
          this.totalReward += Number(item.delivery_cost);
        });
        console.log("totalReward", this.totalReward);
        // deliveries.unsubscribe();
      }
      )
  }

  ionViewWillLeave() {
    this.deliveries.unsubscribe();
  }


}
