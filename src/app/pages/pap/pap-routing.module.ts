import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PapListComponent } from "./pap-list/pap-list.component";
import { PapAddComponent } from "./pap-add/pap-add.component";
import { PapDetailComponent } from "./pap-detail/pap-detail.component";
import { InfoClientComponent } from "./info-client/info-client.component";
import { PapAgricoleComponent } from "./pap-agricole/pap-agricole.component";
import { PapPlaceAffaireComponent } from "./pap-place-affaire/pap-place-affaire.component";
import { PapEconomiqueComponent } from "./pap-economique/pap-economique.component";

const routes: Routes = [
  {
    path: "list",
    component: PapListComponent,
  },

  {
    path: "add",
    component: PapAddComponent,
  },
  {
    path: "detail",
    component: PapDetailComponent,
  },
  {
    path: "papAgricole",
    component: PapAgricoleComponent,
  },
  {
    path: "papPlaceAffaire",
    component: PapPlaceAffaireComponent,
  },

  {
    path: "papEconomique",
    component: PapEconomiqueComponent,
  },

  {
    path: "detail",
    component: PapDetailComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PapRoutingModule {}
