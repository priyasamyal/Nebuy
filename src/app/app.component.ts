import {Component} from '@angular/core';
import {App, Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {Geolocation} from '@ionic-native/geolocation';
import {Keyboard} from '@ionic-native/keyboard';
import {NativeStorage} from '@ionic-native/native-storage';
import {AngularFireAuth} from 'angularfire2/auth';
import {AuthService} from '../providers/auth-service';
import {PushService} from '../providers/push-service';
import {LocalNotificationsService} from '../providers/local-notifications-service';
import {GlobalVariable} from './global';
import {Subscription} from 'rxjs/Subscription';
import {DomSanitizer} from '@angular/platform-browser';
import {TranslateService} from '@ngx-translate/core';
import {Storage} from '@ionic/storage';
import {NgModule} from '@angular/core';
import {TranslateModule} from '@ngx-translate/core';
import {FirebaseService} from '../providers/firebase-service';
declare var window: any;
@NgModule({
  imports: [TranslateModule.forChild()],
})
@Component({templateUrl: 'app.html'})
export class MyApp {
  rootPage: any;
  dangerousUrl: any;

  constructor(
    platform: Platform,
    statusBar: StatusBar,
    translate: TranslateService,
    splashScreen: SplashScreen,
    geolocation: Geolocation,
    private keyboard: Keyboard,
    private storage: Storage,
    private globals: GlobalVariable,
    private auth: AuthService,
    private ps: PushService,
    private fs: FirebaseService,
    private lns: LocalNotificationsService,
    private nativeStorage: NativeStorage,
    private afAuth: AngularFireAuth,
    private sanitizer: DomSanitizer
  ) {
    const authObserver: Subscription = afAuth.authState.subscribe(
      async user => {
        if (user) {
          console.log('user', user, 'logged in');
          auth.setGlobals(user.uid);
          globals.current_userUID = user.uid;
          // this.userNotif.createNotificationDocument();
          // this.fs.getUserProfileObject().subscribe(profile => { console.log('profile',
          // profile); })
          await this.ps.initializePushToken(user.uid);
          const userSubscription = this.fs
            .getUserProfileObject()
            .subscribe(profile => {
              if (profile) {
                if (profile.account_linked) {
                  globals.userName = user.email.replace('@gmail.com', '');
                  globals.userNotifications = profile.notifications;
                  this.rootPage = 'OrderTabs';
                  splashScreen.hide();
                  console.log('iiner else');
                } else {
                  this.rootPage = 'EnterUsernamePage';
                }
              } else {
                this.rootPage = 'Landing';
                splashScreen.hide();
              }
            });
          // this.triggerNotification(); userSubscription.unsubscribe();
          // authObserver.unsubscribe();
        } else {
          this.rootPage = 'Landing';
          splashScreen.hide();
        
          // this.rootPage = 'EnterCodePage'; authObserver.unsubscribe();
        }
        this.dangerousUrl = 'https://firebasestorage.googleapis.com/';
        sanitizer.bypassSecurityTrustUrl(this.dangerousUrl);
      }
    );

    platform.ready().then(() => {
      if (window.cordova) {
        console.log('disable scrool');
        window.cordova.plugins.Keyboard.disableScroll(true);
      }
      // splashScreen.hide(); splashScreen.hide();
      if (statusBar) {
        // hide StatusBar using cordova-plugin-statusbar statusBar.hide();
        statusBar.overlaysWebView(false);
        statusBar.styleDefault();
      }
      this.keyboard.hideKeyboardAccessoryBar(false);
      this.nativeStorage
        .getItem('myLangauage')
        .then(data => {
          if (data.langauge == '' || data.langauge == 'undefined') {
            if (
              window.navigator.language != null &&
              window.navigator.language != 'undefined' &&
              window.navigator.language.length >= 2
            ) {
              if (
                window.navigator.language.substring(0, 2) == 'de' ||
                window.navigator.language.substring(0, 2) == 'en' ||
                window.navigator.language.substring(0, 2) == 'es' ||
                window.navigator.language.substring(0, 2) == 'tr'
              ) {
                globals.language = window.navigator.language.substring(0, 2);
              } else {
                globals.language = 'en';
              }
            }
          } else {
            this.globals.language = data.langauge;
          }
        })
        .catch(error => {
          if (
            window.navigator.language != null &&
            window.navigator.language != 'undefined' &&
            window.navigator.language.length >= 2
          ) {
            console.log('turkish', window.navigator.language.substring(0, 2));
            if (
              window.navigator.language.substring(0, 2) == 'de' ||
              window.navigator.language.substring(0, 2) == 'en' ||
              window.navigator.language.substring(0, 2) == 'es' ||
              window.navigator.language.substring(0, 2) == 'tr'
            ) {
              globals.language = window.navigator.language.substring(0, 2);
            } else {
              globals.language = 'en';
            }
          }
        });
      translate.setDefaultLang(globals.language);

      this.lns.responseToNotifications();

      this.nativeStorage
        .getItem('currencyType')
        .then(data => {
          this.globals.currency = data.currency;
        })
        .catch(error => {
          this.globals.currency = 'EUR';
        });

      const onSuccess = function(position) {
        // TODO: remove egypt coords globals.lat = 30.09906; globals.lng = 31.31692;
        globals.lat = position.coords.latitude;
        globals.lng = position.coords.longitude;
      };

      // onError Callback receives a PositionError object
      //
      function onError(error) {
        alert('code: ' + error.code + '\nmessage: ' + error.message + '\n');
      }
      navigator.geolocation.getCurrentPosition(onSuccess, onError);
    });
  }
}
