import { ChangeDetectorRef, Component, Inject, OnInit, Optional } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatDivider } from "@angular/material/divider";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { LocalService } from "src/app/core/services/local.service";
import { User } from "src/app/store/Authentication/auth.models";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { AuthenticationService } from "src/app/core/services/auth.service";

export interface ChangePasswordDialogData {
  isForced?: boolean;
}

@Component({
  selector: "app-change-password",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDivider,
  ],
  templateUrl: "./change-password.component.html",
  styleUrls: ["./change-password.component.css"],
})
export class ChangePasswordComponent implements OnInit {
  user!: User;
  loader: boolean = false;
  isForced: boolean = false;

  hideOldPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;

  passwordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    public matDialogRef: MatDialogRef<ChangePasswordComponent>,
    private localService: LocalService,
    private snackbar: SnackBarService,
    private authService: AuthenticationService,
    private changeDetectorRefs: ChangeDetectorRef,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: ChangePasswordDialogData
  ) {
    this.isForced = data?.isForced ?? false;
  }

  ngOnInit(): void {
    this.user = this.localService.getDataJson("user");
    this.passwordForm = this.fb.group(
      {
        oldPassword: ["", Validators.required],
        newPassword: [
          "",
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/),
          ],
        ],
        confirmPassword: ["", Validators.required],
      },
      { validators: this.checkPasswords }
    );
  }

  checkPasswords(group: AbstractControl): ValidationErrors | null {
    const newPassword = group.get("newPassword")?.value;
    const confirmPassword = group.get("confirmPassword")?.value;
    return newPassword === confirmPassword ? null : { notSame: true };
  }

  onCancel(): void {
    if (!this.isForced) {
      this.matDialogRef.close();
    }
  }

  onSubmit(): void {
    if (this.passwordForm.invalid) {
      this.snackbar.openSnackBar(
        "Veuillez corriger les erreurs dans le formulaire",
        "OK",
        ["mycssSnackbarRed"]
      );
      return;
    }

    const data = {
      email: this.user?.email,
      oldPassword: this.passwordForm.value.oldPassword,
      newPassword: this.passwordForm.value.newPassword,
    };

    const confirmMsg = this.isForced
      ? "Confirmer le changement de mot de passe ?"
      : "Voulez-vous vraiment modifier votre mot de passe ?";

    this.snackbar.showConfirmation(confirmMsg).then((result) => {
      if (result["value"] !== true) return;

      this.loader = true;
      this.changeDetectorRefs.markForCheck();

      this.authService.changementDuPassword(data).subscribe({
        next: (resp) => {
          this.loader = false;
          if (resp["responseCode"] === 200) {
            if (this.isForced) {
              this.snackbar.openSnackBar(
                "Mot de passe mis à jour. Bienvenue !",
                "OK",
                ["mycssSnackbarGreen"]
              );
              this.matDialogRef.close(true);
            } else {
              this.snackbar.openSnackBar(
                "Mot de passe modifié avec succès ! Veuillez vous reconnecter.",
                "OK",
                ["mycssSnackbarGreen"]
              );
              this.matDialogRef.close();
              this.authService.logout();
              this.router.navigate(["/auth/login"]);
            }
          } else {
            this.snackbar.openSnackBar(
              resp["message"] || "Erreur lors de la modification",
              "OK",
              ["mycssSnackbarRed"]
            );
          }
          this.changeDetectorRefs.markForCheck();
        },
        error: (error) => {
          this.loader = false;
          this.snackbar.openSnackBar(
            error.error?.message || "Une erreur s'est produite. Veuillez réessayer.",
            "OK",
            ["mycssSnackbarRed"]
          );
          this.changeDetectorRefs.markForCheck();
        },
      });
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.passwordForm?.get(controlName);
    if (!control) return "";
    if (control.hasError("required")) return "Ce champ est obligatoire";
    if (controlName === "newPassword") {
      if (control.hasError("minlength")) return "Minimum 8 caractères";
      if (control.hasError("pattern"))
        return "Doit contenir majuscule, minuscule, chiffre et caractère spécial (@$!%*?&)";
    }
    if (controlName === "confirmPassword" && this.passwordForm?.hasError("notSame")) {
      return "Les mots de passe ne correspondent pas";
    }
    return "";
  }
}