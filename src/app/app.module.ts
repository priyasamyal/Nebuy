import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';

import { CurrencyPipe } from "@angular/common";
import { MyApp } from './app.component';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Camera } from "@ionic-native/camera";
import { Geolocation } from "@ionic-native/geolocation";
import { NativeStorage } from "@ionic-native/native-storage";
import { OneSignal } from '@ionic-native/onesignal';
import { IonicStorageModule } from '@ionic/storage';
// import { LocalNotifications } from "@ionic-native/local-notifications";
import { Keyboard } from "@ionic-native/keyboard";
import { Facebook } from "@ionic-native/facebook";
import { SocialSharing } from "@ionic-native/social-sharing";
// import { LaunchNavigator } from "@ionic-native/launch-navigator";
import { IonicImageViewerModule } from "ionic-img-viewer";
// import { ActionSheet } from "@ionic-native/action-sheet";
import { InAppBrowser } from "@ionic-native/in-app-browser";
import { ImagePicker } from "@ionic-native/image-picker";

// importing providers
import { AuthService } from '../providers/auth-service';
import { FirebaseService } from '../providers/firebase-service';
import { PushService } from "../providers/push-service";
import { GoogleMaps } from '../providers/google-maps';
import { LocalNotificationsService } from "../providers/local-notifications-service";
import { GlobalVariable } from './global';
import { MultiPickerModule } from 'ion-multi-picker';

// importing angularire 2
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from "angularfire2/auth";

import { Ionic2RatingModule } from "ionic2-rating";
 import { DatePipe } from '@angular/common';
 import { TranslateModule, TranslateLoader,TranslatePipe } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { HttpModule, Http } from "@angular/http";
import {AlertProvider} from "../providers/alert/alert";
import {LoaderProvider} from "../providers/loader/loader";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";


export const firebaseConfig = {
  // apiKey: "AIzaSyB-Dpy7JHP2a9XvU4DMNGSonbC2QQ5vZ9E",
  // authDomain: "flex-orda.firebaseapp.com",
  // databaseURL: "https://flex-orda.firebaseio.com",
  // projectId: "flex-orda",
  // storageBucket: "flex-orda.appspot.com",
  // messagingSenderId: "206080062764"
  apiKey: "AIzaSyB50Uqd3sKRe3KbNqLyrjIFq4t6wpAlcCM",
  authDomain: "nebuy-f0035.firebaseapp.com",
  databaseURL: "https://nebuy-f0035.firebaseio.com",
  projectId: "nebuy-f0035",
  storageBucket: "nebuy-f0035.appspot.com",
  messagingSenderId: "634967884988"
};

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    MyApp,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    HttpModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]

      }
    }),
    IonicModule.forRoot(MyApp, {
      backButtonText: '',
      backButtonIcon: 'ion-custom-back',
      statusbarPadding: false,
      mode: 'ios'

    }),
    MultiPickerModule,

    IonicStorageModule.forRoot(),
    Ionic2RatingModule,
    IonicImageViewerModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    AngularFireAuthModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Geolocation,
    DatePipe,
    Camera,
    NativeStorage,
    OneSignal,
    IonicStorageModule,
    ImagePicker,
    TranslatePipe,
    LocalNotificationsService,
    Keyboard,
    Facebook,
    SocialSharing,
    InAppBrowser,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    GlobalVariable,
    CurrencyPipe,
    AuthService,
    FirebaseService,
    PushService,
    GoogleMaps,
    AlertProvider,
    LoaderProvider,
  ]
})
export class AppModule { }
