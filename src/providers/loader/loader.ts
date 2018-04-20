import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {LoadingController} from "ionic-angular";

@Injectable()
export class LoaderProvider {
  loading;

  constructor(
    public loadingCtrl: LoadingController,
  ) {

  }

  show() {
    this.loading = this.loadingCtrl.create({
      dismissOnPageChange: true,
      spinner: 'hide',
      content: `
      <img src="./assets/img/loader.gif" style="width:50%">`
    });
    this.loading.present();
  }
  hide() {
    try {
      this.loading.dismiss();
    } catch (error) { }
  }
  autoHide(time) {
    this.loading = this.loadingCtrl.create({
      duration: time
    });
    this.loading.present();
  }

}
