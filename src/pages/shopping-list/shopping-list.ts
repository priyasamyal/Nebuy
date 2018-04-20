import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { ImagePicker, ImagePickerOptions } from "@ionic-native/image-picker";
import { Camera, CameraOptions } from '@ionic-native/camera';
import { GlobalVariable } from "../../app/global";
import { TranslateService,TranslateModule } from '@ngx-translate/core';

@IonicPage()
@Component({
  selector: 'page-shopping-list',
  templateUrl: 'shopping-list.html',
})
export class ShoppingList {

  submitAttempt: boolean = false;
  orderForm: FormGroup;
  productImages: Array<{ id: number, images: string[] }> = [];
  cameraCounter = [0];
  totalEstimate: number = 0;
  shopDetails: any;
  cameraOptions: CameraOptions = {
    quality: 95,
    destinationType: this.camera.DestinationType.DATA_URL,
    sourceType: this.camera.PictureSourceType.CAMERA,
    encodingType: this.camera.EncodingType.PNG,
    targetWidth: 500,
    targetHeight: 500,
    saveToPhotoAlbum: true
  };
  pickerOptions: ImagePickerOptions = {
    width: 500,
    height: 500,
    quality: 95,
    outputType: 1,
    maximumImagesCount: 5
  };
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public translate: TranslateService,
    public viewCtrl: ViewController,
    private formBuilder: FormBuilder,
    private imagePicker: ImagePicker,
    private globals: GlobalVariable,
    private camera: Camera) {

      

   

    translate.addLangs([globals.language]);

    translate.setDefaultLang(globals.language);

         // the lang to use, if the lang isn't available, it will use the current loader to get them
        translate.use(globals.language);

    this.shopDetails = navParams.get('shopDetails');

    this.orderForm = formBuilder.group({
      products: formBuilder.array([
        this.initProduct(),
      ]),
      // totalCost: ['']
    });
    this.orderForm.value.products.forEach(element => {
      this.totalEstimate += parseInt(element.cost)
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProductModal');
    /*if (this.globals.cacheProducts) {
      console.log(this.globals.cacheProducts);
      this.orderForm.setValue(this.globals.cacheProducts);
      // this.orderForm.patchValue(this.globals.cacheProducts);
    }*/
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
  initProduct() {
    return this.formBuilder.group({
      product: ['', Validators.required],
      images: [''],
      cost: [0, Validators.required]
    })
  }
  addProduct() {
    const control = <FormArray>this.orderForm.controls['products'];
    control.push(this.initProduct());
    this.cameraCounter.push(0);
    console.log(control.length);
    console.log(control);
    console.log(control.value);
    console.log(this.cameraCounter);
    this.totalEstimate = 0;
    this.orderForm.value.products.forEach(element => {
      this.totalEstimate += parseInt(element.cost)
    });

  }

  removeProduct(i: number) {
    const control = <FormArray>this.orderForm.controls['products'];
    // console.log("i:", i);
    this.totalEstimate -= control.value[i]['cost']
    if (this.totalEstimate < 0) {
      this.totalEstimate = 0;
    }
    // console.log(control.value[0]['cost']);
    control.removeAt(i);
    // console.log(control);
    console.log(control.value);
    this.productImages.splice(i, 1);

    this.cameraCounter.splice(i, 1);
    // console.log(this.cameraCounter);
    console.log("productImgaes: ", this.productImages);


  }

  async pickImage(name, index: number) {
    console.log(name);
    console.log("index:", index);
    try {
      var images = await this.imagePicker.getPictures(this.pickerOptions)
      console.log(images);
      console.log("productImages:", this.productImages);
      console.log("product images length:", this.productImages.length)
      if (this.productImages[index] !== undefined) {
        images.map(image => {
          this.productImages[index].images.push(image);
        })
      } else {
        this.productImages.splice(index, 0, { id: index, images: images })
      }
      console.log("productImages after mapping:", this.productImages);
      name.patchValue(this.productImages[index].images);
      console.log(this.orderForm.value.products);
    } catch (error) {
      console.error("error uploading image: ", error)
    }
  }

  async openCamera(name, index: number) {
    try {
      const image = await this.camera.getPicture(this.cameraOptions);
      // console.log(image)
      if (this.productImages[index] !== undefined) {
        this.productImages[index].images.push(image);
      }
      else {
        this.productImages.splice(index, 0, { id: index, images: [image] })
      }
      console.log("productImages after mapping:", this.productImages);
      name.patchValue(this.productImages[index].images);
      console.log(this.orderForm.value.products);
    } catch (error) {
      console.error("error uploading image: ", error)
    }
  }

  submitProducts() {
    // this.globals.cacheProducts = this.orderForm.value;
    // this.viewCtrl.dismiss(this.globals.cacheProducts);
  }

  proceed() {
    this.submitAttempt = true;
    if (!this.orderForm.valid) {
      console.log("no ways");
    } else if(this.orderForm.value.products.length < 1) {
      console.log("no ways");
    } 
    else {
      console.log(this.orderForm.value);
      console.log(this.shopDetails);
      this.navCtrl.push("OrderDropoff",
        {
          orderPickupDetails: this.orderForm.value,
          shopDetails: this.shopDetails,
          totalEstimate: this.totalEstimate
        });
    }
  }
}
