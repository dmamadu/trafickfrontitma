import { ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { UntypedFormGroup } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";
import { MatPaginator, MatPaginatorIntl } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { ServiceParent } from "src/app/core/services/serviceParent";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import {
  ButtonAction,
  TableauComponent,
} from "src/app/shared/tableau/tableau.component";
import { UIModule } from "src/app/shared/ui/ui.module";
import { PapService } from "../../pap/pap.service";
import { EntenteCompensationService } from "../entente.compensation.service";
import { LocalService } from "src/app/core/services/local.service";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { AddEntenteComponent } from "../add-entente/add-entente.component";
import { AjoutEntenteComponent } from "../ajout-entente/ajout-entente.component";
import { CoreService } from "src/app/shared/core/core.service";
import { CompensationDetailComponent } from "../compensation-detail/compensation-detail.component";

@Component({
  selector: "app-list-entente",
  standalone: true,
  providers: [
    {
      provide: MatDialogRef,
      useValue: [],
    },
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatPaginatorIntl },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: "outline" },
    },
  ],
  imports: [TableauComponent, UIModule, AngularMaterialModule],
  templateUrl: "./list-entente.component.html",
  styleUrl: "./list-entente.component.css",
})
export class ListEntenteComponent implements OnInit {
  addEntente() {
    this._router.navigate(["ententeCompensation/add"]);
  }
  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: "Entente" },
      { label: "Entente de compensatin", active: true },
    ];

    this.getEntente();
    this.headers = this.createHeader();
    this.btnActions = this.createActions();
  }
  breadCrumbItems: (
    | { label: string; active?: undefined }
    | { label: string; active: boolean }
  )[];
  //filterTable($event: any) {}

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  informations: any;
  displayedColumns: any;
  searchList: any;
  codeEnvoye: number;
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
  title: string = "Gestion des ententes";
  url: string = "ententes";
  panelOpenState = false;
  img;
  image;
  privilegeByRole: any; //liste des codes recu de l'api lors de la connexion
  privilegeForPage: number = 2520; //code privilege envoye pour afficher la page
  privilegePage;
  headers: any = [];
  btnActions: any = [];

  currentProjectId: any;

  constructor(
    private _router: Router,
    private _changeDetectorRef: ChangeDetectorRef,
    private parentService: ServiceParent,
    private localService: LocalService,
    private snackbar: SnackBarService,
    private coreService: CoreService
  ) {
    this.currentProjectId = this.localService.getData("ProjectId");
  }

  createHeader() {
    return [
      {
        th: "Code du Pap",
        td: "codePap",
      },
      {
        th: "Prénom",
        td: "prenom",
      },
      {
        th: "nom",
        td: "nom",
      },
    ];
  }

  createActions(): ButtonAction[] {
    return [
      {
        icon: "bxs-edit",
        couleur: "green",
        size: "icon-size-4",
        title: "Modifier",
        isDisabled: this.hasUpdate,
        action: (element?) => this.updateItems(element),
      },
      {
        icon: "bxs-trash-alt",
        couleur: "#D55E00",
        size: "icon-size-4",
        title: "Supprimer",
        isDisabled: this.hasDelete,
        action: (element?) => this.supprimerItems(element.id, element),
      },
      {
        icon: "bxs-info-circle",
        couleur: "black",
        size: "icon-size-4",
        title: "détail",
        isDisabled: this.hasDelete,
        action: (element?) => this.detailItems(element),
      },
    ];
  }

  addItems(): void {
    this.snackbar.openModal(
      AjoutEntenteComponent,
      "73rem",
      "new",
      "",
      this.datas,
      "",
      () => {
        this.getEntente();
      }
    );
  }

  updateItems(element: any) {
    console.log(element);

    this.snackbar.openModal(
      AjoutEntenteComponent,
      "73rem",
      "edit",
      "",
      element,
      "",
      () => {
        this.getEntente();
      }
    );
  }
  supprimerItems(id, information) {
    this.snackbar
      .showConfirmation("Voulez-vous vraiment supprimer cette entente?")
      .then((result) => {
        if (result["value"] == true) {
          this.currentIndex = information;
          this.showLoader = "isShow";
          this.coreService.deleteItem(id, "ententes").subscribe(
            (resp: any) => {
              if (resp && resp["responseCode"] == "200") {
                this.getEntente();
                this.snackbar.openSnackBar(
                  "Entente supprimée avec succès",
                  "OK",
                  ["mycssSnackbarGreen"]
                );
              } else {
                console.error("Unexpected response structure", resp);
                this.snackbar.openSnackBar(
                  "Une erreur s'est produite lors de la suppression de l'entente.",
                  "OK",
                  ["mycssSnackbarRed"]
                );
              }
            },
            (error) => {
              this.snackbar.showErrors(error);
            }
          );
        }
      });
  }

  // detailItems(id: any, element: any) {
  //   console.log(element);
  //   this.localService.saveDataJson("entente", element);

  //   this._router.navigate(["ententeCompensation/detail"]);
  // }

  detailItems(element: any) {
    console.log(element);
    this.snackbar.openModal(
      CompensationDetailComponent,
      "51rem",
      "edit",
      "",
      element,
      "",
      () => {
        this.getEntente();
      }
    );
  }

  getEntente() {
    return this.parentService
      .listeByProject(
        this.url,
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
            this.dataSource = new MatTableDataSource(data["data"]);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            this.datas = data["data"];
            this.length = data["length"];
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



  filterTable(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value.trim();
    this.loadData = true;
    this.parentService
      .searchGlobal(this.url, searchTerm, this.currentProjectId,this.pageSize, this.offset)
      .subscribe(
        (data: any) => {
          this.loadData = false;
          console.log('====================================');
          console.log(data);
          console.log('====================================');
          if (data["responseCode"] == 200) {
            this.dataSource = new MatTableDataSource(data["data"]);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            this.datas = data["data"];
            this.length = data["length"];
            this._changeDetectorRef.markForCheck();
          } else {
            this.dataSource = new MatTableDataSource();
          }
        },
        (err) => {
          this.loadData = false;
          console.log(err);
        }
      );
  }

  pageChanged(event) {
    console.log(event);
    this.datas = [];
    this._changeDetectorRef.markForCheck();
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.offset = this.pageIndex;
    this.getEntente();
  }
}
