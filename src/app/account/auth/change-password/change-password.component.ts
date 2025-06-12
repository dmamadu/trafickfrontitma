import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatDivider } from "@angular/material/divider";
import { MatDialogRef } from "@angular/material/dialog";
import { LocalService } from "src/app/core/services/local.service";
import { User } from "src/app/store/Authentication/auth.models";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { AuthenticationService } from "src/app/core/services/auth.service";

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
  onCancel() {
   this.passwordForm.reset();
  }
  private fb = inject(FormBuilder);
  private router = inject(Router);
  user!: User;
  loader: boolean;

  constructor(
    public matDialogRef: MatDialogRef<ChangePasswordComponent>,
    private localService: LocalService,
    private snackbar: SnackBarService,
    private authService: AuthenticationService,
    private changeDetectorRefs: ChangeDetectorRef
  ) {}
  ngOnInit(): void {
    this.user = this.localService.getDataJson("user");
  }

  hideoldPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;

  passwordForm = this.fb.group(
    {
      email: [this.user?.email],
      oldPassword: ["", Validators.required],
      newPassword: [
        "",
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
          ),
        ],
      ],
      confirmPassword: ["", Validators.required],
    },
    { validator: this.checkPasswords }
  );

  checkPasswords(group: AbstractControl): ValidationErrors | null {
  const newPassword = group.get('newPassword')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  return newPassword === confirmPassword ? null : { notSame: true };
}
  onSubmit() {
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

    this.snackbar
      .showConfirmation(`Voulez-vous vraiment modifier votre mot de passe ?`)
      .then((result) => {
        if (result["value"] !== true) return;
        this.loader = true;
        this.changeDetectorRefs.markForCheck();
        this.authService.changementDuPassword(data).subscribe({
          next: (resp) => {
            this.loader = false;
            if (resp["status"] === 200) {
              this.snackbar.openSnackBar(
                "Mot de passe modifié avec succès! Veuillez vous reconnecter.",
                "OK",
                ["mycssSnackbarGreen"]
              );
              this.matDialogRef.close();
              this.authService.logout();
              this.router.navigate(["/auth/login"]);
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
            console.error("Password change error:", error);

            this.snackbar.openSnackBar(
              error.error?.message ||
                "Une erreur s'est produite. Veuillez réessayer.",
              "OK",
              ["mycssSnackbarRed"]
            );

            this.changeDetectorRefs.markForCheck();
          },
        });
      })
      .catch(() => {
        this.loader = false;
        this.changeDetectorRefs.markForCheck();
      });
  }

getErrorMessage(controlName: string): string {
  const control = this.passwordForm.get(controlName);

  if (!control) return '';
  if (control.hasError('required')) {
    return 'Ce champ est obligatoire';
  }

  if (controlName === 'email' && control.hasError('email')) {
    return 'Email invalide';
  }

  if (controlName === 'newPassword') {
    if (control.hasError('minlength')) {
      return 'Minimum 8 caractères';
    }
    if (control.hasError('pattern')) {
      return 'Doit contenir majuscule, minuscule, chiffre et caractère spécial';
    }
  }
  if (controlName === 'confirmPassword') {
    if (control.hasError('required')) {
      return 'La confirmation est obligatoire';
    }
    if (this.passwordForm.hasError('notSame')) {
      return 'Les mots de passe ne correspondent pas';
    }
  }

  return '';
}
}
