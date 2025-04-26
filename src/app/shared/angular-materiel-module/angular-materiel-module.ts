import { NgModule } from "@angular/core";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import {
  MatFormField,
  MatFormFieldModule,
  MatLabel,
} from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatDatepickerModule } from "@angular/material/datepicker";
import {
  MatNativeDateModule,
  MatOptionModule,
  MatPseudoCheckboxModule,
  MatRippleModule,
} from "@angular/material/core";
import { MatMenuModule } from "@angular/material/menu";
import { MatButtonModule } from "@angular/material/button";
import { FlexLayoutModule } from "@angular/flex-layout";
import { MatMomentDateModule } from "@angular/material-moment-adapter";
import { MatIcon, MatIconModule } from "@angular/material/icon";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatTabGroup, MatTabsModule } from "@angular/material/tabs";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatBadgeModule } from "@angular/material/badge";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatTableModule } from "@angular/material/table";
import { MatDividerModule } from '@angular/material/divider';
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import {
  MatStep,
  MatStepper,
  MatStepperModule,
} from "@angular/material/stepper";
import { NgxMatIntlTelInputComponent } from "ngx-mat-intl-tel-input";
import { MatRadioModule } from "@angular/material/radio";
import { MatAccordion, MatExpansionModule } from "@angular/material/expansion";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialogModule } from "@angular/material/dialog";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { CdkStepperModule } from "@angular/cdk/stepper";
import { NgSelectModule } from "@ng-select/ng-select";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSidenavModule } from "@angular/material/sidenav";
import { HttpClientModule } from "@angular/common/http";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { MatChipsModule } from "@angular/material/chips";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
const materialModules = [
  MatAutocompleteModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatInputModule,
  MatNativeDateModule,
  MatButtonModule,
  MatIconModule,
  MatMenuModule,
  MatButtonToggleModule,
  MatButtonModule,
  MatToolbarModule,
  MatLabel,
  MatToolbarModule,
  MatProgressSpinnerModule,
  MatBadgeModule,
  MatProgressBarModule,
  MatProgressBarModule,
  CommonModule,
  MatToolbarModule,
  MatIconModule,
  MatFormFieldModule,
  MatInputModule,
  MatProgressSpinnerModule,
  MatButtonModule,
  MatSelectModule,
  MatTableModule,
  MatTableModule,
  MatSortModule,
  MatPaginator,
  MatPaginator,
  MatStepperModule,
  NgxMatIntlTelInputComponent,
  MatIconModule,
  MatRadioModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatInputModule,
  MatFormFieldModule,
  MatInputModule,
  CommonModule,
  ReactiveFormsModule,
  FormsModule,
  MatDialogModule,
  MatTableModule,
  MatSortModule,
  MatTooltipModule,
  MatButtonModule,
  MatIconModule,
  MatPaginatorModule,
  MatPaginator,
  MatFormFieldModule,
  MatInputModule,
  MatIconModule,
  MatDialogModule,
  MatSlideToggleModule,
  MatAutocompleteModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatInputModule,
  MatNativeDateModule,
  MatButtonModule,
  MatIconModule,
  MatMenuModule,
  MatButtonToggleModule,
  MatButtonModule,
  MatToolbarModule,
  MatProgressSpinnerModule,
  MatBadgeModule,
  MatProgressBarModule,
  MatProgressBarModule,
  MatTooltipModule,
  MatTooltipModule,
  MatInputModule,
  MatTableModule,
  MatPaginatorModule,
  MatPaginator,
  MatTooltipModule,
  MatFormFieldModule,
  MatTableModule,
  MatIcon,
  MatSelectModule,
  MatSort,
  MatTableModule,
  MatFormField,
  MatTabGroup,
  MatIconModule,
  FormsModule,
  ReactiveFormsModule,
  MatStepperModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatOptionModule,
  MatButtonModule,
  MatPseudoCheckboxModule,
  MatRadioModule,
  MatSelectModule,
  MatStepperModule,
  MatStepper,
  MatAccordion,
  MatExpansionModule,
  MatInputModule,
  MatAccordion,
  MatIconModule,
  FormsModule,
  ReactiveFormsModule,
  MatStepperModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatOptionModule,
  MatButtonModule,
  MatCheckboxModule,
  MatRadioModule,
  MatExpansionModule,
  NgxMatIntlTelInputComponent,
  FlexLayoutModule,
  CdkStepperModule,
  MatFormFieldModule,
  MatDatepickerModule,
  NgSelectModule,
  MatAutocompleteModule,
  MatButtonModule,
  MatCheckboxModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatMenuModule,
  MatProgressBarModule,
  MatRippleModule,
  MatSortModule,
  MatSelectModule,
  MatSlideToggleModule,
  MatTableModule,
  MatTooltipModule,
  MatDialogModule,
  ReactiveFormsModule,
  MatSnackBarModule,
  MatProgressSpinnerModule,
  MatToolbarModule,
  MatStepperModule,
  MatExpansionModule,
  MatToolbarModule,
  MatNativeDateModule,
  MatNativeDateModule,
  MatTableModule,
  MatMomentDateModule,
  MatSidenavModule,
  MatSelectModule,
  HttpClientModule,
  MatAutocompleteModule,
  MatRadioModule,
  DragDropModule,
  MatChipsModule,
  MatSidenavModule,
  MatSidenavModule,

  MatButtonModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatRadioModule,
  MatSelectModule,
  MatSidenavModule,
  MatSlideToggleModule,
  //FuseAlertModule,
  //SharedModule,
  MatTooltipModule,
  //FuseCardModule,
  MatTableModule,
  MatExpansionModule,
  MatTabsModule,
  //FuseNavigationModule,
  MatToolbarModule,
  MatDialogModule,
  MatMomentDateModule,
  MatProgressSpinnerModule,
  NgSelectModule,
  NgOptimizedImage,
  MatStepperModule,
  MatMenuModule,
  NgxMatIntlTelInputComponent,
  MatPaginatorModule,
  NgSelectModule,
  MatNativeDateModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatDatepickerModule,
  MatDividerModule,
  MatCardModule,
  MatListModule
 // MatListModule,

];
@NgModule({
  declarations: [],
  imports: [CommonModule, materialModules],
  exports: [materialModules],
})
export class AngularMaterialModule {}
