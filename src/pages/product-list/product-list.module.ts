import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProductList } from './product-list';
import { IonicImageViewerModule } from "ionic-img-viewer";
import { TranslateService,TranslateModule } from '@ngx-translate/core';
import {TooltipsModule} from "ionic-tooltips";

@NgModule({
  declarations: [
    ProductList,
  ],
  imports: [
    IonicPageModule.forChild(ProductList),
    IonicImageViewerModule,
    TranslateModule,
    TooltipsModule

  ],
  exports: [
    ProductList
  ]
})
export class ProductListModule {}
