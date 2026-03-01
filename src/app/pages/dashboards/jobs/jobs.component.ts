// import { Component, OnDestroy, OnInit } from "@angular/core";
// import { LocalService } from "src/app/core/services/local.service";
// import { User } from "src/app/store/Authentication/auth.models";
// import { ServiceParent } from "src/app/core/services/serviceParent";
// import { SnackBarService } from "src/app/shared/core/snackBar.service";
// import { ProjectService } from "src/app/core/services/project.service";
// import { MatDialog } from "@angular/material/dialog";
// import { MatIconModule } from "@angular/material/icon";
// import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
// import { GoogleMapsModule } from "@angular/google-maps";
// import { PapGoogleMapsComponent } from "../pap-google-maps/pap-google-maps.component";
// import { PapMultiPolygonMapsComponent } from "../pap-multi-polygon-maps/pap-multi-polygon-maps.component";
// import { TaskCalendarComponent } from "../../tasks/task-calendar/task-calendar.component";
// import { Subject, takeUntil } from "rxjs";
// import { Pap } from "../../pap/pap.model";

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
//   statsPertes?: { totalPerte: number };
// }

// interface CombinedStats {
//   placeAffaireStats: StatsCategory;
//   agricoleStats: StatsCategory;
//   habitatStats: StatsCategory;
//   totalStats: StatsCategory;
// }

// @Component({
//   selector: "app-jobs",
//   standalone: true,
//   imports: [
//     MatIconModule,
//     AngularMaterialModule,
//     GoogleMapsModule,
//     PapGoogleMapsComponent,
//     PapMultiPolygonMapsComponent,
//     TaskCalendarComponent,
//   ],
//   templateUrl: "./jobs.component.html",
//   styleUrls: ["./jobs.component.scss"],
// })
// export class JobsComponent implements OnInit, OnDestroy {

//   private destroy$ = new Subject<void>();
//   private readonly PAGE_SIZE = 10000;

//   loadStats = true;
//   userConnected: User;
//   currentProjectId: any;
//   lengthRencontre = 0;

//   placeAffaireStats: StatsCategory;
//   agricoleStats: StatsCategory;
//   habitatStats: StatsCategory;
//   totalStats: StatsCategory;

//   paps: Pap[] = [];
//   papsAgricole: any[] = [];
//   papsHabitat: any[] = [];
//   isLoadingPap = false;

//   tasksData: any[] = [];

//   readonly VULNERABILITY_CRITERIA = [
//     { key: 'Situation matrimoniale précaire',  label: 'Situation matrimoniale' },
//     { key: 'Ménage avec personne handicapée',  label: 'Personne handicapée'   },
//     { key: 'Mineur chef de ménage',            label: 'Mineur(e) en charge'   },
//     { key: 'Analphabétisme',                   label: 'Éducation'             },
//     { key: 'Ménage nombreux',                  label: 'Personne en charge'    },
//     { key: 'Personne âgée sans soutien',       label: 'Personne âgée'         },
//   ];

//   constructor(
//     private localService: LocalService,
//     private parentService: ServiceParent,
//     private projectService: ProjectService,
//   ) {
//     this.currentProjectId = this.localService.getData("ProjectId");
//   }

//   ngOnInit(): void {
//     this.userConnected = this.localService.getDataJson("user");
//     this.getStatCombine();
//     this.getTaches();
//     this.loadPaps();
//     this.loadPapsAgricole();
//     this.loadPapsHabitat();
//     this.getRencontres();
//   }

//   ngOnDestroy(): void {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }

//   // ── Data fetching ──────────────────────────────────────────

//   private getStatCombine(): void {
//     this.projectService
//       .getStatsCombineByProjectId(this.currentProjectId)
//       .pipe(takeUntil(this.destroy$))
//       .subscribe({
//         next: (data: CombinedStats) => {
//           this.placeAffaireStats = data.placeAffaireStats;
//           this.agricoleStats     = data.agricoleStats;
//           this.habitatStats      = data.habitatStats;
//           this.totalStats        = data.totalStats;
//           this.loadStats         = false;
//         },
//         error: (err) => {
//           console.error('Erreur stats combinées:', err);
//           this.loadStats = false;
//         },
//       });
//   }

//   private getTaches(): void {
//     this.parentService
//       .list("taches", this.PAGE_SIZE, 0, this.currentProjectId)
//       .pipe(takeUntil(this.destroy$))
//       .subscribe({
//         next: (data: any) => {
//           if (data.responseCode === 200) this.tasksData = data.data;
//         },
//         error: (err) => console.error('Erreur tâches:', err),
//       });
//   }

//   private getRencontres(): void {
//     this.projectService
//       .getRencontreByProjectId(this.currentProjectId)
//       .pipe(takeUntil(this.destroy$))
//       .subscribe({
//         next: (data: any) => {
//           if (data.responseCode === 200) this.lengthRencontre = data.data.length;
//         },
//         error: (err) => console.error('Erreur rencontres:', err),
//       });
//   }

//   loadPaps(): void {
//     this.isLoadingPap = true;
//     this.parentService
//       .list("databasePapPlaceAffaire", 1000, 0, this.currentProjectId)
//       .pipe(takeUntil(this.destroy$))
//       .subscribe({
//         next: (data: any) => {
//           if (data.responseCode === 200) this.paps = data.data;
//           this.isLoadingPap = false;
//         },
//         error: (err) => {
//           console.error(err);
//           this.isLoadingPap = false;
//         },
//       });
//   }

//   loadPapsAgricole(): void {
//     this.isLoadingPap = true;
//     this.parentService
//       .list("papAgricole", 1000, 0, this.currentProjectId)
//       .pipe(takeUntil(this.destroy$))
//       .subscribe({
//         next: (data: any) => {
//           if (data.responseCode === 200) {
//             this.papsAgricole = data.data.map((pap: any) => ({
//               ...pap,
//               multiPolygonGeometrique: pap.pointGeometriques,
//             }));
//           }
//           this.isLoadingPap = false;
//         },
//         error: (err) => {
//           console.error(err);
//           this.isLoadingPap = false;
//         },
//       });
//   }

//   loadPapsHabitat(): void {
//     this.isLoadingPap = true;
//     this.parentService
//       .list("papHabitat", 1000, 0, this.currentProjectId)
//       .pipe(takeUntil(this.destroy$))
//       .subscribe({
//         next: (data: any) => {
//           if (data.responseCode === 200) this.papsHabitat = data.data;
//           this.isLoadingPap = false;
//         },
//         error: (err) => {
//           console.error(err);
//           this.isLoadingPap = false;
//         },
//       });
//   }

//   // ── Computed stats ─────────────────────────────────────────

//   getVulnerablePeopleCount(): number {
//     if (!this.totalStats) return 0;
//     const nonVulnerable = this.totalStats.Vulnerabilites_globales['Non vulnérable'] || 0;
//     return this.totalStats.Sexes_globaux.Total - nonVulnerable;
//   }

//   getVulnerableBySex(stats: StatsCategory): { hommes: number; femmes: number; autre: number } {
//     if (!stats) return { hommes: 0, femmes: 0, autre: 0 };
//     const nv = stats.Vulnerabilites_par_sexe['Non vulnérable'] ?? {};
//     return {
//       hommes: stats.Sexes_globaux.Hommes - (nv['Hommes'] || 0),
//       femmes: stats.Sexes_globaux.Femmes - (nv['Femmes'] || 0),
//       autre:  stats.Sexes_globaux.Autre  - (nv['Autre']  || 0),
//     };
//   }

//   getVulnerablePlaceAffaireBySex() { return this.getVulnerableBySex(this.placeAffaireStats); }
//   getVulnerableAgricoleBySex()     { return this.getVulnerableBySex(this.agricoleStats);     }
//   getVulnerableHabitatBySex()      { return this.getVulnerableBySex(this.habitatStats);      }

//   getCriterionCount(category: keyof JobsComponent, criterionKey: string): number {
//     const stats = this[category] as StatsCategory;
//     return stats?.Vulnerabilites_globales?.[criterionKey] || 0;
//   }

//   getPercentage(value: number, total: number): number {
//     return total > 0 ? (value / total) * 100 : 0;
//   }

//   getGlobalPercentage(
//     value1: number, total1: number,
//     value2: number, total2: number,
//     value3 = 0,    total3 = 0,
//   ): number {
//     const total = (total1 || 0) + (total2 || 0) + (total3 || 0);
//     const value = (value1 || 0) + (value2 || 0) + (value3 || 0);
//     return total > 0 ? (value / total) * 100 : 0;
//   }
// }
import { Component, OnDestroy, OnInit } from "@angular/core";
import { LocalService } from "src/app/core/services/local.service";
import { ServiceParent } from "src/app/core/services/serviceParent";
import { ProjectService } from "src/app/core/services/project.service";
import { MatIconModule } from "@angular/material/icon";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { GoogleMapsModule } from "@angular/google-maps";
import { PapGoogleMapsComponent } from "../pap-google-maps/pap-google-maps.component";
import { PapMultiPolygonMapsComponent } from "../pap-multi-polygon-maps/pap-multi-polygon-maps.component";
import { TaskCalendarComponent } from "../../tasks/task-calendar/task-calendar.component";
import { Subject, takeUntil } from "rxjs";
import { Pap } from "../../pap/pap.model";

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
  selector: "app-jobs",
  standalone: true,
  imports: [
    MatIconModule,
    AngularMaterialModule,
    GoogleMapsModule,
    PapGoogleMapsComponent,
    PapMultiPolygonMapsComponent,
    TaskCalendarComponent,
  ],
  templateUrl: "./jobs.component.html",
  styleUrls: ["./jobs.component.scss"],
})
export class JobsComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();
  private readonly PAGE_SIZE = 10000;

  loadStats = true;
  currentProjectId: any;

  statsData: CombinedStatsResponse;

  paps: Pap[] = [];
  papsAgricole: any[] = [];
  papsHabitat: any[] = [];
  isLoadingPap = false;
  lengthRencontre = 0;
  tasksData: any[] = [];

  readonly CRITERES = [
    { key: 'Situation matrimoniale précaire', label: 'Situation matrimoniale' },
    { key: 'Ménage avec personne handicapée', label: 'Personne handicapée'   },
    { key: 'Mineur chef de ménage',           label: 'Mineur(e) en charge'   },
    { key: 'Analphabétisme',                  label: 'Éducation'             },
    { key: 'Ménage nombreux',                 label: 'Personne en charge'    },
    { key: 'Personne âgée sans soutien',      label: 'Personne âgée'         },
  ];

  constructor(
    private localService: LocalService,
    private parentService: ServiceParent,
    private projectService: ProjectService,
  ) {
    this.currentProjectId = this.localService.getData("ProjectId");
  }

  ngOnInit(): void {
    this.loadStats_();
    this.loadPaps();
    this.loadPapsAgricole();
    this.loadPapsHabitat();
    this.loadRencontres();
    this.loadTaches();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadStats_(): void {
    this.projectService
      .getStatsCombineByProjectId(this.currentProjectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: CombinedStatsResponse) => {
          this.statsData = data;
          this.loadStats = false;
        },
        error: (err) => {
          console.error('Erreur stats:', err);
          this.loadStats = false;
        },
      });
  }

  private loadTaches(): void {
    this.parentService
      .list("taches", this.PAGE_SIZE, 0, this.currentProjectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          if (data.responseCode === 200) this.tasksData = data.data;
        },
        error: (err) => console.error('Erreur tâches:', err),
      });
  }

  private loadRencontres(): void {
    this.projectService
      .getRencontreByProjectId(this.currentProjectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          if (data.responseCode === 200) this.lengthRencontre = data.data.length;
        },
        error: (err) => console.error('Erreur rencontres:', err),
      });
  }

  loadPaps(): void {
    this.isLoadingPap = true;
    this.parentService
      .list("databasePapPlaceAffaire", 1000, 0, this.currentProjectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          if (data.responseCode === 200) this.paps = data.data;
          this.isLoadingPap = false;
        },
        error: (err) => { console.error(err); this.isLoadingPap = false; },
      });
  }

  loadPapsAgricole(): void {
    this.isLoadingPap = true;
    this.parentService
      .list("papAgricole", 1000, 0, this.currentProjectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          if (data.responseCode === 200) {
            this.papsAgricole = data.data.map((pap: any) => ({
              ...pap,
              multiPolygonGeometrique: pap.pointGeometriques,
            }));
          }
          this.isLoadingPap = false;
        },
        error: (err) => { console.error(err); this.isLoadingPap = false; },
      });
  }

  loadPapsHabitat(): void {
    this.isLoadingPap = true;
    this.parentService
      .list("papHabitat", 1000, 0, this.currentProjectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          if (data.responseCode === 200) this.papsHabitat = data.data;
          this.isLoadingPap = false;
        },
        error: (err) => { console.error(err); this.isLoadingPap = false; },
      });
  }
}