import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { BaremePapAgricoleComponent } from "./bareme-pap-agricole/bareme-pap-agricole.component";
import { BaremePapOperateurEconomiqueComponent } from "./bareme-pap-operateur-economique/bareme-pap-operateur-economique.component";
import { BaremeRevenueComponent } from "./bareme-revenue/bareme-revenue.component";
import { BaremeRecolteComponent } from "./bareme-recolte/bareme-recolte.component";



const routes: Routes = [

  {
    path: "agricole",
    component: BaremePapAgricoleComponent,
  },
  {
    path: "economique",
    component: BaremePapOperateurEconomiqueComponent,
  },
  {
    path: "revenue",
    component: BaremeRevenueComponent,
  },
  {
    path: "recolte",
    component: BaremeRecolteComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BaremeRoutingModule {}
