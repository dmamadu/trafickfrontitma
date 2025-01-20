import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ListComponent } from "./list/list.component";
import { AddComponent } from "./add/add.component";
import { MoprofileComponent } from "./moprofile/moprofile.component";

const routes: Routes = [
  {
    path: "chef-de-mission",
    component: ListComponent, // Liste des "Chef de mission"
  },
  {
    path: "specialiste-reinstallation",
    component: ListComponent, // Liste des "Spécialiste en réinstallation"
  },
  {
    path: "gestion-parties-prenantes",
    component: ListComponent, // Liste des "Spécialiste en gestion des parties prenantes"
  },
  {
    path: "genre-inclusions-sociale",
    component: ListComponent, // Liste des "Spécialiste en Genre et Inclusions Sociale"
  },
  {
    path: "base-de-donnees-sig",
    component: ListComponent, // Liste des "Spécialiste en base de données et SIG"
  },
  {
    path: "animateurs-communautaires",
    component: ListComponent, // Liste des "Animateurs communautaires"
  },
  {
    path: "add",
    component: AddComponent,
  },
  {
    path: "detail",
    component: MoprofileComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConsultantRoutingModule {}
