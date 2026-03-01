
// import { Component, OnDestroy, OnInit, ViewChild, ChangeDetectorRef } from "@angular/core";
// import { PapService } from "../../pap/pap.service";
// import { MatSort } from "@angular/material/sort";
// import { MatPaginator } from "@angular/material/paginator";
// import { Pap } from "../../pap/pap.model";
// import { MatTableDataSource } from "@angular/material/table";
// import { UntypedFormGroup } from "@angular/forms";
// import { ServiceParent } from "src/app/core/services/serviceParent";
// import { LocalService } from "src/app/core/services/local.service";
// import { Subject, takeUntil } from "rxjs";
// import { ProjectService } from "src/app/core/services/project.service";

// interface SexStats {
//   Total: number;
//   Hommes: number;
//   Femmes: number;
//   Autre: number;
// }

// interface VulnerabilityStats {
//   [key: string]: number;
// }

// interface VulnerabilityBySex {
//   Hommes: number;
//   Femmes: number;
//   Autre: number;
// }

// interface VulnerabilityDetails {
//   [key: string]: VulnerabilityBySex;
// }

// interface StatsCategory {
//   Vulnerabilites_globales: VulnerabilityStats;
//   Sexes_globaux: SexStats;
//   Vulnerabilites_par_sexe: VulnerabilityDetails;
// }

// interface CombinedStats {
//   placeAffaireStats: StatsCategory;
//   agricoleStats: StatsCategory;
//   habitatStats: StatsCategory; // AJOUTÉ
//   totalStats: StatsCategory;
// }

// @Component({
//   selector: "app-mise-en-oeuvre",
//   templateUrl: "./mise-en-oeuvre.component.html",
//   styleUrl: "./mise-en-oeuvre.component.css",
// })
// export class MiseEnOeuvreComponent implements OnInit, OnDestroy {
//   [x: string]: any;

//   listPap: Pap[];
//   filterTable($event: any) {}
//   breadCrumbItems: Array<{}>;
//   isLoading: boolean = false;
//   loadData: boolean = true;
//   loadStats: boolean = true;
//   pageSizeOptions = [5, 10, 25, 100, 500, 1000];
//   pageSize: number = 10000000;
//   pageIndex: number = 0;
//   userConnecter;
//   offset: number = 0;

//   urlEntente: string = "ententeSynchroniser";

//   currentProjectId: any;
  
//   // Données des statistiques combinées
//   statsData: any;
//   placeAffaireStats: any;
//   agricoleStats: any;
//   habitatStats: any; // AJOUTÉ
//   totalStats: any;

//   // Données pour l'affichage
//   dossiersIncomplets: number = 0;
//   dossiersComplets: number = 0;
//   ententesCompensation: number = 0;
//   dossiersTransmis: number = 0;
//   papPayees: number = 0;

//   // Configuration des graphiques - MODIFIÉ pour 3 catégories
//   pieChart = {
//     series: [0, 0, 0], // MODIFIÉ
//     chart: {
//       type: "pie",
//       width: 380, // Augmenté pour mieux voir 3 parts
//     },
//     labels: ["PAP Agricoles", "PAP Places d'affaires", "PAP Habitat"], // MODIFIÉ
//     colors: ["#D45C00", "#0C8439", "#1E88E5"], // MODIFIÉ - Ajouté bleu pour Habitat
//     legend: {
//       position: "bottom",
//     },
//   };

//   vulnerableChart = {
//     series: [0, 0],
//     chart: {
//       type: "pie",
//       width: 330,
//     },
//     labels: ["Vulnérables", "Non vulnérables"],
//     colors: ["#0C8439", "#D45C00"],
//     legend: {
//       position: "bottom",
//     },
//   };

//   barChart = {
//     series: [
//       {
//         name: "Effectif masculin",
//         data: [0, 0, 0], // MODIFIÉ
//       },
//       {
//         name: "Effectif féminin",
//         data: [0, 0, 0], // MODIFIÉ
//       },
//     ],
//     chart: {
//       type: "bar",
//       height: 320,
//       stacked: true,
//     },
//     xaxis: {
//       categories: ["PAP Agricoles", "PAP Places d'affaires", "PAP Habitat"], // MODIFIÉ
//     },
//     colors: ["#008FFB", "#FF4560"],
//     legend: {
//       position: "top",
//     },
//     plotOptions: {
//       bar: {
//         horizontal: false,
//       },
//     },
//   };

//   compensationChart = {
//     series: [
//       {
//         name: "Total des compensations",
//         data: [0, 0, 0], // MODIFIÉ
//       },
//     ],
//     chart: {
//       type: "bar",
//       height: 320,
//     },
//     xaxis: {
//       categories: ["PAP Agricoles", "PAP Places d'affaires", "PAP Habitat"], // MODIFIÉ
//     },
//     colors: ["#0C8439"],
//     dataLabels: {
//       enabled: true,
//       formatter: function (val) {
//         return val.toLocaleString() + " CFA";
//       },
//     },
//   };

//   private destroy$ = new Subject<void>();

//   constructor(
//     private localService: LocalService,
//     private parentService: ServiceParent,
//     private projectService: ProjectService,
//     private _changeDetectorRef: ChangeDetectorRef // AJOUTÉ
//   ) {
//     this.currentProjectId = this.localService.getData("ProjectId");
//     console.log("Current Project ID:", this.currentProjectId);
//   }

//   ngOnInit(): void {
//     this.getStatCombine();
//     this.getEntente();
//   }

//   getStatCombine() {
//     this.loadData = true;
//     this.loadStats = true;
    
//     this.projectService
//       .getStatsCombineByProjectId(this.currentProjectId)
//       .pipe(takeUntil(this.destroy$))
//       .subscribe(
//         (data: any) => {
//           console.log("Statistiques combinées du projet:", data);
//           this.loadStats = false;
//           this.loadData = false;
          
//           this.statsData = data;
//           this.placeAffaireStats = data.placeAffaireStats;
//           this.agricoleStats = data.agricoleStats;
//           this.habitatStats = data.habitatStats; // AJOUTÉ
//           this.totalStats = data.totalStats;
          
//           // Mise à jour des graphiques avec les nouvelles données
//           this.updateAllCharts();
//         },
//         (err) => {
//           console.error('Erreur lors du chargement des stats:', err);
//           this.loadStats = false;
//           this.loadData = false;
//         }
//       );
//   }

//   updateAllCharts() {
//     this.updatePieChart();
//     this.updateVulnerableChart();
//     this.updateBarChart();
//     this.updateCompensationChart();
//   }

//   updatePieChart() {
//     if (this.agricoleStats && this.placeAffaireStats && this.habitatStats) {
//       const agricoleTotal = this.agricoleStats.Sexes_globaux?.Total || 0;
//       const placeAffaireTotal = this.placeAffaireStats.Sexes_globaux?.Total || 0;
//       const habitatTotal = this.habitatStats.Sexes_globaux?.Total || 0; // AJOUTÉ
      
//       this.pieChart = {
//         ...this.pieChart,
//         series: [agricoleTotal, placeAffaireTotal, habitatTotal] // MODIFIÉ
//       };
//     }
//   }

//   updateVulnerableChart() {
//     if (this.totalStats && this.totalStats.Vulnerabilites_globales) {
//       const vulnerabilities = this.totalStats.Vulnerabilites_globales;
      
//       // Calculer les vulnérables (tous sauf "Non vulnérable")
//       let vulnerableCount = 0;
//       let nonVulnerableCount = vulnerabilities["Non vulnérable"] || 0;
      
//       Object.keys(vulnerabilities).forEach(key => {
//         if (key !== "Non vulnérable") {
//           vulnerableCount += vulnerabilities[key] || 0;
//         }
//       });
      
//       this.vulnerableChart = {
//         ...this.vulnerableChart,
//         series: [vulnerableCount, nonVulnerableCount]
//       };
//     }
//   }

//   updateBarChart() {
//     if (this.agricoleStats && this.placeAffaireStats && this.habitatStats) {
//       const agricoleHommes = this.agricoleStats.Sexes_globaux?.Hommes || 0;
//       const agricoleFemmes = this.agricoleStats.Sexes_globaux?.Femmes || 0;
//       const placeAffaireHommes = this.placeAffaireStats.Sexes_globaux?.Hommes || 0;
//       const placeAffaireFemmes = this.placeAffaireStats.Sexes_globaux?.Femmes || 0;
//       const habitatHommes = this.habitatStats.Sexes_globaux?.Hommes || 0; // AJOUTÉ
//       const habitatFemmes = this.habitatStats.Sexes_globaux?.Femmes || 0; // AJOUTÉ

//       this.barChart = {
//         ...this.barChart,
//         series: [
//           {
//             name: "Effectif masculin",
//             data: [agricoleHommes, placeAffaireHommes, habitatHommes], // MODIFIÉ
//           },
//           {
//             name: "Effectif féminin",
//             data: [agricoleFemmes, placeAffaireFemmes, habitatFemmes], // MODIFIÉ
//           },
//         ]
//       };
//     }
//   }

//   updateCompensationChart() {
//     if (this.agricoleStats && this.placeAffaireStats && this.habitatStats) {
//       const agricolePerte = this.agricoleStats.statsPertes?.totalPerte || 0;
//       const placeAffairePerte = this.placeAffaireStats.statsPertes?.totalPerte || 0;
//       const habitatPerte = this.habitatStats.statsPertes?.totalPerte || 0; // AJOUTÉ

//       this.compensationChart = {
//         ...this.compensationChart,
//         series: [
//           {
//             name: "Total des compensations",
//             data: [agricolePerte, placeAffairePerte, habitatPerte], // MODIFIÉ
//           },
//         ]
//       };
//     }
//   }

//   getEntente() {
//     return this.parentService
//       .listeByProject(
//         this.urlEntente,
//         this.pageSize,
//         this.offset,
//         this.currentProjectId
//       )
//       .subscribe(
//         (data: any) => {
//           console.log(data);
//           if (data["responseCode"] == 200) {
//             this.ententesCompensation = data["length"];
//             this._changeDetectorRef.markForCheck();
//           } else {
//             this.dataSource = new MatTableDataSource();
//           }
//         },
//         (err) => {
//           console.log(err);
//         }
//       );
//   }

//   ngOnDestroy() {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }
// }
import { Component, OnDestroy, OnInit, ChangeDetectorRef } from "@angular/core";
import { ServiceParent } from "src/app/core/services/serviceParent";
import { LocalService } from "src/app/core/services/local.service";
import { Subject, takeUntil } from "rxjs";
import { ProjectService } from "src/app/core/services/project.service";

interface CriterionStats {
  total: number;
  hommes: number;
  femmes: number;
  autre: number;
}

interface CategoryStats {
  total: number;
  hommes: number;
  femmes: number;
  autre: number;
  percentHommes: number;
  percentFemmes: number;
  totalVulnerables: number;
  vulnerablesHommes: number;
  vulnerablesFemmes: number;
  vulnerablesAutre: number;
  criteresVulnerabilite: { [key: string]: CriterionStats };
  totalPerte: number;
}

interface GlobalSummary {
  totalPersonnesAffectees: number;
  totalVulnerables: number;
  percentHommesGlobal: number;
  percentFemmesGlobal: number;
  totalCompensations: number;
}

interface CombinedStatsResponse {
  placeAffaireStats: CategoryStats;
  agricoleStats: CategoryStats;
  habitatStats: CategoryStats;
  totalStats: CategoryStats;
  summary: GlobalSummary;
}

@Component({
  selector: "app-mise-en-oeuvre",
  templateUrl: "./mise-en-oeuvre.component.html",
  styleUrl: "./mise-en-oeuvre.component.css",
})
export class MiseEnOeuvreComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();
  private readonly PAGE_SIZE = 10000000;

  loadData = true;
  currentProjectId: any;

  statsData: CombinedStatsResponse;
  ententesCompensation = 0;
  dossiersTransmis = 0;
  papPayees = 0;

  // ── Charts ──────────────────────────────────────────────
  pieChart = {
    series: [0, 0, 0],
    chart: { type: "pie", width: 380 },
    labels: ["PAP Agricoles", "PAP Places d'affaires", "PAP Habitat"],
    colors: ["#D45C00", "#0C8439", "#1E88E5"],
    legend: { position: "bottom" },
  };

  vulnerableChart = {
    series: [0, 0],
    chart: { type: "pie", width: 330 },
    labels: ["Vulnérables", "Non vulnérables"],
    colors: ["#0C8439", "#D45C00"],
    legend: { position: "bottom" },
  };

  barChart = {
    series: [
      { name: "Effectif masculin", data: [0, 0, 0] },
      { name: "Effectif féminin",  data: [0, 0, 0] },
    ],
    chart: { type: "bar", height: 320, stacked: true },
    xaxis: { categories: ["PAP Agricoles", "PAP Places d'affaires", "PAP Habitat"] },
    colors: ["#008FFB", "#FF4560"],
    legend: { position: "top" },
    plotOptions: { bar: { horizontal: false } },
  };

  compensationChart = {
    series: [{ name: "Total des compensations", data: [0, 0, 0] }],
    chart: { type: "bar", height: 320 },
    xaxis: { categories: ["PAP Agricoles", "PAP Places d'affaires", "PAP Habitat"] },
    colors: ["#0C8439"],
    dataLabels: {
      enabled: true,
      formatter: (val: number) => val.toLocaleString() + " CFA",
    },
  };

  constructor(
    private localService: LocalService,
    private parentService: ServiceParent,
    private projectService: ProjectService,
    private cdr: ChangeDetectorRef,
  ) {
    this.currentProjectId = this.localService.getData("ProjectId");
  }

  ngOnInit(): void {
    this.loadStats();
    this.loadEntentes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Data fetching ────────────────────────────────────────

  private loadStats(): void {
    this.projectService
      .getStatsCombineByProjectId(this.currentProjectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: CombinedStatsResponse) => {
          this.statsData = data;
          this.updateCharts(data);
          this.loadData = false;
        },
        error: (err) => {
          console.error('Erreur stats:', err);
          this.loadData = false;
        },
      });
  }

  private loadEntentes(): void {
    this.parentService
      .listeByProject("ententeSynchroniser", this.PAGE_SIZE, 0, this.currentProjectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          if (data.responseCode === 200) {
            this.ententesCompensation = data.length;
            this.cdr.markForCheck();
          }
        },
        error: (err) => console.error('Erreur ententes:', err),
      });
  }

  // ── Charts update ────────────────────────────────────────

  private updateCharts(data: CombinedStatsResponse): void {
    const { agricoleStats: ag, placeAffaireStats: pa, habitatStats: hab, totalStats: tot, summary } = data;

    // Pie — effectif par catégorie
    this.pieChart = {
      ...this.pieChart,
      series: [ag.total, pa.total, hab.total],
    };

    // Pie — vulnérables vs non vulnérables (données déjà calculées)
    this.vulnerableChart = {
      ...this.vulnerableChart,
      series: [summary.totalVulnerables, tot.total - summary.totalVulnerables],
    };

    // Bar — hommes / femmes par catégorie
    this.barChart = {
      ...this.barChart,
      series: [
        { name: "Effectif masculin", data: [ag.hommes, pa.hommes, hab.hommes] },
        { name: "Effectif féminin",  data: [ag.femmes, pa.femmes, hab.femmes] },
      ],
    };

    // Bar — compensations par catégorie
    this.compensationChart = {
      ...this.compensationChart,
      series: [{
        name: "Total des compensations",
        data: [ag.totalPerte, pa.totalPerte, hab.totalPerte],
      }],
    };
  }
}