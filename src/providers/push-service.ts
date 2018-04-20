import {Injectable} from '@angular/core';
import {Http, Response, Headers, RequestOptions, URLSearchParams} from '@angular/http';
import {Platform} from "ionic-angular";
import {OneSignal} from '@ionic-native/onesignal';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import {Observable} from "rxjs";
import {AngularFireDatabase} from 'angularfire2/database';
import {GlobalVariable} from "../app/global";

@Injectable()
export class PushService {

  url : string = '';
  headers : any;
  appId : string = "";

  constructor(public http : Http, private globals : GlobalVariable, private _SIGNAL : OneSignal, private db : AngularFireDatabase, private platform : Platform) {

    console.log('Hello PushService Provider');
    this.url = "https://onesignal.com/api/v1/notifications";
    this.appId = "62a54e9c-81ad-42b1-ba3a-d87c06fdb5bf";
    this.headers = new Headers({'Authorization': 'Basic YjYyZTdmYTItYjMxMi00MTM5LTg5Y2YtNGUxNjMwODYyODI4', 'Content-type': 'application/json; charset=utf-8'});
  }

  acceptOrderNotification(playerId : string) {
    var message = {
      app_id: this.appId,
      contents: {
        "en": "Order Accepted"
      },
      title: this.globals.firstName + " has accepted to deliver your order",
      data: {
        type: "orderAccepted",
        name: this.globals.firstName
      },
      include_player_ids: [playerId]
    };
    let options = new RequestOptions({method: "POST", headers: this.headers});

    return this
      .http
      .post(this.url, JSON.stringify(message), options)
      .toPromise()
      .then(this.extractData)
      .catch(this.catchPromiseError);
  }

  sendRemoteMessage(playerId : string, chatId : string, msg : string, pageName : string, pageNo : any) {
    console.log("send message notification chatId", chatId);
    console.log("appId", this.appId);

    console.log("appplayerIdId", playerId);
    console.log("chatId", chatId);
    console.log("msg", msg);
    console.log("appId", this.appId);
    var message = {
      app_id: this.appId,
      contents: {
        "en": this.globals.userName + ": " + msg
      },
      // title: "User " + this.globals.userName + " has send you a message",
      ios_badgeType: 'Increase',
      ios_badgeCount: 1,
      data: {
        type: "msgNotification",
        chatId: chatId,
        pageName: pageName,
        pageNo: pageNo,
        name: this.globals.userName,
        message: msg
      },
      include_player_ids: [playerId]
    };

    console.log(message);

    console.log('message payload', message);

    let options = new RequestOptions({method: "POST", headers: this.headers});

    return this
      .http
      .post(this.url, JSON.stringify(message), options)
      .toPromise()
      .then(this.extractData)
      .catch(this.catchPromiseError);
  }

  sendRemoteAddress(playerId : string, chatId : string, address : string, lat : string, lng : string, pageName : string, pageNo : any) {
    var message = {
      app_id: this.appId,
      contents: {
        "en": "User " + this.globals.userName + " has send you a message"
      },
      // title: "User " + this.globals.userName + " has send you a message",
      ios_badgeType: 'Increase',
      ios_badgeCount: 1,
      data: {
        type: "msgNotification",
        chatId: chatId,
        pageName: pageName,
        pageNo: pageNo,
        name: this.globals.userName,
        message: address,
        lat: lat,
        lng: lng
      },
      include_player_ids: [playerId]
    };

    let options = new RequestOptions({method: "POST", headers: this.headers});

    return this
      .http
      .post(this.url, JSON.stringify(message), options)
      .toPromise()
      .then(this.extractData)
      .catch(this.catchPromiseError);
  }

  sendRemoteImage(playerId : string, chatId : string, image : string, pageName : string, pageNo : any) {
    console.log("chatId", chatId);
    var message = {
      app_id: this.appId,
      contents: {
        "en": "User " + this.globals.userName + " has send you a message"
      },
      // title: "User " + this.globals.userName + " has send you a message",
      ios_badgeType: 'Increase',
      ios_badgeCount: 1,
      data: {
        type: "msgNotification",
        chatId: chatId,
        pageName: pageName,
        pageNo: pageNo,
        name: this.globals.userName,
        message: image
      },
      include_player_ids: [playerId]
    };

    let options = new RequestOptions({method: "POST", headers: this.headers});

    return this
      .http
      .post(this.url, JSON.stringify(message), options)
      .toPromise()
      .then(this.extractData)
      .catch(this.catchPromiseError);
  }

  confirmDeliveryFromSeller(playerId : string, deliveryData, cost) {
    var message = {
      app_id: this.appId,
      contents: {
        "en": "Delivery Confirmation"
      },
      title: this.globals.firstName + " has delivered your order plase confirm",
      data: {
        type: "confirmDelivery",
        name: this.globals.firstName,
        playerId: this.globals.currentUserPlayerId,
        deliveryData: deliveryData,
        cost: cost
      },
      include_player_ids: [playerId]
    };

    let options = new RequestOptions({method: "POST", headers: this.headers});

    return this
      .http
      .post(this.url, JSON.stringify(message), options)
      .toPromise()
      .then(this.extractData)
      .catch(this.catchPromiseError);
  }

  delinceDeliveryFromBuyer(playerId : string) {
    console.log(playerId);
    var message = {
      app_id: this.appId,
      contents: {
        "en": "Delivery Confirmation"
      },
      data: {
        type: "declineDelivery",
        playerId: this.globals.currentUserPlayerId
      },
      include_player_ids: [playerId]
    };
    console.log(message);
    // TODO: set delivery status to I am delivering

    let options = new RequestOptions({method: "POST", headers: this.headers});

    return this
      .http
      .post(this.url, JSON.stringify(message), options)
      .toPromise()
      .then(this.extractData)
      .catch(this.catchPromiseError);
  }

  confirmDeliveryFromBuyer(playerId : string, deliveryData) {
    var message = {
      app_id: this.appId,
      contents: {
        "en": "Delivery Confirmation"
      },
      title: "The buyer has confirmed you delivery",
      data: {
        type: "buyerConfirmation",
        name: this.globals.firstName,
        playerId: this.globals.currentUserPlayerId,
        deliveryData: deliveryData
      },
      include_player_ids: [playerId]
    };

    let options = new RequestOptions({method: "POST", headers: this.headers});

    return this
      .http
      .post(this.url, JSON.stringify(message), options)
      .toPromise()
      .then(this.extractData)
      .catch(this.catchPromiseError);
  }

  sendLocationNotification(lat, lng) {

    var message = {
      app_id: this.appId,
      contents: {
        "en": "An Order was placed near you"
      },
      data: {
        type: "orderNearby"
      },
      filters: [
        {
          "field": "location",
          "radius": "20000",
          "lat": lat,
          "long": lng
        }
      ]
    };

    let options = new RequestOptions({method: "POST", headers: this.headers});

    return this
      .http
      .post(this.url, JSON.stringify(message), options)
      .toPromise()
      .then(this.extractData)
      .catch(this.catchPromiseError);
  }

  orderExpired(date, orderId, chatId) {
    console.log("this.globals.currentUserPlayerId", this.globals.currentUserPlayerId);
    var message = {
      app_id: this.appId,
      contents: {
        "en": "Order Update"
      },
      // title: "Your order expired",
      data: {
        type: "orderExpired",
        orderId: orderId,
        chatId: chatId
      },
      ios_badgeType: 'Increase',
      ios_badgeCount: 1,
      send_after: date,
      include_player_ids: [this.globals.currentUserPlayerId]
    };

    let options = new RequestOptions({method: "POST", headers: this.headers});

    return this
      .http
      .post(this.url, JSON.stringify(message), options)
      .toPromise()
      .then(this.extractData)
      .catch(this.catchPromiseError);
  }

  cancelOrderNotification(playerId) {
    let user = this.globals.userName
    console.log("user", user)
    console.log("playerId", playerId)
    var message = {
      app_id: this.appId,
      contents: {
        "en": user + ` cancelled delivery. Your order is active again`
      },
      title: user + ` cancelled delivery. Your order is active again`,
      data: {
        type: "cancelOrder",
        user: user
        // chatId: chatId
      },
      ios_badgeType: 'Increase',
      ios_badgeCount: 1,
      include_player_ids: [playerId]
    };

    let options = new RequestOptions({method: "POST", headers: this.headers});

    return this
      .http
      .post(this.url, JSON.stringify(message), options)
      .toPromise()
      .then(this.extractData)
      .catch(this.catchPromiseError);
  }

  help(email, helpText) {
    let url = "http://flexorda.com/flexordaapp/Data/mail_help";

    let body = new URLSearchParams();
    body.set("helpText", helpText);
    body.set("email", email);

    let headers = new Headers({'Content-Type': 'application/json; charset=UTF-8'});
    let options = new RequestOptions({headers: headers});

    console.log(body);
    console.log(body.toString());

    return this
      .http
      .post(url, body)
      .toPromise()
      .then(this.extractData)
      .catch(this.catchPromiseError);

  }

  report(reportObj) {
    let url = "http://flexorda.com/flexordaapp/Data/mail_order";
    let body = new URLSearchParams();
    body.set("order", JSON.stringify(reportObj));
    // body.set("complaint", reportObj["complaint"]); body.set("images",
    // reportObj["images"]); body.set("reportId", reportObj["report_id"]);
    // body.set("orderData", JSON.stringify(reportObj["order_data"]));

    console.log("reportObj", reportObj);
    console.log("strigified", JSON.stringify(reportObj));
    // console.log("parsed", JSON.parse(reportObj));
    let headers = new Headers({'Content-Type': 'application/json'});
    // let options = new RequestOptions({ headers: headers });

    console.log(body);
    // console.log(body.toString());

    return this
      .http
      .post(url, body)
      .toPromise()
      .then((res : Response) => {
        return res.json()
      })
      .catch(this.catchPromiseError);
  }

  reportOrder(reportObj) {
    let url = "http://flexorda.com/flexordaapp/Data/mail_orderreport";
    let body = new URLSearchParams();
    body.set("data", JSON.stringify(reportObj));
    // body.set("complaint", reportObj["complaint"]); body.set("images",
    // reportObj["images"]); body.set("reportId", reportObj["report_id"]);
    // body.set("orderData", JSON.stringify(reportObj["order_data"]));

    console.log("reportObj", reportObj);
    console.log("strigified", JSON.stringify(reportObj));
    // console.log("parsed", JSON.parse(reportObj)); let headers = new Headers({
    // 'Content-Type': 'application/json; charset=UTF-8' }); let options = new
    // RequestOptions({ headers: headers });

    console.log(body);
    // console.log(body.toString());

    return this
      .http
      .post(url, body)
      .toPromise()
      .then((res : Response) => {
        return res.json()
      })
      .catch(this.catchPromiseError);
  }

  private logResponse(res : Response) {
    console.log(res.json());
  }

  private extractData(res : Response) {
    return res.json();
  }

  private catchPromiseError(error : Response | any) : Promise < any > {
    // console.log(error); return Observable.throw(error.json().error || error ||
    // "some error in http get");
    return Promise.reject(error.json().error || error || "some error in http post");
  }

  private catchObserverError(error : Response | any) {
    // console.log(error);
    return Observable.throw(error.json().error || error || "some error in http get");
  }

  async initializePushToken(uid) {
    console.log('initialiazinf push token');
    if (this.platform.is('ios')) {
      console.log("platform ios");
      var iosSettings = {};
      iosSettings["kOSSettingsKeyAutoPrompt"] = true;
      iosSettings["kOSSettingsKeyInAppLaunchURL"] = false;

      this
        ._SIGNAL
        .startInit(this.appId)
        .iOSSettings(iosSettings);
    } else if (this.platform.is('android')) {
      console.log("platform android");
      this
        ._SIGNAL
        .startInit(this.appId, '634967884988');
    }

    this
      ._SIGNAL
      .inFocusDisplaying(this._SIGNAL.OSInFocusDisplayOption.None);

    // const ids = await this._SIGNAL.getIds(); console.log("ids", ids);
    // this.globals.currentUserPlayerId = ids.userId; await this.db.object('/users/'
    // + uid).update({   pushToken: ids.pushToken,   playerId: ids.userId });

    this
      ._SIGNAL
      .endInit();

    this
      ._SIGNAL
      .getIds()
      .then((ids) => {
        console.log('player ids', ids);
        this.globals.currentUserPlayerId = ids.userId;
        this
          .db
          .object('/users/' + uid)
          .update({pushToken: ids.pushToken, playerId: ids.userId})
      })
      .then(() => {
        this
          ._SIGNAL
          .setSubscription(true);
        this
          ._SIGNAL
          .endInit();
        return true;
      })
  }

  async clearPushToken(uid) : Promise < any > {
    this
      ._SIGNAL
      .setSubscription(false);
    return this
      .db
      .object('/users/' + uid)
      .update({pushToken: "", playerId: ""})
  }
}
