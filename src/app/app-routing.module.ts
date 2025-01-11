import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { AuthGuard } from "./core/guards/auth.guard";
import { LayoutComponent } from "./layouts/layout.component";
import { CyptolandingComponent } from "./cyptolanding/cyptolanding.component";
import { Page404Component } from "./extrapages/page404/page404.component";
import { PersonnePhysiqueComponent } from "./pages/personne-physique/personne-physique.component";
import { HomePageComponent } from "./pages/home-page/home-page.component";

const routes: Routes = [
  {
    path: "auth",
    loadChildren: () =>
      import("./account/account.module").then((m) => m.AccountModule),
  },
  {
    path: "",
    component: LayoutComponent,
    loadChildren: () =>
      import("./pages/pages.module").then((m) => m.PagesModule),
    canActivate: [AuthGuard],
  },
  {
    path: "accueil",
    component: HomePageComponent,
  },
  {
    path: "pages",
    loadChildren: () =>
      import("./extrapages/extrapages.module").then((m) => m.ExtrapagesModule),
    canActivate: [AuthGuard],
  },
  { path: "home", component: CyptolandingComponent },
  { path: "**", component: Page404Component },

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true ,scrollPositionRestoration: "top" })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
