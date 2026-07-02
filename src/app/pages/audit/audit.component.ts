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
];

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

  constructor(private auditService: AuditService) {}

  ngOnInit(): void {
    this.headers = this.createHeaders();
    this.loadEntries();
  }

  createHeaders() {
    return [
      { th: "Date", td: "dateAction", sortable: true },
      { th: "Type d'action", td: "typeAction", sortable: true },
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
            this.datas = data.data;
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
