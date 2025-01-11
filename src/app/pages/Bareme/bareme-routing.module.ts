import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { BaremePapAgricoleComponent } from "./bareme-pap-agricole/bareme-pap-agricole.component";
import { BaremePapOperateurEconomiqueComponent } from "./bareme-pap-operateur-economique/bareme-pap-operateur-economique.component";



const routes: Routes = [

  {
    path: "agricole",
    component: BaremePapAgricoleComponent,
  },
  {
    path: "economique",
    component: BaremePapOperateurEconomiqueComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BaremeRoutingModule {}
