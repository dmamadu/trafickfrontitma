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
    { key: 'Personne âgée sans soutien',      label: 'Personne âgée'         },
    { key: 'Ménage nombreux',                 label: 'Ménage nombreux'       },
    { key: 'Analphabétisme',                  label: 'Analphabétisme'        },
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
      .list("databasePapHabitat", 1000, 0, this.currentProjectId)
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
