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
    path: "reset-password",
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
