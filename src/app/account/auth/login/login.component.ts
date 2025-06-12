import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthenticationService } from "../../../core/services/auth.service";

import { Store } from "@ngrx/store";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { Auth, User } from "src/app/store/Authentication/auth.models";
import { LocalService } from "src/app/core/services/local.service";
import { ColorService } from "src/app/core/services/color.service";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { SelectProjectComponent } from "../select-project/select-project.component";
import { MatDialog } from "@angular/material/dialog";
import { TokenStorageService } from "src/app/core/services/token-storage.service";
@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})

/**
 * Login component
 */
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  submitted: any = false;
  error: any = "";
  returnUrl: string;
  fieldTextType!: boolean;
  loader: boolean = false;

  // set the currenr year
  year: number = new Date().getFullYear();

  // tslint:disable-next-line: max-line-length
  constructor(
    private formBuilder: FormBuilder,
    //  private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    public toastr: ToastrService,
    private colorService: ColorService,
    private tokenStorage: TokenStorageService,
    private localService: LocalService,
    private snackbar: SnackBarService,
    private _matDialog: MatDialog
  ) {}

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required]],
    });
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

  /**
   * Form submit
   */
  /*
  onSubmit() {
    this.submitted = true;
    this.loader = true;
    return this.authenticationService
      .login(this.f.email.value, this.f.password.value)
      .subscribe(
        (user: Auth) => {
          console.log(user);
          this.localService.saveDataJson("user", user.user);
          this.submitted = false;
          this.toastr.success(`Bienvenue ${user.user.firstname}`);
          this.router.navigate(["/dashboards/jobs"]);
        },
        (error) => {
          console.log(error);

          this.submitted = false;
          //  console.error("Erreur lors de la tentative de connexion :", error);
          this.toastr.error(`Une erreur s'est produite ou veiillez vérifier vos identifiants`);
        }
      );
  }*/

  /*
  onSubmit() {
    this.submitted = true;
    this.loader = true;
    return this.authenticationService
      .login(this.f.email.value, this.f.password.value)
      .subscribe(
        (user: Auth) => {
          console.log(user);
          localStorage.setItem("token",user.token);
          //this.localService.saveDataJson("user", user.user);
         // this.tokenStorage.saveToken(user.token);
          if (user.user.projects && user.user.projects.length > 1) {
            this.router.navigate(["/select-project"]);
          } else if (user.user.projects && user.user.projects.length === 1) {
            const selectedProjectId = user.user.projects[0].id;
            this.localService.saveData("ProjectId", selectedProjectId);
            const project = user.user.projects[0];

            if (project.colors) {
              const colors = JSON.parse(project.colors);
              this.colorService.setColors(colors);
              this.localService.saveData(
                "projectColors",
                JSON.stringify(colors)
              );
            }

            // Persister les couleurs dans le localStorage
            //  this.localService.saveData("projectId", project.id.toString());
            //this.router.navigate(["/dashboards/jobs"]);
            this.choicePeoject();
          } else {
            this.toastr.warning("Aucun projet n'est associé à votre compte.");
          }
          this.submitted = false;
          this.toastr.success(`Bienvenue ${user.user.firstname}`);
        },
        (error) => {
          console.log(error);
          this.submitted = false;
          this.toastr.error(
            `Une erreur s'est produite ou veuillez vérifier vos identifiants`
          );
        }
      );
  }
      */
  // onSubmit() {
  //   this.submitted = true;
  //   this.loader = true;

  //   return this.authenticationService
  //     .login(this.f.email.value, this.f.password.value)
  //     .subscribe(
  //       (user: Auth) => {
  //         console.log(user);
  //         localStorage.setItem("token", user.token);
  //         this.toastr.success(`Bienvenue ${user.user.firstname}`);
  //         if (user.user.projects?.length > 1) {
  //           this.choicePeoject();
  //         } else {
  //           this.router.navigate(["/dashboards/jobs"]);
  //         }
  //         this.submitted = false;
  //         this.loader = false;
  //       },
  //       (error) => {
  //         console.log(error);
  //         this.toastr.error(
  //           `Une erreur s'est produite ou veuillez vérifier vos identifiants`
  //         );
  //         this.submitted = false;
  //         this.loader = false;
  //       }
  //     );
  // }

  onSubmit() {
    this.submitted = true;
    this.loader = true;

    return this.authenticationService
      .login(this.f.email.value, this.f.password.value)
      .subscribe(
        (user: Auth) => {
          console.log(user);
          localStorage.setItem("token", user.token);
          // Message d'accueil plus complet avec nom et rôle
          // const welcomeMessage = `Bienvenue ${user.user.firstname} ${
          //   user.user.lastname || ""
          // }
          // (${user.user.role[0].name || "utilisateur"})`;
          const welcomeMessage = `Bienvenue ${user.user.firstname} ${
            user.user.lastname || ""
          }, vous êtes connecté(e) en tant que ${
            user.user.role[0].name || "utilisateur"
          }`;
          this.toastr.success(welcomeMessage, null, {
            timeOut: 15000,
            progressBar: true,
            closeButton: true,
          });
          if (user.user.projects?.length > 1) {
            this.choicePeoject();
          } else {
            this.localService.saveData(
              "ProjectId",
              user.user.projects[0]?.id.toString()
            );
            this.router.navigate(["/dashboards/jobs"]);
          }
          this.submitted = false;
          this.loader = false;
        },
        (error) => {
          console.log(error);
          this.toastr.error(
            `Une erreur s'est produite ou veuillez vérifier vos identifiants`,
            null,
            {
              timeOut: 5000, // 5 secondes pour les erreurs
              progressBar: true,
              closeButton: true,
            }
          );
          this.submitted = false;
          this.loader = false;
        }
      );
  }

  choicePeoject(): void {
    this._matDialog.open(SelectProjectComponent);
  }

  /**
   * Password Hide/Show
   */
  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }
}
