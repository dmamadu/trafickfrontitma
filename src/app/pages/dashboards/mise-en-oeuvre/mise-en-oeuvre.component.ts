import { Component, OnInit, ViewChild } from "@angular/core";
import { PapService } from "../../pap/pap.service";
import { MatSort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import { Pap } from "../../pap/pap.model";
import { MatTableDataSource } from "@angular/material/table";
import { UntypedFormGroup } from "@angular/forms";
import { ServiceParent } from "src/app/core/services/serviceParent";
import { LocalService } from "src/app/core/services/local.service";
import { takeUntil } from "rxjs";

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
  selector: "app-mise-en-oeuvre",
  templateUrl: "./mise-en-oeuvre.component.html",
  styleUrl: "./mise-en-oeuvre.component.css",
})
export class MiseEnOeuvreComponent implements OnInit {
  [x: string]: any;

  listPap: Pap[];
  filterTable($event: any) {}
  breadCrumbItems: Array<{}>;
  isLoading: boolean = false;
  pageSizeOptions = [5, 10, 25, 100, 500, 1000];
  pageSize: number = 10000000;
  pageIndex: number = 0;
  userConnecter;
  offset: number = 0;


  currentProjectId: any;
  countByCategory = {};
  countByVulnerabilityStatus = {};
  countBySex = {};

  constructor(
    private localService: LocalService,
    private parentService: ServiceParent
  ) {
    this.currentProjectId = this.localService.getData("ProjectId");
  }

  ngOnInit(): void {
    this.loadAllCategories();
    this.getEntente();
    this.getStatCombine();
  }

  getPartiAffecte() {}

  papCategories: number = 100;
  papDeplacement: number = 50;
  papVulnerables: number = 20;

  dossiersIncomplets: number = 0;
  dossiersComplets: number = 0;
  ententesCompensation: number = 0;
  dossiersTransmis: number = 0;
  papPayees: number = 0;

  vulnerableChart = {
    series: [20, 40],
    chart: {
      type: "pie",
      width: 330,
    },
    labels: ["Vulnérables", "Non vulnérables"],
    colors: ["#0C8439", "#D45C00"],
    legend: {
      position: "bottom",
    },
  };

  categories = ["Agricoles", "Places affaires"];

  barChart = {
    series: [
      {
        name: "Effectif féminin",
        data: [],
      },
      {
        name: "Effectif masculin",
        data: [],
      },
    ],
    chart: {
      type: "bar",
      height: 320,
      stacked: true,
    },
    xaxis: {
      categories: ["Agricole", "Place d'affaire"],
    },
    colors: ["#0C8439", "#D45C00"],
    legend: {
      position: "top",
    },
    plotOptions: {
      bar: {
        horizontal: false,
      },
    },
  };

  compensationChart = {
    series: [
      {
        name: "Total des compensations",
        data: [100000, 60000],
      },
    ],
    chart: {
      type: "bar",
      height: 320,
    },
    xaxis: {
      categories: this.categories,
    },
    colors: ["#0C8439"],
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val + " CFA";
      },
    },
  };

  countElementsByCategory(): void {
    this.countByCategory = this.datas.reduce((acc, item) => {
      acc[item.categorie] = (acc[item.categorie] || 0) + 1;
      return acc;
    }, {});
  }

  countElementsByVulnerabilityStatus(): void {
    this.countByVulnerabilityStatus = this.datas.reduce((acc, item) => {
      acc[item.statutVulnerable] = (acc[item.statutVulnerable] || 0) + 1;
      return acc;
    }, {});
  }

  countElementsBySex(): void {
    this.countBySex = this.datas.reduce((acc, item) => {
      acc[item.sexe] = (acc[item.sexe] || 0) + 1;
      return acc;
    }, {});
  }

  papAgricoleCount: number = 0;
  databasePapPlaceAffaireCount: number = 0;
  papEconomiqueCount: number = 0;

  pieChart = {
    series: [0, 0],
    chart: {
      type: "pie",
      width: 330,
    },
    labels: ["Agricoles", "Places affaires"],
    colors: ["#D45C00", "#0C8439"],
    legend: {
      position: "bottom",
    },
  };

  getPapByCategory(category: string) {
    this.loadData = true;
    return this.parentService
      .list(category, this.pageSize, this.offset)
      .subscribe(
        (data: any) => {
          if (data["responseCode"] === 200) {
            const currentList = data.data;
            console.log(
              `Liste récupérée pour la catégorie ${category}:`,
              currentList
            );
            this.listPap = [...this.listPap, ...currentList];
            this.lengthPap += currentList.length;
            if (category === "papAgricole") {
              this.papAgricoleCount += currentList.length;
            } else if (category === "databasePapPlaceAffaire") {
              this.databasePapPlaceAffaireCount += currentList.length;
            } else if (category === "papEconomique") {
              this.papEconomiqueCount += currentList.length;
            }
            this.updateSexCounts(category, currentList);
            this.updateVulnerabilityCounts(currentList);
            this.updatePieChart();
            this.updateBarChart();
          } else {
            console.error(
              `Erreur lors de la récupération des PAP pour ${category}`
            );
          }
          this.loadData = false;
        },
        (err) => {
          console.error(`Erreur réseau pour la catégorie ${category}:`, err);
          this.loadData = false;
        }
      );
  }

  sexCounts = {
    papAgricole: { male: 0, female: 0 },
    databasePapPlaceAffaire: { male: 0, female: 0 },
    papEconomique: { male: 0, female: 0 },
  };

  // Votre fonction mise à jour
  updateSexCounts(category: string, list: any[]): void {
    const maleCount = list.filter(
      (pap) =>
        pap.sexe === "G" || pap.sexe === "Garcon" || pap.sexe === "Masculin"
    ).length;

    const femaleCount = list.filter(
      (pap) =>
        pap.sexe === "F" || pap.sexe === "Feminim" || pap.sexe === "Féminin"
    ).length;

    // Mise à jour des comptes
    this.sexCounts[category].male = maleCount;
    this.sexCounts[category].female = femaleCount;

    // Mise à jour du graphique
    this.updateBarChart();
  }

  // Fonction pour mettre à jour le graphique
  updateBarChart(): void {
    this.barChart = {
      series: [
        {
          name: "Masculin",
          data: [
            this.sexCounts.papAgricole.male,
            this.sexCounts.databasePapPlaceAffaire.male,
            this.sexCounts.papEconomique.male,
          ],
        },
        {
          name: "Féminin",
          data: [
            this.sexCounts.papAgricole.female,
            this.sexCounts.databasePapPlaceAffaire.female,
            this.sexCounts.papEconomique.female,
          ],
        },
      ],
      chart: {
        type: "bar",
        height: 350,
        stacked: true,
      },
      plotOptions: {
        bar: {
          horizontal: false,
        },
      },
      xaxis: {
        categories: ["PAP Agricole", "PAP Place Affaire"],
      },
      colors: ["#008FFB", "#FF4560"],
      legend: {
        position: "top",
      },
    };
  }

  updateVulnerabilityCounts(list: any[]): void {
    list.forEach((pap) => {
      if (pap.statutVulnerable === "Oui") {
        this.vulnerabilityCounts.vulnerable++;
      } else if (pap.statutVulnerable === "Non") {
        this.vulnerabilityCounts.nonVulnerable++;
      }
    });
  }

  updatePieChart() {
    this.pieChart.series = [
      this.papAgricoleCount,
      this.databasePapPlaceAffaireCount,
    ];
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





  loadAllCategories() {
    this.listPap = [];
    this.lengthPap = 0;
    this.vulnerabilityCounts = { vulnerable: 0, nonVulnerable: 0 };
    this.papAgricoleCount = 0;
    this.databasePapPlaceAffaireCount = 0;
    this.papEconomiqueCount = 0;
    this.sexCounts = {
      papAgricole: { male: 0, female: 0 },
      databasePapPlaceAffaire: { male: 0, female: 0 },
      papEconomique: { male: 0, female: 0 },
    };
    const categories = ["papAgricole", "databasePapPlaceAffaire"];
    categories.forEach((category) => {
      this.getPapByCategory(category);
    });
  }

  getEntente() {
    return this.parentService
      .listeByProject(
        this.urlEntente,
        this.pageSize,
        this.offset,
        this.currentProjectId
      )
      .subscribe(
        (data: any) => {
          console.log(data);

          this.loadData = false;
          if (data["responseCode"] == 200) {
            this.loadData = false;
            // this.dataSource = new MatTableDataSource(data["data"]);
            // this.dataSource.paginator = this.paginator;
            // this.dataSource.sort = this.sort;
            // this.datas = data["data"];
            this.ententesCompensation = data["length"];
            this._changeDetectorRef.markForCheck();
          } else {
            this.loadData = false;
            this.dataSource = new MatTableDataSource();
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }
}
