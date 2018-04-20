import {Component, OnDestroy, ViewChild, ElementRef} from '@angular/core';
import {
  IonicPage,
  NavController,
  LoadingController,
  Platform,
  NavParams,
  TextInput,
  Content,
  App,
  AlertController,
} from 'ionic-angular';
import {
  FirebaseListObservable,
  AngularFireDatabase,
} from 'angularfire2/database';
import {GlobalVariable} from '../../app/global';
import {FirebaseService} from '../../providers/firebase-service';
import {PushService} from '../../providers/push-service';
import {NativeStorage} from '@ionic-native/native-storage';
import firebase from 'firebase';
import {ImageViewerController} from 'ionic-img-viewer';
import {InAppBrowser} from '@ionic-native/in-app-browser';
import {ImagePicker, ImagePickerOptions} from '@ionic-native/image-picker';
import {Camera, CameraOptions} from '@ionic-native/camera';
import {DomSanitizer} from '@angular/platform-browser';
import {Storage} from '@ionic/storage';
import {TranslateService, TranslateModule} from '@ngx-translate/core';
import {OneSignal} from '@ionic-native/onesignal';
import {Subscription} from 'rxjs/Subscription';

@IonicPage()
@Component({selector: 'page-chat', templateUrl: 'chat.html'})
export class Chat implements OnDestroy {
  @ViewChild(Content) content: Content;
  @ViewChild('sendInput') public sendInput: TextInput;
  pushSubscription: Subscription;
  messages: FirebaseListObservable<any>;
  otherUserMessages: any;
  _imageViewerCtrl: ImageViewerController;
  message: string;
  chatId: any;
  dialog: any;
  pageName: string;
  pageNo: any;
  item: any;
  recipientId: string;
  recipientName: string;
  playerId: any;
  show: boolean = true;
  cameraOptions: CameraOptions = {
    quality: 100,
    destinationType: this.camera.DestinationType.DATA_URL,
    sourceType: this.camera.PictureSourceType.CAMERA,
    encodingType: this.camera.EncodingType.JPEG,
    targetWidth: 200,
    targetHeight: 200,
    saveToPhotoAlbum: true,
  };

  pickerOptions: ImagePickerOptions = {
    width: 200,
    height: 200,
    quality: 100,
    outputType: 1,
    maximumImagesCount: 1,
  };

  constructor(
    public navCtrl: NavController,
    imageViewerCtrl: ImageViewerController,
    public navParams: NavParams,
    private af: AngularFireDatabase,
    private fs: FirebaseService,
    public app: App,
    public storage: Storage,
    private ps: PushService,
    public translate: TranslateService,
    public _DomSanitizer: DomSanitizer,
    private platform: Platform,
    private iab: InAppBrowser,
    public loadingCtrl: LoadingController,
    private ns: NativeStorage,
    private oneSignal: OneSignal,
    private globals: GlobalVariable,
    private imagePicker: ImagePicker,
    private alertCtrl: AlertController,
    private camera: Camera
  ) {
    translate.addLangs([globals.language]);

    translate.setDefaultLang(globals.language);

    // the lang to use, if the lang isn't available, it will use the current loader
    // to get them
    translate.use(globals.language);

    storage.ready().then(() => {});

    console.log('chat nav params', this.navParams);

    this.chatId = navParams.get('item').chat_id;
    this.item = this.navParams.get('item');
    this.pageName = navParams.get('pageName');
    this.pageNo = navParams.get('pageNo');
    this.recipientId = navParams.get('recipientId');
    this.getPushTokenForRecipient();
    this._imageViewerCtrl = imageViewerCtrl;

    if (this.chatId) {
      this.messages = this.af.list(
        '/users/' +
          this.globals.current_userUID +
          '/messages/' +
          this.chatId +
          '/chat_messages/'
      );
      if (this.pageNo == 1 && this.pageName == 'MyOrders') {
        this.otherUserMessages = firebase
          .database()
          .ref(
            '/users/' +
              this.item.seller_id +
              '/messages/' +
              this.chatId +
              '/chat_messages/'
          );
      } else {
        if (this.pageNo == 3 && this.pageName == 'MyDeliveries') {
          this.otherUserMessages = firebase
            .database()
            .ref(
              '/users/' +
                this.item.buyer_id +
                '/messages/' +
                this.chatId +
                '/chat_messages/'
            );
        }
      }

      if (this.pageNo == 1 && this.pageName == 'MyOrders') {
        console.log('page', this.pageNo);
        console.log('pageName', this.pageName);
        if (this.globals.myOrdersNotifications > 1) {
          this.globals.myOrdersNotifications -= Number(
            this.globals.chatNotifications[this.chatId]
          );
          this.globals.chatNotifications[this.chatId] = '';
          this.storage.set(
            this.chatId,
            this.globals.chatNotifications[this.chatId]
          );
        } else {
          this.globals.myOrdersNotifications = 0;
          this.globals.chatNotifications[this.chatId] = '';
          this.storage.set(
            this.chatId,
            this.globals.chatNotifications[this.chatId]
          );
        }
      } else {
        if (this.pageNo == 3 && this.pageName == 'MyDeliveries') {
          console.log('page', this.pageNo);
          console.log('pageName', this.pageName);

          console.log('page', this.globals.myDeliveriesNotifications + '');
          console.log(
            'pageName',
            this.globals.chatNotifications[this.chatId] + ''
          );
          if (this.globals.myDeliveriesNotifications > 1) {
            this.globals.myDeliveriesNotifications -= Number(
              this.globals.chatNotifications[this.chatId]
            );
            this.globals.chatNotifications[this.chatId] = '';
            console.log('pa', this.globals.myDeliveriesNotifications);
            console.log('pageNe', this.globals.chatNotifications[this.chatId]);
            this.storage.set(
              this.chatId,
              this.globals.chatNotifications[this.chatId]
            );
          } else {
            this.globals.myDeliveriesNotifications = 0;
            this.globals.chatNotifications[this.chatId] = '';
            this.storage.set(
              this.chatId,
              this.globals.chatNotifications[this.chatId]
            );
          }
        }
      }
    }
  }

  presentImage(myImage) {
    const imageViewer = this._imageViewerCtrl.create(myImage);
    imageViewer.present();
  }

  ionViewWillEnter() {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad Chat');
    console.log('recipientName', this.globals.recipientName);
  }

  ionViewDidEnter() {
    console.log(this.item);
    this.content.scrollToBottom();
  }

  hideDialog() {
    if (this.dialog) {
      this.dialog.style.visibility = 'hidden';
    }
  }

  removeNotification() {
    this.navCtrl.pop();
    this.app
      .getRootNav()
      .getActiveChildNav()
      .select(this.pageNo, this.chatId);
  }

  async getPushTokenForRecipient() {
    //debugger;
    if (!this.playerId) {
      console.log('this.recipientId', this.recipientId);
      const playerId = await this.fs.getPlayerId(this.recipientId);
      this.playerId = playerId.playerId;
    }

    if (!this.recipientName) {
      const recipientName = await this.fs.getPlayerId(this.recipientId);
      this.globals.recipientName = recipientName.user_name;
    }
  }

  choose() {
    this.dialog = document.getElementById('my_dialog');
    this.dialog.style.visibility = 'visible';
  }

  async send() {
    console.log('sending');
    this.sendInput.setFocus();
    try {
      if (
        this.message == '' ||
        this.message.replace(/\s|\n/g, '').length == 0
      ) {
        this.message = '';
        // document.getElementById('messageId').style.textAlign = 'center';

        throw 'message empty';
      } else {
        // Initialize chat if not initialized if (!this.chatId) {

        if (this.pageNo == 1 && this.pageName == 'MyOrders') {
          this.chatId = await this.fs.initializeChat(this.item, 'order');
        } else {
          this.chatId = await this.fs.initializeChat(this.item, 'delivery');
        }

        this.item.chat_id = this.chatId;
        console.log('initializeChat', this.chatId);
        // }

        this.messages = this.af.list(
          'users/' +
            this.globals.current_userUID +
            '/messages/' +
            this.chatId +
            '/chat_messages/'
        );
        this.otherUserMessages =
          this.pageName === 'MyOrders'
            ? firebase
                .database()
                .ref(
                  'users/' +
                    this.item.seller_id +
                    '/messages/' +
                    this.chatId +
                    '/chat_messages/'
                )
            : firebase
                .database()
                .ref(
                  'users/' +
                    this.item.buyer_id +
                    '/messages/' +
                    this.chatId +
                    '/chat_messages/'
                );

        // this.messages.subscribe(item => console.log(item));
        let composeMessage = {
          text: this.message,
          date: new Date().toDateString(),
          message_sender: this.globals.current_userUID,
        };

        // document.getElementById('messageId').style.textAlign = 'center';
        const result = await Promise.all([
          this.addMessage(composeMessage),
          this.ps.sendRemoteMessage(
            this.playerId,
            this.chatId,
            this.message,
            this.pageName,
            this.pageNo
          ),
        ]);
        console.log(result);
        // this   .content   .scrollToBottom();
        this.message = '';
      }
      this.content.scrollToBottom(400);
    } catch (error) {
      console.error(error);
    }
  }

  focus() {
    // alert(1); this.autoScroll();
    this.content.scrollToBottom(400);
    console.log('okk scrolling');
  }

  autoScroll() {
    // setTimeout(function () {   var itemList =
    // document.getElementById("chat-autoscroll");   console.log(itemList);
    // console.log(itemList.scrollTop);   itemList.scrollTop =
    // itemList.scrollHeight;   console.log("hel;;") });
  }

  openAddress(lat: string, lng: string) {
    let destination = lat + ',' + lng;
    console.log('destination', destination);
    let label = encodeURI('your location');
    console.log('label', label);
    if (this.platform.is('ios')) {
      // window.open('maps://?q=' + 'dropoff' + '&saddr=' + position.coords.latitude +
      // ',' + position.coords.longitude + '&daddr=' + this.location.latitude + ',' +
      // this.location.longitude, '_system'); window.open('maps://?q=' + destination,
      // '_system');
      console.log('yup its ios');
      const browser = this.iab.create(
        'maps://?q=' + destination + '(' + label + ')',
        '_system'
      );
    }
    // android
    if (this.platform.is('android')) {
      const browser = this.iab.create(
        'geo://' +
          lat +
          ',' +
          lat +
          '?q=' +
          lng +
          ',' +
          lng +
          '(' +
          label +
          ')',
        '_system'
      );
      // window.open('http://tebros.com/2016/02/launching-external-maps-app-from-ionic
      // 2/', '_system');
    }
  }

  async getAddress() {
    this.dialog.style.visibility = 'hidden';

    try {
      let address = 'assets/img/locationImage.png';

      let composeMessage = {
        date: new Date().toDateString(),
        message_sender: this.globals.current_userUID,
        address: address,
        lat: this.globals.lat,
        lng: this.globals.lng,
      };
      const result = await Promise.all([
        this.addMessage(composeMessage),
        // this.messages.push(composeMessage),
        this.ps.sendRemoteAddress(
          this.playerId,
          this.chatId,
          address,
          this.globals.lat,
          this.globals.lng,
          this.pageName,
          this.pageNo
        ),
      ]);
      console.log('result', result);
      this.content.scrollToBottom();
    } catch (error) {
      console.error('hello', error);
    }

    //  let destination = this.globals.lat.toString() + ',' +
    // this.globals.lng.toString();     console.log("destination", destination); let
    // label = encodeURI(name);     console.log("label", label);     if
    // (this.platform.is('ios')) {       // window.open('maps://?q=' + 'dropoff' +
    // '&saddr=' + position.coords.latitude + ',' + position.coords.longitude +
    // '&daddr=' + this.location.latitude + ',' + this.location.longitude,
    // '_system');       // window.open('maps://?q=' + destination, '_system');
    // console.log("yup its ios");       const browser =
    // this.iab.create('maps://?q=' + destination + '(' + label + ')', '_system');
    // };     // android     if (this.platform.is('android')) {       const browser
    // = this.iab.create('geo://' + this.globals.lat + ',' + this.globals.lat +
    // '?q=' + this.globals.lng + ',' + this.globals.lng + '(' + label + ')',
    // '_system');       //
    // window.open('http://tebros.com/2016/02/launching-external-maps-app-from-ionic
    // 2 /', '_system');     };
  }

  async pickPhoto() {
    this.dialog.style.visibility = 'hidden';

    try {
      var images = await this.imagePicker.getPictures(this.pickerOptions);
      console.log(images);
      var imge: any;
      images.map(image => {
        imge = image;
      });
      let status = await this.fs.storeChatImage(this.chatId, imge);

      console.log(status);

      let composeMessage = {
        date: new Date().toDateString(),
        message_sender: this.globals.current_userUID,
        image: status,
      };
      const result = await Promise.all([
        this.addMessage(composeMessage),
        // this.messages.push(composeMessage),
        this.ps.sendRemoteImage(
          this.playerId,
          this.chatId,
          imge,
          this.pageName,
          this.pageNo
        ),
      ]);
      console.log(result);
      this.content.scrollToBottom();
      console.log('image added');
    } catch (error) {
      console.error('error uploading image: ', error);
    }
  }

  async takePhoto() {
    this.dialog.style.visibility = 'hidden';
    try {
      const image = await this.camera.getPicture(this.cameraOptions);
      let imge = await this.fs.storeChatImage(this.chatId, image);

      let composeMessage = {
        date: new Date().toDateString(),
        message_sender: this.globals.current_userUID,
        image: imge,
      };
      const result = await Promise.all([
        this.addMessage(composeMessage),
        // this.messages.push(composeMessage),
        this.ps.sendRemoteImage(
          this.playerId,
          this.chatId,
          image,
          this.pageName,
          this.pageNo
        ),
      ]);
      console.log(result);
      this.content.scrollToBottom();
      // console.log("productImages:", this.productImages);
    } catch (error) {
      console.error('error uploading image: ', error);
    }
  }

  CancelDialog() {
    this.dialog.style.visibility = 'hidden';
  }

  chatProfile() {
    this.navCtrl.push('ChatProfile', {recipientId: this.recipientId});
  }

  async addMessage(message) {
    const messageRef = await this.messages.push(message);
    return this.otherUserMessages.child(messageRef.key).update(message);
  }

  /**
   * Delete chat id from orders/deliveries
   * Delete entire chat if deleted from both seller and buyer
   */
  deleteChat() {
    const alert = this.alertCtrl.create({
      subTitle: 'Are you sure you want to delete chat?',
      buttons: [
        {
          text: 'ok',
          handler: () => {
            if (this.chatId) {
              console.log('chat to delete', this.chatId);
              if (this.pageNo == 3 && this.pageName == 'MyDeliveries') {
                // Remove chat id from deliveries
                console.log('from delivery');
                this.fs.deleteUserChat(this.item, 'delivery');
              } else {
                console.log('from order');
                // Remove chat id from orders
                this.fs.deleteUserChat(this.item, 'order');
              }
              this.navCtrl.pop();
            }
          },
        },
      ],
    });

    alert.present();
  }

  grow(event) {
    console.log('key up', event);
    const textArea = event.target;
    textArea.style.height = '5px';
    textArea.style.height = textArea.scrollHeight + 'px';
    // this.content.getNativeElement().content.style.marginBottom =
    // textArea.style.height;
    this.content.resize();
    this.content.scrollToBottom();
  }

  ngOnDestroy() {
    this.pushSubscription && this.pushSubscription.unsubscribe();
  }

  disableSendBtn() {
    console.log('message', this.message);
    //  debugger var element = document.getElementById("myLabel"); setTimeout(() =>
    // {   element.scrollIntoView(true) }, 200);

    if (this.message != '') {
      console.log('if ');
      this.show = false;
    } else {
      console.log('elese');
      this.show = true;
    }
    this.content.scrollToBottom(400);
  }
}
