import { Component, OnInit, ViewChild } from "@angular/core";
import { PapService } from "../../pap/pap.service";
import { MatSort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import { Pap } from "../../pap/pap.model";
import { MatTableDataSource } from "@angular/material/table";
import { UntypedFormGroup } from "@angular/forms";
import { ServiceParent } from "src/app/core/services/serviceParent";

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

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  informations: any;
  displayedColumns: any;
  searchList: any;
  codeEnvoye: number; //code envoye par notre menu
  hasList: boolean;
  hasAdd: boolean;
  hasUpdate: boolean;
  hasDelete: boolean;
  hasDetail: boolean;
  length = 100;
  searchForm: UntypedFormGroup;
  dialogRef: any;
  dataSource: MatTableDataSource<any>;
  datas = [];
  lengthPap: number;
  deleteUser: boolean = false;
  currentIndex;
  loadData: boolean = false;
  exporter: boolean = false;
  isCollapsed: boolean = false;
  isSearch2: boolean = false;
  isSearch: boolean = false;
  rechercher = "";
  showLoader = "isNotShow";
  message = "";
  config: any;
  isLoading: boolean = false;
  pageSizeOptions = [5, 10, 25, 100, 500, 1000];
  pageSize: number = 10000000;
  pageIndex: number = 0;
  userConnecter;
  offset: number = 0;
  title: string = "Gestion des partis affectés";
  url: string = "personneAffectes";
  panelOpenState = false;
  img;

  image;
  privilegeByRole: any;
  privilegeForPage: number = 2520;
  privilegePage;
  headers: any = [];
  btnActions: any = [];
  currentUser: any;

  countByCategory = {};
  countByVulnerabilityStatus = {};
  countBySex = {};

  constructor(
    private papService: PapService,
    private parentService: ServiceParent
  ) {}

  ngOnInit(): void {
    this.loadAllCategories();
  }

  getPartiAffecte() {}

  papCategories: number = 100;
  papDeplacement: number = 50;
  papVulnerables: number = 20;

  dossiersIncomplets: number = 10;
  dossiersComplets: number = 90;
  ententesCompensation: number = 70;
  dossiersTransmis: number = 80;
  papPayees: number = 65;

  vulnerableChart = {
    series: [20, 40],
    chart: {
      type: "pie",
      width: 380,
    },
    labels: ["Vulnérables", "Non vulnérables"],
    colors: ["#FF5733", "#33FF57"],
    legend: {
      position: "bottom",
    },
  };

  categories = ["Opérateurs économiques", "Agricoles", "Places affaires"];

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
      height: 350,
      stacked: true,
    },
    xaxis: {
      categories: ["Agricole", "Place d'affaire", "Économique"],
    },
    colors: ["#FF5733", "#33FF57"],
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
        data: [100000, 80000, 60000],
      },
    ],
    chart: {
      type: "bar",
      height: 350,
    },
    xaxis: {
      categories: this.categories,
    },
    colors: ["#008FFB"],
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val + " €";
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
    series: [0, 0, 0],
    chart: {
      type: "pie",
      width: 380,
    },
    labels: ["Opérateurs économiques", "Agricoles", "Places affaires"],
    colors: ["#FF5733", "#33FF57", "#3357FF"],
    legend: {
      position: "bottom",
    },
  };

  getPapByCategory(category: string) {
    return this.parentService
      .list(category, this.pageSize, this.offset)
      .subscribe(
        (data: any) => {
          this.loadData = false;
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
        },
        (err) => {
          console.error(`Erreur réseau pour la catégorie ${category}:`, err);
        }
      );
  }

  updateSexCounts(category: string, list: any[]): void {
    const maleCount = list.filter((pap) => pap.sexe === "Masculin").length;
    const femaleCount = list.filter((pap) => (pap.sexe === "Féminin" || "Feminim")).length;

    if (!this.sexCounts) {
      this.sexCounts = {
        papAgricole: { male: 0, female: 0 },
        databasePapPlaceAffaire: { male: 0, female: 0 },
        papEconomique: { male: 0, female: 0 },
      };
    }

    this.sexCounts[category].male += maleCount;
    this.sexCounts[category].female += femaleCount;
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
      this.papEconomiqueCount,
      this.papAgricoleCount,
      this.databasePapPlaceAffaireCount,
    ];
  }

  updateBarChart() {
    this.barChart.series = [
      {
        name: "Effectif féminin",
        data: [
          this.sexCounts.papAgricole.female,
          this.sexCounts.databasePapPlaceAffaire.female,
          this.sexCounts.papEconomique.female,
        ],
      },
      {
        name: "Effectif masculin",
        data: [
          this.sexCounts.papAgricole.male,
          this.sexCounts.databasePapPlaceAffaire.male,
          this.sexCounts.papEconomique.male,
        ],
      },
    ];
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
    const categories = [
      "papAgricole",
      "databasePapPlaceAffaire",
      "papEconomique",
    ];
    categories.forEach((category) => {
      this.getPapByCategory(category);
    });
  }
}
