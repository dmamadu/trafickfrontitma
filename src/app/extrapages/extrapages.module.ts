import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgOtpInputModule } from 'ng-otp-input';

import { ExtrapagesRoutingModule } from './extrapages-routing.module';

// Swiper Slider
import { SlickCarouselModule } from 'ngx-slick-carousel';

@NgModule({
  // tslint:disable-next-line: max-line-length
  declarations: [  ],
  imports: [
    CommonModule,
    ExtrapagesRoutingModule,
    NgOtpInputModule,
    SlickCarouselModule
  ]
})
export class ExtrapagesModule { }
