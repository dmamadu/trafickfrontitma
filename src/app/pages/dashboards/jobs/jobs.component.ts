import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
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
import { MatIconModule } from "@angular/material/icon";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { GoogleMapsModule } from "@angular/google-maps";
import { PapGoogleMapsComponent } from "../pap-google-maps/pap-google-maps.component";
import { CalendarComponent } from "../calendar-component/calendar-component";
import { Subject, takeUntil } from "rxjs";
import { Pap } from "../../pap/pap.model";
import { PapMultiPolygonMapsComponent } from "../pap-multi-polygon-maps/pap-multi-polygon-maps.component";

interface SexStats {
  Total: number;
  Hommes: number;
  Femmes: number;
  Autre: number;
}

interface VulnerabilityStats {
  [key: string]: number;
}

interface VulnerabilityBySex {
  Hommes: number;
  Femmes: number;
  Autre: number;
}

interface VulnerabilityDetails {
  [key: string]: VulnerabilityBySex;
}

interface StatsCategory {
  Vulnerabilites_globales: VulnerabilityStats;
  Sexes_globaux: SexStats;
  Vulnerabilites_par_sexe: VulnerabilityDetails;
}

interface CombinedStats {
  placeAffaireStats: StatsCategory;
  agricoleStats: StatsCategory;
  totalStats: StatsCategory;
}


@Component({
  selector: "app-jobs",
  standalone:true,
  imports: [MatIconModule, AngularMaterialModule, GoogleMapsModule, PapGoogleMapsComponent, CalendarComponent, PapMultiPolygonMapsComponent],
  templateUrl: "./jobs.component.html",
  styleUrls: ["./jobs.component.scss"],
})

/**
 * Jobs Component
 */
export class JobsComponent implements OnInit,OnDestroy {

  loadStats: boolean = true;

  statsData: any;
  placeAffaireStats: any;
  agricoleStats: any;
  totalStats: any;

  // Liste des vulnérabilités pour le template
  vulnerabilitesList = [
    'Situation matrimoniale précaire',
    'Ménage avec personne handicapée',
    'Mineur chef de ménage',
    'Personne âgée sans soutien',
    'Ménage nombreux',
    'Analphabétisme',
    'Non vulnérable'
  ];





  urlTaches: string = "taches";
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
  lengthPapVulnerable: number= 0;

  listPlainte: any[] = [];
  listDocument: any[] = [];
  lisRencontre: any[] = [];

  tasksData: any[] = [];

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
    // this.getStat();
    this.getUserConnected();
    this.getStatCombine();
    // this.loadAllCategories();
   // this.getPip();
    // this.getPlainte();
     this.getTaches();
     this.loadPaps();
     this.loadPapsAgricole();
    //this.getDocument();
    this.getRencontres();
    this.getPerteTotaleByCategory("papAgricole", this.evaluationPerteAgricole);
    this.getPerteTotaleByCategory(
      "databasePapPlaceAffaire",
      this.evaluationPertePlaceAffaire
    );
  }
percentHommes: number = 0;
percentFemmes: number = 0;
  getUserConnected() {
    this.userConnected = this.localService.getDataJson("user");
  }

  classifyVulnerability(): void {
    if (this.listPap && this.listPap.length > 0) {
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
      ).pipe(takeUntil(this.destroy$))
      .subscribe(
        (data: any) => {
          this.loadData = false;
          if (data["responseCode"] == 200) {
            this.loadData = false;
            this.lengthPip = data.length;
          } else {
            this.loadData = false;
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }
private destroy$ = new Subject<void>();

getPlainte() {
    this.loadData = true;
    return this.parentService
        .list("plaintes", this.pageSize, this.offset, this.currentProjectId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
            next: (data: any) => {
                this.loadData = false;
                if (data["responseCode"] === 200) {
                    this.lengthPlainte = data.length;
                    this.listPlainte = data.data;
                    this.classifyComplaints();
                    this.complaintChart.series = [
                        this.complaintCounts.resolu,
                        this.complaintCounts.enAttente,
                        this.complaintCounts.enCours,
                    ];
                }
            },
            error: (err) => {
                this.loadData = false;
                console.error('Erreur lors de la récupération des plaintes:', err);
            }
        });
}

getTaches() {
    this.loadData = true;
    return this.parentService
        .list(this.urlTaches, this.pageSize, this.offset, this.currentProjectId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
            next: (data: any) => {
                this.loadData = false;
                if (data["responseCode"] === 200) {
                    this.tasksData = data["data"];
                    console.log('Taches récupérées:', data);
                }
            },
            error: (err) => {
                this.loadData = false;
                console.error('Erreur lors de la récupération des tâches:', err);
            }
        });
}



ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
}

  public complaintCounts = {
  resolu: 0,
  enAttente: 0,
  enCours: 0
};

classifyComplaints(): void {
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
      .pipe(takeUntil(this.destroy$))
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

  getStat() {
    console.log('test ');
    return this.projectService
      .getStatsByProjectId('papAgricole', this.currentProjectId)
      .subscribe(
        (data: any) => {
          this.loadStats = false;
          console.log("Statistiques du projet:", data);
        },
        (err) => {
          console.log(err);
        }
      );
  }


  getStatCombine() {
    this.projectService
      .getStatsCombineByProjectId(this.currentProjectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data: CombinedStats) => {
          console.log("Statistiques combine du projet:", data);
          this.loadStats = false;
          this.statsData = data;
          this.placeAffaireStats = data.placeAffaireStats;
          this.agricoleStats = data.agricoleStats;
          this.totalStats = data.totalStats;
        },
        (err) => {
          console.error('Erreur lors du chargement des stats:', err);
          this.loadStats = false;
        }
      );
  }


  
getVulnerablePeopleCount(): number {
  if (!this.totalStats) return 0;
  
  const totalNonVulnerable = this.totalStats.Vulnerabilites_globales['Non vulnérable'] || 0;
  return this.totalStats.Sexes_globaux.Total - totalNonVulnerable;
}


getVulnerablePlaceAffaireBySex() {
  if (!this.placeAffaireStats) return { hommes: 0, femmes: 0, autre: 0 };

  const nonVulnerableHommes = this.placeAffaireStats.Vulnerabilites_par_sexe['Non vulnérable']?.Hommes || 0;
  const nonVulnerableFemmes = this.placeAffaireStats.Vulnerabilites_par_sexe['Non vulnérable']?.Femmes || 0;
  const nonVulnerableAutre = this.placeAffaireStats.Vulnerabilites_par_sexe['Non vulnérable']?.Autre || 0;

  return {
    hommes: this.placeAffaireStats.Sexes_globaux.Hommes - nonVulnerableHommes,
    femmes: this.placeAffaireStats.Sexes_globaux.Femmes - nonVulnerableFemmes,
    autre: this.placeAffaireStats.Sexes_globaux.Autre - nonVulnerableAutre
  };
}

getVulnerableAgricoleBySex() {
  if (!this.agricoleStats) return { hommes: 0, femmes: 0, autre: 0 };

  const nonVulnerableHommes = this.agricoleStats.Vulnerabilites_par_sexe['Non vulnérable']?.Hommes || 0;
  const nonVulnerableFemmes = this.agricoleStats.Vulnerabilites_par_sexe['Non vulnérable']?.Femmes || 0;
  const nonVulnerableAutre = this.agricoleStats.Vulnerabilites_par_sexe['Non vulnérable']?.Autre || 0;

  return {
    hommes: this.agricoleStats.Sexes_globaux.Hommes - nonVulnerableHommes,
    femmes: this.agricoleStats.Sexes_globaux.Femmes - nonVulnerableFemmes,
    autre: this.agricoleStats.Sexes_globaux.Autre - nonVulnerableAutre
  };
}


readonly VULNERABILITY_CRITERIA = [
  { key: 'Situation matrimoniale précaire', label: 'Situation matrimoniale' },
  { key: 'Ménage avec personne handicapée', label: 'Personne handicapée' },
  { key: 'Mineur chef de ménage', label: 'Mineur(e) en charge' },
  { key: 'Analphabétisme', label: 'Éducation' },
  { key: 'Ménage nombreux', label: 'Personne en charge' },
  { key: 'Personne âgée sans soutien', label: 'Personne âgée' }
];

getCriterionCount(category: string, criterionKey: string): number {
  const stats = this[category as keyof this] as any;
  return stats?.Vulnerabilites_globales?.[criterionKey] || 0;
}

paps: Pap[]=[];
papsAgricole: any[]=[];
isLoadingPap:boolean=false;
loadPaps(): void {
  this.isLoadingPap = true; 
  this.parentService.list("databasePapPlaceAffaire", 1000, 0, this.currentProjectId)
   .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data: any) => {
        console.log('res',data);
        if (data.responseCode == 200) {
          this.paps = data.data;
        }
        this.isLoadingPap = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoadingPap = false;
      }
    });
}

loadPapsAgricole(): void {
  console.log('loadPapsAgricole');
  this.isLoadingPap = true; 
  this.parentService.list("papAgricole", 1000, 0, this.currentProjectId)
   .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data: any) => {
        console.log('resAgricole', data);
        if (data.responseCode == 200) {
          // Debug: vérifier ce que contient pointGeometriques
          console.log('Premier PAP brut:', data.data[0]);
          console.log('pointGeometriques du premier PAP:', data.data[0]?.pointGeometriques);
          
          // Copie correcte sans supprimer pointGeometriques
          this.papsAgricole = data.data.map((pap: any) => ({
            ...pap,
            multiPolygonGeometrique: pap.pointGeometriques // Garde les deux propriétés
          }));
          
          console.log('papsAgricole après transformation:', this.papsAgricole);
          console.log('Premier PAP transformé:', this.papsAgricole[0]);
          console.log('multiPolygonGeometrique du premier:', this.papsAgricole[0]?.multiPolygonGeometrique);
        }
        this.isLoadingPap = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoadingPap = false;
      }
    });
}


  getPapByCategory(category: string) {
    return this.parentService
      .list(category, this.pageSize, this.offset, this.currentProjectId)
      .pipe(takeUntil(this.destroy$))
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
      .pipe(takeUntil(this.destroy$))
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

         //   console.log("Total des pertes pour tous les PAP:", totalPertes);
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


getPercentage(value: number, total: number): number {
  return total > 0 ? (value / total) * 100 : 0;
}
getGlobalPercentage(value1: number, total1: number, value2: number, total2: number): number {
  const total = (total1 || 0) + (total2 || 0);
  const value = (value1 || 0) + (value2 || 0);
  return total > 0 ? (value / total) * 100 : 0;
}
// Récupère les noms des vulnérabilités
getVulnerabilityNames(): string[] {
  return this.vulnerabilitesList;
}
}
