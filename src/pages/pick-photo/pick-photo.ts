import { Component } from '@angular/core';
import {IonicPage, NavController, NavParams, ToastController, ViewController} from 'ionic-angular';
import {ImagePicker, ImagePickerOptions} from "@ionic-native/image-picker";
import {Camera, CameraOptions} from "@ionic-native/camera";
import {TranslateService} from "@ngx-translate/core";

@IonicPage()
@Component({
  selector: 'page-pick-photo',
  templateUrl: 'pick-photo.html',
})
export class PickPhotoPage {
  productImages: Array<string> = [];
  cameraOptions: CameraOptions = {
    quality: 50,
    destinationType: this.camera.DestinationType.DATA_URL,
    sourceType: this.camera.PictureSourceType.CAMERA,
    encodingType: this.camera.EncodingType.JPEG,
    targetWidth: 150,
    targetHeight: 150,
    saveToPhotoAlbum: true
  };
  pickerOptions: ImagePickerOptions = {
    width: 200,
    height: 200,
    quality: 50,
    outputType: 1,
    maximumImagesCount: 5
  };
  constructor(
    public navCtrl: NavController,
    private imagePicker: ImagePicker,
    private toastCtrl: ToastController,
    private camera: Camera,
    public translate: TranslateService,
    private vc: ViewController,
    public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PickPhotoPage');
  }


  async openCamera() {
    try {
      if(this.productImages.length<5){
        const image = await this.camera.getPicture(this.cameraOptions);
        this.productImages.push(image);
        this.close(this.productImages);
      }else{
        let noaddress;
        await   this.translate.stream('You can only add 5 images per product').subscribe((res: string) => {
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
      }
    } catch (error) {
      console.error("error uploading image: ", error)
    }
  }


  async pickImage() {
    try {
      if(this.productImages.length<5){
        var images = await this.imagePicker.getPictures(this.pickerOptions)
        images.map(image => {
          if (image !== "") {
            this.productImages.push(image);
          }
        });
        this.close(this.productImages);
      }else{
        let noaddress
        await   this.translate.stream('You can only add 5 images per product').subscribe((res: string) => {
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
      }
    } catch (error) {
      console.error("error uploading image: ", error)
    }
  }

  close(data?) {
    data ? this.vc.dismiss(data) : this.vc.dismiss();
  }

}
