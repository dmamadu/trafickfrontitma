import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { ProjectlistComponent } from "./projectlist/projectlist.component";
import { OverviewComponent } from "./overview/overview.component";
import { CreateComponent } from "./create/create.component";
import { AuthGuard } from "src/app/core/guards/auth.guard";
import { UpdateComponent } from "./update/update.component";
import { NormesListComponent } from "./normes/normes-list.component";

const routes: Routes = [
  {
    path: "list",
    component: ProjectlistComponent,
  },
  {
    path: "overview/:id",
    component: OverviewComponent,
  },
  {
    path: "create",
    component: CreateComponent,
  },
  {
    path: "update",
    component: UpdateComponent,
  },
  {
    path: "normes",
    component: NormesListComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectsRoutingModule {}
