import { Component } from '@angular/core';
import {IonicPage, NavController, NavParams, ViewController} from 'ionic-angular';
import {countries} from "../../data/countries.data";

/**
 * Generated class for the SelectCountryCodePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-select-country-code',
  templateUrl: 'select-country-code.html',
})
export class SelectCountryCodePage {
  countries: any = [];
  temp: any = [];
  constructor(public navCtrl: NavController, public navParams: NavParams, private vc: ViewController) {
    this.countries = countries;
    this.temp = countries;

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SelectCountryCodePage');
  }

  selectedCountry(country) {
    this.vc.dismiss(country);
  }

  search(event) {
    let val = event.target.value;
    if (val) {
      val = val.toLowerCase();
      const temp = this.temp.filter(function(d) {
        console.log(d.name);
        return d.name.toLowerCase().indexOf(val) !== -1 ||
          !val;
      });

      // update the rows
      this.countries = temp;
    } else {
      this.countries = countries;
    }

  }

  cancel() {
    console.log('cancelled');
    this.countries = countries;
  }
}
