import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { PersonnePhysiqueComponent } from "./personne-physique/personne-physique.component";
import { AjoutPersonnePhysiqueComponent } from "./personne-physique/ajout/ajout.component";
import { TesterComponent } from "./tester/tester.component";
import { JuristAppComponent } from "./jurist-app/jurist-app.component";
import { RoleComponent } from "./parametrages/role/role.component";
import { FonctionUtilisateurComponent } from "./parametrages/fonction-utilisateur/fonction-utilisateur.component";
import { CategoryComponent } from "@ctrl/ngx-emoji-mart";
import { CategorieUtilisateurComponent } from "./parametrages/categorie-utilisateur/categorie-utilisateur.component";
import { UtilisateurComponent } from "./parametrages/utilisateur/utilisateur.component";
import { GestionDossierComponent } from "./parametrages/dossier/gestion-dossier/gestion-dossier.component";
import { CategorieDossierComponent } from "./parametrages/dossier/categorie-dossier/categorie-dossier.component";
import { RencontreComponent } from "./elaboration/rencontre/rencontre.component";
import { QuartierComponent } from "./geolocalisation/quartier/quartier.component";
import { PointRepereComponent } from "./geolocalisation/point-repere/point-repere.component";
import { AuditComponent } from "./audit/audit.component";
import { RoleGuard } from "../core/guards/role.guard";

const ADMIN_ROLES = ["Super Admin", "Admin"];

const routes: Routes = [
  // { path: '', redirectTo: 'dashboard' },
  {
    path: "dashboards",
    loadChildren: () =>
      import("./dashboards/dashboards.module").then((m) => m.DashboardsModule),
  },
  {
    path: "projects",
    canActivate: [RoleGuard],
    data: { roles: ADMIN_ROLES },
    loadChildren: () =>
      import("./projects/projects.module").then((m) => m.ProjectsModule),
  },
  {
    path: "tasks",
    loadChildren: () =>
      import("./tasks/tasks.module").then((m) => m.TasksModule),
  },

  // {
  //   path: "pages",
  //   loadChildren: () =>
  //     import("./utility/utility.module").then((m) => m.UtilityModule),
  // },
  {
    path: "ui",
    loadChildren: () => import("./ui/ui.module").then((m) => m.UiModule),
  },

  {
    path: "tables",
    loadChildren: () =>
      import("./tables/tables.module").then((m) => m.TablesModule),
  },
  {
    path: "icons",
    loadChildren: () =>
      import("./icons/icons.module").then((m) => m.IconsModule),
  },
  {
    path: "charts",
    loadChildren: () =>
      import("./chart/chart.module").then((m) => m.ChartModule),
  },
  {
    path: "maps",
    loadChildren: () => import("./maps/maps.module").then((m) => m.MapsModule),
  },
  {
    path: "jobs",
    loadChildren: () => import("./jobs/jobs.module").then((m) => m.JobsModule),
  },
  {
    path: "maitrouvrages",
    canActivate: [RoleGuard],
    data: { roles: ADMIN_ROLES },
    loadChildren: () =>
      import("./maitrouvrages/maitrouvrages.module").then(
        (m) => m.MaitrouvragesModule
      ),
  },
  {
    path: "pap",
    loadChildren: () =>
      import("./pap/pap-routing.module").then((m) => m.PapRoutingModule),
  },
  {
    path: "ficheIdentification",
    loadChildren: () =>
      import("./ficheIdentificationPap/ficheIdentification-routing.module").then((m) => m.FicheIdentificationRoutingModule),
  },
  {
    path: "pip",
    loadChildren: () =>
      import("./pip/pip-routing.module").then((m) => m.PipRoutingModule),
  },
  {
    path: "consultant",
    canActivate: [RoleGuard],
    data: { roles: ADMIN_ROLES },
    loadChildren: () =>
      import("./consultant/consulant-routing.module").then(
        (m) => m.ConsultantRoutingModule
      ),
  },

  {
    path: "plainte",
    loadChildren: () =>
      import("./plainte/plainte-routing.module").then(
        (m) => m.PlainteRoutingModule
      ),
  },
  {
    path: "ententeCompensation",
    loadChildren: () =>
      import("./entente-compensation/entente-compensation-routing.module").then(
        (m) => m.EntenteCompensationRoutingModule
      ),
  },

  { path: "tester", component: TesterComponent },

  { path: "juristApp", component: JuristAppComponent },

  {
    path: "fonctions",
    component: FonctionUtilisateurComponent,
    canActivate: [RoleGuard],
    data: { roles: ADMIN_ROLES },
  },
  {
    path: "roles",
    component: RoleComponent,
    canActivate: [RoleGuard],
    data: { roles: ADMIN_ROLES },
  },
  {
    path: "categories",
    component: CategorieUtilisateurComponent,
    canActivate: [RoleGuard],
    data: { roles: ADMIN_ROLES },
  },
  {
    path: "utilisateurs",
    component: UtilisateurComponent,
    canActivate: [RoleGuard],
    data: { roles: ADMIN_ROLES },
  },
  {
    path: "audit",
    component: AuditComponent,
    canActivate: [RoleGuard],
    data: { roles: ADMIN_ROLES },
  },

  { path: "dossiers", component: GestionDossierComponent },
  { path: "catégorie-dossier", component: CategorieDossierComponent },
  { path: "rencontres", component: RencontreComponent },

  {
    path: "geolocalisation/quartiers",
    component: QuartierComponent,
    canActivate: [RoleGuard],
    data: { roles: ADMIN_ROLES },
  },
  {
    path: "geolocalisation/points-de-repere",
    component: PointRepereComponent,
    canActivate: [RoleGuard],
    data: { roles: ADMIN_ROLES },
  },

  {
    path: "baremes",
    loadChildren: () =>
      import("./Bareme/bareme-routing.module").then((m) => m.BaremeRoutingModule),
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}