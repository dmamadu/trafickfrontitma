import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthenticationService } from "../../../core/services/auth.service";

import { Store } from "@ngrx/store";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { Auth, User } from "src/app/store/Authentication/auth.models";
import { LocalService } from "src/app/core/services/local.service";
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
    private localService: LocalService
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
  }

  /**
   * Password Hide/Show
   */
  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }
}
