import { Injectable } from '@angular/core';
// import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Geolocation } from '@ionic-native/geolocation';

declare var google;

@Injectable()
export class GoogleMaps {

  lat: number;
  lng: number;

  constructor(public geolocation: Geolocation) {
    console.log('Hello GoogleMaps Provider');

    // this.getCurrentPosition();
  }

  getCurrentPosition() {

    // get current position
    return this.geolocation.getCurrentPosition()
      .then(pos => {
        console.log('lat: ' + pos.coords.latitude + ', lng: ' + pos.coords.longitude);
        this.lat = pos.coords.latitude;
        this.lng = pos.coords.longitude;
      }, error => {
        console.error('error getting current position: ', error);
        this.lat = 31.5127918;
        this.lng = 74.3162381;
        return error
      })
  }

  autoCompleteService(input) {

    let autocomplete = new google.maps.places.AutocompleteService();
    autocomplete.getPlacePredictions({ input: input}, (predictions, status) => {
      // me.autocompleteItems = [];
      console.log(predictions)
      // me.zone.run(function () {
      //   predictions.forEach(function (prediction) {
      //     me.autocompleteItems.push(prediction.description);
      //   });
      // });
    });
    let geolocation = {
      lat: this.lat,
      lng: this.lng
    };
    let circle = new google.maps.Circle({
      center: geolocation,
      radius: 500
    });
    // autocomplete.setBounds(circle.getBounds());

    // let place = autocomplete.getPlace();
    // if (place) {
    //   this.storePlaceDetails(this.place);
    // }
    // return autocomplete;
  }
}
