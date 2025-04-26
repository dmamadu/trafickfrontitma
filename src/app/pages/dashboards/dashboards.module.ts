import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { DashboardsRoutingModule } from "./dashboards-routing.module";
import { UIModule } from "../../shared/ui/ui.module";
import { WidgetModule } from "../../shared/widget/widget.module";

import { NgApexchartsModule } from "ng-apexcharts";
import { SharedModule } from "./saas/shared/shared.module";
import { NgxPaginationModule } from "ngx-pagination";
import { TooltipModule } from "ngx-bootstrap/tooltip";
import { BsDropdownModule, BsDropdownConfig } from "ngx-bootstrap/dropdown";
import { CarouselModule } from "ngx-bootstrap/carousel";
import { TabsModule } from "ngx-bootstrap/tabs";
import { ModalModule } from "ngx-bootstrap/modal";

import { SimplebarAngularModule } from "simplebar-angular";

import { DefaultComponent } from "./default/default.component";
import { SaasComponent } from "./saas/saas.component";
import { CryptoComponent } from "./crypto/crypto.component";
import { BlogComponent } from "./blog/blog.component";
import { JobsComponent } from "./jobs/jobs.component";
import { PdfViewerModule } from "ng2-pdf-viewer";
import { NgxDocViewerModule } from "ngx-doc-viewer";
import { ListPvComponent } from "./list-pv/list-pv.component";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatPaginatorIntl } from "@angular/material/paginator";
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";
import { MiseEnOeuvreComponent } from './mise-en-oeuvre/mise-en-oeuvre.component';
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
@NgModule({
  declarations: [
    DefaultComponent,
    SaasComponent,
    CryptoComponent,
    BlogComponent,
    JobsComponent,
    ListPvComponent,
    MiseEnOeuvreComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PdfViewerModule,
    DashboardsRoutingModule,
    UIModule,
    BsDropdownModule.forRoot(),
    TooltipModule.forRoot(),
    TabsModule.forRoot(),
    CarouselModule.forRoot(),
    WidgetModule,
    NgApexchartsModule,
    SharedModule,
    SimplebarAngularModule,
    NgxDocViewerModule,
    NgxPaginationModule,
    PdfViewerModule,
    ModalModule.forRoot(),
    AngularMaterialModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    BsDropdownConfig,
    {
      provide: MatDialogRef,
      useValue: [],
    },
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatPaginatorIntl },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: "outline" },
    },
  ],
})
export class DashboardsModule {}
