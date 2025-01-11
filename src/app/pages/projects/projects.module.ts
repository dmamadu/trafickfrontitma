import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

// routing
import { ProjectsRoutingModule } from "./projects-routing.module";
import { UIModule } from "../../shared/ui/ui.module";

// simplebar
import { SimplebarAngularModule } from "simplebar-angular";

// dropzone
import { DropzoneModule } from "ngx-dropzone-wrapper";
import { DROPZONE_CONFIG } from "ngx-dropzone-wrapper";
import { DropzoneConfigInterface } from "ngx-dropzone-wrapper";

// FlatPicker
import { FlatpickrModule } from "angularx-flatpickr";

// bootstrap component
import { TooltipModule } from "ngx-bootstrap/tooltip";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { PaginationModule } from "ngx-bootstrap/pagination";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
// apexchart
import { NgApexchartsModule } from "ng-apexcharts";

// component
import { ProjectlistComponent } from "./projectlist/projectlist.component";
import { OverviewComponent } from "./overview/overview.component";
import { CreateComponent } from "./create/create.component";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { ModalModule } from "ngx-bootstrap/modal";
import { UpdateComponent } from './update/update.component';
import { NgxPaginationModule } from "ngx-pagination";
import { NgxDocViewerModule } from "ngx-doc-viewer";
import { TableauComponent } from "src/app/shared/tableau/tableau.component";

const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface = {
  // Change this to your upload POST address:
  url: "https://httpbin.org/post",
  maxFilesize: 50,
  acceptedFiles: "image/*",
};

@NgModule({
  declarations: [
    ProjectlistComponent,
    OverviewComponent,
    CreateComponent,
    UpdateComponent,
  ],
  imports: [
    CommonModule,
    ProjectsRoutingModule,
    UIModule,
    TooltipModule.forRoot(),
    NgApexchartsModule,
    FormsModule,
    ReactiveFormsModule,
    BsDatepickerModule.forRoot(),
    PaginationModule.forRoot(),
    SimplebarAngularModule,
    FlatpickrModule.forRoot(),
    NgMultiSelectDropDownModule.forRoot(),
    AngularMaterialModule,
    DropzoneModule,
    ModalModule.forRoot(),
    NgxDocViewerModule,
    NgxPaginationModule,
    TableauComponent

  ],
  providers: [
    {
      provide: DROPZONE_CONFIG,
      useValue: DEFAULT_DROPZONE_CONFIG,
    },
  ],
})
export class ProjectsModule {}
