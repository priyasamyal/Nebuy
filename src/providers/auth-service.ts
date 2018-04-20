import {Injectable} from '@angular/core';
import {AngularFireAuth} from 'angularfire2/auth';
import {AngularFireDatabase} from 'angularfire2/database';
import {GlobalVariable} from '../app/global';
import {PushService} from "./push-service";
import {Facebook} from "@ionic-native/facebook";
import * as firebase from 'firebase';
import 'rxjs/add/operator/map';
import {Platform} from "ionic-angular";
import {Storage} from "@ionic/storage";
import {FirebaseObjectObservable} from "angularfire2/database";

@Injectable()
export class AuthService {

  public fireAuth : any;
  public userData : any;
  item : FirebaseObjectObservable < any >;
  constructor(private afAuth : AngularFireAuth, private globals : GlobalVariable, private db : AngularFireDatabase, private platform : Platform, private storage : Storage, private fb : Facebook, private ps : PushService) {

    console.log('Hello AuthService Provider');
    afAuth
      .authState
      .subscribe(user => {
        if (user) {
          this.fireAuth = user
          console.log(user);
        }
      });
    // this.fireAuth = firebase.auth();

    this.userData = firebase
      .database()
      .ref('/users');
  }

  loginUser(email : string, password : string)/*: firebase.Promise<any>*/
  {
    // return firebase.auth().signInWithEmailAndPassword(email, password);
    return this
      .afAuth
      .auth
      .signInWithEmailAndPassword(email, password);
  }

  async signupUser(email : string, password : string, signupData : any)/*: firebase.Promise<any>*/
  {
    try {
      const newUser = await this
        .afAuth
        .auth
        .createUserWithEmailAndPassword(email, password)
      await this
        .afAuth
        .auth
        .currentUser
        .updateProfile({
          displayName: signupData.userName,
          photoURL: "https://aciappcenter.cisco.com/skin/frontend/ciscopackage/system/images/avatar.p" +
              "ng",
          //background_image: "../assets/img/background.png"

        });

      this.globals.current_userUID = newUser.uid;
      this.globals.firstName = signupData.firstName;
      this.globals.lastName = signupData.lastName;
      this.globals.userName = signupData.userName;
      await this
        .userData
        .child(newUser.uid)
        .set({
          email: email,
          user_name: signupData.userName,
          first_name: signupData.firstName,
          last_name: signupData.lastName,
          date_of_birth: signupData.dob,
          no_of_orders: 0,
          profile_photo: "https://aciappcenter.cisco.com/skin/frontend/ciscopackage/system/images/avatar.p" +
              "ng"
        });

      this
        .ps
        .initializePushToken(newUser.uid);
    } catch (error) {
      console.error(error);
      throw error
    }
  }

  getCode(params : {
    mobile: string,
    countryCode: string
  }) {
    const promise = new Promise((resolve, reject) => {
      console.log('verfication');

      if (this.platform.is('android')) {
        console.log('verfication from android');

        (< any > window)
          .FirebasePlugin
          .verifyPhoneNumber(params.mobile, 60, (credentials) => {
            console.log(credentials.verificationId);
            resolve(credentials.verificationId);
          }, (error) => {
            console.log(error);
            reject(error.message);
          });
      } else if (this.platform.is('ios')) {
        console.log('verfication from ios');

        (< any > window)
          .FirebasePlugin
          .getVerificationID('+' + params.countryCode + params.mobile, credentials => {
            console.log("verificationID: " + credentials);
            resolve(credentials);
          }, error => {
            console.log("error: " + error);
            reject(error.description);
          });
      }
    });

    return promise;
  }

  async verify(verificationId, code) {
    console.log('verification');
    let signInCredential = firebase
      .auth
      .PhoneAuthProvider
      .credential(verificationId, code);
    return await firebase
      .auth()
      .signInWithCredential(signInCredential);
  }

  async register(username : string, password : string) {
    let credential = firebase
      .auth
      .EmailAuthProvider
      .credential(username + '@gmail.com', password);
    await this
      .afAuth
      .auth
      .currentUser
      .linkWithCredential(credential);
    // await this.linkAccount(true);
    await this
      .afAuth
      .auth
      .currentUser
      .updateProfile({
        displayName: username.replace('@gmail', ''),
        photoURL: "https://aciappcenter.cisco.com/skin/frontend/ciscopackage/system/images/avatar.p" +
            "ng"
      });
    const newUser = this.afAuth.auth.currentUser;
    await this
      .userData
      .child(newUser.uid)
      .set({
        user_name: username.replace('@gmail', ''),
        no_of_orders: 0,
        account_linked: true,
        profile_photo: "https://aciappcenter.cisco.com/skin/frontend/ciscopackage/system/images/avatar.p" +
            "ng"
      });
    this
      .ps
      .initializePushToken(newUser.uid);
  }

  async linkAccount(isLinked : boolean) {
    await this
      .platform
      .ready();
    await this
      .storage
      .ready();
    try {
      await this
        .storage
        .set('account_linked', isLinked);
    } catch (error) {
      console.log(error);
    }
  }

  resetPassword(email : string) : any {
    return this
      .afAuth
      .auth
      .sendPasswordResetEmail(email)
      // return this.fireAuth.sendPasswordResetEmail(email);
  }

  changePassword(password) {
    const user = firebase
      .auth()
      .currentUser;
    return user.updatePassword(password);
  }

  logoutUser() {
    return this
      .afAuth
      .auth
      .signOut();
  }

  getUserProfile() {
    return this.afAuth.auth.currentUser;
  }

  async updatePhoto(url : string, userName) {
    const profile = await this
      .afAuth
      .auth
      .currentUser
      .updateProfile({
        displayName: userName, photoURL: url,
        //background_image: savedImage
      });
    return await this
      .db
      .object('/users/' + this.globals.current_userUID)
      .update({profile_photo: url})
  }

  updateUsername(username : string) {}

  setGlobals(uid) {
    this
      .db
      .object('/users/' + uid)
      .first()
      .subscribe((snapshot) => {
        this.globals.firstName = snapshot.first_name;
        this.globals.lastName = snapshot.last_name;
        this.globals.userName = snapshot.user_name;
        this.globals.current_userUID = uid;
        console.log('this.globals.firstName', this.globals.firstName);
      });
    /*ref.once("value", (snapshot) => {
                                          this.globals.firstName = snapshot.val().first_name;
                                          this.globals.lastName = snapshot.val().last_name;
                                          console.log('this.globals.firstName', this.globals.firstName);
                                        })*/
  }
  unsetGlobals() {
    this.globals.current_userUID = "";
    this.globals.notificationToken = "";
    this.globals.firstName = "";
    this.globals.lastName = "";
    this.globals.userName = "";
    this.globals.orderStatus = "active";
    this.globals.lat = '';
    this.globals.lng = '';
    this.globals.currentUserPlayerId = '';
    this.globals.orderLat = '';
    this.globals.orderLng = '';
    this.globals.updateOrderLocations = '';
    this.globals.chatNotifications = {};
  }
}