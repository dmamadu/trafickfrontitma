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
  pageSize: number = 10;
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

  // Propriétés pour stocker les résultats du comptage
  countByCategory = {};
  countByVulnerabilityStatus = {};
  countBySex = {};

  constructor(private papService: PapService,
    private parentService: ServiceParent,
  ) {}

  ngOnInit(): void {
    this.getPap();
  }

  getPartiAffecte() {}

  papCategories: number = 100;
  papDeplacement: number = 50;
  papVulnerables: number = 20;

  // Statut des dossiers individuel
  dossiersIncomplets: number = 10;
  dossiersComplets: number = 90;
  ententesCompensation: number = 70;
  dossiersTransmis: number = 80;
  papPayees: number = 65;

  // Données des catégories PAP
  pieChart = {
    series: [40, 30, 20, 10],
    chart: {
      type: "pie",
      width: 380,
    },
    labels: ["Opérateurs économiques", "Agricoles", "Transports", "Autres"],
    colors: ["#FF5733", "#33FF57", "#3357FF", "#FF33A1"],
    legend: {
      position: "bottom",
    },
  };

  // Données des PAP vulnérables et non vulnérables
  vulnerableChart = {
    series: [60, 40],
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

  categories = ["Opérateurs économiques", "Agricoles", "Transports", "Autres"];

  // Graphique en barres empilées (effectif féminin et masculin)
  barChart = {
    series: [
      {
        name: "Effectif féminin",
        data: [20, 15, 10, 25],
      },
      {
        name: "Effectif masculin",
        data: [30, 35, 40, 25],
      },
    ],
    chart: {
      type: "bar",
      height: 350,
      stacked: true,
    },
    xaxis: {
      categories: this.categories,
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

  // Graphique en colonnes (compensations totales)
  compensationChart = {
    series: [
      {
        name: "Total des compensations",
        data: [100000, 80000, 60000, 90000],
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

  getPap(): void {
    this.parentService
      .list("personneAffectes", this.pageSize, this.offset)
      .subscribe(
        (data: any) => {
          this.loadData = false;
          if (data["responseCode"] == 200) {
            this.datas = data["data"];
            // Après avoir récupéré les données, lancez les comptages
            this.countElementsByCategory();
            this.countElementsByVulnerabilityStatus();
            this.countElementsBySex();
          } else {
            this.dataSource = new MatTableDataSource();
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }

  // Comptage des éléments par catégorie
  countElementsByCategory(): void {
    this.countByCategory = this.datas.reduce((acc, item) => {
      acc[item.categorie] = (acc[item.categorie] || 0) + 1;
      return acc;
    }, {});
    console.log("Count by category:", this.countByCategory);
  }

  // Comptage des éléments par statut de vulnérabilité
  countElementsByVulnerabilityStatus(): void {
    this.countByVulnerabilityStatus = this.datas.reduce((acc, item) => {
      acc[item.statutVulnerable] = (acc[item.statutVulnerable] || 0) + 1;
      return acc;
    }, {});
    console.log(
      "Count by vulnerability status:",
      this.countByVulnerabilityStatus
    );
  }

  // Comptage des éléments par sexe
  countElementsBySex(): void {
    this.countBySex = this.datas.reduce((acc, item) => {
      acc[item.sexe] = (acc[item.sexe] || 0) + 1;
      return acc;
    }, {});
    console.log("Count by sex:", this.countBySex);
  }
}
