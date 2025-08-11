import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AlertModule } from 'ngx-bootstrap/alert';
// Swiper Slider
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { UIModule } from '../../shared/ui/ui.module';
import { LoginComponent } from './login/login.component';

import { AuthRoutingModule } from './auth-routing';
import { PasswordresetComponent } from './passwordreset/passwordreset.component';
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import { AngularMaterialModule } from 'src/app/shared/angular-materiel-module/angular-materiel-module';

@NgModule({
  declarations: [LoginComponent , PasswordresetComponent],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        AlertModule.forRoot(),
        UIModule,
        AuthRoutingModule,
        SlickCarouselModule,
        MatProgressSpinner,
        AngularMaterialModule
    ]
})
export class AuthModule { }
