import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { FicheIPapFormComponent } from "./fiche-ipap-form/fiche-ipap-form.component";
import { FicheIPapAgricoleListComponent } from "./fiche-ipap-agricole-list/fiche-ipap-agricole-list.component";
import { FicheIPapPlaceAffaireListComponent } from "./fiche-ipap-place-affaire-list/fiche-ipap-place-affaire-list.component";


const routes: Routes = [

  {
    path: "add",
    component: FicheIPapFormComponent,
  },

  {
    path: "papAgricole",
    component: FicheIPapAgricoleListComponent,
  },
  {
    path: "papPlaceAffaire",
    component: FicheIPapPlaceAffaireListComponent,
  },

  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FicheIdentificationRoutingModule {}
