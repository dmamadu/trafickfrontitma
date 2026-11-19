import { Component, OnInit } from "@angular/core";
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import { AuthenticationService } from "../../../core/services/auth.service";
import { ToastrService } from "ngx-toastr";

/** Même règle que le changement de mot de passe (change-password) et que le back (/users/reset-password). */
const REGLE_MOT_DE_PASSE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s]).+$/;

const motsDePasseIdentiques: ValidatorFn = (groupe: AbstractControl): ValidationErrors | null => {
  const mdp = groupe.get("newPassword")?.value;
  const confirmation = groupe.get("confirmPassword")?.value;
  return mdp && confirmation && mdp !== confirmation ? { differents: true } : null;
};

type Etape = "demande" | "nouveau" | "termine";

@Component({
  selector: "app-passwordreset",
  templateUrl: "./passwordreset.component.html",
  // Même mise en page que la connexion : styles partagés + compléments propres à cette page
  styleUrls: ["../login/login.component.scss", "./passwordreset.component.scss"],
})
/**
 * Réinitialisation du mot de passe, en deux temps :
 *  1. /auth/reset-password            → l'utilisateur demande un lien par e-mail ;
 *  2. /auth/reset-password?token=…    → le lien de l'e-mail ouvre le choix du nouveau mot de passe.
 */
export class PasswordresetComponent implements OnInit {
  etape: Etape = "demande";
  token = "";

  resetForm: FormGroup;
  nouveauForm: FormGroup;

  submitted: any = false;
  success: any = "";
  /** Erreur renvoyée par le back (lien expiré, invalide, mot de passe refusé…). */
  erreur = "";
  lienInvalide = false;
  afficherMdp = false;
  afficherConfirmation = false;

  year: number = new Date().getFullYear();

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    public toastr: ToastrService,
    private authenticationService: AuthenticationService
  ) {}

  ngOnInit() {
    this.resetForm = this.formBuilder.group({
      email: ["", [Validators.required, Validators.email]],
    });
    this.nouveauForm = this.formBuilder.group(
      {
        newPassword: ["", [Validators.required, Validators.minLength(8), Validators.pattern(REGLE_MOT_DE_PASSE)]],
        confirmPassword: ["", [Validators.required]],
      },
      { validators: motsDePasseIdentiques }
    );

    this.token = this.route.snapshot.queryParamMap.get("token") ?? "";
    this.etape = this.token ? "nouveau" : "demande";
  }

  // convenience getters for easy access to form fields
  get f() {
    return this.resetForm.controls;
  }

  get n() {
    return this.nouveauForm.controls;
  }

  /** Critères du mot de passe, affichés en direct sous le champ. */
  get criteres(): { libelle: string; ok: boolean }[] {
    const v: string = this.n.newPassword.value ?? "";
    return [
      { libelle: "8 caractères minimum", ok: v.length >= 8 },
      { libelle: "Une majuscule et une minuscule", ok: /[A-Z]/.test(v) && /[a-z]/.test(v) },
      { libelle: "Un chiffre", ok: /\d/.test(v) },
      { libelle: "Un caractère spécial (!, @, #…)", ok: /[^A-Za-z\d\s]/.test(v) },
    ];
  }

  /** Étape 1 : demande d'un lien par e-mail. */
  onSubmit() {
    this.erreur = "";
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }
    this.submitted = true;
    this.authenticationService.resetPassword(this.f.email.value).subscribe({
      next: (data: any) => {
        this.submitted = false;
        if (data?.responseCode && data.responseCode !== 200) {
          this.erreur = data.message || "La demande n'a pas pu aboutir.";
          return;
        }
        this.success = data;
        this.resetForm.reset();
      },
      error: (err) => {
        this.submitted = false;
        this.erreur = err?.message || "L'envoi de l'e-mail a échoué. Réessayez dans quelques instants.";
      },
    });
  }

  /** Étape 2 : enregistrement du nouveau mot de passe avec le jeton du lien. */
  enregistrerNouveau() {
    this.erreur = "";
    if (this.nouveauForm.invalid) {
      this.nouveauForm.markAllAsTouched();
      return;
    }
    this.submitted = true;
    this.authenticationService.changePassword(this.n.newPassword.value, this.token).subscribe({
      next: (data: any) => {
        this.submitted = false;
        if (data?.responseCode === 200) {
          this.etape = "termine";
          return;
        }
        this.erreur = data?.message || "La réinitialisation a échoué.";
        // Lien expiré ou invalide : inutile de réessayer avec ce jeton
        this.lienInvalide = data?.responseCode === 404 || /lien/i.test(this.erreur);
      },
      error: (err) => {
        this.submitted = false;
        this.erreur = err?.message || "La réinitialisation a échoué. Réessayez dans quelques instants.";
      },
    });
  }

  /** Abandonne le lien actuel et revient à la demande d'un nouveau lien. */
  demanderNouveauLien() {
    this.token = "";
    this.erreur = "";
    this.lienInvalide = false;
    this.success = "";
    this.etape = "demande";
    this.router.navigate(["/auth/reset-password"], { replaceUrl: true });
  }
}
