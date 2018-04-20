import { Injectable } from '@angular/core'
import { FormGroup } from '@angular/forms';
import { Observable } from "rxjs";
@Injectable()
export class GlobalVariable {
  // public ionicApis: string = "https://api.ionic.io/";
  public enterUsername: boolean;
  public current_userUID: string = "";
  public notificationToken: string = "";
  public firstName: string = "";
  public lastName: string = "";
  public userName: string = "";
  public orderStatus: string = "active";
  public lat;
  public lng;
  public pushObject;
  // public cacheProducts: FormGroup;
  public currentUserPlayerId: string = '';
  public orderLat: any;
  public orderLng: any;
  public backgroundImage: string = '';
  public updateOrderLocations: any;
  public chatNotifications = {};
  public myOrdersNotifications:number = 0;
  public myDeliveriesNotifications :number = 0;
  public recipientName = '';
  public language = '';
  public currency: string = "EUR";
  public userNotifications: any = {};


  public badgeNumber = 7;
}
