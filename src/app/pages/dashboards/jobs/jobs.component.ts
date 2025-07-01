import { Component, OnInit, ViewChild } from "@angular/core";
import { ChartType } from "./jobs.model";

import { ChartComponent } from "ng-apexcharts";
import { LocalService } from "src/app/core/services/local.service";
import { User } from "src/app/store/Authentication/auth.models";
import { ServiceParent } from "src/app/core/services/serviceParent";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { ListPvComponent } from "../list-pv/list-pv.component";
import { ProjectService } from "src/app/core/services/project.service";
import { ImageModalComponent } from "src/app/shared/image-modal.component";
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: "app-jobs",
  templateUrl: "./jobs.component.html",
  styleUrls: ["./jobs.component.scss"],
})

/**
 * Jobs Component
 */
export class JobsComponent implements OnInit {
  userConnected: User;
  imageUserConnected: any;
  isDropup: boolean = true;
  pageSize: number = 10000;
  pageIndex: number = 0;
  offset: number = 0;
  loadData: boolean = false;

  lengthPap: number;
  lengthPip: number;
  lenghtDocument: number;
  lengthPlainte: number;
  lengthRencontre: number;

  listPlainte: any[] = [];
  listDocument: any[] = [];
  lisRencontre: any[] = [];

  public listPap: any[] = [];
  public vulnerabilityCounts = {
    Faible: 0,
    Moyenne: 0,
  };
  currentProjectId: any;

  constructor(
    private localService: LocalService,
    private parentService: ServiceParent,
    private projectService: ProjectService,
    private _matDialog: MatDialog,
    private snackbar: SnackBarService
  ) {
    this.currentProjectId = this.localService.getData("ProjectId");
  }

  jobViewChart: ChartType;
  ApplicationChart: ChartType;
  ApprovedChart: ChartType;
  RejectedChart: ChartType;
  emailSentBarChart: ChartType;
  showNavigationArrows: any;
  showNavigationIndicators: any;
  vacancyData: any;
  receivedTimeChart: ChartType;
  recentJobsData: any;
  isActive: string;
  DetailProject = {
    fichiers: [
      {
        fichierUrl: "https://example.com/fichier1.doc",
        fichierName: "Document 1",
      },
      {
        fichierUrl: "https://example.com/fichier2.pdf",
        fichierName: "Report 2024",
      },
      {
        fichierUrl: "https://example.com/fichier3.ppt",
        fichierName: "Presentation Final",
      },
    ],
  };

  @ViewChild("chart", { static: false }) chart: ChartComponent;

  ngOnInit(): void {
    this.getUserConnected();
    this.loadAllCategories();
    this.getPip();
    this.getPlainte();
    this.getDocument();
    this.getRencontres();
    this.getPerteTotaleByCategory("papAgricole", this.evaluationPerteAgricole);
    this.getPerteTotaleByCategory(
      "databasePapPlaceAffaire",
      this.evaluationPertePlaceAffaire
    );
  }

  getUserConnected() {
    this.userConnected = this.localService.getDataJson("user");
  }

  classifyVulnerability(): void {
    if (this.listPap && this.listPap.length > 0) {
      // console.log("====================================");
      // console.log("listPap: " + this.listPap);
      // console.log("====================================");
      this.listPap.forEach((pap) => {
        if (pap.vulnerabilite == "Moyenne") {
          this.vulnerabilityCounts.Moyenne++;
        } else if (pap.vulnerabilite === "Faible") {
          this.vulnerabilityCounts.Faible++;
        }
      });
    } else {
      console.error(
        "Aucune donnée disponible pour classifier la vulnérabilité des PAP."
      );
    }

    console.log("Vulnérable:", this.vulnerabilityCounts.Moyenne);
    console.log("Non Vulnérable:", this.vulnerabilityCounts.Faible);
  }

  public vulnerabilityChart = {
    series: [],
    chart: {
      type: "pie",
      height: 320,
    },
    labels: ["Vulnérable", "Non Vulnérable"],
    colors: ["#0C8439", "#D45B00"],
    legend: {
      position: "bottom",
    },
  };

  getPip() {
    this.loadData = true;
    return this.parentService
      .list(
        "partie-interesse",
        this.pageSize,
        this.offset,
        this.currentProjectId
      )
      .subscribe(
        (data: any) => {
          this.loadData = false;
          if (data["responseCode"] == 200) {
            //  console.log(data);
            this.loadData = false;
            this.lengthPip = data.length;
            // console.log(data);
          } else {
            this.loadData = false;
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }

  //

  getPlainte() {
    return this.parentService
      .list("plaintes", this.pageSize, this.offset, this.currentProjectId)
      .subscribe(
        (data: any) => {
          this.loadData = false;
          if (data["responseCode"] == 200) {
            console.log('==============plaintes======================');
            console.log(data);
            console.log('====================================');
            this.loadData = false;
            this.lengthPlainte = data.length;
            this.listPlainte = data.data;
            this.classifyComplaints();
            this.complaintChart.series = [
              this.complaintCounts.resolu,
              this.complaintCounts.enAttente,
              this.complaintCounts.enCours,
            ];
          } else {
            this.loadData = false;
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }

  getDocument() {
    return this.parentService
      .list("documents", this.pageSize, this.offset, this.currentProjectId)
      .subscribe(
        (data: any) => {
          this.loadData = false;
          if (data["responseCode"] == 200) {
            this.loadData = false;
            this.listDocument = data["data"];
            this.lenghtDocument = data.length;
            //  console.log(data);
          } else {
            this.loadData = false;
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }



  public complaintCounts = {
  resolu: 0,
  enAttente: 0,
  enCours: 0
};
  // classifyComplaints(): void {
  //   if (this.listPlainte && this.listPlainte.length > 0) {
  //     this.listPlainte.forEach((complaint) => {
  //       if (complaint.etat == "Résolue") {
  //         this.complaintCounts.resolu++;
  //       } else if (complaint.etat == "En Attente") {
  //         this.complaintCounts.enAttente++;
  //       } else if (complaint.etat == "En cours") {
  //         this.complaintCounts.enCours++;
  //       }
  //     });
  //   } else {
  //     console.error("Aucune donnée disponible pour classifier les plaintes.");
  //   }
  // }
classifyComplaints(): void {
    // Reset counts
    this.complaintCounts = {
      resolu: 0,
      enAttente: 0,
      enCours: 0
    };

    if (this.listPlainte && this.listPlainte.length > 0) {
      this.listPlainte.forEach((complaint : any) => {
        console.log('===================complein=================');
        console.log(complaint.etat);
        console.log('====================================');
        if (complaint.etat == "Résolue") {
          this.complaintCounts.resolu++;
        } else if (complaint.etat == "En Attente") {
          this.complaintCounts.enAttente++;
        } else if (complaint.etat == "En cours") {
          this.complaintCounts.enCours++;
        }
      });

      // Update chart series with the counts
      this.complaintChart.series = [
        this.complaintCounts.resolu,
        this.complaintCounts.enAttente,
        this.complaintCounts.enCours
      ];
    } else {
      console.error("Aucune donnée disponible pour classifier les plaintes.");
      this.complaintChart.series = [0, 0, 0]; // Set empty data
    }
  }
  public complaintChart = {
    series: [],
    chart: {
      type: "pie",
      height: 320,
    },
    labels: ["Résolue", "En Attente", "En Cours"],
    colors: ["#D45C00", "#0C8439", "#000000"],
    legend: {
      position: "bottom",
    },
  };

  //engagements

  engagements = [
    {
      type: "Réunion d'information Konia",
      date: "28/12/2022",
      reference: "PV 1 PAR3 Réunion comm. Konia",
    },
    {
      type: "PAR3 signature ordre de mission",
      date: "29/12/2022",
      reference: "PV 2 PAR3 signature ordre de mission",
    },
    {
      type: "Réunion d'information Balla Kayati",
      date: "29/12/2022",
      reference: "PV 3 PAR3 Réunion Balla Kayati",
    },
    {
      type: "Réunion d'information Malapoouya",
      date: "29/12/2022",
      reference: "PV 4 PAR3 réunion Malapoouya",
    },
    {
      type: "Profil Socio-économique Horè Gouba",
      date: "30/12/2022",
      reference: "PV 5 Profil Socio-économique Horè Gouba rev_Ro",
    },
    {
      type: "Profil Socio-économique Kissaka PAR3",
      date: "30/12/2022",
      reference: "PV 6 Profil Socio-économique Kissaka PAR3 rev_Ro",
    },
    {
      type: "Profil Socio-économique Djolol PAR3",
      date: "30/12/2022",
      reference: "PV 7 Profil Socio-économique Djolol PAR3 rev_Ro",
    },
    {
      type: "Focus group Horè Bhoundou PAR3",
      date: "03/01/2023",
      reference: "PV 8 Focus group Horè Bhoundou PAR3 rev_Ro",
    },
    {
      type: "Profil Socio-économique Horè Kintaou PAR3",
      date: "04/01/2023",
      reference: "PV 9 Profil Socio-économique Horè Kintaou PAR3 rev_Ro",
    },
    {
      type: "Focus group N'dantari Ley API DM PAR3",
      date: "04/01/2023",
      reference: "PV 10 Focus group N'dantari Ley API DM PAR3 rev_Ro",
    },
    {
      type: "Réunion d'information N'dantari Dow",
      date: "04/01/2023",
      reference: "PV 11 N'dantari Dow rev_Ro",
    },
    {
      type: "Focus group Marga",
      date: "04/01/2023",
      reference: "PV 12 Focus group Marga rev_Ro",
    },
    {
      type: "Focus group Telirè",
      date: "05/01/2023",
      reference: "PV 13 Focus group Telirè rev_Ro",
    },
    {
      type: "Focus group Fakerè",
      date: "06/01/2023",
      reference: "PV 14 Focus group Fakerè rev_Ro",
    },
    {
      type: "Focus group Hakkoudhè Tchandhi",
      date: "06/01/2023",
      reference: "PV 15 Focus group Hakkoudhè Tchandhi rev_Ro",
    },
    {
      type: "Focus group Djohèrè",
      date: "16/01/2023",
      reference: "PV 16 Focus group Djohèrè",
    },
    {
      type: "Focus group Balla Dabi",
      date: "06/01/2023",
      reference: "PV 17 Focus group Balla Dabi",
    },
    {
      type: "Focus group Balla Kayati",
      date: "16/01/2023",
      reference: "PV 18 Focus group Balla Kayati",
    },
    {
      type: "Identification des sites de relocalisation de Horè Gouba",
      date: "23/01/2023",
      reference:
        "PV 19 Identification des sites de relocalisation de Horè Gouba rev_Ro (1)",
    },
  ];

  page = 1;

  viewPV(reference: string): void {
    this.snackbar.openModal(
      ListPvComponent,
      "45rem",
      "new",
      "",
      reference,
      "",
      () => {}
    );
  }

  getFileName(url: string): string {
    return url.substring(url.lastIndexOf("/") + 1);
  }

  getRencontres() {
    return this.projectService
      .getRencontreByProjectId(this.currentProjectId)
      .subscribe(
        (data: any) => {
          this.loadData = false;
          if (data["responseCode"] == 200) {
            this.loadData = false;
            this.lisRencontre = data["data"];
            this.lengthRencontre = this.lisRencontre.length;
          } else {
            this.loadData = false;
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }
  getPapByCategory(category: string) {
    return this.parentService
      .list(category, this.pageSize, this.offset, this.currentProjectId)
      .subscribe(
        (data: any) => {
          this.loadData = false;
          if (data["responseCode"] === 200) {
            const currentList = data.data;
            this.listPap = [...this.listPap, ...currentList];
            this.lengthPap += currentList.length;
            this.updateVulnerabilityCounts(currentList);
          } else {
            console.error(
              `Erreur lors de la récupération des PAP pour ${category}`
            );
          }
        },
        (err) => {
          console.error(`Erreur réseau pour la catégorie ${category}:`, err);
        }
      );
  }

  evaluationPertePlaceAffaire: number = 0;
  evaluationPerteAgricole: number = 0;

  getPerteTotaleByCategory(category: string, evalutationPerte: number) {
    return this.parentService
      .list(category, this.pageSize, this.offset, this.currentProjectId)
      .subscribe(
        (data: any) => {
          this.loadData = false;
          if (data["responseCode"] == 200) {
            // Calculer la somme totale des pertes
            const totalPertes = this.listPap.reduce((sum, pap) => {
              // Convertir en nombre au cas où perteTotale serait une chaîne
              const perte = Number(pap.perteTotale) || 0;
              return sum + perte;
            }, 0);

            console.log("Total des pertes pour tous les PAP:", totalPertes);
            // Vous pouvez stocker ce total où vous en avez besoin, par exemple:
            evalutationPerte = totalPertes;

            //this.updateVulnerabilityCounts(currentList);
          } else {
            console.error(
              `Erreur lors de la récupération des PAP pour ${category}`
            );
          }
        },
        (err) => {
          console.error(`Erreur réseau pour la catégorie ${category}:`, err);
        }
      );
  }

  updateVulnerabilityCounts(list: any[]): void {
    list.forEach((pap) => {
      if (pap.vulnerabilite == "Faible") {
        this.vulnerabilityCounts.Faible++;
      } else if (pap.vulnerabilite == "Moyenne") {
        this.vulnerabilityCounts.Moyenne++;
      }
      this.vulnerabilityChart.series = [
        this.vulnerabilityCounts.Faible,
        this.vulnerabilityCounts.Moyenne,
      ];
    });
  }

  loadAllCategories() {
    this.listPap = [];
    this.lengthPap = 0;
    this.vulnerabilityCounts = { Moyenne: 0, Faible: 0 };
    const categories = [
      "papAgricole",
      "databasePapPlaceAffaire",
      // "papEconomique",
    ];
    categories.forEach((category) => {
      this.getPapByCategory(category);
    });
  }

  openImageModal(imageUrl: string) {
    if (imageUrl) {
      this._matDialog.open(ImageModalComponent, {
        data: { imageUrl: imageUrl },
      });
    }
  }
}
