import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { LoginComponent } from "./login/login.component";

import { PasswordresetComponent } from "./passwordreset/passwordreset.component";
import { SelectProjectComponent } from "./select-project/select-project.component";

const routes: Routes = [
  {
    path: "login",
    component: LoginComponent,
  },
  {
    // Sans jeton : demande d'un lien. Avec ?token=… : choix du nouveau mot de passe.
    path: "reset-password",
    component: PasswordresetComponent,
  },
  {
    // Ancienne adresse des e-mails de réinitialisation (avant nov. 2026) : les liens déjà envoyés restent valides
    path: "login-2",
    component: PasswordresetComponent,
  },
  {
    path: "select-project",
    component: SelectProjectComponent,
  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
