import { Component, OnDestroy, OnInit } from "@angular/core";
import { LocalService } from "src/app/core/services/local.service";
import { Subject, forkJoin, takeUntil } from "rxjs";
import { ProjectService } from "src/app/core/services/project.service";

interface DossiersStats {
  ententesSignees: number;
  dossiersTransmis: number;
  papPayees: number;
}

interface GlobalSummary {
  totalPersonnesAffectees: number;
  totalVulnerables: number;
  percentHommesGlobal: number;
  percentFemmesGlobal: number;
  totalCompensations: number;
}

interface CombinedStatsResponse {
  summary: GlobalSummary;
  dossiersStats: DossiersStats;
}

interface AvancementStats {
  brouillon: number;
  synchronisee: number;
  finalisee: number;
  compensationAEtablir: number;
  papAInformer: number;
  accordAObtenir: number;
  paiementAEffectuer: number;
  formationADonner: number;
  suiviAEffectuer: number;
  processusTermine: number;
}

@Component({
  selector: "app-mise-en-oeuvre",
  templateUrl: "./mise-en-oeuvre.component.html",
  styleUrl: "./mise-en-oeuvre.component.css",
})
export class MiseEnOeuvreComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  loadData = true;
  currentProjectId: any;
  statsData: CombinedStatsResponse;

  processusChart = {
    series: [{ name: "Ententes", data: [0, 0, 0, 0, 0, 0, 0] }],
    chart: { type: "bar", height: 360 },
    xaxis: {
      categories: [
        "Compensation à établir",
        "PAP à informer",
        "Accord à obtenir",
        "Paiement à effectuer",
        "Formation à donner",
        "Suivi à effectuer",
        "Processus terminé",
      ],
    },
    colors: ["#1E88E5"],
    dataLabels: { enabled: true },
    plotOptions: { bar: { horizontal: false, borderRadius: 4 } },
  };

  statutChart = {
    series: [0, 0, 0],
    chart: { type: "pie", width: 380 },
    labels: ["Brouillon", "Synchronisée", "Finalisée"],
    colors: ["#FF9800", "#1E88E5", "#4CAF50"],
    legend: { position: "bottom" },
  };

  constructor(
    private localService: LocalService,
    private projectService: ProjectService,
  ) {
    this.currentProjectId = this.localService.getData("ProjectId");
  }

  ngOnInit(): void {
    this.loadAll();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAll(): void {
    forkJoin({
      combined: this.projectService.getStatsCombineByProjectId(this.currentProjectId),
      avancement: this.projectService.getAvancementByProjectId(this.currentProjectId),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ combined, avancement }: { combined: CombinedStatsResponse; avancement: AvancementStats }) => {
          this.statsData = combined;
          this.updateCharts(avancement);
          this.loadData = false;
        },
        error: (err) => {
          console.error("Erreur chargement MEO:", err);
          this.loadData = false;
        },
      });
  }

  private updateCharts(av: AvancementStats): void {
    this.processusChart = {
      ...this.processusChart,
      series: [{
        name: "Ententes",
        data: [
          av.compensationAEtablir,
          av.papAInformer,
          av.accordAObtenir,
          av.paiementAEffectuer,
          av.formationADonner,
          av.suiviAEffectuer,
          av.processusTermine,
        ],
      }],
    };
    this.statutChart = {
      ...this.statutChart,
      series: [av.brouillon, av.synchronisee, av.finalisee],
    };
  }
}
