import { Component, OnInit } from "@angular/core";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { TableauComponent } from "src/app/shared/tableau/tableau.component";
import { UIModule } from "src/app/shared/ui/ui.module";
import { AuditService } from "./audit.service";

const TYPE_ACTIONS = [
  "SUPPRESSION_PLAINTE_BATCH",
  "SUPPRESSION_PAP_AGRICOLE_BATCH",
  "SUPPRESSION_PAP_HABITAT_BATCH",
  "SUPPRESSION_PAP_PLACEAFFAIRE_BATCH",
  "MODIFICATION_PAP_SOURCE",
  "MODIFICATION_PAP_CHAMP",
  "CREATION_UTILISATEUR",
  "MODIFICATION_UTILISATEUR",
  "SUPPRESSION_UTILISATEUR",
  "ACTIVATION_UTILISATEUR",
  "DESACTIVATION_UTILISATEUR",
  "CHANGEMENT_MOT_DE_PASSE",
  "CHANGEMENT_MOT_DE_PASSE_ECHEC",
  "REINITIALISATION_MOT_DE_PASSE",
  "CONNEXION_REUSSIE",
  "CONNEXION_ECHEC",
  "PROFIL_MODIFIE",
];

/** Libellés français des types d'action (affichage et filtres). */
const LIBELLES_TYPES: Record<string, string> = {
  SUPPRESSION_PLAINTE_BATCH: "Suppression de plaintes (lot)",
  SUPPRESSION_PAP_AGRICOLE_BATCH: "Suppression de PAP agricoles (lot)",
  SUPPRESSION_PAP_HABITAT_BATCH: "Suppression de PAP habitat (lot)",
  SUPPRESSION_PAP_PLACEAFFAIRE_BATCH: "Suppression de PAP places d'affaires (lot)",
  MODIFICATION_PAP_SOURCE: "Modification de PAP (source)",
  MODIFICATION_PAP_CHAMP: "Modification de PAP (champ)",
  CREATION_UTILISATEUR: "Création d'utilisateur",
  MODIFICATION_UTILISATEUR: "Modification d'utilisateur",
  SUPPRESSION_UTILISATEUR: "Suppression d'utilisateur",
  ACTIVATION_UTILISATEUR: "Activation d'utilisateur",
  DESACTIVATION_UTILISATEUR: "Désactivation d'utilisateur",
  CHANGEMENT_MOT_DE_PASSE: "Changement de mot de passe",
  CHANGEMENT_MOT_DE_PASSE_ECHEC: "Changement de mot de passe échoué",
  REINITIALISATION_MOT_DE_PASSE: "Réinitialisation de mot de passe",
  CONNEXION_REUSSIE: "Connexion réussie",
  CONNEXION_ECHEC: "Connexion échouée",
  PROFIL_MODIFIE: "Profil modifié",
};

@Component({
  selector: "app-audit",
  standalone: true,
  imports: [TableauComponent, UIModule, AngularMaterialModule],
  templateUrl: "./audit.component.html",
})
export class AuditComponent implements OnInit {
  breadCrumbItems = [
    { label: "Administration" },
    { label: "Journal d'audit", active: true },
  ];

  typeActions = TYPE_ACTIONS;
  typeActionFiltre = "";
  utilisateurFiltre = "";

  headers: any[] = [];
  datas: any[] = [];
  loadData = false;
  length = 0;
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 25, 100, 500, 1000];

  /** « CONNEXION_ECHEC » → « Connexion échec » : libellé lisible pour la liste des filtres. */
  libelleType(type: string): string {
    if (LIBELLES_TYPES[type]) {
      return LIBELLES_TYPES[type];
    }
    const texte = type.toLowerCase().replace(/_/g, " ");
    return texte.charAt(0).toUpperCase() + texte.slice(1);
  }

  constructor(private auditService: AuditService) {}

  ngOnInit(): void {
    this.headers = this.createHeaders();
    this.loadEntries();
  }

  createHeaders() {
    return [
      { th: "Date", td: "dateLibelle", sortable: false },
      { th: "Type d'action", td: "typeLibelle", sortable: true, badgeClass: this.badgesTypes() },
      { th: "Utilisateur", td: "utilisateur", sortable: true },
      { th: "Détails", td: "details", sortable: false },
    ];
  }

  loadEntries(): void {
    this.loadData = true;
    this.auditService
      .search(this.pageIndex, this.pageSize, this.typeActionFiltre || undefined, this.utilisateurFiltre || undefined)
      .subscribe({
        next: (data: any) => {
          this.loadData = false;
          if (data?.responseCode == 200) {
            this.datas = (data.data ?? []).map((e: any) => ({
              ...e,
              dateLibelle: this.formaterDate(e.dateAction),
              typeLibelle: this.libelleType(e.typeAction ?? ""),
            }));
            this.length = data.length ?? 0;
          } else {
            this.datas = [];
            this.length = 0;
          }
        },
        error: () => {
          this.loadData = false;
        },
      });
  }

  /** Badge par type : échecs en rouge, suppressions en orange, connexions réussies en vert. */
  private badgesTypes(): { name: string; value: string }[] {
    return TYPE_ACTIONS.map((type) => ({
      name: this.libelleType(type),
      value: type.endsWith("_ECHEC")
        ? "badge-danger"
        : type.startsWith("SUPPRESSION")
          ? "badge-orange"
          : type === "CONNEXION_REUSSIE"
            ? "badge-success"
            : "badge-blue",
    }));
  }

  /** « 2026-11-13T17:46:05.447 » → « 13/11/2026 17:46 ». */
  private formaterDate(valeur: string): string {
    const d = valeur ? new Date(valeur) : null;
    if (!d || isNaN(d.getTime())) {
      return valeur ?? "";
    }
    const p = (n: number) => String(n).padStart(2, "0");
    return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }

  applyFilters(): void {
    this.pageIndex = 0;
    this.loadEntries();
  }

  pageChanged(event: any): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadEntries();
  }
}
