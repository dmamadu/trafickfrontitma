import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { TabsModule } from "ngx-bootstrap/tabs";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { ModalModule } from "ngx-bootstrap/modal";
import { TooltipModule } from "ngx-bootstrap/tooltip";
import { CollapseModule } from "ngx-bootstrap/collapse";
import { AlertModule } from "ngx-bootstrap/alert";
import { SimplebarAngularModule } from "simplebar-angular";

import { WidgetModule } from "../shared/widget/widget.module";
import { UIModule } from "../shared/ui/ui.module";

// Emoji Picker

import { PagesRoutingModule } from "./pages-routing.module";

import { HttpClientModule } from "@angular/common/http";

import { AngularMaterialModule } from "../shared/angular-materiel-module/angular-materiel-module";
import { TableauComponent } from "../shared/tableau/tableau.component";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatDialogModule } from "@angular/material/dialog";
import { AjoutPersonnePhysiqueComponent } from "./personne-physique/ajout/ajout.component";
import { TesterComponent } from './tester/tester.component';
import { RoleComponent } from './parametrages/role/role.component';
import { CategorieUtilisateurComponent } from './parametrages/categorie-utilisateur/categorie-utilisateur.component';
import { AddCategorieComponent } from './parametrages/categorie-utilisateur/add-categorie/add-categorie.component';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    BsDropdownModule.forRoot(),
    ModalModule.forRoot(),
    PagesRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    UIModule,
    FormsModule,
    WidgetModule,
    TabsModule.forRoot(),
    TooltipModule.forRoot(),
    CollapseModule.forRoot(),
    AlertModule.forRoot(),
    SimplebarAngularModule,
    AngularMaterialModule,
    MatFormFieldModule,
    MatInputModule

  ],
})
export class PagesModule {}
