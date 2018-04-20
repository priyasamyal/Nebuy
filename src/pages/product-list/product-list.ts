import {Component, OnInit} from '@angular/core';
import {
  AlertController, Events, IonicPage, LoadingController, NavController, NavParams, Platform,
  PopoverController
} from 'ionic-angular';
import { GlobalVariable } from "../../app/global";
import { Keyboard } from "@ionic-native/keyboard";
import { Subscription } from "rxjs/Subscription";
import { ToastController } from 'ionic-angular';
import { App, ViewController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import {FirebaseService} from "../../providers/firebase-service";
import * as _ from 'lodash';

@IonicPage()
@Component({
  selector: 'page-product-list',
  templateUrl: 'product-list.html',
})
export class ProductList implements OnInit {
  productAdded = false;
  currencyIcon: string;
  submitAttempt: boolean = false;
  products: Array<{ name: string, cost: number, images: string[] }> = [];
  orderDetails: any;
  obsArray = [];
  currency:any;
  productName: string = '';
  dialog: any;
  productCost: string = '';
  totalEstimate: number = 0;
  clearOnEdit: boolean = true;
  costNotEntered: boolean = false;
  nameNotEntered: boolean = false;
  cost: string = '0';
  keyOpen: Subscription;
  keyClosed: Subscription;
  private isKeyboardOpen: boolean = false;
  productImages: Array<string> = [];


  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public platform: Platform,
    private globals: GlobalVariable,
    private keyboard: Keyboard,
    private toastCtrl: ToastController,
    public viewCtrl: ViewController,
    public app: App,
    private events: Events,
    private alertCtrl: AlertController,
    private fs: FirebaseService,
    private loadingCtrl: LoadingController,
    public translate: TranslateService,
    private popoverCtrl: PopoverController) {

      translate.addLangs([globals.language]);

      translate.setDefaultLang(globals.language);

       // the lang to use, if the lang isn't available, it will use the current loader to get them
      translate.use(globals.language);

      if(this.globals.currency!=null && this.globals.currency!='invalid' && this.globals.currency!='EUR' && this.globals.currency!='USD'){
        this.currency = 'EUR';
      }else{
       this.currency = this.globals.currency;
      }
     this.orderDetails = navParams.get('orderDetails');
    }

    ngOnInit() {
      this.getCurrency();
    }

  ionViewWillEnter() {
    if (this.platform.is('android')) {
      this.keyOpen = this.keyboard.onKeyboardShow()
        .subscribe(() => {
          this.isKeyboardOpen = true;
        })
      this.keyClosed = this.keyboard.onKeyboardHide()
        .subscribe(() => {
          this.isKeyboardOpen = false;
        })
    }
  }

  ionViewWillLeave() {
    if (this.platform.is('android')) {
      this.keyOpen.unsubscribe();
      this.keyClosed.unsubscribe();
    }
  }

  ionViewDidLoad() {
    this.currency = this.globals.currency;
  }



  clearText(){
  }

  removeCost(){
    this.costNotEntered = false;
  }

  removeName(){
    this.nameNotEntered = false;
    this.keyboard.disableScroll(false);
  }

  addProduct(name, cost, index: number) {
    console.log(name + ' ' + cost + ' ' + index);
    if (name != '') {
      this.nameNotEntered = false;
      if(Number(cost) >= 1){
        this.costNotEntered = false;
      this.products.push({ name: name, cost: Number(cost), images: this.productImages });
      this.totalEstimate += Number(cost);
      // this.products[index].name = name;
      // this.products[index].cost = cost;
      // this.products[index].images = this.productImages;
        this.productAdded = true;
      this.initilizeVariables();
    }else this.costNotEntered = true;
    } else this.nameNotEntered = true;

  }

  choosePhoto(){
    const popover = this.popoverCtrl.create('PickPhotoPage', {}, {cssClass: 'pick-photo-popover custom-popover'});
    popover.present();
    popover.onDidDismiss((images) => {
      if (images && images.length) {
        this.productImages = _.uniq(_.concat(this.productImages, images));
      }
      // console.log(this.productImages);
    });
  }


  goToDeliveryPage(name, cost, index: number) {


 if (this.products.length < 1 && this.productImages.length==0 && name == '' &&  Number(cost) == 0) {

         let noaddress

         this.translate.stream('Kindly fill atleast one field to proceed').subscribe((res: string) => {

     noaddress = res;


    //await this.translate.instant('Saved Address list');
});

      let toast = this.toastCtrl.create({
    message: noaddress,
    duration: 3000,
    position: 'center'
  });

  toast.onDidDismiss(() => {
    console.log('Dismissed toast');
  });

  toast.present();

    } else {

      if(this.products.length > 0){

    }else{
this.costNotEntered = false;
this.nameNotEntered = false;
  this.dialog = document.getElementById('my_confirm_dialog');
    this.dialog.style.visibility = "visible" ;


    }
    }

  }


  goToDelivery(name, cost, index: number){

      this.dialog.style.visibility = "hidden" ;

          this.nameNotEntered = false;
        this.costNotEntered = false;
      this.products.push({ name: name, cost: Number(cost), images: this.productImages });
      this.totalEstimate += Number(cost);
      this.initilizeVariables();


          console.log('proceed clicked');

  }

  initilizeVariables() {
    this.productName = '';
    this.productCost = '';
    this.productImages = [];
  }

  removeProduct(index: number) {
    console.log(this.products);
    console.log(index);
    this.totalEstimate -= this.products[index].cost;
    this.products.splice(index, 1);
    console.log(this.products);
  }

  proceed() {
    if (this.products.length < 1) {
      if (this.products.length < 1 && this.productImages.length==0 && name == '' &&  Number(this.cost) == 0) {
         let noaddress
         this.translate.get('Kindly add atleast one product to proceed').subscribe((res: string) => {
            noaddress = res;
          });
          let toast = this.toastCtrl.create({
            message: noaddress,
            duration: 3000,
            position: 'center'
          });
        toast.onDidDismiss(() => {
          console.log('Dismissed toast');
        });

        toast.present();

          } else {

          }
        }
  }

  async addOrder() {
    console.log(this.orderDetails);
      try {
        this.initiateLoader("Placing your order");
        let dateCreated = this.getCreationDate();
        const addOrder = await this.fs.addOrder(
          this.totalEstimate,
          this.orderDetails.shopDetails,
          this.orderDetails.dropOffDetails,
          this.products,
          dateCreated
        );
        this.events.publish('order:placed');
        console.log("order added", addOrder);
        this.navCtrl.popToRoot();
        this.app.getRootNav().getActiveChildNav().select(1);
      } catch (error) {
        const alert = this.alertCtrl.create({
          title: "Error",
          subTitle: error,
          buttons: ['Try Again']
        });
        alert.present();
      }
  }


  clearIcon() {

  }

  getCurrency() {
    if(this.globals.currency!=null && this.globals.currency!='invalid' && this.globals.currency!='EUR' && this.globals.currency!='USD'){

      this.currency = 'EUR';
    }else{

      this.currency = this.globals.currency
    }
    this.currencyIcon = 'ai-'+ this.globals.currency;
  }

  initiateLoader(content: string) {
    let loader = this.loadingCtrl.create({
      // content: content,
      duration: 2500,
      dismissOnPageChange: true,
      spinner: 'hide',
      content: `<img src="assets/img/loader.gif" style="width:50%">`
    });
    loader.present();
  }

  getCreationDate() {
    let currentDateTime = new Date();
    let currentYear = currentDateTime.getFullYear().toString();
    let currentMonth = currentDateTime.getMonth() + 1;
    let currentDate = currentDateTime.getDate().toString();
    let date = currentDate; let month = currentMonth - 1;
    let dateCreated = currentDate + "-" + currentMonth.toString() + "-" + currentYear;
    console.log("dateCreated", dateCreated);
    return dateCreated;
  }


}
