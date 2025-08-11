import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JobsComponent } from "./jobs/jobs.component";
import { MiseEnOeuvreComponent } from './mise-en-oeuvre/mise-en-oeuvre.component';

const routes: Routes = [
    {
        path:"jobs",
        component:JobsComponent
    },
    {
      path:"miseEnOeuvre",
      component:MiseEnOeuvreComponent
  }

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DashboardsRoutingModule {}
