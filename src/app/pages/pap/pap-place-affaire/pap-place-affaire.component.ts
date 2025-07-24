import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  ViewChild,
} from "@angular/core";
import {
  ButtonAction,
  TableauComponent,
} from "src/app/shared/tableau/tableau.component";
import { UIModule } from "../../../shared/ui/ui.module";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator, MatPaginatorIntl } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { FormsModule, UntypedFormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { DatePipe } from "@angular/common";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { TesterComponent } from "../../tester/tester.component";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";
import * as XLSX from "xlsx";
import { Pap, ResponsePap } from "../pap.model";
import { PapService } from "../pap.service";
import { ServiceParent } from "src/app/core/services/serviceParent";
import { DatatableComponent } from "src/app/shared/datatable/datatable.component";
import { ToastrService } from "ngx-toastr";
import { SharedService } from "../../projects/shared.service";
import { LocalService } from "src/app/core/services/local.service";
import { CoreService } from "src/app/shared/core/core.service";
import * as moment from "moment";
import autoTable from "jspdf-autotable";
import jsPDF from "jspdf";
import { logoItma } from "src/app/shared/logoItma";
import { ExportService } from "src/app/shared/core/export.service";
import { RechercheService } from "src/app/core/services/recherche.service";
import { JuristAppComponent } from "../../jurist-app/jurist-app.component";
import { BatimentComponent } from "../batiment/batiment.component";
import { PapAgricoleComponent } from "../pap-agricole/pap-agricole.component";
import { AddPapPlaceAffaireComponent } from "./add-pap-place-affaire/add-pap-place-affaire.component";
import { LoaderComponent } from "../../../shared/loader/loader.component";

@Component({
  selector: "app-pap-place-affaire",
  standalone: true,
  templateUrl: "./pap-place-affaire.component.html",
  styleUrl: "./pap-place-affaire.component.css",
  providers: [
    DatePipe,
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
    ExportService,
  ],
  imports: [
    TableauComponent,
    UIModule,
    AngularMaterialModule,
    DatatableComponent,
    FormsModule,
    LoaderComponent,
  ],
})
export class PapPlaceAffaireComponent {
  [x: string]: any;

  listPap: Pap[];
  // filterTable($event: any) {}
  breadCrumbItems: Array<{}>;

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
  //constantes = CONSTANTES;
  userConnecter;
  offset: number = 0;
  title: string = "Gestion des partis affectés";
  url: string = "databasePapPlaceAffaire";
  panelOpenState = false;
  img;
  image;
  privilegeByRole: any;
  privilegeForPage: number = 2520;
  privilegePage;
  headers: any = [];
  btnActions: any = [];
  currentProjectId: any;

  constructor(
    private changeDetectorRefs: ChangeDetectorRef,
    private _router: Router,
    private datePipe: DatePipe,
    private snackbar: SnackBarService,
    private papService: PapService,
    private parentService: ServiceParent,
    public matDialogRef: MatDialogRef<PapAgricoleComponent>,
    private _changeDetectorRef: ChangeDetectorRef,
    public toastr: ToastrService,
    private sharedService: SharedService,
    private localService: LocalService,
    private coreService: CoreService,
  ) {
    this.currentProjectId = this.localService.getData("ProjectId");
    this.informations = {
      exportFile: ["excel", "pdf"],
      titleFile: "liste des pap",
      code: "01410",
      tabHead: ["Prénom", "Nom", "Nationalité"],
      tabFileHead: [
        "Id",
        "Code Pap",
        "Nom",
        "Prénom",
        "Code Place Affaire",
        "Commune",
        "Département",
        "Nombre Place Affaire",
        "Surnom",
        "Sexe",
        "Photo Pap",
        "Photo Place Affaire",
        "Point Géométriques",
        "Nationalité",
        "Ethnie",
        "Langue Parlée",
        "Situation Matrimoniale",
        "Niveau Étude",
        "Religion",
        "Activité Principale",
        "Membre Foyer",
        "Membre Foyer Handicapé",
        "Project Id",
        "Type",
      ],
      searchFields: [],
      tabBody: ["prenom", "nom", "nationalite"],
      tabFileBody: [
        "id",
        "codePap",
        "nom",
        "prenom",
        "codePlaceAffaire",
        "commune",
        "departement",
        "nombrePlaceAffaire",
        "surnom",
        "sexe",
        "photoPap",
        "photoPlaceAffaire",
        "pointGeometriques",
        "nationalite",
        "ethnie",
        "langueParlee",
        "situationMatrimoniale",
        "niveauEtude",
        "religion",
        "activitePrincipale",
        "membreFoyer",
        "membreFoyerHandicape",
        "projectId",
        "type",
      ],
      action: [
        { name: "modifier", icon: "edit", color: "primary" },
        {
          name: "supprimer",
          icon: "delete",
          color: "red",
        },
        { name: "detail", icon: "detail", color: "red" },
      ],
    };
    //
    this.displayedColumns = this.informations.tabBody;
  }

  selectedOption: string = "";
  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: "Pap" },
      { label: "Pap List", active: true },
    ];
    this.getPapPlaceAffaire();
    this.headers = this.createHeader();
    this.btnActions = this.createActions();
  }

  createHeader() {
    return [
      {
        th: "CODE PAP",
        td: "codePap",
      },
      {
        th: "CODE Place Affaire",
        td: "codePlaceAffaire",
      },
      {
        th: "PRENOM",
        td: "prenom",
      },
      {
        th: "NOM",
        td: "nom",
      },
      {
        th: "NUMERO TELEPHONE",
        td: "numeroTelephone",
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
        couleur: "black	",
        size: "icon-size-4",
        title: "détail",
        isDisabled: this.hasDelete,
        action: (element?) => this.detailItems(element.id, element),
      },
    ];
  }

  getPapPlaceAffaire() {
    this.loadData = true;
    return this.parentService
      .list(this.url, this.pageSize, this.offset, this.currentProjectId)
      .subscribe(
        (data: any) => {
          this.loadData = false;
          if (data["responseCode"] == 200) {
            this.loadData = false;
            console.log(data);
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
    this.getPapPlaceAffaire();
  }

  updateItems(information): void {
    console.log(information);
    this.snackbar.openModal(
      AddPapPlaceAffaireComponent,
      "60rem",
      "edit",
      "",
      information,
      "",
      () => {
        this.getPapPlaceAffaire();
      }
    );
  }

  //cette fonction permet de supprimer
  supprimerItems(id, information) {
    this.snackbar
      .showConfirmation("Voulez-vous vraiment supprimer ce parti affecté ?")
      .then((result) => {
        if (result["value"] == true) {
          this.deleteUser = true;
          this.currentIndex = information;
          this.showLoader = "isShow";
          const message = "Parti affecté supprimé";
          this.coreService.deleteItem(id, this.url).subscribe(
            (resp) => {
              this.showLoader = "isNotShow";
              this.coreService
                .list(this.url, this.offset, this.pageSize)
                .subscribe((resp: any) => {
                  const data = resp["data"] || resp;
                  this.dataSource = new MatTableDataSource(data);
                  this.dataSource.paginator = this.paginator;
                  this.dataSource.sort = this.sort;
                  this.deleteUser = false;
                  this.datas = resp["data"] || data;
                  this.length = resp["total"] || data.length;
                  this.changeDetectorRefs.markForCheck();
                  this.changeDetectorRefs.detectChanges();
                  this.snackbar.openSnackBar(message + " avec succès", "OK", [
                    "mycssSnackbarGreen",
                  ]);
                });
            },
            (error) => {
              this.showLoader = "isNotShow";
              this.deleteUser = false;
              this.snackbar.showErrors(error);
            }
          );
        }
      });
  }

  filterList() {
    this.isCollapsed = !this.isCollapsed;
  }

  filterTable(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value.trim();
    // Appeler l'API avec le terme de recherche
    this.loadData = true;
    this.parentService
      .searchGlobal(
        this.url,
        searchTerm,
        this.currentProjectId,
        this.pageSize,
        this.offset
      )
      .subscribe(
        (data: any) => {
          this.loadData = false;
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






  addItems(): void {
    if (!this.currentProjectId) {
      this.showProjectSelectionError();
      return;
    }

    this.snackbar.openModal(
      AddPapPlaceAffaireComponent,
      "6Orem",
      "new",
      "",
      this.datas,
      "",
      () => {
        this.getPapPlaceAffaire();
      }
    );
  }

  convertedJson: string;

  fileUpload(event: any) {
    console.log(event.target.files);
    const selectedFile = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsBinaryString(selectedFile);
    fileReader.onload = (event: any) => {
      console.log(event);
      let binaryData = event.target.result;
      let workbook = XLSX.read(binaryData, { type: "binary" });
      workbook.SheetNames.forEach((sheet) => {
        const worksheet = workbook.Sheets[sheet];
        const data: any[][] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        }) as any[][];
        const headers = data[0];
        this.headings = headers;
        const jsonData = data.slice(1).map((row: any[]) => {
          let obj: any = {};
          headers.forEach((header: string, index: number) => {
            obj[header] = row[index];
          });
          return obj;
        });
        this.dataExcel = jsonData;
       // console.log("dataExcel", this.dataExcel);

        //this.convertedJson = JSON.stringify(jsonData, undefined, 4);
      });
    };
  }

  headings = [];
  dataExcel = [];

  resetDataFromExcel() {
    this.headings = [];
    this.dataExcel = [];
    this.convertedJson = "";
  }

  triggerFileUpload() {
    if (!this.currentProjectId) {
      this.showProjectSelectionError();
      return;
    }
    const fileUploadElement = document.getElementById(
      "file-upload"
    ) as HTMLInputElement;
    if (fileUploadElement) {
      fileUploadElement.click();
    }
  }

  private showProjectSelectionError(): void {
    this.toastr.error(
      "Vous devez vous connecter en tant que maître d'ouvrage responsable d'un projet .",
      "Action non autorisée",
      {
        timeOut: 15000,
        progressBar: true,
        closeButton: true,
        enableHtml: true,
      }
    );
  }

  importData() {
    this.snackbar
      .showConfirmation(`Voulez-vous vraiment importer ces données ?`)
      .then((result) => {
        if (result["value"] !== true) return;
        this.loadData = true;
        const dataToSend = this.dataExcel.map((item) => ({
          ...item,
          projectId: +this.currentProjectId,
        }));
        return this.papService
          .add("databasePapPlaceAffaire", dataToSend)
          .subscribe(
            (data: any) => {
              console.log(data);
              this.toastr.success(data.message);
              this.dataExcel = [];
              this.getPapPlaceAffaire();
              this.loadData = false;
            },
            (err) => {
              this.loadData = false;
              console.log(err);
              this.toastr.error(err);
            }
          );
      });
  }

  // importDatas(params: string) {
  //   return this.papService.add(`${params} `, this.dataExcel).subscribe(
  //     (data: any) => {
  //       console.log("====================================");
  //       console.log(data);
  //       console.log("====================================");
  //       this.toastr.success(data.message);
  //       this.selectedOption = "";
  //       this.resetDataFromExcel();
  //     },
  //     (err) => {
  //       console.log("====================================");
  //       console.log(err);
  //       console.log("====================================");
  //       this.toastr.error(err);
  //       this.resetDataFromExcel();
  //     }
  //   );
  // }



  detailItems(id, information) {
    this.localService.saveDataJson("pap", information);
    this.sharedService.setSelectedItem(information);
    this._router.navigate(["pap/detail"]);
  }
}
