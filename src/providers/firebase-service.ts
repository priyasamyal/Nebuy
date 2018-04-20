import {Injectable} from '@angular/core';
import {Subscription} from "rxjs/Subscription";
import 'rxjs/add/operator/map';
import 'rxjs/Rx';
import {Observable} from 'rxjs/Rx';
import {Geolocation} from '@ionic-native/geolocation';
import {GlobalVariable} from "../app/global";
import {FirebaseListObservable, FirebaseObjectObservable, AngularFireDatabase} from "angularfire2/database";
import {PushService} from "./push-service";
// import { LocalNotificationsService } from "./local-notifications-service";
import firebase from 'firebase';
declare var GeoFire : any;
@Injectable()
export class FirebaseService {

  orderList$ : FirebaseListObservable < any >;
  orderObject$ : FirebaseObjectObservable < any >;
  buyerObject$ : FirebaseObjectObservable < any >;
  chatRef$ : FirebaseListObservable < any >;
  buyerAddress : any;
  buyerEmail : any;
  userData : any;
  userOrders : any;
  // this.globals.current_userUIDirebase.auth().currentUser;
  orders = [];
  imagesStored : string[] = []
  lat : number;
  lng : number;
  orderLocations = firebase
    .database()
    .ref('orders/locations');
  userLocations = firebase
    .database()
    .ref('users/locations');
  // time: any;

  constructor(private af : AngularFireDatabase, private geolocation : Geolocation, private ps : PushService, private globals : GlobalVariable) {
    console.log('Hello FirebaseService Provider');
  }

  storePictures(uid, name : string, photoRef)/*: firebase.Promise<any>*/
  {
    let storageRef = firebase
      .storage()
      .ref('/users/');
    return storageRef
      .child(uid)
      .child(name)
      .putString(photoRef, 'base64', {contentType: 'image/png'})
  }

  async addOrder(totalEstimate, shopContent, dropoffDetails, products, dateCreated) : Promise < any > {
    console.log(dropoffDetails);
    this.userOrders = firebase
      .database()
      .ref('/users/' + this.globals.current_userUID + '/orders/');
    let time;
    let geoFire = new GeoFire(this.orderLocations);
    // let dateCreated = new Date();

    if (dropoffDetails.anyTime) {
      time = {
        anyTime: dropoffDetails.anyTime
      };
    } else {
      time = {
        betweenTimeOne: dropoffDetails.betweenTimeOne,
        betweenTimeTwo: dropoffDetails.betweenTimeTwo
      };
    }

    try {
      console.log('buyer name', this.globals.userName);
      this.orderList$ = this
        .af
        .list('/orders');
      const orderRef = await this
        .orderList$
        .push({
          status: 'active',
          cost: totalEstimate,
          reward: dropoffDetails.reward || 0,
          delivery_time: time,
          dateCreated: dateCreated,
          buyer_id: this.globals.current_userUID,
          buyer_name: this.globals.userName,
          shop: {
            shop_name: shopContent.name,
            address: shopContent.formatted_address,
            place_id: shopContent.placeId,
            lat: shopContent.lat,
            lng: shopContent.lng,
            shop_photo: shopContent.photo

          },
          location: {
            lat: shopContent.lat,
            lng: shopContent.lng
          },
          delivery_address: {
            name: dropoffDetails.name,
            address: dropoffDetails.formatted_address,
            place_id: dropoffDetails.placeId,
            lat: dropoffDetails.lat,
            lng: dropoffDetails.lng
          },
          // products: products
        })
      const storedProducts = await this.storeProductImages(orderRef.key, products);
      console.log("storedProducts", storedProducts);

      // TODO: Remove initialize chat when creating an order const initializeChat =
      // await this.initializeChat(orderRef.key); console.log('initializeChat',
      // initializeChat);

      let ref = firebase
        .database()
        .ref('orders/' + orderRef.key + "/");
      const uidUpdated = await ref.update({uid: orderRef.key})
      console.log("uidUpdated", uidUpdated);

      const geofire = await geoFire.set(orderRef.key, [shopContent.lat, shopContent.lng])
      console.log("geoFireSet", geofire);
      // .catch(error => {   throw (error); });

      await this
        .userOrders
        .child(orderRef.key)
        .update({
          uid: orderRef.key,
          status: 'active',
          cost: totalEstimate,
          reward: dropoffDetails.reward,
          delivery_time: time,
          dateCreated: dateCreated,
          buyer_id: this.globals.current_userUID,
          buyer_name: this.globals.userName,
          shop: {
            shop_name: shopContent.name,
            address: shopContent.formatted_address,
            place_id: shopContent.placeId,
            lat: shopContent.lat,
            lng: shopContent.lng,
            shop_photo: shopContent.photo
          },
          location: {
            lat: shopContent.lat,
            lng: shopContent.lng
          },
          delivery_address: {
            name: dropoffDetails.name,
            address: dropoffDetails.formatted_address,
            place_id: dropoffDetails.placeId,
            lat: dropoffDetails.lat,
            lng: dropoffDetails.lng
          },
          messages: 0
          // products: products
        });
      let userRef = firebase
        .database()
        .ref('/users/' + this.globals.current_userUID);
      let no_of_orders : number;
      await userRef.once("value", snapshot => {
        no_of_orders = snapshot
          .val()
          .no_of_orders;
        no_of_orders += 1;
      });
      await userRef.update({no_of_orders: no_of_orders})
      return {
        orderId: orderRef.key, noOfOrders: no_of_orders,
        /*chatRef: initializeChat*/
      }
    } catch (error) {
      console.error("error adding order:", error);
      return error;
    }

  }

  async storeProductImages(orderRef, products) : Promise < any > {
    let images: string[] = [];
    let ref = firebase
      .database()
      .ref('orders/' + orderRef + "/");
    let storageRef = firebase
      .storage()
      .ref(orderRef);
    this.userOrders = firebase
      .database()
      .ref('/users/' + this.globals.current_userUID + '/orders/');

    return products.forEach((item, i) => {
      if (item.images.length > 0) {
        item
          .images
          .forEach((image, index) => {
            storageRef
              .child(item.name)
              .child(index.toString())
              .putString(image, 'base64', {contentType: 'image/jpg'})
              .then((savedImage) => {
                console.log(savedImage.downloadURL);
                images.push(savedImage.downloadURL)
                // image = savedImage.downloadURL;
                products[i].images[index] = savedImage.downloadURL;
              })
              .then(() => {
                console.log('this.imagesStored', images);
                console.log("products", products);
                ref.update({products: products});
                this
                  .userOrders
                  .child(orderRef)
                  .update({products: products})
              })
          })
      } else {
        this
          .userOrders
          .child(orderRef)
          .update({products: products})
        ref.update({products: products});
      }
      // console.log('this.imagesStored', images); item.images = images;
    })
    // console.log(products);

  }

  async initializeChat(item, from) {
    console.log('order from initialize chat', item);
    // let dateCreated = new Date();
    const orderKey = from === 'order'
      ? item.uid
      : item.order_id;
    const deliveryKey = from === 'order'
      ? item.delivery_id
      : item.uid;
    const buyerId = from === 'order'
      ? this.globals.current_userUID
      : item.buyer_id;
    this.userOrders = firebase
      .database()
      .ref('/users/' + buyerId + '/orders/');
    console.log(this.userOrders);
    const userDeliveries = firebase
      .database()
      .ref('/users/' + item.seller_id + '/deliveries/');

    if (item.chat_id) {
      console.log('chat id present', item.chat_id);
      // if (item.chat_deleted) {
      await userDeliveries
        .child(deliveryKey)
        .update({chat_deleted: false});

      await this
        .userOrders
        .child(orderKey)
        .update({chat_deleted: false});
      // }
      return item.chat_id;
    } else {

      this.chatRef$ = this
        .af
        .list('/users/' + buyerId + '/messages');
      const chatRef = await this
        .chatRef$
        .push({order_id: orderKey, buyer_id: buyerId, seller_id: item.seller_id});

      console.log(chatRef);

      const sellerChatRef = firebase
        .database()
        .ref('/users/' + item.seller_id + '/messages');
      await sellerChatRef
        .child(chatRef.key)
        .update({order_id: orderKey, buyer_id: buyerId, seller_id: item.seller_id});

      console.log('initialize success');
      // let orderRef = firebase.database().ref('orders/' + orderKey + "/"); await
      // orderRef.update({ chat_id: chatRef.key, /*dateCreate: dateCreated*/});
      await this
        .userOrders
        .child(orderKey)
        .update({chat_id: chatRef.key});
      await userDeliveries
        .child(deliveryKey)
        .update({chat_id: chatRef.key});
      return chatRef.key
    }

  }

  editOrderStatus(orderKey) {
    let orderRef = firebase
      .database()
      .ref('/orders/' + orderKey);
    return orderRef.update({
      status: 'inactive'
    }, (error) => {
      console.log('Error updating status: ' + error);
    })
  }

  async getOrderStatus(orderKey) {
    let orderRef = firebase
      .database()
      .ref('/orders/' + orderKey);
    let status;
    await orderRef.once("value", snapshot => {
      status = snapshot
        .val()
        .status;
    })
    if (status) 
      return status
  }
  async deleteOrder(orderKey, chatId
    ?, buyerId
    ?) {
    if (chatId) {
      let chat_ref = firebase
        .database()
        .ref('/messages/' + chatId);
      await chat_ref.remove();
    }
    // let ref; if (buyerId) {   ref = firebase.database().ref('/users/' + buyerId +
    // '/orders/' + orderKey); } else {   ref = firebase.database().ref('/users/' +
    // this.globals.current_userUID + '/orders/' + orderKey); }
    let orderRef = firebase
      .database()
      .ref('/users/' + this.globals.current_userUID + '/finished_orders/' + orderKey);
    let orderLocationRef = firebase
      .database()
      .ref('/users/' + this.globals.current_userUID + '/finished_orders/' + orderKey);
    // await ref.remove();
    await orderRef.remove();
    await orderLocationRef.remove();
  }

  async DeleteOrder(orderKey, chatId
    ?, buyerId
    ?) {
    if (chatId) {
      let chat_ref = firebase
        .database()
        .ref('/messages/' + chatId);
      await chat_ref.remove();
    }
    let ref;
    if (buyerId) {
      ref = firebase
        .database()
        .ref('/users/' + buyerId + '/orders/' + orderKey);
    } else {
      ref = firebase
        .database()
        .ref('/users/' + this.globals.current_userUID + '/orders/' + orderKey);
    }
    let orderRef = firebase
      .database()
      .ref('/orders/' + orderKey);
    let orderLocationRef = firebase
      .database()
      .ref('/orders/locations/' + orderKey);
    await ref.remove();
    await orderRef.remove();
    await orderLocationRef.remove();
  }

  async deleteDelivery(seller_id, item) {

    let orderRef = firebase
      .database()
      .ref('/users/' + seller_id + '/finished_deliveries/' + item);

    console.log('url', orderRef);

    await orderRef.remove();

  }

  getUserOrders() {
    // let userOrders$: FirebaseListObservable<any>; userOrders$ =
    // this.af.database.list('/users/' + this.globals.current_userUID + '/orders/');
    return this
      .af
      .list('/users/' + this.globals.current_userUID + '/orders/');
  }

  getUserDeliveries() {
    return this
      .af
      .list('/users/' + this.globals.current_userUID + '/deliveries/');
  }
  getSpecificOrder(orderUID) {
    // return this.af.database.list('/users/' + this.globals.current_userUID +
    // '/orders/'+ orderUID);
    return this
      .af
      .object('/users/' + this.globals.current_userUID + '/orders/' + orderUID)
      .take(1)
      .toPromise()
  }

  getFinishedDeliveries() {
    return this
      .af
      .list('/users/' + this.globals.current_userUID + '/finished_deliveries/');
  }

  rateFinishedDelivery(deliveryId) {
    let ref = firebase
      .database()
      .ref('/users/' + this.globals.current_userUID + '/finished_deliveries/' + deliveryId);
    return ref.update({rated: true});
  }

  getFinishedOrders() {
    return this
      .af
      .list('/users/' + this.globals.current_userUID + '/finished_orders/');
  }

  editFinishedOrders(orderKey, editItems) {
    let ref = firebase
      .database()
      .ref('/users/' + this.globals.current_userUID + '/finished_orders/' + orderKey);
    return ref.update(editItems);
  }

  async addDeliveryStatus(uid, orderUID, buyerUID) {
    const orderObject$ = this
      .af
      .object('/users/' + buyerUID + '/orders/' + orderUID);
    try {

      return orderObject$.update({delivery: uid, buyer_id: buyerUID})

    } catch (error) {
      console.error("error", error);
    }

  }

  async updateOrderStatus(orderUID, status : string, lat
    ?, lng
    ?)/* : firebase.Promise<any> */
  {
    const orderObject$ = this
      .af
      .object('orders/' + orderUID);
    try {
      const orderLocation = await this
        .af
        .object('/orders/locations/' + orderUID)
        .take(1)
        .toPromise()
      let orderLatLng = {
        orderLat: '',
        orderLng: ''
      };
      if (status == "in_active") {
        orderLatLng.orderLat = orderLocation.l[0];
        orderLatLng.orderLng = orderLocation.l[1];
        this.globals.updateOrderLocations = orderLatLng;
        console.log(this.globals.updateOrderLocations)
        this
          .af
          .object('/orders/locations/' + orderUID)
          .remove()
      }
      if (status == "active") {
        // let lat = this.globals.updateOrderLocations.orderLat; let lng =
        // this.globals.updateOrderLocations.orderLng;
        // console.log(this.globals.updateOrderLocations)
        if (lat && lng) {
          let geoFire = new GeoFire(this.orderLocations);
          geoFire
            .set(orderUID, [lat, lng])
            .catch(error => {
              throw(error);
            });
        }
        console.log("updating order status")
      }
      return orderObject$.update({status: status});
    } catch (error) {
      console.error("error", error);
    }
  }

  async updateOrderstatus(orderUID, status : string)/* : firebase.Promise<any> */
  {
    const orderObject$ = this
      .af
      .object('orders/' + orderUID);
    try {

      return orderObject$.update({status: status});
    } catch (error) {
      console.error("error", error);
    }
  }

  async updateDeliveryStatus(id, sellerId, status : string, deliveryCosts
    ?)/* : firebase.Promise<any> */
  {

    let updates : any = {
      status: status
    };

    if (deliveryCosts) {
      updates = Object.assign(updates, deliveryCosts);
    }
    console.log('updating delivery status', updates);
    const deliveryObject$ = this
      .af
      .object('/users/' + sellerId + '/deliveries/' + id);
    try {

      return deliveryObject$.update(updates);
    } catch (error) {
      console.error("error", error);
    }
  }

  async updateOrderStatusInBuyer(buyerUID, orderUID, status : string, deliveryCosts
    ?) {
    console.log('updating order status in buyer', status, buyerUID, orderUID);

    let updates : any = {
      status: status,
      seller_id: this.globals.current_userUID,
      seller_name: this.globals.userName
    };
    if (status === 'active') {
      updates.chat_id = null;
    }
    if (deliveryCosts) {
      updates = Object.assign(updates, deliveryCosts);
    }
    const orderObject$ = this
      .af
      .object('/users/' + buyerUID + '/orders/' + orderUID);
    return orderObject$.update(updates)
  }

  removeDeliveryInCurrentUser(deliveryId, orderId) {
    let ref = firebase
      .database()
      .ref('/users/' + this.globals.current_userUID + '/deliveries/' + deliveryId);
    ref.remove();
  }

  async addDeliveriesInCurrentUser(buyerUID, orderUID, item) {
    var time;
    console.log(item);
    console.log('seller name', this.globals.userName);
    if (item.delivery_time.anyTime) {
      time = {
        anyTime: item.delivery_time.anyTime
      };
    } else {
      time = {
        betweenTimeOne: item.delivery_time.betweenTimeOne,
        betweenTimeTwo: item.delivery_time.betweenTimeTwo
      };
    }
    let ref = firebase
      .database()
      .ref('/users/' + this.globals.current_userUID)
      .child('deliveries');
    // let chatRef = this.af.object('/messages/' + item.chat_id);
    const delivery = await ref.push({
      buyer_id: buyerUID,
      order_id: orderUID,
      buyer_name: item.buyer_name,
      seller_id: this.globals.current_userUID,
      seller_name: this.globals.userName,
      //chat_id: item.chat_id,
      cost: item.cost,
      reward: item.reward,
      delivery_time: time,
      dateCreated: item.dateCreated,
      shop: {
        shop_name: item.shop.shop_name,
        address: item.shop.address,
        place_id: item.shop.place_id,
        lat: item.shop.lat,
        lng: item.shop.lng,
        shop_photo: item.shop.shop_photo
      },
      delivery_address: {
        name: item.delivery_address.name,
        address: item.delivery_address.address,
        place_id: item.delivery_address.place_id,
        lat: item.delivery_address.lat,
        lng: item.delivery_address.lng,
        // shop_photo:item.shop.photo
      },
      products: item.products,
      status: 'delivering',
      messages: 0
    });
    let deliveryRef = firebase
      .database()
      .ref('/users/' + this.globals.current_userUID + '/deliveries/' + delivery.key + "/");
    deliveryRef.update({uid: delivery.key});
    let orderRef = firebase
      .database()
      .ref('/users/' + buyerUID + '/orders/' + item.uid + "/");
    orderRef.update({delivery_id: delivery.key, seller_name: this.globals.userName});
    // chatRef.update({ seller_id: this.globals.current_userUID });

  }

  addAddress(addresses) : firebase.Promise < any > {
    let ref = firebase
      .database()
      .ref('/users/' + this.globals.current_userUID);
    return ref.update({addresses: addresses});
  }

  getUserAddress() {
    return this
      .af
      .list('/users/' + this.globals.current_userUID + '/addresses/')
  }

  // watchUserLocation() {   setInterval(() => {     this.getCurrentPosition() },
  // 5000); }
  getCurrentPosition() {
    return this
      .geolocation
      .getCurrentPosition()
  }

  setUserLocation(lat, lng) {
    let geoFire = new GeoFire(this.userLocations);
    return geoFire.set(this.globals.current_userUID, [lat, lng])
  }

  async editOrderActivate(orderKey, editData, deliveryTimeType, lat, lng)/* : firebase.Promise<any> */
  {
    let ref = firebase
      .database()
      .ref('/users/' + this.globals.current_userUID + '/orders/' + orderKey);
    let orderRef = firebase
      .database()
      .ref('/orders/' + orderKey);
    let geoFire = new GeoFire(this.orderLocations);
    const geofire = await geoFire.set(orderRef.key, [lat, lng])
    console.log("geoFireSet", geofire);

    orderRef.update({
      delivery_time: {
        betweenTimeOne: editData.betweenTimeOne,
        betweenTimeTwo: editData.betweenTimeTwo
      },
      status: "active"
    })
    return ref.update({
      delivery_time: {
        betweenTimeOne: editData.betweenTimeOne,
        betweenTimeTwo: editData.betweenTimeTwo
      },
      status: "active"

    })

  }

  async editOrder(orderKey, editData, products, deliveryTimeType, cost : number, lat, lng)/* : firebase.Promise<any> */
  {
    let ref = firebase
      .database()
      .ref('/users/' + this.globals.current_userUID + '/orders/' + orderKey);
    let orderRef = firebase
      .database()
      .ref('/orders/' + orderKey);
    let geoFire = new GeoFire(this.orderLocations);
    const geofire = await geoFire.set(orderRef.key, [lat, lng])

    let deliveryTime = deliveryTimeType == 'anyTime'
      ? {
        anyTime: editData.deliveryTime
      }
      : {
        betweenTimeOne: editData.betweenTimeOne,
        betweenTimeTwo: editData.betweenTimeTwo
      };

    const newOrder : any = {
      delivery_time: deliveryTime,
      reward: editData.reward,
      cost: cost
    };

    console.log(newOrder);
    this.editProducts(orderKey, products);
    orderRef.update(newOrder);
    return ref.update(newOrder);
    // if (deliveryTimeType == 'anyTime') {   this.editProducts(orderKey, products);
    //   orderRef.update({     delivery_time: { anyTime: editData.deliveryTime },
    // reward: editData.reward,     cost: cost   })   return ref.update({
    // delivery_time: { anyTime: editData.deliveryTime },     reward:
    // editData.reward,     cost: cost   }) } else if (deliveryTimeType ==
    // 'betweenTimeOne') {   this.editProducts(orderKey, products);
    // orderRef.update({     delivery_time: { betweenTimeOne:
    // editData.betweenTimeOne, betweenTimeTwo: editData.betweenTimeTwo }, reward:
    // editData.reward,     cost: cost   })   return ref.update({ delivery_time: {
    // betweenTimeOne: editData.betweenTimeOne, betweenTimeTwo:
    // editData.betweenTimeTwo },     reward: editData.reward,     cost: cost   }) }

  }

  editProducts(orderKey, products) {
    products.map((item, i) => {
      console.log(item);
      let userProductRef = firebase
        .database()
        .ref('/users/' + this.globals.current_userUID + '/orders/' + orderKey + '/products/' + i);
      let orderProductRef = firebase
        .database()
        .ref('/orders/' + orderKey + '/products/' + i);
      userProductRef.update({cost: item.cost, name: item.name});
      orderProductRef.update({cost: item.cost, name: item.name});
    });
  }

  getUserProfile() {
    return this
      .af
      .list('/users/' + this.globals.current_userUID);
  }

  getUserProfilePicture(uid) {
    return this
      .af
      .object('/users/' + uid + '/profile_photo/')
      .take(1)
      .toPromise();;
  }

  getUserProfileObject() {
    return this
      .af
      .object('/users/' + this.globals.current_userUID);
  }

  getUserName(uid) {
    return this
      .af
      .object('/users/' + uid + '/user_name/')
      .take(1)
      .toPromise();
  }

  getUserEmail(uid) {
    return this
      .af
      .object('/users/' + uid + '/email/')
      .take(1)
      .toPromise();
  }

  getUserReviews(uid) {
    return this
      .af
      .list('/users/' + uid + '/reviews/');
  }

  discardReview(orderId) {
    let subscribtion : Subscription = this
      .af
      .list('/users/' + this.globals.current_userUID + '/reviews/')
      .subscribe((data) => {
        // data.forEach(element => {   if (element.order_id == orderId) {
        // this.af.object('/users/' + this.globals.current_userUID + '/reviews/' +
        // element.$key).remove();   } });
        let review = data.find(element => {
          return element.order_id == orderId;
          // if (element.order_id == orderId) { }
        });
        console.log("deleting review", review);
        if (review) {
          console.log("deleting review");
          this
            .af
            .object('/users/' + this.globals.current_userUID + '/reviews/' + review.$key)
            .remove();
        } else 
          console.log("review doese not exists");
        subscribtion.unsubscribe();
      })
  }
  async updateUserRating(rating, uid) {
    console.log("rating", rating);
    let newRating;
    const subscription : Subscription = this
      .af
      .object('/users/' + uid)
      .take(1)
      .subscribe((userData) => {
        console.log("userData", userData);
        if (userData.rating) {
          newRating = (userData.rating + rating) / 2;
          console.log("newRating", newRating);
          this.updateUserProfile('rating', newRating, uid);
          subscription.unsubscribe();
        } else {
          this.updateUserProfile('rating', rating, uid);
          subscription.unsubscribe();
        };
      })
  }

  updateUserProfile(key, value, uid) {
    let ref = firebase
      .database()
      .ref('users/' + uid + "/");
    ref.update({[key]: value});
  }

  async storeProfilePhoto(image : string) {
    let storageRef = firebase
      .storage()
      .ref(this.globals.current_userUID + '/profile_photo/');
    const savedImage = await storageRef.putString(image, 'base64', {contentType: 'image/jpg'});
    return savedImage.downloadURL;
    // return this.af.object('/users/' + this.globals.current_userUID).update({
    // profile_photo: savedImage.downloadURL })
  }

  async storeProfileBackground(image : string) {
    let storageRef = firebase
      .storage()
      .ref(this.globals.current_userUID + '/background_image/');
    const savedImage = await storageRef.putString(image, 'base64', {contentType: 'image/jpg'});
    console.log('hello', savedImage.downloadURL);
    return savedImage.downloadURL;

  }

  async storeChatImage(chatId, image) {
    const filename = Math.floor(Date.now() / 1000);
    let stoge = firebase
      .storage()
      .ref(chatId);
    let storageRef = stoge.child('/image/' + filename + '.jpg');
    const savedImage = await storageRef.putString(image, 'base64', {contentType: 'image/jpg'})
    console.log('hello', savedImage.downloadURL);
    return savedImage.downloadURL;

  }

  async getPlayerId(uid) {
    console.log("getPlayerId uid", uid);
    let ref = firebase
      .database()
      .ref('/users/' + uid);

    const snapshot = await ref.once('value');
    console.log("snapshot snapshot.val()", snapshot.val());
    return snapshot.val();
  }

  async getPlayerIds(uid) {
    let playerId;
    const subscription : Subscription = this
      .af
      .object('/users/' + uid)
      .take(1)
      .subscribe((userData) => {
        console.log("userData", userData);

        playerId = userData.playerId;

        subscription.unsubscribe();

      })

    return playerId;
  }

  async finishOrders(deliveryData, total) {
    console.log('finish order delivery data', deliveryData);
    try {
      var time;
      if (deliveryData.delivery_time.anyTime) {
        time = {
          anyTime: deliveryData.delivery_time.anyTime
        };
      } else {
        time = {
          betweenTimeOne: deliveryData.delivery_time.betweenTimeOne,
          betweenTimeTwo: deliveryData.delivery_time.betweenTimeTwo
        };
      }
      let buyerOrderRef = firebase
        .database()
        .ref('/users/' + deliveryData.buyer_id/*+ '/finished_orders/' + deliveryData.order_id + "/"*/);
      let sellerDeliveryRef = firebase
        .database()
        .ref('/users/' + deliveryData.seller_id/* + '/finished_deliveries/' + deliveryData.order_id + "/"*/);
      await buyerOrderRef
        .child('finished_orders')
        .push({
          buyer_id: deliveryData.buyer_id,
          order_id: deliveryData.uid,
          seller_id: deliveryData.seller_id,
          cost: deliveryData.cost,
          reward: deliveryData.reward,
          actual_cost: deliveryData.actual_cost,
          delivery_cost: deliveryData.delivery_cost,
          delivery_time: time,
          dateCreated: deliveryData.dateCreated,
          shop: {
            shop_name: deliveryData.shop.shop_name,
            address: deliveryData.shop.address,
            place_id: deliveryData.shop.place_id,
            lat: deliveryData.shop.lat,
            lng: deliveryData.shop.lng,
            shop_photo: deliveryData.shop.shop_photo
          },
          delivery_address: {
            name: deliveryData.delivery_address.name,
            address: deliveryData.delivery_address.address,
            place_id: deliveryData.delivery_address.place_id,
            lat: deliveryData.delivery_address.lat,
            lng: deliveryData.delivery_address.lng
          },
          products: deliveryData.products,
          totalCost: total
        });
      await sellerDeliveryRef
        .child('finished_deliveries')
        .push({
          buyer_id: deliveryData.buyer_id,
          order_id: deliveryData.uid,
          seller_id: deliveryData.seller_id,
          cost: deliveryData.cost,
          reward: deliveryData.reward,
          actual_cost: deliveryData.actual_cost,
          delivery_cost: deliveryData.delivery_cost,
          delivery_time: time,
          dateCreated: deliveryData.dateCreated,
          shop: {
            shop_name: deliveryData.shop.shop_name,
            address: deliveryData.shop.address,
            place_id: deliveryData.shop.place_id,
            lat: deliveryData.shop.lat,
            lng: deliveryData.shop.lng,
            shop_photo: deliveryData.shop.shop_photo
          },
          delivery_address: {
            name: deliveryData.delivery_address.name,
            address: deliveryData.delivery_address.address,
            place_id: deliveryData.delivery_address.place_id,
            lat: deliveryData.delivery_address.lat,
            lng: deliveryData.delivery_address.lng
          },
          products: deliveryData.products,
          totalCost: total
        })
      // this.af.object('/users/' + deliveryData.buyer_id + '/orders/' +
      // deliveryData.order_id).remove();
      this.DeleteOrder(deliveryData.uid);
      this
        .af
        .object('/users/' + deliveryData.seller_id + '/deliveries/' + deliveryData.delivery_id)
        .remove();
    } catch (error) {
      console.error("error in finishOrder:", error.toString);
    }
  }

  async finishOrder(deliveryData, total) {

    try {
      var time;
      if (deliveryData.delivery_time.anyTime) {
        time = {
          anyTime: deliveryData.delivery_time.anyTime
        };
      } else {
        time = {
          betweenTimeOne: deliveryData.delivery_time.betweenTimeOne,
          betweenTimeTwo: deliveryData.delivery_time.betweenTimeTwo
        };
      }
      let buyerOrderRef = firebase
        .database()
        .ref('/users/' + deliveryData.buyer_id/*+ '/finished_orders/' + deliveryData.order_id + "/"*/);
      let sellerDeliveryRef = firebase
        .database()
        .ref('/users/' + deliveryData.seller_id/* + '/finished_deliveries/' + deliveryData.order_id + "/"*/);
      await buyerOrderRef
        .child('finished_orders')
        .push({
          buyer_id: deliveryData.buyer_id,
          order_id: deliveryData.order_id,
          seller_id: deliveryData.seller_id,
          cost: deliveryData.cost,
          reward: deliveryData.reward,
          delivery_time: time,
          dateCreated: deliveryData.dateCreated,
          shop: {
            shop_name: deliveryData.shop.shop_name,
            address: deliveryData.shop.address,
            place_id: deliveryData.shop.place_id,
            lat: deliveryData.shop.lat,
            lng: deliveryData.shop.lng,
            shop_photo: deliveryData.shop.shop_photo
          },
          delivery_address: {
            name: deliveryData.delivery_address.name,
            address: deliveryData.delivery_address.address,
            place_id: deliveryData.delivery_address.place_id,
            lat: deliveryData.delivery_address.lat,
            lng: deliveryData.delivery_address.lng
          },
          products: deliveryData.products,
          totalCost: total
        });
      await sellerDeliveryRef
        .child('finished_deliveries')
        .push({
          buyer_id: deliveryData.buyer_id,
          order_id: deliveryData.order_id,
          seller_id: deliveryData.seller_id,
          cost: deliveryData.cost,
          reward: deliveryData.reward,
          delivery_time: time,
          dateCreated: deliveryData.dateCreated,
          shop: {
            shop_name: deliveryData.shop.shop_name,
            address: deliveryData.shop.address,
            place_id: deliveryData.shop.place_id,
            lat: deliveryData.shop.lat,
            lng: deliveryData.shop.lng,
            shop_photo: deliveryData.shop.shop_photo
          },
          delivery_address: {
            name: deliveryData.delivery_address.name,
            address: deliveryData.delivery_address.address,
            place_id: deliveryData.delivery_address.place_id,
            lat: deliveryData.delivery_address.lat,
            lng: deliveryData.delivery_address.lng
          },
          products: deliveryData.products,
          totalCost: total
        })
      // this.af.object('/users/' + deliveryData.buyer_id + '/orders/' +
      // deliveryData.order_id).remove();
      this.deleteOrder(deliveryData.order_id);
      this
        .af
        .object('/users/' + deliveryData.seller_id + '/deliveries/' + deliveryData.uid)
        .remove();
    } catch (error) {
      console.error("error in finishOrder:", error.toString);
    }
  }

  async report(orderData, images
    ?) : Promise < any > {
    let reports = this
      .af
      .list('reports/');
    let reportRef = await reports.push({orderData: orderData});
    console.log("reportRef", reportRef.key)
    let storageRef = firebase
      .storage()
      .ref('reports/');
    let ref = firebase
      .database()
      .ref('reports/' + reportRef.key + "/");
    let process;
    if (images && images.length > 0) {
      process = images.map(async(image, index) => {
        const savedImage = await storageRef
          .child(reportRef.key)
          .child(index.toString())
          .putString(image, 'base64', {contentType: 'image/jpg'});
        return savedImage.downloadURL;
      });
      const savedImages = await Promise.all(process)
      console.log("savedImage", savedImages);
      await ref.update({images: savedImages});
      return this
        .af
        .object('reports/' + reportRef.key + "/")
        .take(1)
        .toPromise();
    } else {
      return this
        .af
        .object('reports/' + reportRef.key + "/")
        .take(1)
        .toPromise();
    }
  }

  async deleteUserChat(item, origin) {
    let orderId,
      deliveryId,
      buyerId,
      chatId = item.chat_id;
    const userMessagesRef = firebase
      .database()
      .ref('users/' + this.globals.current_userUID + '/messages/' + chatId + '/chat_messages');
    if (origin === 'order') {
      orderId = item.uid;
      deliveryId = item.delivery_id;
      buyerId = this.globals.current_userUID;
    } else {
      orderId = item.order_id;
      deliveryId = item.uid;
      buyerId = item.buyer_id;
    }

    console.log(item);

    const orderRef = firebase
      .database()
      .ref('users/' + buyerId + '/orders/' + orderId);
    const deliveryRef = firebase
      .database()
      .ref('users/' + item.seller_id + '/deliveries/' + deliveryId);

    await userMessagesRef.remove();
    if (origin === 'order') {
      console.log(orderRef);
      await orderRef.update({chat_deleted: true});
    } else {
      console.log(deliveryRef);
      await deliveryRef.update({chat_deleted: true});
    }
  }
}
