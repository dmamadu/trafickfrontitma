import { CommonModule, DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { finalize } from "rxjs";
import { ColorService } from "src/app/core/services/color.service";
import { LocalService } from "src/app/core/services/local.service";
import { PermissionService } from "src/app/core/services/permission.service";
import { isExtensionAccepted } from "src/app/shared/utils/file-extension";
import { USER_PROFILE_UPDATED_EVENT, resolveUserImageUrl } from "src/app/shared/utils/user-image";
import { User } from "src/app/store/Authentication/auth.models";
import { Connexion, MonProjet, ProfilService } from "./profil.service";

type Onglet = "informations" | "securite" | "projets";

const ONGLETS: { id: Onglet; label: string; icon: string; description: string }[] = [
  { id: "informations", label: "Informations", icon: "person", description: "Photo et coordonnées" },
  { id: "securite", label: "Sécurité", icon: "lock", description: "Mot de passe et connexions" },
  { id: "projets", label: "Mes projets", icon: "folder_open", description: "Projets et rôles" },
];

const ADMIN_ROLES = ["Super Admin", "Admin"];
const PHOTO_EXTENSIONS = [".png", ".jpg"]; // .jpeg accepté via isExtensionAccepted
const PHOTO_MAX_BYTES = 10 * 1024 * 1024; // limite multipart du back (10 Mo)

@Component({
  selector: "app-profil",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, DatePipe],
  templateUrl: "./profil.component.html",
})
export class ProfilComponent implements OnInit {
  readonly onglets = ONGLETS;
  onglet: Onglet = "informations";

  user: User | null = null;
  loadingUser = true;
  loadError = "";

  form: FormGroup;
  saving = false;
  uploadingPhoto = false;

  connexions: Connexion[] = [];
  connexionsTotal = 0;
  connexionsPage = 0;
  readonly connexionsSize = 10;
  loadingConnexions = false;

  projets: MonProjet[] = [];
  projetsLoaded = false;
  loadingProjets = false;
  currentProjectId = "";

  constructor(
    private profilService: ProfilService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private matDialog: MatDialog,
    private localService: LocalService,
    private colorService: ColorService,
    private permissionService: PermissionService
  ) {
    this.form = this.fb.group({
      contact: ["", [Validators.maxLength(30), Validators.pattern(/^[0-9+\s().-]*$/)]],
      locality: ["", [Validators.maxLength(100)]],
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const demande = params.get("onglet") as Onglet;
      this.onglet = ONGLETS.some((o) => o.id === demande) ? demande : "informations";
    });
    // Tout est chargé d'emblée : l'en-tête affiche des indicateurs issus des trois onglets.
    this.chargerProfil();
    this.chargerConnexions(0);
    this.chargerProjets();
  }

  // ---------- Navigation ----------

  choisirOnglet(onglet: Onglet): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: { onglet }, replaceUrl: true });
  }

  // ---------- Indicateurs de l'en-tête ----------

  /** Connexion réussie précédant la session en cours (la plus récente est celle d'aujourd'hui). */
  get connexionPrecedente(): string | null {
    if (this.connexionsPage !== 0) {
      return this.derniereConnexionConnue;
    }
    const reussies = this.connexions.filter((c) => c.type === "CONNEXION_REUSSIE");
    return reussies[1]?.date ?? reussies[0]?.date ?? null;
  }
  private derniereConnexionConnue: string | null = null;

  /** Tentatives échouées parmi les 10 dernières connexions. */
  get echecsRecents(): number {
    return this.connexionsPage === 0
      ? this.connexions.filter((c) => c.type !== "CONNEXION_REUSSIE").length
      : this.echecsConnus;
  }
  private echecsConnus = 0;

  projetCouleur(projet: MonProjet): string {
    try {
      const primary = projet.colors ? JSON.parse(projet.colors)?.primary : null;
      return typeof primary === "string" && /^#[0-9a-f]{3,8}$/i.test(primary) ? primary : "#245363";
    } catch {
      return "#245363";
    }
  }

  // ---------- Informations ----------

  get photoUrl(): string {
    return resolveUserImageUrl(this.user?.imageUrl);
  }

  get initiales(): string {
    const f = this.user?.firstname?.trim()?.[0] ?? "";
    const l = this.user?.lastname?.trim()?.[0] ?? "";
    return (f + l).toUpperCase();
  }

  get roleLabel(): string {
    return this.user?.role?.[0]?.name || "Aucun rôle";
  }

  get isAdmin(): boolean {
    return (this.user?.role ?? []).some((r) => ADMIN_ROLES.includes(r?.name ?? ""));
  }

  chargerProfil(): void {
    this.loadingUser = true;
    this.loadError = "";
    this.profilService
      .getMe()
      .pipe(finalize(() => (this.loadingUser = false)))
      .subscribe({
        next: (user) => {
          this.user = user;
          this.resetForm();
        },
        error: (err) => (this.loadError = err?.message || "Impossible de charger votre profil."),
      });
  }

  resetForm(): void {
    this.form.reset({ contact: this.user?.contact ?? "", locality: this.user?.locality ?? "" });
  }

  enregistrer(): void {
    if (this.form.invalid || !this.user) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.envoyerProfil(this.user.imageUrl ?? null, "Vos informations ont été enregistrées.", () => (this.saving = false));
  }

  choisirPhoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ""; // permet de re-sélectionner le même fichier
    if (!file || !this.user) {
      return;
    }
    const ext = file.name.includes(".") ? file.name.substring(file.name.lastIndexOf(".")) : "";
    if (!isExtensionAccepted(PHOTO_EXTENSIONS, ext)) {
      this.toastr.error("Formats acceptés : PNG, JPG, JPEG.");
      return;
    }
    if (file.size > PHOTO_MAX_BYTES) {
      this.toastr.error("La photo ne doit pas dépasser 10 Mo.");
      return;
    }
    this.uploadingPhoto = true;
    this.profilService.uploadPhoto(file).subscribe({
      next: (fileName) => {
        if (!fileName) {
          this.uploadingPhoto = false;
          this.toastr.error("L'envoi de la photo a échoué.");
          return;
        }
        this.envoyerProfil(fileName, "Photo de profil mise à jour.", () => (this.uploadingPhoto = false), true);
      },
      error: (err) => {
        this.uploadingPhoto = false;
        this.toastr.error(err?.message || "L'envoi de la photo a échoué.");
      },
    });
  }

  retirerPhoto(): void {
    if (!this.user?.imageUrl) {
      return;
    }
    this.uploadingPhoto = true;
    this.envoyerProfil(null, "Photo de profil retirée.", () => (this.uploadingPhoto = false), true);
  }

  /**
   * Enregistre le profil. Pour un changement de photo, on renvoie les coordonnées déjà enregistrées
   * (et non le formulaire en cours d'édition), pour ne pas valider des saisies non confirmées.
   */
  private envoyerProfil(imageUrl: string | null, succes: string, done: () => void, photoSeule = false): void {
    const source = photoSeule
      ? { contact: this.user?.contact ?? null, locality: this.user?.locality ?? null }
      : this.form.value;
    this.profilService
      .updateMe({ contact: source.contact || null, locality: source.locality || null, imageUrl })
      .pipe(finalize(done))
      .subscribe({
        next: (user) => {
          const brouillon = photoSeule ? this.form.value : null;
          this.user = user;
          this.resetForm();
          if (brouillon) {
            this.form.patchValue(brouillon); // conserve une saisie en cours
          }
          this.synchroniserSession(user);
          this.toastr.success(succes);
        },
        error: (err) => this.toastr.error(err?.message || "L'enregistrement a échoué."),
      });
  }

  /** Met à jour la copie de l'utilisateur gardée en session et prévient la barre du haut. */
  private synchroniserSession(user: User): void {
    const stored = this.localService.getDataJson("user");
    if (stored) {
      stored.contact = user.contact;
      stored.locality = user.locality;
      stored.imageUrl = user.imageUrl;
      this.localService.saveDataJson("user", stored);
    }
    window.dispatchEvent(new CustomEvent(USER_PROFILE_UPDATED_EVENT));
  }

  // ---------- Sécurité ----------

  get connexionsPages(): number {
    return Math.max(1, Math.ceil(this.connexionsTotal / this.connexionsSize));
  }

  chargerConnexions(page: number): void {
    this.loadingConnexions = true;
    this.profilService
      .getConnexions(page, this.connexionsSize)
      .pipe(finalize(() => (this.loadingConnexions = false)))
      .subscribe({
        next: (res) => {
          if (this.connexionsPage === 0 && res.page !== 0) {
            // on garde les indicateurs de l'en-tête calculés sur la première page
            this.derniereConnexionConnue = this.connexionPrecedente;
            this.echecsConnus = this.echecsRecents;
          }
          this.connexions = res.items;
          this.connexionsTotal = res.total;
          this.connexionsPage = res.page;
        },
        error: (err) => this.toastr.error(err?.message || "Impossible de charger l'historique."),
      });
  }

  changerMotDePasse(): void {
    import("src/app/account/auth/change-password/change-password.component").then(({ ChangePasswordComponent }) => {
      this.matDialog
        .open(ChangePasswordComponent, { data: { isForced: false } })
        .afterClosed()
        .subscribe(() => this.chargerConnexions(0));
    });
  }

  // ---------- Mes projets ----------

  chargerProjets(): void {
    this.loadingProjets = true;
    this.currentProjectId = this.localService.getData("ProjectId") || "";
    this.profilService
      .getProjets()
      .pipe(finalize(() => (this.loadingProjets = false)))
      .subscribe({
        next: (projets) => {
          this.projets = projets;
          this.projetsLoaded = true;
        },
        error: (err) => this.toastr.error(err?.message || "Impossible de charger vos projets."),
      });
  }

  estProjetActif(projet: MonProjet): boolean {
    return String(projet.id) === String(this.currentProjectId);
  }

  projetImage(projet: MonProjet): string | null {
    return projet.imageUrl ? resolveUserImageUrl(projet.imageUrl) : null;
  }

  /** Même logique que l'écran de sélection de projet (SelectProjectComponent.onProjectSelect). */
  basculerVers(projet: MonProjet): void {
    if (projet.colors) {
      try {
        this.colorService.setColors(JSON.parse(projet.colors));
      } catch {
        // couleurs mal formées : on garde les couleurs actuelles
      }
    }
    this.localService.saveData("ProjectId", projet.id.toString());
    this.localService.saveData("libelleProject", projet.libelle ?? "");
    this.localService.saveData("ProjectLogo", (projet.imageUrl || "default-logo.png").toString());
    const terminer = () => {
      this.toastr.success(`Projet « ${projet.libelle} » sélectionné.`);
      this.router.navigate(["/dashboards/jobs"]);
    };
    this.permissionService.load(projet.id).subscribe({ next: terminer, error: terminer });
  }

  ouvrirSelectionAdmin(): void {
    import("src/app/account/auth/select-project-admin/select-project-admin.component").then(
      ({ SelectProjectAdminComponent }) => this.matDialog.open(SelectProjectAdminComponent)
    );
  }
}
