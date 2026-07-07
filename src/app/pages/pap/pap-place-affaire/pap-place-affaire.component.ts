// import {
//   ChangeDetectorRef,
//   Component,
//   inject,
//   OnDestroy,
//   OnInit,
//   ViewChild,
// } from "@angular/core";
// import {
//   ButtonAction,
//   TableauComponent,
// } from "src/app/shared/tableau/tableau.component";
// import { UIModule } from "../../../shared/ui/ui.module";
// import { MatTableDataSource } from "@angular/material/table";
// import { MatPaginator, MatPaginatorIntl } from "@angular/material/paginator";
// import { MatSort } from "@angular/material/sort";
// import { FormsModule, UntypedFormGroup } from "@angular/forms";
// import { Router } from "@angular/router";
// import { DatePipe } from "@angular/common";
// import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
// import { TesterComponent } from "../../tester/tester.component";
// import { SnackBarService } from "src/app/shared/core/snackBar.service";
// import {
//   MAT_DIALOG_DATA,
//   MatDialog,
//   MatDialogRef,
// } from "@angular/material/dialog";
// import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";
// import * as XLSX from "xlsx";
// import { Pap, ResponsePap } from "../pap.model";
// import { PapService } from "../pap.service";
// import { ServiceParent } from "src/app/core/services/serviceParent";
// import { DatatableComponent } from "src/app/shared/datatable/datatable.component";
// import { ToastrService } from "ngx-toastr";
// import { SharedService } from "../../projects/shared.service";
// import { LocalService } from "src/app/core/services/local.service";
// import { CoreService } from "src/app/shared/core/core.service";
// import * as moment from "moment";
// import autoTable from "jspdf-autotable";
// import jsPDF from "jspdf";
// import { logoItma } from "src/app/shared/logoItma";
// import { ExportService } from "src/app/shared/core/export.service";
// import { RechercheService } from "src/app/core/services/recherche.service";
// import { JuristAppComponent } from "../../jurist-app/jurist-app.component";
// import { BatimentComponent } from "../batiment/batiment.component";
// import { PapAgricoleComponent } from "../pap-agricole/pap-agricole.component";
// import { AddPapPlaceAffaireComponent } from "./add-pap-place-affaire/add-pap-place-affaire.component";
// import { LoaderComponent } from "../../../shared/loader/loader.component";
// import { Subject, takeUntil } from "rxjs";

// @Component({
//   selector: "app-pap-place-affaire",
//   standalone: true,
//   templateUrl: "./pap-place-affaire.component.html",
//   styleUrl: "./pap-place-affaire.component.css",
//   providers: [
//     DatePipe,
//     {
//       provide: MatDialogRef,
//       useValue: [],
//     },
//     { provide: MAT_DIALOG_DATA, useValue: {} },
//     { provide: MatPaginatorIntl },
//     {
//       provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
//       useValue: { appearance: "outline" },
//     },
//     ExportService,
//   ],
//   imports: [
//     TableauComponent,
//     UIModule,
//     AngularMaterialModule,
//     DatatableComponent,
//     FormsModule,
//     LoaderComponent,
//   ],
// })
// export class PapPlaceAffaireComponent  implements OnInit ,OnDestroy{
//   [x: string]: any;

//   listPap: Pap[];
//   breadCrumbItems: Array<{}>;

//   @ViewChild(MatSort) sort: MatSort;
//   @ViewChild(MatPaginator) paginator: MatPaginator;
//   informations: any;
//   displayedColumns: any;
//   searchList: any;
//   codeEnvoye: number;
//   hasList: boolean;
//   hasAdd: boolean;
//   hasUpdate: boolean;
//   hasDelete: boolean;
//   hasDetail: boolean;
//   length = 100;
//   searchForm: UntypedFormGroup;
//   dialogRef: any;
//   dataSource: MatTableDataSource<any>;
//   datas = [];
//   deleteUser: boolean = false;
//   currentIndex;
//   loadData: boolean = false;
//   exporter: boolean = false;
//   isCollapsed: boolean = false;
//   isSearch2: boolean = false;
//   isSearch: boolean = false;
//   rechercher = "";
//   showLoader = "isNotShow";
//   message = "";
//   config: any;
//   isLoading: boolean = false;
//   pageSizeOptions = [5, 10, 25, 100, 500, 1000];
//   pageSize: number = 10;
//   pageIndex: number = 0;
//   userConnecter;
//   offset: number = 0;
//   title: string = "Gestion des partis affectés";
//   url: string = "databasePapPlaceAffaire";
//   panelOpenState = false;
//   img;
//   image;
//   privilegeByRole: any;
//   privilegeForPage: number = 2520;
//   privilegePage;
//   headers: any = [];
//   btnActions: any = [];
//   currentProjectId: any;

//   constructor(
//     private changeDetectorRefs: ChangeDetectorRef,
//     private _router: Router,
//     private snackbar: SnackBarService,
//     private papService: PapService,
//     private parentService: ServiceParent,
//     public matDialogRef: MatDialogRef<PapAgricoleComponent>,
//     private _changeDetectorRef: ChangeDetectorRef,
//     public toastr: ToastrService,
//     private sharedService: SharedService,
//     private localService: LocalService,
//     private coreService: CoreService,
//   ) {
//     this.currentProjectId = this.localService.getData("ProjectId");
//     this.informations = {
//       exportFile: ["excel", "pdf"],
//       titleFile: "liste des pap",
//       code: "01410",
//       tabHead: ["Prénom", "Nom", "Nationalité"],
//       tabFileHead: [
//         "Id",
//         "Code Pap",
//         "Nom",
//         "Prénom",
//         "Code Place Affaire",
//         "Commune",
//         "Département",
//         "Nombre Place Affaire",
//         "Surnom",
//         "Sexe",
//         "Photo Pap",
//         "Photo Place Affaire",
//         "Point Géométriques",
//         "Nationalité",
//         "Ethnie",
//         "Langue Parlée",
//         "Situation Matrimoniale",
//         "Niveau Étude",
//         "Religion",
//         "Activité Principale",
//         "Membre Foyer",
//         "Membre Foyer Handicapé",
//         "Project Id",
//         "Type",
//       ],
//       searchFields: [],
//       tabBody: ["prenom", "nom", "nationalite"],
//       tabFileBody: [
//         "id",
//         "codePap",
//         "nom",
//         "prenom",
//         "codePlaceAffaire",
//         "commune",
//         "departement",
//         "nombrePlaceAffaire",
//         "surnom",
//         "sexe",
//         "photoPap",
//         "photoPlaceAffaire",
//         "pointGeometriques",
//         "nationalite",
//         "ethnie",
//         "langueParlee",
//         "situationMatrimoniale",
//         "niveauEtude",
//         "religion",
//         "activitePrincipale",
//         "membreFoyer",
//         "membreFoyerHandicape",
//         "projectId",
//         "type",
//       ],
//       action: [
//         { name: "modifier", icon: "edit", color: "primary" },
//         {
//           name: "supprimer",
//           icon: "delete",
//           color: "red",
//         },
//         { name: "detail", icon: "detail", color: "red" },
//       ],
//     };
//     //
//     this.displayedColumns = this.informations.tabBody;
//   }


// private destroy$ = new Subject<void>();

// ngOnDestroy() {
//     this.destroy$.next();
//     this.destroy$.complete();
// }



//   selectedOption: string = "";
//   ngOnInit(): void {
//     this.breadCrumbItems = [
//       { label: "Pap" },
//       { label: "Pap List", active: true },
//     ];
//     this.getPapPlaceAffaire();
//     this.headers = this.createHeader();
//     this.btnActions = this.createActions();
//   }

//   createHeader() {
//     return [
//       {
//         th: "CODE PAP",
//         td: "codePap",
//       },
//       {
//         th: "CODE Place Affaire",
//         td: "codePlaceAffaire",
//       },
//       {
//         th: "PRENOM",
//         td: "prenom",
//       },
//       {
//         th: "NOM",
//         td: "nom",
//       },
//       {
//         th: "NUMERO TELEPHONE",
//         td: "numeroTelephone",
//       },
//     ];
//   }

//   createActions(): ButtonAction[] {
//     return [
//       {
//         icon: "bxs-edit",
//         couleur: "green",
//         size: "icon-size-4",
//         title: "Modifier",
//         isDisabled: this.hasUpdate,
//         action: (element?) => this.updateItems(element),
//       },
//       {
//         icon: "bxs-info-circle",
//         couleur: "black	",
//         size: "icon-size-4",
//         title: "détail",
//         isDisabled: this.hasDelete,
//         action: (element?) => this.detailItems(element.id, element),
//       },
//     ];
//   }

// handleBulkDelete(selectedIds: number[]): void {
//   console.log('IDs à supprimer:', selectedIds);
//   this.snackbar
//     .showConfirmation("Voulez-vous vraiment supprimer ces partis affectés ?")
//     .then((result) => {
//       if (result["value"] == true) {
//         this.deleteUser = true;
//           this.showLoader = "isShow";
//           const message = "Partis affectés supprimés avec succès";
//           this.papService.deleteMultipleByIds(this.url, selectedIds).subscribe(
//             (resp) => {
//               this.showLoader = "isNotShow";
//               this.coreService
//                 .list(this.url, this.offset, this.pageSize)
//                 .subscribe((resp: any) => {
//                   this.snackbar.openSnackBar(message + " avec succès", "OK", [
//                     "mycssSnackbarGreen",
//                   ]);
//                   this.getPapPlaceAffaire();
//                 });
//             },
//             (error) => {
//               this.showLoader = "isNotShow";
//               this.deleteUser = false;
//               this.snackbar.showErrors(error);
//             }
//           );
//         }
//       });
// }

//   getPapPlaceAffaire() {
//     this.loadData = true;
//     return this.parentService
//       .list(this.url, this.pageSize, this.offset, this.currentProjectId)
//       .pipe(takeUntil(this.destroy$))
//       .subscribe(
//         (data: any) => {
//           this.loadData = false;
//           if (data["responseCode"] == 200) {
//             this.loadData = false;
//             this.dataSource = new MatTableDataSource(data["data"]);
//             this.dataSource.paginator = this.paginator;
//             this.dataSource.sort = this.sort;
//             this.datas = data["data"];
//             this.length = data["length"];
//             this._changeDetectorRef.markForCheck();
//           } else {
//             this.loadData = false;
//             this.dataSource = new MatTableDataSource();
//           }
//         },
//         (err) => {
//           this.loadData = false;
//           console.log(err);
//         }
//       );
//   }

//   pageChanged(event) {
//     console.log(event);
//     this.datas = [];
//     this._changeDetectorRef.markForCheck();
//     this.pageSize = event.pageSize;
//     this.pageIndex = event.pageIndex;
//     this.offset = this.pageIndex;
//     this.getPapPlaceAffaire();
//   }

//   updateItems(information): void {
//     console.log(information);
//     this.snackbar.openModal(
//       AddPapPlaceAffaireComponent,
//       "50rem",
//       "edit",
//       "auto",
//       information,
//       "",
//       () => {
//         this.getPapPlaceAffaire();
//       }
//     );
//   }

//   //cette fonction permet de supprimer
//   supprimerItems(id, information) {
//     this.snackbar
//       .showConfirmation("Voulez-vous vraiment supprimer ce parti affecté ?")
//       .then((result) => {
//         if (result["value"] == true) {
//           this.deleteUser = true;
//           this.currentIndex = information;
//           this.showLoader = "isShow";
//           const message = "Parti affecté supprimé";
//           this.coreService.deleteItem(id, this.url).subscribe(
//             (resp) => {
//               this.showLoader = "isNotShow";
//               this.coreService
//                 .list(this.url, this.offset, this.pageSize)
//                 .subscribe((resp: any) => {
//                   const data = resp["data"] || resp;
//                   this.dataSource = new MatTableDataSource(data);
//                   this.dataSource.paginator = this.paginator;
//                   this.dataSource.sort = this.sort;
//                   this.deleteUser = false;
//                   this.datas = resp["data"] || data;
//                   this.length = resp["total"] || data.length;
//                   this.changeDetectorRefs.markForCheck();
//                   this.changeDetectorRefs.detectChanges();
//                   this.snackbar.openSnackBar(message + " avec succès", "OK", [
//                     "mycssSnackbarGreen",
//                   ]);
//                 });
//             },
//             (error) => {
//               this.showLoader = "isNotShow";
//               this.deleteUser = false;
//               this.snackbar.showErrors(error);
//             }
//           );
//         }
//       });
//   }

//   filterList() {
//     this.isCollapsed = !this.isCollapsed;
//   }

//   filterTable(event: Event) {
//     const searchTerm = (event.target as HTMLInputElement).value.trim();
//     this.loadData = true;
//     this.parentService
//       .searchGlobal(
//         this.url,
//         searchTerm,
//         this.currentProjectId,
//         this.pageSize,
//         this.offset
//       )
//       .subscribe(
//         (data: any) => {
//           this.loadData = false;
//           if (data["responseCode"] == 200) {
//             this.dataSource = new MatTableDataSource(data["data"]);
//             this.dataSource.paginator = this.paginator;
//             this.dataSource.sort = this.sort;
//             this.datas = data["data"];
//             this.length = data["length"];
//             this._changeDetectorRef.markForCheck();
//           } else {
//             this.dataSource = new MatTableDataSource();
//           }
//         },
//         (err) => {
//           this.loadData = false;
//           console.log(err);
//         }
//       );
//   }






//   addItems(): void {
//     if (!this.currentProjectId) {
//       this.showProjectSelectionError();
//       return;
//     }

//     this.snackbar.openModal(
//       AddPapPlaceAffaireComponent,
//       "50rem",
//       "new",
//       "auto",
//       this.datas,
//       "",
//       () => {
//         this.getPapPlaceAffaire();
//       }
//     );
//   }

//   convertedJson: string;

//   fileUpload(event: any) {
//     console.log(event.target.files);
//     const selectedFile = event.target.files[0];
//     const fileReader = new FileReader();
//     fileReader.readAsBinaryString(selectedFile);
//     fileReader.onload = (event: any) => {
//       console.log(event);
//       let binaryData = event.target.result;
//       let workbook = XLSX.read(binaryData, { type: "binary" });
//       workbook.SheetNames.forEach((sheet) => {
//         const worksheet = workbook.Sheets[sheet];
//         const data: any[][] = XLSX.utils.sheet_to_json(worksheet, {
//           header: 1,
//         }) as any[][];
//         const headers = data[0];
//         this.headings = headers;
//         const jsonData = data.slice(1).map((row: any[]) => {
//           let obj: any = {};
//           headers.forEach((header: string, index: number) => {
//             obj[header] = row[index];
//           });
//           return obj;
//         });
//         this.dataExcel = jsonData;

//       });
//     };
//   }

//   headings = [];
//   dataExcel = [];

//   resetDataFromExcel() {
//     this.headings = [];
//     this.dataExcel = [];
//     this.convertedJson = "";
//   }

//   triggerFileUpload() {
//     if (!this.currentProjectId) {
//       this.showProjectSelectionError();
//       return;
//     }
//     const fileUploadElement = document.getElementById(
//       "file-upload"
//     ) as HTMLInputElement;
//     if (fileUploadElement) {
//       fileUploadElement.click();
//     }
//   }

//   private showProjectSelectionError(): void {
//     this.toastr.error(
//       "Vous devez vous connecter en tant que maître d'ouvrage responsable d'un projet .",
//       "Action non autorisée",
//       {
//         timeOut: 15000,
//         progressBar: true,
//         closeButton: true,
//         enableHtml: true,
//       }
//     );
//   }

//   importData() {
//     this.snackbar
//       .showConfirmation(`Voulez-vous vraiment importer ces données ?`)
//       .then((result) => {
//         if (result["value"] !== true) return;
//         this.loadData = true;
//         const dataToSend = this.dataExcel.map((item) => ({
//           ...item,
//           projectId: +this.currentProjectId,
//         }));
//         return this.papService
//           .add("databasePapPlaceAffaire", dataToSend)
//           .subscribe(
//             (data: any) => {
//               console.log(data);
//               this.toastr.success(data.message);
//               this.dataExcel = [];
//               this.getPapPlaceAffaire();
//               this.loadData = false;
//             },
//             (err) => {
//               this.loadData = false;
//               console.log(err);
//               this.toastr.error(err);
//             }
//           );
//       });
//   }




//   detailItems(id, information) {
//     this.localService.saveDataJson("pap", information);
//     this.sharedService.setSelectedItem(information);
//     this._router.navigate(["pap/detail"]);
//   }
// }


import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { ButtonAction } from "src/app/shared/tableau/tableau.component";
import { UIModule } from "../../../shared/ui/ui.module";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator, MatPaginatorIntl } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { DatePipe } from "@angular/common";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from "@angular/material/dialog";
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Pap } from "../pap.model";
import { PapService } from "../pap.service";
import { ServiceParent } from "src/app/core/services/serviceParent";
import { DatatableComponent } from "src/app/shared/datatable/datatable.component";
import { ToastrService } from "ngx-toastr";
import { SharedService } from "../../projects/shared.service";
import { LocalService } from "src/app/core/services/local.service";
import { CoreService } from "src/app/shared/core/core.service";
import { PapAgricoleComponent } from "../pap-agricole/pap-agricole.component";
import { AddPapPlaceAffaireComponent } from "./add-pap-place-affaire/add-pap-place-affaire.component";
import { LoaderComponent } from "../../../shared/loader/loader.component";
import { Subject, takeUntil } from "rxjs";
import {
  ActionButton,
  PageActionsComponent,
} from "src/app/shared/refactore/page-actions/page-actions.component";
import { TableauComponent } from "src/app/shared/tableau/tableau.component";

// Messages constants
const MESSAGES = {
  DELETE_CONFIRM: "Voulez-vous vraiment supprimer ce parti affecté ?",
  DELETE_CONFIRM_BULK: "Voulez-vous vraiment supprimer ces partis affectés ?",
  DELETE_SUCCESS: "Parti affecté supprimé",
  DELETE_SUCCESS_BULK: "Partis affectés supprimés",
  IMPORT_CONFIRM: "Voulez-vous vraiment importer ces données ?",
  PROJECT_ERROR: "Vous devez vous connecter en tant que maître d'ouvrage responsable d'un projet.",
  PROJECT_ERROR_TITLE: "Action non autorisée",
  SUCCESS_SUFFIX: " avec succès",
} as const;

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
  ],
  imports: [
    TableauComponent,
    UIModule,
    AngularMaterialModule,
    DatatableComponent,
    FormsModule,
    LoaderComponent,
    PageActionsComponent,
  ],
})
export class PapPlaceAffaireComponent implements OnInit, OnDestroy {
  // Properties
  listPap: Pap[];
  breadCrumbItems: Array<{}>;
  
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  // Table configuration
  headers: any[] = [];
  btnActions: ButtonAction[] = [];
  dataSource: MatTableDataSource<any>;
  datas: any[] = [];
  length = 0;

  // Pagination
  pageSizeOptions = [5, 10, 25, 100, 500, 1000];
  pageSize: number = 10;
  pageIndex: number = 0;
  offset: number = 0;

  // Loading states
  loadData: boolean = false;
  deleteUser: boolean = false;

  // Project & URL
  currentProjectId: any;
  readonly url: string = "databasePapPlaceAffaire";

  // Excel import
  headings: any[] = [];
  dataExcel: any[] = [];

  // Actions configuration
  actions: ActionButton[] = [
    {
      label: "Ajouter un pap place affaire",
      icon: "add",
      action: "add",
      type: "primary",
    },
    {
      label: "Importer Excel",
      icon: "upload_file",
      action: "import",
      type: "success",
    },
    {
      label: "Exporter Excel",
      icon: "table_chart",
      action: "export-excel",
      type: "success",
    },
    {
      label: "Exporter PDF",
      icon: "picture_as_pdf",
      action: "export-pdf",
      type: "danger",
    },
  ];

  // Destroy subject for unsubscribe
  private destroy$ = new Subject<void>();

  constructor(
    private changeDetectorRefs: ChangeDetectorRef,
    private _router: Router,
    private snackbar: SnackBarService,
    private papService: PapService,
    private parentService: ServiceParent,
    public matDialogRef: MatDialogRef<PapAgricoleComponent>,
    private _changeDetectorRef: ChangeDetectorRef,
    public toastr: ToastrService,
    private sharedService: SharedService,
    private localService: LocalService,
    private coreService: CoreService
  ) {
    this.currentProjectId = this.localService.getData("ProjectId");
  }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: "Pap" },
      { label: "Pap List", active: true },
    ];
    this.headers = this.createHeader();
    this.btnActions = this.createActions();
    this.getPapPlaceAffaire();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Header configuration
  createHeader() {
    return [
      { th: "CODE PAP", td: "codePap" },
      { th: "CODE Place Affaire", td: "codePlaceAffaire" },
      { th: "PRENOM", td: "prenom" },
      { th: "NOM", td: "nom" },
      { th: "NUMERO TELEPHONE", td: "numeroTelephone" },
      { th: "VULNÉRABLE", td: "vulne" },
    ];
  }

  // Actions configuration
  createActions(): ButtonAction[] {
    return [
      {
        icon: "bxs-edit",
        couleur: "green",
        size: "icon-size-4",
        title: "Modifier",
        isDisabled: false,
        action: (element?) => this.updateItems(element),
      },
      {
        icon: "bxs-info-circle",
        couleur: "black",
        size: "icon-size-4",
        title: "détail",
        isDisabled: false,
        action: (element?) => this.detailItems(element.id, element),
      },
    ];
  }

  // Data fetching
  getPapPlaceAffaire() {
    this.loadData = true;
    return this.parentService
      .list(this.url, this.pageSize, this.offset, this.currentProjectId)
      .pipe(takeUntil(this.destroy$))
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
          console.error("Error fetching PAP data:", err);
        }
      );
  }

  // Pagination
  pageChanged(event: any): void {
    this.datas = [];
    this._changeDetectorRef.markForCheck();
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.offset = this.pageIndex;
    this.getPapPlaceAffaire();
  }

  // Search
  filterTable(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.trim();
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
          console.error("Error searching:", err);
        }
      );
  }

  // CRUD Operations
  addItems(): void {
    if (!this.currentProjectId) {
      this.showProjectSelectionError();
      return;
    }

    this.snackbar.openModal(
      AddPapPlaceAffaireComponent,
      "50rem",
      "new",
      "auto",
      this.datas,
      "",
      () => this.getPapPlaceAffaire()
    );
  }

  updateItems(information: any): void {
    this.snackbar.openModal(
      AddPapPlaceAffaireComponent,
      "50rem",
      "edit",
      "auto",
      information,
      "",
      () => this.getPapPlaceAffaire()
    );
  }

  supprimerItems(id: number, information: any): void {
    this.snackbar
      .showConfirmation(MESSAGES.DELETE_CONFIRM)
      .then((result) => {
        if (result["value"] !== true) return;

        this.deleteUser = true;
        
        this.coreService.deleteItem(id, this.url).subscribe(
          () => {
            this.getPapPlaceAffaire();
            this.deleteUser = false;
            this.snackbar.openSnackBar(MESSAGES.DELETE_SUCCESS + MESSAGES.SUCCESS_SUFFIX, "OK", [
              "mycssSnackbarGreen",
            ]);
          },
          (error) => {
            this.deleteUser = false;
            this.snackbar.showErrors(error);
          }
        );
      });
  }

  handleBulkDelete(selectedIds: number[]): void {
    this.snackbar
      .showConfirmation(MESSAGES.DELETE_CONFIRM_BULK)
      .then((result) => {
        if (result["value"] !== true) return;

        this.deleteUser = true;
        
        this.papService.deleteMultipleByIds(this.url, selectedIds).subscribe(
          () => {
            this.getPapPlaceAffaire();
            this.deleteUser = false;
            this.snackbar.openSnackBar(MESSAGES.DELETE_SUCCESS_BULK + MESSAGES.SUCCESS_SUFFIX, "OK", [
              "mycssSnackbarGreen",
            ]);
          },
          (error) => {
            this.deleteUser = false;
            this.snackbar.showErrors(error);
          }
        );
      });
  }

  detailItems(id: number, information: any): void {
    this.localService.saveDataJson("pap", information);
    this.sharedService.setSelectedItem(information);
    this._router.navigate(["pap/detail"]);
  }

  // Excel Import
  fileUpload(event: any): void {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    const fileReader = new FileReader();
    fileReader.readAsBinaryString(selectedFile);
    
    fileReader.onload = (event: any) => {
      const binaryData = event.target.result;
      const workbook = XLSX.read(binaryData, { type: "binary" });
      
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
      });
    };
  }

  triggerFileUpload(): void {
    if (!this.currentProjectId) {
      this.showProjectSelectionError();
      return;
    }
    
    const fileUploadElement = document.getElementById("file-upload") as HTMLInputElement;
    fileUploadElement?.click();
  }

  resetDataFromExcel(): void {
    this.headings = [];
    this.dataExcel = [];
  }

  importData(): void {
    this.snackbar
      .showConfirmation(MESSAGES.IMPORT_CONFIRM)
      .then((result) => {
        if (result["value"] !== true) return;

        this.loadData = true;
        const dataToSend = this.dataExcel.map((item) => ({
          ...item,
          projectId: +this.currentProjectId,
        }));

        this.papService.add("databasePapPlaceAffaire", dataToSend).subscribe(
          (data: any) => {
            this.toastr.success(data.message);
            this.dataExcel = [];
            this.getPapPlaceAffaire();
            this.loadData = false;
          },
          (err) => {
            this.loadData = false;
            console.error("Error importing data:", err);
            this.toastr.error(err);
          }
        );
      });
  }

  // Action handlers
  handleSearch(searchValue: string): void {
    console.log("Search:", searchValue);
  }

  handleAction(action: string): void {
    switch (action) {
      case "add":
        this.addItems();
        break;
      case "import":
        this.triggerFileUpload();
        break;
      case "export-excel":
        this.exportToExcel();
        break;
      case "export-pdf":
        this.exportToPdf();
        break;
    }
  }

  // Utility methods
  private showProjectSelectionError(): void {
    this.toastr.error(
      MESSAGES.PROJECT_ERROR,
      MESSAGES.PROJECT_ERROR_TITLE,
      {
        timeOut: 15000,
        progressBar: true,
        closeButton: true,
        enableHtml: true,
      }
    );
  }

  exportToExcel(): void {
    if (!this.datas.length) {
      this.toastr.warning("La liste est vide.");
      return;
    }
    const rows = this.datas.map((item: any) => ({
      "Code PAP":             item.codePap            || "",
      "Code Place Affaire":   item.codePlaceAffaire   || "",
      "Prénom":               item.prenom             || "",
      "Nom":                  item.nom                || "",
      "Sexe":                 item.sexe               || "",
      "Téléphone":            item.numeroTelephone    || "",
      "Commune":              item.commune            || "",
      "Département":          item.departement        || "",
      "Nationalité":          item.nationalite        || "",
      "Activité Principale":  item.activitePrincipale || "",
      "Situation Matrimoniale": item.situationMatrimoniale || "",
      "Statut PAP":           item.statutPap          || "",
      "Vulnérabilité":        item.vulnerabilite      || "",
      "Perte Totale (FCFA)":  item.perteTotale        ?? "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook  = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "PAP Places Affaires");
    worksheet["!cols"] = [20,20,15,15,8,15,15,15,12,20,20,12,15,16].map(w => ({ wch: w }));
    XLSX.writeFile(workbook, "pap-places-affaires.xlsx");
    this.toastr.success("Export Excel réussi.");
  }

  exportToPdf(): void {
    if (!this.datas.length) {
      this.toastr.warning("La liste est vide.");
      return;
    }
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(13);
    doc.text("Liste des PAP – Places Affaires / Économiques", 14, 14);
    doc.setFontSize(8);
    doc.text(`Généré le ${new Date().toLocaleDateString("fr-FR")} — Total : ${this.datas.length} enregistrement(s)`, 14, 20);

    autoTable(doc, {
      startY: 25,
      head: [["Code PAP", "Code PA", "Prénom", "Nom", "Sexe", "Téléphone", "Commune", "Statut", "Vulnérabilité", "Perte (FCFA)"]],
      body: this.datas.map((item: any) => [
        item.codePap            || "",
        item.codePlaceAffaire   || "",
        item.prenom             || "",
        item.nom                || "",
        item.sexe               || "",
        item.numeroTelephone    || "",
        item.commune            || "",
        item.statutPap          || "",
        item.vulnerabilite      || "",
        item.perteTotale != null ? item.perteTotale.toLocaleString("fr-FR") : "",
      ]),
      styles:          { fontSize: 7, cellPadding: 2 },
      headStyles:      { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save("pap-places-affaires.pdf");
    this.toastr.success("Export PDF réussi.");
  }
}