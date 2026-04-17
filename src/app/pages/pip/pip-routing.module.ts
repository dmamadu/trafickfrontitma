import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PipAddComponent } from "./pip-add/pip-add.component";
import { PipListComponent } from "./pip-list/pip-list.component";



const routes: Routes = [

  {
    path: "add",
    component: PipAddComponent,
  },
  // {
  //   path: "medias",
  //   component: PipListComponent,
  // },
  // {
  //   path: "ong",
  //   component: PipListComponent,
  // },
  // {
  //   path: "entreprise",
  //   component: PipListComponent,
  // },
  // {
  //   path: "organisation",
  //   component: PipListComponent,
  // },
  // {
  //   path: "bailleurs",
  //   component: PipListComponent,
  // },
  {
  path: "",
  component: PipListComponent,
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PipRoutingModule {}
